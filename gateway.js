const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const apicache = require('apicache');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const cache = apicache.middleware;

app.use(morgan('combined'));

// Load config
const configPath = path.join(__dirname, 'gateway-config.json');
let config = { routes: [] };

try {
// check for CONFIG_JSON in envs
    if (process.env.CONFIG_JSON) {
        config = JSON.parse(process.env.CONFIG_JSON);
        console.log("Loaded config from environment variable.");
    } 
    // Fallback to local file
    else if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log("Loaded config from local file.");
    } else {
        console.warn(" No configuration found (checked ENV and local file).");
    }
} catch (error) {
    console.error("Failed to load config:", error.message);
    process.exit(1);
}

const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['akpi-api-key'] || req.query.api_key;
    const validKey = process.env.GATEWAY_API_KEY || 'akpi-secret-key';

    if (!apiKey || apiKey !== validKey) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

app.get('/health', (req, res) => res.json({ status: 'OK' }));

config.routes.forEach(route => {
    const middlewares = [];

    if (route.rateLimit) {
        middlewares.push(rateLimit({
            windowMs: route.rateLimit.windowMs || 15 * 60 * 1000,
            max: route.rateLimit.max || 100,
            message: { error: 'Too many requests' }
        }));
    }

    if (route.auth) {
        middlewares.push(checkApiKey);
    }

    if (route.cache) {
        middlewares.push(cache(route.cache));
    }

    const envTargetKey = `TARGET_${route.name.toUpperCase().replace(/\s+/g, '_')}`;
    const target = process.env[envTargetKey] || route.target;

    if (!target) {
        console.warn(`Skipping ${route.name}: No target URL.`);
        return;
    }

    const proxyOptions = {
        target,
        changeOrigin: true,
        ws: route.websocket || false,
        onError: (err, req, res) => {
            console.error('Proxy Error:', err);
            res.status(502).json({ error: 'Bad Gateway' });
        }
    };

    app.use(route.path, ...middlewares, createProxyMiddleware(proxyOptions));
    
    console.log(`Route: ${route.path} -> ${target} [Auth: ${!!route.auth}]`);
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
    console.log(`AKPI running on port ${PORT}`);
});
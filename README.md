# Akpi Gateway

Akpi is a lightweight, environment-agnostic API Gateway designed to sit in front of your microservices. It handles routing, authentication, rate limiting, and caching, allowing your services to focus on business logic.

## Features

- **Dynamic Routing**: Configure routes via a simple JSON file.
- **Authentication**: Optional API Key protection for specific routes.
- **Rate Limiting**: Protect your services from abuse with configurable limits.
- **Caching**: Cache GET requests to reduce load on backend services.
- **WebSocket Support**: Native support for proxying WebSocket connections.
- **Environment Overrides**: Override target URLs via environment variables (perfect for Docker/Kubernetes).

## Installation

```bash
git clone https://github.com/Noah-droid/akpi.git
cd akpi
npm install
```

## Configuration

Define your routes in `gateway-config.json`:

```json
{
  "routes": [
    {
      "name": "users",
      "path": "/users",
      "target": "https://api.example.com/users",
      "auth": true,
      "rateLimit": {
        "windowMs": 60000,
        "max": 100
      }
    },
    {
      "name": "realtime",
      "path": "/socket",
      "target": "ws://localhost:8080",
      "websocket": true
    }
  ]
}
```

### Configuration Options

| Option      | Type    | Description                                                      |
| ----------- | ------- | ---------------------------------------------------------------- |
| `name`      | string  | Unique identifier for the route.                                 |
| `path`      | string  | The path to listen on (e.g., `/api/v1`).                         |
| `target`    | string  | The upstream service URL.                                        |
| `auth`      | boolean | If `true`, requires `x-api-key` header.                          |
| `rateLimit` | object  | `{ windowMs, max }` settings for rate limiting.                  |
| `cache`     | string  | Duration string (e.g., `"5 minutes"`) for caching GET responses. |
| `websocket` | boolean | Set to `true` to enable WebSocket proxying.                      |

## Environment Variables

The gateway supports configuration via environment variables in three ways:

### Method 1: Using .env File (Recommended for local development)

Create a `.env` file in the project root (see `.env.example` for template):

```bash
PORT=3000
GATEWAY_API_KEY=your-secret-key
CONFIG_JSON={"routes":[...]}
```

### Method 2: Direct Environment Variables (Recommended for Docker/Cloud)

Set environment variables directly in your deployment platform:

- `PORT`: Port to run the gateway on (default: 3000).
- `GATEWAY_API_KEY`: The secret key required for protected routes (default: `akpi-secret-key`).
- `CONFIG_JSON`: Full gateway configuration as JSON string (overrides `gateway-config.json`).
- `TARGET_[ROUTE_NAME]`: Override the target URL for a specific route.
  - Example: `TARGET_AUTH=https://prod-auth-service.com` overrides the `auth` route target.

### Method 3: Using gateway-config.json

If no environment variables are set, the gateway loads configuration from `gateway-config.json`.

## Usage

Start the gateway:

```bash
npm start
```

### Health Check

The gateway exposes a health check endpoint at `/health`.

```bash
curl http://localhost:3000/health
# {"status":"OK"}
```

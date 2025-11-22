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

- `PORT`: Port to run the gateway on (default: 3000).
- `GATEWAY_API_KEY`: The secret key required for protected routes (default: `default-secret-key`).
- `TARGET_[ROUTE_NAME]`: Override the target URL for a specific route.
  - Example: `TARGET_USERS=http://prod-user-service:8080` overrides the `users` route target.

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

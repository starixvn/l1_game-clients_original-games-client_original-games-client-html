# Reverse Proxy Setup for Sedie-Multiplayer Game

This setup simulates the exact deployment environment where the game is served behind a reverse proxy with a base path.

## Architecture

```
Internet → Reverse Proxy (Port 3000) → Sedie Game Container (Port 5000)
               ↓
         Strips /game-148 prefix
               ↓
         Forwards to container
```

## URLs

-   **External Access**: `http://localhost:3000/game-148`
-   **Direct Container**: `http://localhost:5000`
-   **Health Check**: `http://localhost:3000/health`

## Running with Docker Compose (Recommended)

```bash
# Navigate to the sedie-multiplayer package
cd packages/sedie-multiplayer

# Start both services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Running Manually

### Terminal 1: Start the Game Container

```bash
cd packages/sedie-multiplayer
docker build -f Dockerfile -t sedie-multiplayer-game .
docker run -d --name sedie-game-container -p 5000:5000 sedie-multiplayer-game
```

### Terminal 2: Start the Reverse Proxy

```bash
cd packages/sedie-multiplayer
npm install http-proxy-middleware  # Install the dependency
npm run proxy
```

## Testing Image URLs

Test the problematic image URLs through the proxy:

```bash
# Test the statistic-icon-red2.webp image
curl -I "http://localhost:3000/_next/image?url=%2Fgame-148%2Fstatic%2Fimages%2Fsedie-multiplayer%2Fscoreboard%2Fstatistic-icon-red2.webp&w=32&q=75"

# Test the bg-148.webp background image
curl -I "http://localhost:3000/_next/image?url=%2Fgame-148%2Fstatic%2Fimages%2Fbackground%2Fbg-148.webp&w=640&q=75"
```

## Logs

The reverse proxy provides detailed logging to help debug issues:

-   **📨** Incoming requests
-   **🔄** Proxy forwarding
-   **✅** Successful responses (200-299)
-   **❌** Error responses (400+)
-   **⚠️** Warning responses (300-399)

## Environment Variables

-   `PROXY_PORT`: Port for the reverse proxy (default: 3000)
-   `TARGET_HOST`: Target container URL (default: http://localhost:5000)

## Troubleshooting

1. **Container not starting**: Check `docker logs sedie-game-container`
2. **Proxy not forwarding**: Check `docker logs sedie-proxy-container`
3. **Images still 404**: Verify the images exist in the container and check preload cache

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Or manually
docker stop sedie-proxy-container sedie-game-container
docker rm sedie-proxy-container sedie-game-container
```

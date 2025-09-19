# Reverse Proxy Setup for Baccarat-Multiplayer Game

This setup simulates the exact deployment environment where the game is served behind a reverse proxy with a base path.

## Architecture

```
Internet → Reverse Proxy (Port 3001) → Baccarat Game Container (Port 5001)
               ↓
         Strips /game-150 prefix
               ↓
         Forwards to container
```

## URLs

-   **External Access**: `http://localhost:3001/game-150`
-   **Direct Container**: `http://localhost:5001`
-   **Health Check**: `http://localhost:3001/health`

## Running with Docker Compose (Recommended)

```bash
# Navigate to the baccarat-multiplayer package
cd packages/baccarat-multiplayer

# Start both services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Running Manually

### Terminal 1: Start the Game Container

```bash
cd packages/baccarat-multiplayer
docker build -f Dockerfile -t baccarat-multiplayer-game .
docker run -d --name baccarat-game-container -p 5001:5001 baccarat-multiplayer-game
```

### Terminal 2: Start the Reverse Proxy

```bash
cd packages/baccarat-multiplayer
npm install http-proxy-middleware  # Install the dependency
npm run proxy
```

## Testing Image URLs

Test the problematic image URLs through the proxy:

```bash
# Test the statistic-icon-red2.webp image
curl -I "http://localhost:3001/_next/image?url=%2Fgame-150%2Fstatic%2Fimages%2Fbaccarat-multiplayer%2Fscoreboard%2Fstatistic-icon-red2.webp&w=32&q=75"

# Test the bg-150.webp background image
curl -I "http://localhost:3001/_next/image?url=%2Fgame-150%2Fstatic%2Fimages%2Fbackground%2Fbg-150.webp&w=640&q=75"
```

## Logs

The reverse proxy provides detailed logging to help debug issues:

-   **📨** Incoming requests
-   **🔄** Proxy forwarding
-   **✅** Successful responses (200-299)
-   **❌** Error responses (400+)
-   **⚠️** Warning responses (300-399)

## Environment Variables

-   `PROXY_PORT`: Port for the reverse proxy (default: 3001)
-   `TARGET_HOST`: Target container URL (default: http://localhost:5001)

## Troubleshooting

1. **Container not starting**: Check `docker logs baccarat-game-container`
2. **Proxy not forwarding**: Check `docker logs baccarat-proxy-container`
3. **Images still 404**: Verify the images exist in the container and check preload cache

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Or manually
docker stop baccarat-proxy-container baccarat-game-container
docker rm baccarat-proxy-container baccarat-game-container
```

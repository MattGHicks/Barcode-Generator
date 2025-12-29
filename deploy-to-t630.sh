#!/bin/bash
# Deploy Barcode Generator to T630 Homelab Server

set -e

SERVER="t630"
APP_NAME="barcode-generator"
REMOTE_DIR="/home/matt/homelab/apps/${APP_NAME}"

echo "🚀 Deploying Barcode Generator to T630..."

# Create remote directory
echo "📁 Creating remote directory..."
ssh $SERVER "mkdir -p ${REMOTE_DIR}"

# Copy project files (exclude node_modules and build artifacts)
echo "📦 Copying project files..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '*.log' \
  --exclude '.DS_Store' \
  . ${SERVER}:${REMOTE_DIR}/

# Copy environment file if it doesn't exist
echo "🔐 Checking environment file..."
if ! ssh $SERVER "[ -f ${REMOTE_DIR}/.env.local ]"; then
  echo "⚠️  No .env.local found on server. Creating template..."
  ssh $SERVER "cat > ${REMOTE_DIR}/.env.local << 'EOF'
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
EOF"
  echo "⚠️  Please edit ${REMOTE_DIR}/.env.local on the server and add your API key!"
fi

# Build and start the container
echo "🐳 Building and starting Docker container..."
ssh $SERVER "cd ${REMOTE_DIR} && docker compose up -d --build"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Access your barcode generator at:"
echo "  Local: http://192.168.254.126:3002"
echo "  Tailscale: http://100.85.179.110:3002"
echo ""
echo "📡 To enable public internet access:"
echo "  See NGINX-PROXY-SETUP.md for complete instructions"
echo "  Quick summary:"
echo "    1. Add DNS record in Cloudflare (barcode.mght630.com → your IP)"
echo "    2. Add proxy host in Nginx Proxy Manager (http://192.168.254.126:81)"
echo "    3. Request SSL certificate (Let's Encrypt)"
echo "  Then access at: https://barcode.mght630.com"
echo ""
echo "Useful commands:"
echo "  View logs:    ssh $SERVER \"docker logs -f ${APP_NAME}\""
echo "  Restart:      ssh $SERVER \"docker restart ${APP_NAME}\""
echo "  Stop:         ssh $SERVER \"cd ${REMOTE_DIR} && docker compose down\""
echo ""

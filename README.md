# Code39 Barcode Generator - Web Application

A modern, AI-powered web application for generating professional Code39 barcodes. Built with Next.js, Tailwind CSS, and Claude AI.

## Features

- ✨ **AI-Powered Configuration**: Describe what you need in natural language, and Claude AI automatically fills the form
- 📊 **Customizable Barcodes**: Adjust prefix, quantity, page size, and barcode dimensions
- 🎨 **Font Customization**: Choose from multiple PDF-standard fonts (Helvetica, Times, Courier)
- 📄 **PDF Output**: One barcode per page, perfect for printing labels
- ⚡ **Fast Generation**: Generate up to 1000 barcodes in seconds
- 🎯 **User-Friendly**: Clean, modern interface with real-time preview

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

Get your API key from: https://console.anthropic.com/

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Usage

### Basic Usage

1. **Enter barcode details:**
   - Prefix: "1001", "ASSET", "PROD", etc.
   - Start Number: Starting number for sequential generation
   - Quantity: How many barcodes to generate (1-1000)

2. **Adjust page size:**
   - Width: 1.5 inches (default for labels)
   - Height: 1.0 inches (default for labels)

3. **Click "Generate & Download PDF"**

### Using AI Assistance

1. **Describe your needs:**
   - "I need 100 asset tags for inventory tracking"
   - "50 product labels starting from 5000"
   - "200 barcodes for warehouse items"

2. **Click "✨ Fill Form with AI"**

3. **Claude AI automatically configures** all settings with reasoning

### Advanced Settings

- **Scale (1-5)**: Image quality/resolution
- **Bar Height**: Taller bars = easier scanning
- **Bar Width**: Module width in millimeters
- **Font Size**: Text size below barcode
- **Font Style**: Choose from 6 PDF-standard fonts

## Project Structure

```
barcode-webapp/
├── app/
│   ├── api/
│   │   ├── generate/route.ts     # PDF generation API
│   │   └── ai-assist/route.ts    # Claude AI API
│   └── page.tsx                  # Main UI
├── lib/
│   ├── barcode-generator.ts      # Barcode logic
│   └── pdf-builder.ts            # PDF creation
├── public/
│   ├── barcode-icon.svg          # Custom favicon
│   └── og-image.svg              # Social media preview
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── deploy-to-t630.sh
└── Documentation/
    ├── README.md                 # This file
    ├── PROJECT-SUMMARY.md        # Complete project overview
    ├── DEPLOYMENT-SUCCESS.md     # Deployment status
    ├── NGINX-PROXY-SETUP.md      # Public access guide
    ├── DEPLOYMENT-CHECKLIST.md   # Deployment steps
    └── BRANDING.md               # Favicon & metadata
```

## Technology Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Barcode**: bwip-js (Code39)
- **PDF**: PDFKit
- **AI**: Claude 3.5 Sonnet
- **Type Safety**: TypeScript

## Deployment to T630 Homelab

### Quick Deploy

1. **Set your API key in the deployment script:**
```bash
export ANTHROPIC_API_KEY=sk-ant-xxxxx
```

2. **Run the deployment script:**
```bash
./deploy-to-t630.sh
```

3. **Access the app:**
   - Local network: http://192.168.254.126:3002
   - Tailscale VPN: http://100.85.179.110:3002
   - Public (via Nginx): https://barcode.mght630.com (after proxy setup)

### Manual Deployment

If you prefer manual deployment:

1. **SSH to your server:**
```bash
ssh t630
```

2. **Create app directory:**
```bash
mkdir -p ~/homelab/apps/barcode-generator
cd ~/homelab/apps/barcode-generator
```

3. **Copy files from your local machine:**
```bash
# On your Mac
rsync -avz --exclude 'node_modules' --exclude '.next' \
  . t630:~/homelab/apps/barcode-generator/
```

4. **Set environment variable on server:**
```bash
ssh t630
cd ~/homelab/apps/barcode-generator
echo "ANTHROPIC_API_KEY=sk-ant-xxxxx" > .env.local
```

5. **Build and start:**
```bash
docker compose up -d --build
```

### Management Commands

```bash
# View logs
ssh t630 "docker logs -f barcode-generator"

# Restart
ssh t630 "docker restart barcode-generator"

# Stop
ssh t630 "cd ~/homelab/apps/barcode-generator && docker compose down"

# Rebuild after code changes
ssh t630 "cd ~/homelab/apps/barcode-generator && docker compose up -d --build"
```

### Integration with Homepage Dashboard

The barcode generator will automatically appear in your Homepage dashboard under the "Tools" section with these labels configured in docker-compose.yml.

## Public Internet Access

✅ **LIVE AND DEPLOYED:** https://barcode.mght630.com

The barcode generator is publicly accessible from anywhere in the world!

### Access URLs

| Method | URL | Status |
|--------|-----|--------|
| **Public Internet** | https://barcode.mght630.com | ✅ Live - accessible worldwide |
| **Local Network** | http://192.168.254.126:3002 | ✅ Direct access from home network |
| **Tailscale VPN** | http://100.85.179.110:3002 | ✅ Secure remote access |

### Current Configuration

**Nginx Proxy Manager:**
- Domain: barcode.mght630.com
- Forward to: barcode-generator:3000 (Docker internal)
- SSL: Let's Encrypt (auto-renews every 90 days)
- Security: Force SSL, HTTP/2, HSTS enabled

**Cloudflare:**
- DNS: barcode.mght630.com → 47.198.52.185
- Proxy: ☁️ Enabled (DDoS protection + CDN)
- SSL/TLS: Full mode

### Security Note

⚠️ **Important:** This app uses your Anthropic API key for AI features.

**Current Status:** Public access (no authentication)
- ✅ Anyone can generate barcodes manually
- ⚠️ Anyone can use AI features (consumes API credits)
- 💡 Monitor usage at: https://console.anthropic.com/

**To add authentication later:**
- See [NGINX-PROXY-SETUP.md](./NGINX-PROXY-SETUP.md) for HTTP Basic Auth instructions
- Or set up IP whitelisting to restrict access

## Common Use Cases

**Inventory Labels** (1.5" × 1"):
- Prefix: INV, Start: 1, Count: 500

**Asset Tags** (2" × 1"):
- Prefix: ASSET, Start: 1000, Count: 200

**Product Labels** (2" × 3"):
- Prefix: PROD, Start: 5000, Count: 100

## Troubleshooting

**AI Not Working**: Verify `ANTHROPIC_API_KEY` in `.env.local`

**Barcodes Won't Scan**: Increase scale and bar height

**Build Errors**: Clear cache with `rm -rf .next node_modules && npm install`

## License

MIT License - Free to use and modify

---

## 📚 Complete Documentation

- **[PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md)** - Complete project overview and technical details
- **[DEPLOYMENT-SUCCESS.md](./DEPLOYMENT-SUCCESS.md)** - Current deployment status and management
- **[NGINX-PROXY-SETUP.md](./NGINX-PROXY-SETUP.md)** - Public access configuration details
- **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** - Step-by-step deployment guide
- **[BRANDING.md](./BRANDING.md)** - Favicon, Open Graph images, and SEO metadata

---

**Built with Next.js, Tailwind CSS, Claude AI, and ❤️ by Matt Hicks**

**Live at:** https://barcode.mght630.com

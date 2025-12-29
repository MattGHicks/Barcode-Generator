# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Anthropic API key (get it from https://console.anthropic.com/)
- Your server with SSH access

## Option 1: Deploy to Your Own Server (Recommended for You)

### Step 1: Prepare the Application

1. **Set up environment variables:**
   ```bash
   cd barcode-webapp
   cp .env.example .env.local
   ```

2. **Edit `.env.local` and add your API key:**
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   ```

3. **Build the application:**
   ```bash
   npm run build
   ```

### Step 2: Deploy to Your Server

#### Option A: Using PM2 (Process Manager)

1. **Install PM2 globally on your server:**
   ```bash
   npm install -g pm2
   ```

2. **Copy files to your server:**
   ```bash
   rsync -avz --exclude node_modules --exclude .next \
     ./ user@your-server.com:/var/www/barcode-app/
   ```

3. **SSH into your server:**
   ```bash
   ssh user@your-server.com
   cd /var/www/barcode-app
   ```

4. **Install dependencies and build:**
   ```bash
   npm install
   npm run build
   ```

5. **Create PM2 ecosystem file** (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'barcode-app',
       script: 'node_modules/next/dist/bin/next',
       args: 'start -p 3000',
       cwd: '/var/www/barcode-app',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         ANTHROPIC_API_KEY: 'your-api-key-here'
       }
     }]
   };
   ```

6. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

7. **View logs:**
   ```bash
   pm2 logs barcode-app
   ```

#### Option B: Using Docker

1. **Create `Dockerfile`:**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   # Copy package files
   COPY package*.json ./

   # Install dependencies
   RUN npm ci --only=production

   # Copy application files
   COPY . .

   # Build the application
   RUN npm run build

   # Expose port
   EXPOSE 3000

   # Start the application
   CMD ["npm", "start"]
   ```

2. **Create `.dockerignore`:**
   ```
   node_modules
   .next
   .env.local
   *.md
   ```

3. **Build and run Docker container:**
   ```bash
   docker build -t barcode-app .
   docker run -d -p 3000:3000 \
     -e ANTHROPIC_API_KEY=your-api-key-here \
     --name barcode-app \
     barcode-app
   ```

4. **Using Docker Compose** (`docker-compose.yml`):
   ```yaml
   version: '3.8'

   services:
     web:
       build: .
       ports:
         - "3000:3000"
       environment:
         - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
       restart: unless-stopped
   ```

   Then run:
   ```bash
   docker-compose up -d
   ```

### Step 3: Set Up Nginx Reverse Proxy

1. **Create Nginx configuration** (`/etc/nginx/sites-available/barcode-app`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;

           # Increase timeout for PDF generation
           proxy_read_timeout 300s;
           proxy_connect_timeout 300s;
       }

       # Increase max body size for large requests
       client_max_body_size 10M;
   }
   ```

2. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/barcode-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Set up SSL with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Step 4: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## Option 2: Quick Deploy with Vercel (Alternative)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd barcode-webapp
   vercel
   ```

3. **Add environment variable:**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   ```

4. **Redeploy with env:**
   ```bash
   vercel --prod
   ```

## Post-Deployment

### 1. Test the Application

Visit your domain and test:
- [ ] Form loads correctly
- [ ] AI assistance works (requires API key)
- [ ] Barcode generation works
- [ ] PDF downloads successfully

### 2. Monitor the Application

**With PM2:**
```bash
pm2 monit
pm2 logs barcode-app
```

**With Docker:**
```bash
docker logs -f barcode-app
docker stats barcode-app
```

### 3. Set Up Automatic Updates

**Create update script** (`update.sh`):
```bash
#!/bin/bash
cd /var/www/barcode-app
git pull
npm install
npm run build
pm2 restart barcode-app
```

Make it executable:
```bash
chmod +x update.sh
```

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs barcode-app

# Or with Docker
docker logs barcode-app

# Common issues:
# 1. Missing ANTHROPIC_API_KEY
# 2. Port 3000 already in use
# 3. Node.js version < 18
```

### AI assistance not working
- Verify ANTHROPIC_API_KEY is set correctly
- Check API key is valid at https://console.anthropic.com/
- Check server logs for API errors

### PDF generation fails
- Check memory limits (increase if needed)
- Verify bwip-js and pdfkit are installed
- Check server logs for specific errors

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

## Performance Optimization

### 1. Enable Caching in Nginx

Add to your Nginx config:
```nginx
location /_next/static/ {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 60m;
    proxy_cache_bypass $http_pragma $http_authorization;
    add_header Cache-Control "public, immutable";
}
```

### 2. Increase Node.js Memory (if needed)

In PM2 config:
```javascript
env: {
    NODE_OPTIONS: '--max-old-space-size=2048'
}
```

### 3. Set Up CDN (Optional)

Use Cloudflare or similar CDN to cache static assets and improve global performance.

## Security Best Practices

1. **Keep API key secure:**
   - Never commit `.env.local` to git
   - Use environment variables on server
   - Rotate API keys periodically

2. **Enable HTTPS:**
   - Always use SSL certificates
   - Redirect HTTP to HTTPS

3. **Set up rate limiting:**
   Add to Nginx config:
   ```nginx
   limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;

   location /api/ {
       limit_req zone=api burst=5;
       proxy_pass http://localhost:3000;
   }
   ```

4. **Regular updates:**
   ```bash
   npm audit
   npm update
   ```

## Monitoring and Maintenance

### Set Up Uptime Monitoring

Use services like:
- UptimeRobot (https://uptimerobot.com/)
- Pingdom (https://www.pingdom.com/)
- StatusCake (https://www.statuscake.com/)

### Log Rotation

PM2 handles this automatically. For custom logs:
```bash
sudo logrotate /etc/logrotate.d/barcode-app
```

## Support

For issues:
1. Check server logs
2. Verify environment variables
3. Test locally first with `npm run dev`
4. Check Anthropic API status page

## Quick Reference Commands

```bash
# PM2
pm2 start ecosystem.config.js
pm2 stop barcode-app
pm2 restart barcode-app
pm2 logs barcode-app
pm2 monit

# Docker
docker build -t barcode-app .
docker run -d -p 3000:3000 barcode-app
docker stop barcode-app
docker logs -f barcode-app

# Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx

# System
sudo ufw status
sudo systemctl status
journalctl -u nginx -f
```

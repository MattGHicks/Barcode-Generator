# Deployment Checklist

## Pre-Deployment

- [ ] Verify API key is set: `echo $ANTHROPIC_API_KEY`
- [ ] Test app locally works: http://localhost:3000
- [ ] Barcodes generate correctly with proper dimensions
- [ ] AI assistance working

## Deployment to T630

- [ ] Run deployment script:
  ```bash
  export ANTHROPIC_API_KEY=sk-ant-xxxxx
  ./deploy-to-t630.sh
  ```

- [ ] Verify container is running:
  ```bash
  ssh t630 "docker ps | grep barcode"
  ```

- [ ] Test local access: http://192.168.254.126:3002

- [ ] Test Tailscale access: http://100.85.179.110:3002

- [ ] Check logs for errors:
  ```bash
  ssh t630 "docker logs barcode-generator"
  ```

## Public Internet Access (Optional)

### 1. Cloudflare DNS Setup

- [ ] Login to Cloudflare: https://dash.cloudflare.com/
- [ ] Go to mght630.com → DNS → Records
- [ ] Add A record:
  - Name: `barcode`
  - IPv4: (auto-detect public IP)
  - Proxy: ☁️ Proxied (orange cloud)
- [ ] Save and wait for DNS propagation (~5 minutes)

### 2. Nginx Proxy Manager Setup

- [ ] Access Nginx: http://192.168.254.126:81
- [ ] Login: mattghicks@gmail.com / #65Ae02122
- [ ] Add Proxy Host:
  - Domain: `barcode.mght630.com`
  - Scheme: `http`
  - Forward IP: `192.168.254.126`
  - Forward Port: `3002`
  - ✓ Cache Assets
  - ✓ Block Common Exploits
  - ✓ Websockets Support

### 3. SSL Certificate

- [ ] In Nginx Proxy Host → SSL Tab:
  - ✓ Request new SSL Certificate
  - ✓ Force SSL
  - ✓ HTTP/2 Support
  - ✓ HSTS Enabled
  - Email: mattghicks@gmail.com
  - ✓ Agree to Let's Encrypt ToS
- [ ] Save and wait for certificate

### 4. Security (Recommended)

- [ ] Add Access List with HTTP Basic Auth:
  - Nginx → Access Lists → Add
  - Name: "Barcode Generator Access"
  - Add username/password
  - Apply to proxy host

- [ ] Or add IP whitelist if needed

### 5. Test Public Access

- [ ] Test DNS: `dig barcode.mght630.com`
- [ ] Test HTTP redirect: http://barcode.mght630.com
- [ ] Test HTTPS: https://barcode.mght630.com
- [ ] Test from phone (not on WiFi)
- [ ] Generate test barcodes
- [ ] Test AI assistance

## Post-Deployment

### Homepage Integration

- [ ] Verify app appears in Homepage dashboard
- [ ] Check under "Tools" section
- [ ] Test click-through from Homepage

### Monitoring

- [ ] Set up monitoring in Uptime Kuma:
  - URL: https://barcode.mght630.com
  - Check interval: 60 seconds
  - Alert on failures

### Documentation

- [ ] Add to T630 services list
- [ ] Update homelab README if needed
- [ ] Share URL with anyone who needs access

## Troubleshooting

### Container won't start
```bash
ssh t630 "docker logs barcode-generator"
```

### DNS not resolving
```bash
dig barcode.mght630.com
# Check at: https://dnschecker.org
```

### 502 Bad Gateway
- Check container is running
- Verify port 3002 is correct
- Check Nginx config

### SSL certificate failed
- Verify ports 80/443 forwarded to 192.168.254.126
- Check Cloudflare SSL mode: Full (not Full strict)

## Final URLs

After complete setup:

| Access Method | URL |
|---------------|-----|
| Public (HTTPS) | https://barcode.mght630.com |
| Local Network | http://192.168.254.126:3002 |
| Tailscale VPN | http://100.85.179.110:3002 |
| Nginx Admin | http://192.168.254.126:81 |
| Homepage | http://192.168.254.126:3000 |

---

**All done?** Share https://barcode.mght630.com with your team! 🎉

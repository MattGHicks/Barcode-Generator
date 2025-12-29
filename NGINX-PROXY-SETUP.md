# Public Internet Access via Nginx Proxy Manager

✅ **STATUS: COMPLETED AND WORKING**

The Barcode Generator is now live at: **https://barcode.mght630.com**

This document shows the actual working configuration and how to add HTTP Basic Authentication if desired.

## Current Setup

- ✅ Domain: mght630.com (configured with Cloudflare)
- ✅ Nginx Proxy Manager running on T630 (port 81)
- ✅ Port forwarding configured on router (80, 443)
- ✅ Barcode Generator running (container: barcode-generator)
- ✅ SSL certificate: Let's Encrypt (auto-renews)
- ✅ Public URL: https://barcode.mght630.com

## Actual Working Configuration

### DNS Record (Cloudflare)
**Already configured:**
- **Type:** A
- **Name:** barcode
- **IPv4 address:** 47.198.52.185
- **Proxy status:** ☁️ Proxied (orange cloud - DDoS protection enabled)
- **TTL:** Auto

### Nginx Proxy Manager Settings
**Already configured:**

**Details Tab:**
```
Domain Names: barcode.mght630.com
Scheme: http
Forward Hostname / IP: barcode-generator  ⚠️ IMPORTANT: Use container name, not IP!
Forward Port: 3000  ⚠️ IMPORTANT: Use internal port (3000), not external (3002)!
Cache Assets: ✓
Block Common Exploits: ✓
Websockets Support: ✓
```

**SSL Tab:**
```
SSL Certificate: Let's Encrypt (Cert #4)
Force SSL: ✓
HTTP/2 Support: ✓
HSTS Enabled: ✓
HSTS Subdomains: ✗

Email: mattghicks@gmail.com
Auto-renew: ✓ (every 90 days)
```

### Key Learnings

1. **Use container name, not IP:**
   - ✅ Correct: `barcode-generator`
   - ❌ Wrong: `192.168.254.126`
   - Why: Both containers are on the same Docker network (homelab_homelab)

2. **Use internal port, not external:**
   - ✅ Correct: Port `3000`
   - ❌ Wrong: Port `3002`
   - Why: Docker port mapping 3002:3000 is only for external access

3. **Cloudflare SSL mode:**
   - Setting: Full (not Full strict)
   - Why: Internal connection uses self-signed certificate

## Step 5: Security Considerations

### Optional: Add Access List (Recommended)

If you want to restrict access to specific IPs or require authentication:

1. **In Nginx Proxy Manager, go to "Access Lists"**
2. **Create New Access List:**
   ```
   Name: Barcode Generator Access
   ```

3. **Add Authorization:**
   - **Username:** Choose a username
   - **Password:** Create a strong password

4. **Edit your Proxy Host:**
   - Go back to the barcode proxy host
   - Under "Access List" select your newly created list
   - Save

Now users will need to authenticate before accessing the barcode generator.

### Optional: IP Whitelist

To allow only specific IPs:

1. **Edit Access List**
2. **Add in "Access" tab:**
   ```
   # Allow your office IP
   allow 1.2.3.4;

   # Allow your home IP
   allow 5.6.7.8;

   # Deny everyone else
   deny all;
   ```

## Step 6: Update Homepage Dashboard

Add the public URL to your Homepage dashboard for easy access:

**Edit:** `/home/matt/homelab/config/homepage/bookmarks.yaml`

```yaml
- Tools:
    - Barcode Generator:
        - abbr: BC
          href: https://barcode.mght630.com
          description: Public barcode generator
```

## Final URLs

After setup, your barcode generator will be accessible at:

| Access Method | URL | Notes |
|---------------|-----|-------|
| **Public Internet** | https://barcode.mght630.com | SSL secured, accessible anywhere |
| **Local Network** | http://192.168.254.126:3002 | Direct access, no SSL |
| **Tailscale VPN** | http://100.85.179.110:3002 | Secure remote access |

## Troubleshooting

### DNS Not Resolving
```bash
# Check DNS propagation
dig barcode.mght630.com

# Or use online tool
open https://dnschecker.org
```

### SSL Certificate Failed
- Ensure ports 80 and 443 are forwarded to 192.168.254.126
- Check Cloudflare SSL/TLS mode is set to "Full" (not "Full (strict)")
- Verify email address is correct

### 502 Bad Gateway
- Ensure barcode container is running: `ssh t630 "docker ps | grep barcode"`
- Check container logs: `ssh t630 "docker logs barcode-generator"`
- Verify port 3002 is correct in Nginx config

### Cloudflare SSL/TLS Settings

Go to Cloudflare → SSL/TLS → Overview:
- **Encryption mode:** Full (not Full strict, since we're using a self-signed cert internally)

## Maintenance

### Update DNS if Public IP Changes

Your public IP may change. To update:

1. **Check current public IP:**
   ```bash
   curl ifconfig.me
   ```

2. **Update Cloudflare DNS if changed**
   - Or use the Cloudflare DDNS script at `/home/matt/homelab/scripts/cloudflare-ddns.sh`

## Security Best Practices

- ✅ Use HTTPS only (force SSL enabled)
- ✅ Enable HSTS for security
- ✅ Keep Cloudflare proxy enabled (orange cloud) for DDoS protection
- ✅ Consider adding authentication for sensitive use
- ✅ Monitor access logs in Nginx Proxy Manager
- ⚠️ Be aware: API usage costs money - consider rate limiting if publicly exposed

---

**Need help?** Check your existing remote access docs:
- `/Users/matt/Documents/My Coding Projects/linux-server/docs/setup/remote-access.md`

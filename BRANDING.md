# Branding & Metadata

This document describes the custom branding, favicon, and social media preview images for the Code39 Barcode Generator.

## Created Files

### 1. Custom Favicon (`public/barcode-icon.svg`)
**Description:** Indigo barcode icon with "Code39" text
**Dimensions:** 100x100px (scalable SVG)
**Colors:**
- Background: #4F46E5 (Indigo 600)
- Barcode/Text: White

**Features:**
- Scalable vector graphics (looks sharp on all displays)
- Matches the application's indigo color scheme
- Barcode visual representation
- "Code39" text label

### 2. Open Graph Image (`public/og-image.svg`)
**Description:** Social media preview image
**Dimensions:** 1200x630px (Facebook/Twitter/LinkedIn standard)
**Colors:**
- Gradient background: #4F46E5 to #6366F1
- Text: White and light indigo shades

**Content:**
- Title: "Code39 Barcode Generator"
- Subtitle: "AI-Powered Barcode Generation with Claude"
- Visual: Large barcode illustration
- URL: "barcode.mght630.com"
- Attribution: "by Matt Hicks ❤️"

**Usage:**
- Shared links on Facebook, Twitter, LinkedIn
- iMessage/WhatsApp link previews
- Slack, Discord, and other messaging apps
- Search engine results (Google, Bing)

## Metadata Configuration

### Page Title
```
Code39 Barcode Generator | AI-Powered by Claude
```

### Description
```
Generate professional Code39 barcodes with AI-powered configuration.
Create custom barcode labels for inventory, assets, and products.
Built with Next.js and Claude AI by Matt Hicks.
```

### Keywords
- barcode generator
- code39
- barcode labels
- inventory labels
- asset tags
- AI barcode
- Claude AI

### Open Graph Tags
**Configured in `app/layout.tsx`:**
- `og:title`: Code39 Barcode Generator | AI-Powered
- `og:description`: Generate professional Code39 barcodes...
- `og:url`: https://barcode.mght630.com
- `og:image`: /og-image.svg (1200x630)
- `og:type`: website
- `og:locale`: en_US

### Twitter Card
**Type:** summary_large_image
- `twitter:card`: summary_large_image
- `twitter:title`: Code39 Barcode Generator | AI-Powered
- `twitter:description`: Generate professional Code39 barcodes...
- `twitter:image`: /og-image.svg
- `twitter:creator`: @mattghicks

### SEO Configuration
**Robots:** Indexable and crawlable
- `index`: true
- `follow`: true
- Google Bot optimizations enabled
- Image and video preview support

**Canonical URL:** https://barcode.mght630.com

## Preview Examples

### When Shared on Social Media
Users will see:
- Large preview image with barcode design
- Title: "Code39 Barcode Generator | AI-Powered"
- Description snippet
- URL: barcode.mght630.com
- Attribution to Matt Hicks

### In Browser Tab
- Custom indigo barcode favicon
- Page title with "Code39 Barcode Generator"

### In Search Results
- Optimized title and description
- Rich snippets with proper metadata
- Better click-through rates

## Testing Social Previews

### Facebook/LinkedIn
https://developers.facebook.com/tools/debug/
- Enter: https://barcode.mght630.com
- Click "Scrape Again" to refresh

### Twitter/X
https://cards-dev.twitter.com/validator
- Enter: https://barcode.mght630.com
- View preview card

### General Preview Tool
https://metatags.io/
- Enter: https://barcode.mght630.com
- See previews across all platforms

## Files Modified

1. **`app/layout.tsx`** - Added comprehensive metadata
2. **`public/barcode-icon.svg`** - Custom favicon (new)
3. **`public/favicon.svg`** - Copy of barcode icon (new)
4. **`public/og-image.svg`** - Social media preview (new)

## Color Palette

**Primary Colors:**
- Indigo 600: #4F46E5 (main brand color)
- Indigo 500: #6366F1 (gradient accent)
- White: #FFFFFF (text/elements)

**Supporting Colors:**
- Indigo 100: #E0E7FF (light text)
- Indigo 200: #C7D2FE (subdued text)

## Brand Guidelines

### Logo/Icon Usage
- Always maintain aspect ratio
- Minimum size: 32x32px
- Use on light backgrounds
- SVG preferred for scalability

### Messaging
**Primary:** "AI-Powered Barcode Generation"
**Secondary:** "Generate professional Code39 barcodes with Claude AI"
**Attribution:** "by Matt Hicks ❤️"

### Voice & Tone
- Professional but friendly
- Tech-savvy but accessible
- Emphasizes AI capabilities
- Highlights ease of use

## Future Enhancements

Potential improvements:
- [ ] PNG fallback favicons (16x16, 32x32, 192x192, 512x512)
- [ ] Apple Touch Icon (180x180)
- [ ] Windows Tile images
- [ ] Manifest.json for PWA support
- [ ] Animated favicon on barcode generation
- [ ] Dark mode OG image variant

---

**Created:** October 27, 2025
**Author:** Matt Hicks
**Last Updated:** October 27, 2025

# Quick Start Guide

## What's Included

Your Cal Freeman portfolio website is ready to customize! Here's what you have:

- ✅ Minimalist design with white background and black text
- ✅ Helvetica Neue typography 
- ✅ Subtle fade-in animations on scroll
- ✅ Responsive design (works on all devices)
- ✅ Portfolio grid for your projects
- ✅ About section with profile image
- ✅ Social media links
- ✅ Contact section

## First Steps

### 1. Preview the Website Locally

Open terminal and run:
```bash
cd /Users/tre.andrews1/cal/CalFreeman
python3 -m http.server 8000
```

Then visit: `http://localhost:8000`

### 2. Add Your Profile Image

1. Find or create a square image of yourself (600x600px recommended)
2. Save it as `profile.jpg` in the `assets/` folder
3. The website will automatically display it

### 3. Update Your Content

Open `index.html` in a text editor and customize:

- **Line 27-29**: Change "Writer & Director" title and subtitle
- **Line 45-78**: Update your 4 portfolio projects
  - Change project titles
  - Add descriptions
  - Add video URLs (use YouTube embeds or host your own videos)
- **Line 95-107**: Update your about section bio
- **Line 121-141**: Add your actual social media URLs
- **Line 143**: Update your contact email

### 4. Optional: Add More Projects

1. In `index.html`, copy one `<div class="portfolio-item">` block
2. Paste it in the portfolio-grid
3. Update the title, description, and video URL
4. The grid will automatically adapt

## Files Explained

| File | Purpose |
|------|---------|
| `index.html` | Main website structure |
| `styles.css` | Styling and animations |
| `script.js` | Interactive features |
| `fonts/` | Helvetica Neue font files |
| `assets/` | Put your images here |
| `config.json` | Website configuration |
| `README.md` | Full documentation |

## Video Sources

You can add videos in multiple ways:

### Option 1: YouTube
```html
<iframe width="100%" height="100%" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0"></iframe>
```

### Option 2: Local Video File
```html
<video muted loop>
  <source src="path/to/your-video.mp4" type="video/mp4">
</video>
```

### Option 3: Vimeo
```html
<iframe src="https://player.vimeo.com/video/VIDEO_ID" width="100%" height="100%"></iframe>
```

## Color Customization

To change from white/black to different colors:

1. Open `styles.css`
2. Search for `#ffffff` (white) - change to your background color
3. Search for `#000000` (black) - change to your text color

Example: Modern dark theme
- Background: `#1a1a1a` (dark gray)
- Text: `#ffffff` (white)

## Deployment Options

### Free Options:
- **GitHub Pages**: Upload to GitHub, enable Pages in settings
- **Netlify**: Connect GitHub repo, it deploys automatically
- **Vercel**: Similar to Netlify

### Paid Options:
- Buy a domain on GoDaddy/Namecheap
- Use any traditional web hosting (Bluehost, SiteGround, etc.)
- Upload files via FTP

## Common Customizations

### Change Font Size
In `styles.css`, modify `.hero-title`:
```css
.hero-title {
    font-size: 4rem;  /* Change this number */
}
```

### Add More Navigation Links
In `index.html`, add more `<li>` items in the `.nav-menu`

### Change Animation Speed
In `styles.css`, change `0.8s` to a different duration (higher = slower)

### Remove Social Links
In `index.html`, delete the social-link items you don't need

## Next Steps

1. ✅ Preview locally
2. ✅ Add your profile image
3. ✅ Update content in `index.html`
4. ✅ Add your videos
5. ✅ Test on mobile
6. ✅ Deploy to the internet

## Need Help with Videos?

To get video URLs:
1. **YouTube**: Share video → Copy URL
2. **Vimeo**: Similar process
3. **Local**: Upload MP4 to a cloud service (AWS S3, Cloudinary, etc.)

## Performance Tips

- Keep images under 100KB each
- Use MP4 for video format
- Test on different devices
- Monitor at https://pagespeed.web.dev/

## Time to Complete

- Preview: 2 minutes
- Add profile image: 2 minutes  
- Update content: 15-30 minutes
- Test: 5 minutes
- Deploy: 5-15 minutes

**Total: ~30-60 minutes to go live!**

---

Happy building! 🎬

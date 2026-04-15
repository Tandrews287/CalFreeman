# Cal Freeman - Portfolio Website

A clean, minimalist portfolio website for film writer and director Cal Freeman. Built with HTML, CSS, and JavaScript with a focus on simplicity and subtle animations.

## Features

- **Minimalist Design**: Clean white background with black text for maximum readability
- **Responsive Layout**: Fully responsive design that works on desktop, tablet, and mobile
- **Subtle Animations**: Smooth fade-in and scroll animations for visual interest
- **Helvetica Neue Typography**: Professional font family throughout
- **Portfolio Grid**: Showcase projects in a clean grid layout
- **Social Integration**: Links to Instagram, YouTube, and IMDb
- **Smooth Scrolling**: Easy navigation between sections

## Project Structure

```
CalFreeman/
├── index.html          # Main HTML file
├── styles.css          # Styling and animations
├── script.js           # JavaScript for interactivity
├── fonts/              # Helvetica Neue font files
│   ├── HelveticaNeue.otf
│   ├── HelveticaNeue-Medium.otf
│   └── HelveticaNeue-Bold.otf
├── assets/             # Images and media
│   └── profile.jpg     # Profile image (add your own)
└── README.md           # This file
```

## Customization Guide

### Update Profile Information

1. **Hero Section** (`index.html` lines 27-29):
   - Change the title and subtitle

2. **Portfolio Items** (`index.html` lines 45-78):
   - Update project titles and descriptions
   - Replace placeholder video sources with your own videos
   - You can use video hosting services or local video files

3. **About Section** (`index.html` lines 95-107):
   - Add your bio and background information
   - Replace `assets/profile.jpg` with your profile image

4. **Social Links** (`index.html` lines 121-141):
   - Update Instagram, YouTube, and IMDb URLs
   - Replace placeholder links with your actual profiles

5. **Contact Email** (`index.html` line 143):
   - Update the email address in the href attribute

### Add Profile Image

1. Place your profile image in the `assets/` folder
2. Name it `profile.jpg` (or update the filename in `index.html`)
3. Recommended size: 600x600px for best performance

### Customize Colors

The website uses white (`#ffffff`) backgrounds and black (`#000000`) text by default. If you want to change these:

1. Open `styles.css`
2. Find color values (search for `#000000` for black and `#ffffff` for white)
3. Replace with your preferred colors

### Add Videos

Replace the placeholder video sources with your own:

1. Host videos on a platform like YouTube, Vimeo, or use local files
2. Update the `src` attribute in each `<video>` tag
3. Example: `<source src="path/to/your-video.mp4" type="video/mp4">`

## Local Development

### Option 1: Simple HTTP Server (Recommended)

```bash
# Using Python 3
cd /Users/tre.andrews1/cal/CalFreeman
python3 -m http.server 8000

# Then open http://localhost:8000 in your browser
```

### Option 2: Using Node.js

```bash
npm install -g http-server
cd /Users/tre.andrews1/cal/CalFreeman
http-server
```

### Option 3: VS Code Live Server

- Install the "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

## Deployment

### Deploy to GitHub Pages

1. Push your repository to GitHub
2. Go to Settings → Pages
3. Select main branch as the source
4. Your site will be available at `https://username.github.io/CalFreeman`

### Deploy to Hosting Services

- **Netlify**: Connect your GitHub repo and deploy in one click
- **Vercel**: Similar to Netlify, supports automatic deployments
- **Firebase Hosting**: Use Firebase CLI for deployment
- **Traditional Hosting**: Upload files via FTP to any web hosting service

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

1. **Optimize Images**: Compress profile image to under 100KB
2. **Video Format**: Use MP4 format for best browser compatibility
3. **Lazy Loading**: Videos only play on hover, keeping performance optimal
4. **CDN**: Consider using a CDN for faster global delivery

## Customization Examples

### Change Section Backgrounds

In `styles.css`, modify the `.about` section:
```css
.about {
    background-color: #f0f0f0; /* Change this value */
    padding: 6rem 3rem;
}
```

### Adjust Animation Speed

In `styles.css`, modify animation duration (currently `0.8s`):
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
    /* Add: animation: fadeInUp 1.2s ease-out forwards; for slower animations */
}
```

### Add More Portfolio Items

1. Copy a portfolio-item div in `index.html`
2. Update the content
3. The CSS grid will automatically adjust to fit

## SEO Optimization

The website includes basic SEO elements:
- Meta tags for viewport and charset
- Semantic HTML5 structure
- Descriptive page title

To improve SEO further:
1. Add `meta description` tag
2. Use proper heading hierarchy
3. Optimize image alt text

## Accessibility

The website follows accessibility best practices:
- Proper heading hierarchy
- Color contrast compliant
- Keyboard navigation support
- Semantic HTML

## Support & Maintenance

- Update content regularly
- Test on different devices
- Monitor analytics
- Keep fonts and libraries current

## License

© 2026 Cal Freeman. All rights reserved.

---

**Need Help?** Contact for technical support or customization assistance.

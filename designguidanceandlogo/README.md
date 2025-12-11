# Nova CRM Logo Package

## 📦 Package Contents

This package includes three logo variations designed for the Nova CRM project using the Catppuccin Mocha + Innovaas Orange color scheme:

### Logo Files

1. **nova-crm-logo.svg** (200×60px)
   - Horizontal layout
   - Best for: Headers, navigation bars, email signatures
   - Use when you have horizontal space

2. **nova-crm-logo-stacked.svg** (140×100px)
   - Vertical/stacked layout
   - Best for: Sidebars, mobile views, compact spaces
   - Use when you have limited horizontal space

3. **nova-crm-icon.svg** (60×60px)
   - Icon only (no text)
   - Best for: Favicons, app icons, social media profiles
   - Use for sizes below 100px

4. **nova-crm-logo-showcase.html**
   - Interactive showcase with all variations
   - Includes usage guidelines and specifications
   - Open in browser to view

## 🎨 Design Elements

### Icon Concept
- **Exploding star/nova** symbolizing growth and transformation
- **Central orange core** representing the brand
- **Radiating rays** showing energy and expansion
- **Blue accent particles** representing data points and connections

### Colors Used
- **#F25C05** - Innovaas Orange (primary brand color)
- **#ff7b3d** - Orange Soft (accent rays)
- **#89b4fa** - Mocha Blue (data particles)
- **#74c7ec** - Mocha Sapphire (secondary particles)
- **#cdd6f4** - Mocha Text (for "Nova")
- **#a6adc8** - Mocha Subtext (for "CRM")

### Typography
- **Font:** Plus Jakarta Sans
- **"Nova":** 800 weight (Extra Bold)
- **"CRM":** 400 weight (Regular)

## 📐 Usage Guidelines

### Minimum Sizes
- Horizontal logo: 120px width minimum
- Stacked logo: 100px width minimum
- Icon only: 24px minimum

### Clear Space
Maintain at least 20px of clear space around all sides of the logo

### Background Requirements
- ✅ Optimized for dark backgrounds (#1e1e2e - #11111b)
- ⚠️ For light backgrounds, colors may need adjustment

### Do's
✅ Scale proportionally  
✅ Maintain aspect ratio  
✅ Use on dark backgrounds  
✅ Keep minimum clear space  
✅ Use SVG format when possible (infinite scaling)

### Don'ts
❌ Don't rotate or skew  
❌ Don't change colors  
❌ Don't add effects (shadows, outlines, etc.)  
❌ Don't stretch or distort  
❌ Don't recreate or redraw

## 🔧 Implementation

### HTML
```html
<!-- Horizontal Logo in Header -->
<img src="nova-crm-logo.svg" alt="Nova CRM" width="200" height="60">

<!-- Icon for Favicon -->
<link rel="icon" type="image/svg+xml" href="nova-crm-icon.svg">
```

### React
```jsx
import NovaLogo from './assets/nova-crm-logo.svg';

function Header() {
  return <img src={NovaLogo} alt="Nova CRM" className="logo" />;
}
```

### CSS Background
```css
.logo {
  background-image: url('nova-crm-logo.svg');
  background-size: contain;
  background-repeat: no-repeat;
  width: 200px;
  height: 60px;
}
```

## 📱 Creating PNG Versions (if needed)

If you need PNG versions for specific use cases, you can convert the SVG files:

### Using Online Tools
1. Visit [CloudConvert](https://cloudconvert.com/svg-to-png)
2. Upload the SVG file
3. Set desired dimensions
4. Download PNG

### Using Command Line (ImageMagick)
```bash
# Convert to PNG at specific size
convert -background none nova-crm-icon.svg -resize 512x512 nova-crm-icon-512.png

# Common favicon sizes
convert -background none nova-crm-icon.svg -resize 16x16 favicon-16.png
convert -background none nova-crm-icon.svg -resize 32x32 favicon-32.png
convert -background none nova-crm-icon.svg -resize 192x192 favicon-192.png
convert -background none nova-crm-icon.svg -resize 512x512 favicon-512.png
```

### Using Figma/Adobe Illustrator
1. Import the SVG file
2. Export as PNG at desired size
3. Ensure "Transparent Background" is checked

## 🌟 Design Philosophy

The Nova CRM logo represents:
- **Innovation** - Modern, geometric design
- **Growth** - Exploding star symbolism
- **Connectivity** - Radiating rays and data points
- **Professionalism** - Clean typography and balanced composition
- **Energy** - Dynamic orange brand color

The logo works harmoniously with the Catppuccin Mocha dark theme, creating a cohesive brand identity that feels both sophisticated and approachable.

## 📄 License & Usage

These logo files are created for the Nova CRM project. For any questions about usage rights or modifications, please contact the project owner.

---

**Created:** December 2025  
**Design System:** Catppuccin Mocha + Innovaas Orange  
**Version:** 1.0

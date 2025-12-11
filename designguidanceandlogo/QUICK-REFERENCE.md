# Nova CRM Logo - Quick Reference Card

## 🎯 File Sizes & Dimensions

| File | Width | Height | Use Case |
|------|-------|--------|----------|
| nova-crm-logo.svg | 200px | 60px | Headers, navigation |
| nova-crm-logo-stacked.svg | 140px | 100px | Sidebars, mobile |
| nova-crm-icon.svg | 60px | 60px | Favicons, app icons |

## 🎨 Color Palette

| Element | Color | Hex Code | Variable |
|---------|-------|----------|----------|
| Primary (core) | 🟠 Innovaas Orange | `#F25C05` | `--innovaas-orange` |
| Accent rays | 🟠 Orange Soft | `#ff7b3d` | `--innovaas-orange-soft` |
| Data particles | 🔵 Mocha Blue | `#89b4fa` | `--mocha-blue` |
| Data particles | 🔵 Mocha Sapphire | `#74c7ec` | `--mocha-sapphire` |
| "Nova" text | ⚪ Mocha Text | `#cdd6f4` | `--mocha-text` |
| "CRM" text | ⚪ Mocha Subtext | `#a6adc8` | `--mocha-subtext0` |

## 📏 Minimum Sizes

- **Horizontal:** 120px width
- **Stacked:** 100px width  
- **Icon:** 24px
- **Clear space:** 20px all sides

## 🔤 Typography

- **Font:** Plus Jakarta Sans
- **"Nova":** 800 weight
- **"CRM":** 400 weight

## 💻 Quick Implementation

### HTML
```html
<img src="nova-crm-logo.svg" alt="Nova CRM">
```

### React
```jsx
import logo from './nova-crm-logo.svg';
<img src={logo} alt="Nova CRM" />
```

### Favicon
```html
<link rel="icon" href="nova-crm-icon.svg" type="image/svg+xml">
```

## ✅ Do's & Don'ts

### ✅ Do
- Use on dark backgrounds
- Scale proportionally
- Keep clear space
- Use SVG when possible

### ❌ Don't
- Change colors
- Rotate or distort
- Add effects
- Use on light backgrounds (without adjusting)

## 📦 Export Sizes (if converting to PNG)

```
Favicon: 16x16, 32x32, 48x48
App Icon: 192x192, 512x512
Retina: 2x, 3x original size
```

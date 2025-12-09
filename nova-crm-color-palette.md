# Nova CRM Color Palette Guide
**Catppuccin Mocha + Innovaas Orange Theme**

Version 1.0 | December 2025

---

## 🎨 Quick Reference

### CSS Variables (Copy-paste ready)
```css
:root {
    /* Catppuccin Mocha Base Colors */
    --mocha-base: #1e1e2e;
    --mocha-mantle: #181825;
    --mocha-crust: #11111b;
    --mocha-surface0: #313244;
    --mocha-surface1: #45475a;
    --mocha-surface2: #585b70;
    --mocha-overlay0: #6c7086;
    --mocha-overlay1: #7f849c;
    --mocha-overlay2: #9399b2;
    
    /* Catppuccin Mocha Text Colors */
    --mocha-text: #cdd6f4;
    --mocha-subtext1: #bac2de;
    --mocha-subtext0: #a6adc8;
    
    /* Innovaas Brand Orange */
    --innovaas-orange: #F25C05;
    --innovaas-orange-hover: #D94C04;
    --innovaas-orange-soft: #ff7b3d;
    
    /* Catppuccin Mocha Accents */
    --mocha-lavender: #b4befe;
    --mocha-blue: #89b4fa;
    --mocha-sapphire: #74c7ec;
    --mocha-sky: #89dceb;
    --mocha-teal: #94e2d5;
    --mocha-green: #a6e3a1;
    --mocha-yellow: #f9e2af;
    --mocha-peach: #fab387;
    --mocha-maroon: #eba0ac;
    --mocha-red: #f38ba8;
    --mocha-mauve: #cba6f7;
    --mocha-pink: #f5c2e7;
    --mocha-flamingo: #f2cdcd;
    --mocha-rosewater: #f5e0dc;
}
```

---

## 📋 Color Categories

### 1. Background Colors
Used for page backgrounds, cards, and containers.

| Variable | Hex | Usage |
|----------|-----|-------|
| `--mocha-base` | `#1e1e2e` | Primary page background |
| `--mocha-mantle` | `#181825` | Sidebar, elevated surfaces |
| `--mocha-crust` | `#11111b` | Deeper backgrounds, modals |
| `--mocha-surface0` | `#313244` | Card backgrounds, input fields |
| `--mocha-surface1` | `#45475a` | Hover states, borders |
| `--mocha-surface2` | `#585b70` | Active states, dividers |

**Guidelines:**
- Use `base` for main content areas
- Use `mantle` for navigation and sidebars
- Use `crust` for modals and overlays
- Use `surface0-2` for interactive elements with hover/active states

---

### 2. Text Colors
Hierarchical text colors for readability and emphasis.

| Variable | Hex | Usage |
|----------|-----|-------|
| `--mocha-text` | `#cdd6f4` | Primary text, headings |
| `--mocha-subtext1` | `#bac2de` | Secondary text |
| `--mocha-subtext0` | `#a6adc8` | Tertiary text, captions |
| `--mocha-overlay2` | `#9399b2` | Disabled text |
| `--mocha-overlay1` | `#7f849c` | Placeholder text |
| `--mocha-overlay0` | `#6c7086` | De-emphasized text |

**Contrast Ratios (on `--mocha-base`):**
- `--mocha-text`: WCAG AAA (10.5:1)
- `--mocha-subtext1`: WCAG AA (7.8:1)
- `--mocha-subtext0`: WCAG AA (5.2:1)

---

### 3. Brand Colors (Primary Actions)
Innovaas orange for primary CTAs and brand elements.

| Variable | Hex | Usage |
|----------|-----|-------|
| `--innovaas-orange` | `#F25C05` | Primary buttons, brand accents, active states |
| `--innovaas-orange-hover` | `#D94C04` | Hover state for orange elements |
| `--innovaas-orange-soft` | `#ff7b3d` | Soft highlights, less prominent accents |

**Usage Guidelines:**
- Use for all primary CTAs (Submit, Save, Create buttons)
- Use for logo accents and brand elements
- Use for active navigation items
- Use for important status indicators
- **Avoid** using on large background areas (too intense)
- Always use white (`#FFFFFF`) text on orange backgrounds

**Accessibility:**
- Orange on dark backgrounds: AA compliant for all text sizes
- Orange text on white: Use `--innovaas-orange-hover` for better contrast

---

### 4. Semantic Accent Colors
Purpose-specific colors for UI states and categories.

#### Success & Positive
| Variable | Hex | Usage |
|----------|-----|-------|
| `--mocha-green` | `#a6e3a1` | Success messages, positive metrics, completed states |
| `--mocha-teal` | `#94e2d5` | Info badges, secondary success states |

#### Information & Neutral
| Variable | Hex | Usage |
|----------|-----|-------|
| `--mocha-blue` | `#89b4fa` | Info messages, links, neutral badges |
| `--mocha-sapphire` | `#74c7ec` | Secondary info states |
| `--mocha-sky` | `#89dceb` | Tertiary info accents |
| `--mocha-lavender` | `#b4befe` | Highlighted info, user avatars |

#### Warning & Attention
| Variable | Hex | Usage |
|----------|-----|-------|
| `--mocha-yellow` | `#f9e2af` | Warning messages, pending states |
| `--mocha-peach` | `#fab387` | Important notifications (use sparingly) |

#### Error & Danger
| Variable | Hex | Usage |
|----------|-----|-------|
| `--mocha-red` | `#f38ba8` | Error messages, destructive actions |
| `--mocha-maroon` | `#eba0ac` | Secondary error states |

#### Decorative
| Variable | Hex | Usage |
|----------|-----|-------|
| `--mocha-mauve` | `#cba6f7` | Charts, data visualization |
| `--mocha-pink` | `#f5c2e7` | Charts, decorative accents |
| `--mocha-flamingo` | `#f2cdcd` | Charts, soft highlights |
| `--mocha-rosewater` | `#f5e0dc` | Subtle backgrounds |

---

## 🎯 Component Usage Patterns

### Buttons

#### Primary Button
```css
.btn-primary {
    background: var(--innovaas-orange);
    color: #FFFFFF;
    border: none;
    box-shadow: 0 2px 8px rgba(242, 92, 5, 0.3);
}

.btn-primary:hover {
    background: var(--innovaas-orange-hover);
    box-shadow: 0 4px 12px rgba(242, 92, 5, 0.4);
}

.btn-primary:active {
    background: var(--innovaas-orange-hover);
    box-shadow: 0 1px 4px rgba(242, 92, 5, 0.3);
}

.btn-primary:disabled {
    background: var(--mocha-surface1);
    color: var(--mocha-overlay1);
    box-shadow: none;
}
```

#### Secondary Button
```css
.btn-secondary {
    background: var(--mocha-surface0);
    color: var(--mocha-text);
    border: 1px solid var(--mocha-surface1);
}

.btn-secondary:hover {
    background: var(--mocha-surface1);
    border-color: var(--mocha-surface2);
}
```

#### Tertiary/Ghost Button
```css
.btn-tertiary {
    background: transparent;
    color: var(--mocha-blue);
    border: none;
}

.btn-tertiary:hover {
    background: rgba(137, 180, 250, 0.1);
    color: var(--mocha-blue);
}
```

---

### Form Inputs

```css
.input {
    background: var(--mocha-surface0);
    border: 1px solid var(--mocha-surface1);
    color: var(--mocha-text);
}

.input:hover {
    border-color: var(--mocha-surface2);
}

.input:focus {
    border-color: var(--innovaas-orange);
    box-shadow: 0 0 0 3px rgba(242, 92, 5, 0.1);
}

.input::placeholder {
    color: var(--mocha-overlay1);
}

.input:disabled {
    background: var(--mocha-mantle);
    border-color: var(--mocha-surface0);
    color: var(--mocha-overlay0);
}
```

---

### Status Badges

```css
.badge-success {
    background: rgba(166, 227, 161, 0.15);
    color: var(--mocha-green);
}

.badge-info {
    background: rgba(137, 180, 250, 0.15);
    color: var(--mocha-blue);
}

.badge-warning {
    background: rgba(249, 226, 175, 0.15);
    color: var(--mocha-yellow);
}

.badge-error {
    background: rgba(243, 139, 168, 0.15);
    color: var(--mocha-red);
}

.badge-brand {
    background: rgba(242, 92, 5, 0.15);
    color: var(--innovaas-orange);
}
```

---

### Cards & Surfaces

```css
.card {
    background: var(--mocha-mantle);
    border: 1px solid var(--mocha-surface0);
    border-radius: 12px;
}

.card:hover {
    border-color: var(--mocha-surface1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Elevated Card */
.card-elevated {
    background: var(--mocha-surface0);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
```

---

### Navigation

```css
.nav-item {
    color: var(--mocha-subtext0);
}

.nav-item:hover {
    background: var(--mocha-surface0);
    color: var(--mocha-text);
}

.nav-item.active {
    background: linear-gradient(135deg, 
        rgba(242, 92, 5, 0.15), 
        rgba(242, 92, 5, 0.05));
    color: var(--innovaas-orange);
    border-left: 3px solid var(--innovaas-orange);
}
```

---

### Links

```css
a {
    color: var(--mocha-blue);
    text-decoration: none;
}

a:hover {
    color: var(--mocha-sapphire);
    text-decoration: underline;
}

a:visited {
    color: var(--mocha-lavender);
}
```

---

## 📊 Data Visualization

### Chart Color Sequence
Use this order for multi-series charts:

1. `--innovaas-orange` (`#F25C05`) - Primary data series
2. `--mocha-blue` (`#89b4fa`) - Secondary series
3. `--mocha-teal` (`#94e2d5`) - Tertiary series
4. `--mocha-lavender` (`#b4befe`) - Additional series
5. `--mocha-mauve` (`#cba6f7`) - Additional series
6. `--mocha-green` (`#a6e3a1`) - Additional series
7. `--mocha-yellow` (`#f9e2af`) - Additional series
8. `--mocha-pink` (`#f5c2e7`) - Additional series

**Recommended Chart.js/Recharts Configuration:**
```javascript
const chartColors = {
  primary: '#F25C05',
  secondary: '#89b4fa',
  tertiary: '#94e2d5',
  accent1: '#b4befe',
  accent2: '#cba6f7',
  accent3: '#a6e3a1',
  accent4: '#f9e2af',
  accent5: '#f5c2e7'
};

const chartOptions = {
  backgroundColor: '#1e1e2e',
  gridColor: '#313244',
  textColor: '#cdd6f4',
  tooltipBackground: '#181825',
  tooltipBorder: '#313244'
};
```

---

## 🎨 Tailwind Configuration

If using Tailwind CSS, add this to your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Base
        'mocha-base': '#1e1e2e',
        'mocha-mantle': '#181825',
        'mocha-crust': '#11111b',
        'mocha-surface': {
          0: '#313244',
          1: '#45475a',
          2: '#585b70',
        },
        'mocha-overlay': {
          0: '#6c7086',
          1: '#7f849c',
          2: '#9399b2',
        },
        // Text
        'mocha-text': '#cdd6f4',
        'mocha-subtext': {
          0: '#a6adc8',
          1: '#bac2de',
        },
        // Brand
        'innovaas-orange': {
          DEFAULT: '#F25C05',
          hover: '#D94C04',
          soft: '#ff7b3d',
        },
        // Accents
        'mocha-lavender': '#b4befe',
        'mocha-blue': '#89b4fa',
        'mocha-sapphire': '#74c7ec',
        'mocha-sky': '#89dceb',
        'mocha-teal': '#94e2d5',
        'mocha-green': '#a6e3a1',
        'mocha-yellow': '#f9e2af',
        'mocha-peach': '#fab387',
        'mocha-maroon': '#eba0ac',
        'mocha-red': '#f38ba8',
        'mocha-mauve': '#cba6f7',
        'mocha-pink': '#f5c2e7',
        'mocha-flamingo': '#f2cdcd',
        'mocha-rosewater': '#f5e0dc',
      }
    }
  }
}
```

---

## 🚫 Don'ts

1. **Never use Peach as primary brand color** - it's too muted
2. **Don't mix orange with yellow/green** - creates visual clash
3. **Avoid orange text on light backgrounds** - fails accessibility
4. **Don't use more than 3 accent colors per view** - creates visual chaos
5. **Never use pure white (`#FFFFFF`) for backgrounds** - too harsh against Mocha
6. **Don't use red/green together** - colorblind accessibility issue

---

## ✅ Best Practices

1. **Maintain contrast ratios** - Always check WCAG compliance
2. **Use orange sparingly** - Reserve for primary actions and key brand moments
3. **Leverage transparency** - Use `rgba()` with accent colors for backgrounds (15% opacity)
4. **Stay consistent** - Use the same color for the same semantic meaning
5. **Test in dark mode** - Catppuccin Mocha IS dark mode, ensure it works
6. **Add subtle shadows** - Helps create depth without breaking the aesthetic
7. **Use gradients tastefully** - Linear gradients with orange work well for highlights

---

## 🔧 IDE/Design Tool Integration

### VS Code
Install: **Catppuccin for VSCode** theme
- Matches the color palette exactly
- Provides syntax highlighting consistency

### Figma
Download: **Catppuccin Mocha Color Styles**
- Search community files for "Catppuccin Mocha"
- Import as local styles

### Adobe XD / Sketch
Import the CSS variables or use this ASE palette file (create manually):
- Export colors as ASE from provided hex values

---

## 📞 Support

For questions about this color system, contact:
- **Design Lead**: Todd Schiller (Innovaas Solutions)
- **Documentation**: v1.0 - December 2025

---

## 🔗 Resources

- **Catppuccin Official**: https://github.com/catppuccin/catppuccin
- **Innovaas Brand Guidelines**: [Internal Documentation]
- **WCAG Contrast Checker**: https://webaim.org/resources/contrastchecker/

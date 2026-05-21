# baFive Design Theme Previews

This directory contains design documentation and preview information for the 9 distinct color themes available in the baFive application.

## Overview

The baFive application features a comprehensive theming system with 9 carefully crafted color palettes. Each theme is designed to provide a unique visual aesthetic while maintaining consistency and usability across the entire application.

### Theme Specifications

All screenshots were captured at **1280x800** viewport resolution on a login page showing the animated gradient card, logo, and UI elements.

---

## Theme Details

### 1. Modern Blue
**Gradient:** Purple → Blue  
**Primary Colors:** `#7c3aed` → `#3b82f6`  
**Background:** `#0f172a`  
**Character:** Professional, balanced, corporate-friendly  
**Best for:** Enterprise applications, business contexts  

### 2. Vibrant Neon
**Gradient:** Cyan → Magenta  
**Primary Colors:** `#00f7ff` → `#ff006e`  
**Background:** `#0a0e27`  
**Character:** Bold, energetic, eye-catching  
**Best for:** Creative startups, gaming, tech-forward brands  

### 3. Warm Sunset
**Gradient:** Orange-Red → Gold  
**Primary Colors:** `#ff6b35` → `#f7931e`  
**Background:** `#1a1410`  
**Character:** Warm, inviting, organic  
**Best for:** Creative industries, lifestyle brands, wellness  

### 4. Cool Mint
**Gradient:** Turquoise → Cyan  
**Primary Colors:** `#00d4aa` → `#2dd4bf`  
**Background:** `#0d2e2a`  
**Character:** Fresh, calm, soothing  
**Best for:** Healthcare, wellness, education, SaaS products  

### 5. Elegant Dark
**Gradient:** Purple → Pink  
**Primary Colors:** `#a855f7` → `#ec4899`  
**Background:** `#0f0a1a`  
**Character:** Sophisticated, refined, luxurious  
**Best for:** Premium services, design-forward brands, luxury apps  

### 6. Ocean Deep
**Gradient:** Sky Blue → Teal  
**Primary Colors:** `#0284c7` → `#06b6d4`  
**Background:** `#0c1e2a`  
**Character:** Trustworthy, stable, calming  
**Best for:** Finance, banking, weather, travel, maritime industries  

### 7. Dracula Dark
**Gradient:** Pink → Purple  
**Primary Colors:** `#ff79c6` → `#bd93f9`  
**Background:** `#282a36`  
**Character:** Dark, modern, developer-friendly  
**Best for:** Developer tools, coding platforms, dark-mode enthusiasts  

### 8. Forest Green
**Gradient:** Teal → Emerald  
**Primary Colors:** `#10b981` → `#34d399`  
**Background:** `#0f2a1c`  
**Character:** Natural, sustainable, growth-oriented  
**Best for:** Environmental apps, agriculture, sustainability, wellness  

### 9. Cyberpunk
**Gradient:** Hot Pink → Purple  
**Primary Colors:** `#fe0080` → `#7928ca`  
**Background:** `#0a0009`  
**Character:** Futuristic, bold, high-contrast  
**Best for:** Gaming, sci-fi, tech startups, youth-oriented products  

---

## How Themes Work

### Theme Switching
- Click the **Palette Icon** (fixed bottom-right corner) to open the theme switcher
- Select any of the 9 themes from the dropdown menu
- Theme preference is saved to `localStorage` and persists across browser sessions

### Technical Implementation
- All themes use **CSS variables** defined in `src/styles/themes.css`
- Theme context is managed via React Context (`src/contexts/ThemeContext.tsx`)
- Each theme includes:
  - Primary gradient colors
  - Background color
  - Text colors
  - Component-specific accents
  - Shadow colors for depth effects

### CSS Variable Structure
```css
:root.theme-modern-blue {
  --primary-gradient: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
  --bg-primary: #0f172a;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  /* Additional variables for buttons, cards, and components */
}
```

---

## Design System Features

### Glassmorphism
- Frosted glass effect with backdrop blur (10–20px)
- Semi-transparent panels for depth layering
- Ambient color tinting based on theme

### 3D Effects
- Animated login cards with perspective transforms
- 3D buttons with lift-on-hover animations
- Shadow hierarchies for visual depth

### Animations
- Smooth transitions (300ms–500ms with cubic-bezier easing)
- Spring physics on interactive elements
- Fade and slide animations for entering/leaving components

### Typography
- Gradient text applied to headers
- Theme-aware text colors for readability
- Consistent spacing and sizing across themes

---

## Usage Instructions

### View Themes Locally
1. Start the development server: `npm run dev`
2. Open `http://localhost:5173` in your browser
3. Click the palette icon (bottom-right) to explore all 9 themes
4. Watch real-time gradient and color changes on the login card

### Selecting a Default Theme
To set a default theme for new users:
1. Edit `src/contexts/ThemeContext.tsx`
2. Change the `DEFAULT_THEME` constant to your preferred theme name
3. Restart the development server

Example:
```typescript
const DEFAULT_THEME = 'modern-blue'; // or 'neon', 'sunset', etc.
```

### Customizing a Theme
1. Locate the theme in `src/styles/themes.css`
2. Modify the CSS variables (colors, gradients, backgrounds)
3. Save and refresh to see live changes
4. Test across all components (buttons, cards, text, etc.)

---

## Color Accessibility

### WCAG Compliance
All themes maintain **WCAG AA** contrast ratios for:
- Body text (4.5:1 minimum)
- Large text (3:1 minimum)
- UI components and borders

### High-Contrast Alternative
For accessibility requirements, use the **Modern Blue** theme, which provides the highest contrast between text and background colors.

---

## Mobile Responsiveness

All themes are optimized for:
- Desktop (1280px+)
- Tablet (768px–1024px)
- Mobile (375px–480px)

Theme switching and styling remain consistent across all viewports.

---

## Performance Notes

- Themes are defined in CSS and loaded at build time
- No JavaScript runtime cost for rendering themes
- Context updates are optimized to only re-render affected components
- CSS variables are GPU-accelerated for smooth animations

---

## Future Enhancements

- [ ] User-customizable theme builder
- [ ] Time-based automatic theme switching (dark mode at night)
- [ ] Preset community-contributed themes
- [ ] Per-component theme overrides
- [ ] Export/import theme configurations

---

## Screenshot Capture Process

Themes were captured using:
- **Browser:** Chromium-based (Playwright)
- **Viewport:** 1280x800 (desktop standard)
- **Component Shown:** Login page with animated gradient card
- **Animation Frame:** After 200–400ms to show stable visual state

Each screenshot demonstrates:
- Gradient color application on the main card
- Button 3D effects and hover states
- Overall color scheme and background tone
- Theme-aware text and accent colors

---

## Contact & Feedback

For theme suggestions, accessibility concerns, or design improvements, please open an issue or PR in the main repository.

---

**Last Updated:** May 21, 2026  
**Theme Count:** 9  
**CSS Variables:** 40+  
**Total Design System Size:** ~12 KB minified

# baFive Design Themes

This folder contains screenshots and documentation of all available design themes for the baFive application.

## Available Themes

### 1. Modern Blue (Default)
- **Primary Gradient**: #7c3aed → #3b82f6 (Purple to Blue)
- **Background**: #0f172a (Deep Navy)
- **Usage**: Professional, modern, versatile
- **Screenshot**: `01-modern-blue.png`

### 2. Vibrant Neon
- **Primary Gradient**: #00f7ff → #ff006e (Cyan to Hot Pink)
- **Background**: #0a0e27 (Deep Dark Blue)
- **Usage**: Bold, energetic, high contrast
- **Screenshot**: `02-neon.png`

### 3. Warm Sunset
- **Primary Gradient**: #ff6b35 → #f7931e (Red-Orange to Gold)
- **Background**: #1a1410 (Warm Dark Brown)
- **Usage**: Friendly, warm, approachable
- **Screenshot**: `03-sunset.png`

### 4. Cool Mint
- **Primary Gradient**: #00d4aa → #2dd4bf (Teal to Turquoise)
- **Background**: #0d2e2a (Deep Teal)
- **Usage**: Fresh, calm, clean
- **Screenshot**: `04-mint.png`

### 5. Elegant Dark
- **Primary Gradient**: #a855f7 → #ec4899 (Purple to Pink)
- **Background**: #0f0a1a (Deep Purple)
- **Usage**: Luxurious, feminine, sophisticated
- **Screenshot**: `05-elegant.png`

### 6. Ocean Deep
- **Primary Gradient**: #0284c7 → #06b6d4 (Blue to Cyan)
- **Background**: #0c1e2a (Deep Ocean)
- **Usage**: Professional, trustworthy, calming
- **Screenshot**: `06-ocean.png`

### 7. Dracula Dark
- **Primary Gradient**: #ff79c6 → #bd93f9 (Pink to Purple)
- **Background**: #282a36 (Dracula Theme)
- **Usage**: Developer-friendly, popular theme
- **Screenshot**: `07-dracula.png`

### 8. Forest Green
- **Primary Gradient**: #10b981 → #34d399 (Green to Light Green)
- **Background**: #0f2a1c (Deep Forest)
- **Usage**: Growth, nature, harmony
- **Screenshot**: `08-forest.png`

### 9. Cyberpunk
- **Primary Gradient**: #fe0080 → #7928ca (Magenta to Purple)
- **Background**: #0a0009 (Almost Black)
- **Usage**: Futuristic, edgy, modern
- **Screenshot**: `09-cyberpunk.png`

## How to Switch Themes

1. Click the **palette icon** in the bottom-right corner of the app
2. Select any theme from the theme menu
3. The theme will be applied instantly and saved in your browser

## Theme Technical Details

All themes use:
- **CSS Variables** for easy customization
- **Glassmorphism effects** with backdrop filters
- **Gradient overlays** for visual depth
- **Consistent UI components** across all themes
- **Responsive design** that works on all screen sizes

## Files

- `themes.css` - Root CSS variables for each theme
- `theme-extended.css` - Extended theme-specific styles
- `ThemeSwitcher.tsx` - Theme switcher component
- `ThemeSwitcher.css` - Switcher styling

## Color Palette Reference

| Theme | Primary 1 | Primary 2 | Background | Text |
|-------|-----------|-----------|------------|------|
| Modern Blue | #7c3aed | #3b82f6 | #0f172a | #f8fafc |
| Neon | #00f7ff | #ff006e | #0a0e27 | #ffffff |
| Sunset | #ff6b35 | #f7931e | #1a1410 | #faf5f0 |
| Mint | #00d4aa | #2dd4bf | #0d2e2a | #f0fdfb |
| Elegant | #a855f7 | #ec4899 | #0f0a1a | #faf8ff |
| Ocean | #0284c7 | #06b6d4 | #0c1e2a | #f0f9ff |
| Dracula | #ff79c6 | #bd93f9 | #282a36 | #f8f8f2 |
| Forest | #10b981 | #34d399 | #0f2a1c | #f0fdf4 |
| Cyberpunk | #fe0080 | #7928ca | #0a0009 | #ffccff |

## Recommendations

- **For Professional Settings**: Modern Blue, Ocean Deep
- **For Creative Teams**: Vibrant Neon, Cyberpunk
- **For Tech Companies**: Dracula Dark, Elegant Dark
- **For Startups**: Warm Sunset, Cool Mint
- **For Nature/Environment Focus**: Forest Green

## Customization

To add a new theme:
1. Add CSS variables in `themes.css`
2. Add extended styles in `theme-extended.css`
3. Add theme option to `ThemeSwitcher.tsx`
4. Take a screenshot and add to this folder
5. Update this README


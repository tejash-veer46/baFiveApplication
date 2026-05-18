// Theme Screenshot Capture Documentation
// This file documents the process to capture all theme screenshots

const themes = [
  'modern-blue',
  'neon',
  'sunset',
  'mint',
  'elegant',
  'ocean',
  'dracula',
  'forest',
  'cyberpunk'
];

// Instructions:
// 1. Open browser DevTools (F12)
// 2. Go to Console tab
// 3. Run the following commands one by one for each theme

// Command template:
// document.documentElement.className = 'theme-{THEME_NAME}';
// localStorage.setItem('selectedTheme', '{THEME_NAME}');
// window.location.reload();

// Then manually take a screenshot and save it as:
// {NUMBER}-{THEME_NAME}.png

// Example:
// document.documentElement.className = 'theme-modern-blue';
// localStorage.setItem('selectedTheme', 'modern-blue');
// window.location.reload();
// After reload, take screenshot and save as 01-modern-blue.png

console.log('Instructions: Run one of these commands then take a screenshot:');
themes.forEach((theme, index) => {
  const num = String(index + 1).padStart(2, '0');
  console.log(`
// Theme ${num}: ${theme}
document.documentElement.className = 'theme-${theme}';
localStorage.setItem('selectedTheme', '${theme}');
  `);
});

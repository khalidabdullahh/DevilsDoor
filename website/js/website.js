/**
 * Devil's Door — Website Script
 * Handles Theme Management (System / Light / Dark) & Navigation.
 */

class ThemeManager {
  constructor() {
    this.storageKey = 'devilsdoor_theme_preference';
    this.toggleBtn = document.getElementById('theme-toggle');
    this.themes = ['system', 'light', 'dark'];
    this.currentTheme = localStorage.getItem(this.storageKey) || 'system';

    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);

    // Listen to system OS preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.currentTheme === 'system') {
        this.applyTheme('system');
      }
    });

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.cycleTheme());
    }
  }

  cycleTheme() {
    const nextIdx = (this.themes.indexOf(this.currentTheme) + 1) % this.themes.length;
    this.currentTheme = this.themes[nextIdx];
    localStorage.setItem(this.storageKey, this.currentTheme);
    this.applyTheme(this.currentTheme);
  }

  applyTheme(theme) {
    const root = document.documentElement;

    if (theme === 'system') {
      root.removeAttribute('data-theme');
      if (this.toggleBtn) this.toggleBtn.textContent = '🌓';
      if (this.toggleBtn) this.toggleBtn.setAttribute('title', 'Theme: System Default (Click to toggle)');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      if (this.toggleBtn) this.toggleBtn.textContent = '☀️';
      if (this.toggleBtn) this.toggleBtn.setAttribute('title', 'Theme: Light Mode (Click to toggle)');
    } else if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (this.toggleBtn) this.toggleBtn.textContent = '🌙';
      if (this.toggleBtn) this.toggleBtn.setAttribute('title', 'Theme: Dark Mode (Click to toggle)');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
});

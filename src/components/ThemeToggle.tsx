import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { isDarkMode, mounted, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 text-theme-secondary hover:text-ava-accent hover:bg-theme-secondary rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0 focus:border-0 theme-toggle-btn cursor-pointer flex items-center justify-center"
      aria-label="Toggle dark mode"
      type="button"
      disabled={!mounted}
    >
      {/* Always render both icons but only show the appropriate one after mounting */}
      <SunIcon className={`w-5 h-5 transition-opacity duration-200 ${mounted && !isDarkMode ? 'opacity-100' : 'opacity-0'}`} />
      <MoonIcon className={`w-5 h-5 transition-opacity duration-200 absolute ${mounted && isDarkMode ? 'opacity-100' : 'opacity-0'}`} />
    </button>
  );
} 
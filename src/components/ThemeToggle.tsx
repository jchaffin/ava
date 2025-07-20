import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle initial theme from localStorage and system preference
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
      
      setDark(isDark);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark, mounted]);

  // Always render the same structure to prevent hydration mismatch
  return (
    <button
      onClick={() => setDark(d => !d)}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
      aria-label="Toggle dark mode"
      type="button"
      disabled={!mounted}
    >
      {/* Always render both icons but only show the appropriate one after mounting */}
      <SunIcon className={`w-5 h-5 text-ava-primary dark:text-ava-cream transition-opacity ${mounted && !dark ? 'opacity-100' : 'opacity-0'}`} />
      <MoonIcon className={`w-5 h-5 text-ava-primary dark:text-ava-cream transition-opacity absolute ${mounted && dark ? 'opacity-100' : 'opacity-0'}`} />
    </button>
  );
} 
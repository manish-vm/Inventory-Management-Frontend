import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2.5 rounded-xl transition-all duration-300 overflow-hidden group
        ${theme === 'dark' 
          ? 'bg-surface-800 hover:bg-surface-700' 
          : 'bg-surface-100 hover:bg-surface-200'
        }
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Background effect */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
      `} />
      
      {theme === 'dark' ? (
        <div className="relative flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
          <Moon className="w-4 h-4 text-surface-500" />
        </div>
      ) : (
        <div className="relative flex items-center gap-2">
          <Moon className="w-4 h-4 text-surface-500" />
          <Sun className="w-5 h-5 text-orange-500 group-hover:-rotate-180 transition-transform duration-500" />
        </div>
      )}
      
      {/* Sparkle effect on hover */}
      {/* <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <Sparkles className={`w-4 h-4 ${theme === 'dark' ? 'text-primary-400' : 'text-accent-500'}`} />
      </div> */}
    </button>
  );
};

export default ThemeToggle;

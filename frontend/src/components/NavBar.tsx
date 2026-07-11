import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Home' },
  { to: '/planner', label: 'Planner' },
  { to: '/cook', label: 'Cook' },
  { to: '/recipes', label: 'Recipes' },
  { to: '/building-blocks', label: 'Building Blocks' },
  { to: '/pantry', label: 'Pantry' },
  { to: '/ingredients', label: 'Ingredients' },
  { to: '/grocery', label: 'Grocery List' },
  { to: '/expenses', label: 'Expenses' },
];

export function NavBar({
  theme,
  onToggleTheme,
}: {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}) {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__mark">🥣</span>
        <span className="navbar__title">Bowl&nbsp;Ledger</span>
      </div>
      <nav className="navbar__tabs">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) => 'navbar__tab' + (isActive ? ' navbar__tab--active' : '')}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <button
        className="navbar__theme-toggle"
        onClick={onToggleTheme}
        aria-label="Toggle dark mode"
        title="Toggle dark mode"
      >
        {theme === 'dark' ? '☾' : '☀'}
      </button>
    </header>
  );
}

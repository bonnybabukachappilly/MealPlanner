import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { Dashboard } from './pages/Dashboard';
import { Planner } from './pages/Planner';
import { Cook } from './pages/Cook';
import { Recipes } from './pages/Recipes';
import { RecipeDetail } from './pages/RecipeDetail';
import { BuildingBlocks } from './pages/BuildingBlocks';
import { ComponentDetail } from './pages/ComponentDetail';
import { Pantry } from './pages/Pantry';
import { Ingredients } from './pages/Ingredients';
import { GroceryList } from './pages/GroceryList';
import { Expenses } from './pages/Expenses';
import './App.css';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <NavBar theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/cook" element={<Cook />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/building-blocks" element={<BuildingBlocks />} />
            <Route path="/building-blocks/:id" element={<ComponentDetail />} />
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/grocery" element={<GroceryList />} />
            <Route path="/expenses" element={<Expenses />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

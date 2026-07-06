import { useNavigate } from 'react-router-dom';
import { Stars } from './DishCard';
import { CategoryTag } from './CategoryTag';
import type { Ingredient } from '../types';

function splitSteps(instructions: string): string[] {
  return instructions
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z])/))
    .map((s) => s.trim())
    .filter(Boolean);
}

export function DishDetail({
  name,
  category,
  servings,
  prepTime,
  rating,
  photo,
  tags,
  instructions,
  ingredients,
  sourceUrls,
  backTo,
}: {
  name: string;
  category: string;
  servings: number;
  prepTime: string;
  rating: number;
  photo?: string;
  tags: string[];
  instructions: string;
  ingredients: Ingredient[];
  sourceUrls: string[];
  backTo: string;
}) {
  const navigate = useNavigate();
  const steps = splitSteps(instructions);

  return (
    <div className="page">
      <button className="link-btn" onClick={() => navigate(backTo)}>
        ← Back
      </button>

      <div className="detail-hero">
        {photo && <img src={photo} alt={name} className="detail-hero__img" />}
        <div className="detail-hero__overlay">
          <CategoryTag category={category} />
          <h1>{name}</h1>
          <div className="detail-hero__meta">
            <span>{prepTime}</span>
            <span>· {servings} servings</span>
            <Stars rating={rating} />
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="tag-row">
          {tags.map((t) => (
            <span className="tag-chip" key={t}>
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="two-col">
        <div className="two-col__main">
          <h2>Steps</h2>
          <ol className="step-list">
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>

          {sourceUrls.length > 0 && (
            <>
              <h2>Source</h2>
              <ul className="list">
                {sourceUrls.map((u) => (
                  <li key={u}>
                    <a href={u} target="_blank" rel="noreferrer">
                      {u}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="two-col__side">
          <h2>Ingredients</h2>
          <ul className="ingredient-list">
            {ingredients.map((ing) => (
              <li key={ing.id} className="ingredient-list__row">
                <span>{ing.name}</span>
                <span className="ingredient-list__qty">
                  {ing.quantity}
                  {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

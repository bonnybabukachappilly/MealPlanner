import { TapeTab } from './CategoryTag';

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? 'star star--on' : 'star'}>
          ★
        </span>
      ))}
    </span>
  );
}

export function DishCard({
  photo,
  name,
  category,
  prepTime,
  servings,
  rating,
  onClick,
}: {
  photo?: string;
  name: string;
  category: string;
  prepTime?: string;
  servings?: number;
  rating?: number;
  onClick?: () => void;
}) {
  return (
    <button className="dish-card" onClick={onClick}>
      <TapeTab category={category} />
      <div className="dish-card__photo">
        {photo ? (
          <img src={photo} alt={name} loading="lazy" />
        ) : (
          <div className="dish-card__photo-placeholder">🍲</div>
        )}
        <div className="dish-card__gradient" />
        <div className="dish-card__title">{name}</div>
      </div>
      <div className="dish-card__meta">
        <span className="dish-card__meta-left">
          {prepTime && <span>{prepTime}</span>}
          {servings !== undefined && <span>· {servings} servings</span>}
        </span>
        {rating !== undefined && <Stars rating={rating} />}
      </div>
    </button>
  );
}

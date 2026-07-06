import { categoryColorStyle } from '../utils/categoryColors';

export function CategoryTag({ category, small }: { category: string; small?: boolean }) {
  return (
    <span
      className={`category-tag${small ? ' category-tag--sm' : ''}`}
      style={categoryColorStyle(category)}
    >
      {category}
    </span>
  );
}

/** The corner "tape label" tab used on batch/component/recipe cards — the app's signature element. */
export function TapeTab({ category }: { category: string }) {
  return <span className="tape-tab" style={categoryColorStyle(category)} aria-hidden="true" />;
}

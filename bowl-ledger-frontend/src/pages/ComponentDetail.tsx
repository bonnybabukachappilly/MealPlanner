import { useParams } from 'react-router-dom';
import { components } from '../data/dummyData';
import { DishDetail } from '../components/DishDetail';

export function ComponentDetail() {
  const { id } = useParams();
  const component = components.find((c) => c.id === id);

  if (!component) {
    return (
      <div className="page">
        <p className="empty-note">Component not found.</p>
      </div>
    );
  }

  return (
    <DishDetail
      name={component.name}
      category={component.category}
      servings={component.servings}
      prepTime={component.prepTime}
      rating={component.rating}
      photo={component.photo}
      tags={component.tags}
      instructions={component.instructions}
      ingredients={component.ingredients}
      sourceUrls={component.sourceUrls}
      backTo="/building-blocks"
    />
  );
}

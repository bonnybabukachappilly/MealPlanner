import { useParams } from 'react-router-dom';
import { recipes } from '../data/dummyData';
import { DishDetail } from '../components/DishDetail';

export function RecipeDetail() {
  const { id } = useParams();
  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <div className="page">
        <p className="empty-note">Recipe not found.</p>
      </div>
    );
  }

  return (
    <DishDetail
      name={recipe.name}
      category={recipe.category}
      servings={recipe.servings}
      prepTime={recipe.prepTime}
      rating={recipe.rating}
      photo={recipe.photo}
      tags={recipe.tags}
      instructions={recipe.instructions}
      ingredients={recipe.ingredients}
      sourceUrls={recipe.sourceUrls}
      backTo="/recipes"
    />
  );
}

import type { RecipeIngredient } from '../../services/recipeDetailsApi';
interface Props { ingredients: RecipeIngredient[] }
export default function RecipeIngredients({ ingredients }: Props) {
  return (
    <section aria-labelledby="ingredients-heading" className="recipe-ingredients-section">
      <h2 id="ingredients-heading" className="recipe-section-title">Ingredients</h2>
      {ingredients.length ? (
        <ul className="recipe-ingredients-list">
          {ingredients.map((ingredient, index) => (
            <li key={`${ingredient.id}-${index}`} className="recipe-ingredient">
              <div className="recipe-ingredient-media">
                {ingredient.img ? <img src={ingredient.img} alt="" loading="lazy" /> : <span className="recipe-ingredient-placeholder" aria-hidden="true">◌</span>}
              </div>
              <div className="recipe-ingredient-text"><span className="recipe-ingredient-name">{ingredient.name || 'Ingredient'}</span><span className="recipe-ingredient-amount">{ingredient.measure}</span></div>
            </li>
          ))}
        </ul>
      ) : <p className="recipe-muted">No ingredients have been provided.</p>}
    </section>
  );
}

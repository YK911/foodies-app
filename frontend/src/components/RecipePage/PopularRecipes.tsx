import { Link } from 'react-router-dom';
import type { RecipeDetails } from '../../services/recipeDetailsApi';
interface Props { recipes: RecipeDetails[]; isLoading: boolean; error: string | null }
export default function PopularRecipes({ recipes, isLoading, error }: Props) {
  return (
    <section aria-labelledby="popular-recipes-heading" className="recipe-popular">
      <h2 id="popular-recipes-heading" className="recipe-section-title">Popular recipes</h2>
      {isLoading && <p role="status">Loading popular recipes…</p>}
      {error && <p className="recipe-muted" role="status">{error}</p>}
      {!isLoading && !error && recipes.length === 0 && <p className="recipe-muted">No popular recipes available yet.</p>}
      <div className="recipe-popular-grid">
        {recipes.map((recipe) => <article className="recipe-popular-card" key={recipe.id}>
          <Link to={`/recipe/${encodeURIComponent(recipe.id)}`} className="recipe-popular-image" aria-label={`View ${recipe.title}`}>
            {recipe.thumb ? <img src={recipe.thumb} alt="" loading="lazy" /> : <span className="recipe-image-missing">No image</span>}
          </Link>
          <div className="recipe-popular-text">
            <h3><Link to={`/recipe/${encodeURIComponent(recipe.id)}`}>{recipe.title}</Link></h3>
            <p>{recipe.description}</p>
            <div className="recipe-popular-footer">
              <span className="recipe-popular-author">
                {recipe.owner.avatar ? <img src={recipe.owner.avatar} alt="" loading="lazy" /> : <span className="recipe-popular-avatar">{recipe.owner.name.charAt(0).toUpperCase()}</span>}
                <span>{recipe.owner.name}</span>
              </span>
              <Link className="recipe-popular-arrow" to={`/recipe/${encodeURIComponent(recipe.id)}`} aria-label={`Open ${recipe.title}`}>↗</Link>
            </div>
          </div>
        </article>)}
      </div>
    </section>
  );
}

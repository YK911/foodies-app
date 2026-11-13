import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { RecipeDetails } from '../../services/recipeDetailsApi';

interface Props { recipe: RecipeDetails; children: ReactNode }
export default function RecipeMainInfo({ recipe, children }: Props) {
  return (
    <section className="recipe-info" aria-labelledby="recipe-title">
      <div className="recipe-hero-media">
        {recipe.thumb ? <img src={recipe.thumb} alt={recipe.title} loading="eager" /> :
          <div className="recipe-image-missing" role="img" aria-label="Recipe image unavailable">No image</div>}
      </div>
      <div className="recipe-hero-copy">
        <div className="recipe-summary">
          <h1 id="recipe-title">{recipe.title}</h1>
          <div className="recipe-chips">
            {recipe.category && <span className="recipe-chip">{recipe.category}</span>}
            {recipe.time && <span className="recipe-chip">{recipe.time} min</span>}
          </div>
          {recipe.description && <p className="recipe-description">{recipe.description}</p>}
          {recipe.owner.id ? (
            <Link className="recipe-author" to={`/user/${encodeURIComponent(recipe.owner.id)}`}>
              {recipe.owner.avatar ? <img src={recipe.owner.avatar} alt="" /> :
                <span aria-hidden="true" className="recipe-avatar-fallback">{recipe.owner.name.charAt(0).toUpperCase()}</span>}
              <span><small>Created by:</small><strong>{recipe.owner.name}</strong></span>
            </Link>
          ) : <div className="recipe-author"><span>Created by: {recipe.owner.name}</span></div>}
        </div>
        {children}
      </div>
    </section>
  );
}

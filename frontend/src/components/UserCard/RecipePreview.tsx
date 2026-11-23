import { Link } from 'react-router-dom';
import type { ProfileRecipe } from '../../services/userProfileApi';
import styles from '../../pages/UserPage/UserPage.module.css';

import Arrow from '../../assets/icons/arrow-up-right.svg?react';
import Trash from '../../assets/icons/trash.svg?react';

interface Props {
  recipe: ProfileRecipe;
  canRemove: boolean;
  busy: boolean;
  favorite: boolean;
  onRemove: (id: string) => void;
}
export default function RecipePreview({ recipe, canRemove, favorite, busy, onRemove }: Props) {
  return (
    <article className={styles.recipeCard}>
      <Link
        to={`/recipe/${recipe.id}`}
        className={styles.recipeImage}
        aria-label={`View ${recipe.title}`}
      >
        {recipe.thumb ? (
          <img src={recipe.thumb} alt={recipe.title} loading="lazy" decoding="async" />
        ) : (
          <span className={styles.imagePlaceholder}>Recipe image</span>
        )}
      </Link>
      <div className={styles.cardTitleRow}>
        <h3>
          <Link to={`/recipe/${recipe.id}`}>{recipe.title}</Link>
        </h3>
        <p className={styles.cardDescription}>{recipe.description}</p>
      </div>
      <div className={styles.actions}>
        <Link
          to={`/recipe/${recipe.id}`}
          className={styles.iconButton}
          aria-label={`Open ${recipe.title}`}
        >
          <Arrow aria-hidden="true" />
        </Link>
        {canRemove && (
          <button
            type="button"
            className={styles.iconButton}
            disabled={busy}
            aria-label={
              favorite ? `Remove ${recipe.title} from favorites` : `Delete ${recipe.title}`
            }
            onClick={() => onRemove(recipe.id)}
          >
            <Trash aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}

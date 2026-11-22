import { Link } from 'react-router-dom';
import type { ProfileRecipe } from '../../services/userProfileApi';
import styles from '../../pages/UserPage/UserPage.module.css';

interface Props { recipe: ProfileRecipe; canRemove: boolean; busy: boolean; isDemo: boolean; onRemove: (id: string) => void }
export default function RecipePreview({ recipe, canRemove, busy, isDemo, onRemove }: Props) {
  return <article className={styles.recipeCard}>
    <Link to={isDemo ? '/recipe/test' : `/recipe/${recipe.id}`} className={styles.recipeImage} aria-label={`View ${recipe.title}`}>
      {recipe.thumb ? <img src={recipe.thumb} alt={recipe.title} loading="lazy" decoding="async" /> : <span className={styles.imagePlaceholder}>Recipe image</span>}
    </Link>
    <div className={styles.cardTitleRow}>
      <h3><Link to={isDemo ? '/recipe/test' : `/recipe/${recipe.id}`}>{recipe.title}</Link></h3>
      {canRemove && <button type="button" className={styles.removeButton} onClick={() => onRemove(recipe.id)} disabled={busy} aria-label={`Delete ${recipe.title}`} title="Delete recipe">×</button>}
    </div>
    <p className={styles.cardDescription}>{recipe.description}</p>
    <Link className={styles.recipeAuthor} to={isDemo ? '/user/demo' : `/user/${recipe.ownerId}`}>By {recipe.ownerName}</Link>
  </article>;
}

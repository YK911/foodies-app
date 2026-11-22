import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import HeartIcon from '../../assets/icons/heart.svg?react';
import ArrowUpRightIcon from '../../assets/icons/arrow-up-right.svg?react';
import type { RecipeListItem } from '../../services/recipesApi';
import css from './RecipeCard.module.css';

interface RecipeCardProps {
  recipe: RecipeListItem;
  isFavorite: boolean;
  isFavoritePending?: boolean;
  onToggleFavorite: (recipeId: string) => void;
}

export const RecipeCard = ({
  recipe,
  isFavorite,
  isFavoritePending = false,
  onToggleFavorite,
}: RecipeCardProps) => {
  const navigate = useNavigate();
  const { id, title, description, thumb, owner } = recipe;
  const recipePath = `/recipe/${id}`;

  return (
    <article className={css.card}>
      <Link to={recipePath} className={css.imageLink} tabIndex={-1} aria-hidden="true">
        {thumb ? (
          <img className={css.image} src={thumb} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className={css.imagePlaceholder} />
        )}
      </Link>

      <div className={css.body}>
        <div className={css.text}>
          <h3 className={css.title} title={title}>
            {title}
          </h3>
          <p className={css.description}>{description}</p>
        </div>

        <div className={css.footer}>
          {owner ? (
            <button
              type="button"
              className={css.author}
              onClick={() => navigate(`/user/${owner.id}`)}
              aria-label={`Open ${owner.name || 'author'} profile`}
            >
              <span className={css.avatar}>
                {owner.avatar && <img src={owner.avatar} alt="" loading="lazy" decoding="async" />}
              </span>
              <span className={css.authorName}>{owner.name}</span>
            </button>
          ) : (
            <span />
          )}

          <div className={css.actions}>
            <button
              type="button"
              className={clsx(css.iconButton, isFavorite && css.iconButtonActive)}
              onClick={() => onToggleFavorite(id)}
              disabled={isFavoritePending}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <HeartIcon className={css.icon} aria-hidden="true" />
            </button>
            <Link to={recipePath} className={css.iconButton} aria-label={`Open recipe ${title}`}>
              <ArrowUpRightIcon className={css.icon} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default RecipeCard;

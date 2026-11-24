import { Link } from 'react-router-dom';
import type { ProfileUserCard } from '../../services/userProfileApi';
import { Icon } from '../Icon/Icon';
import styles from '../../pages/UserPage/UserPage.module.css';

interface Props {
  user: ProfileUserCard;
  isFollowing: boolean;
  busy: boolean;
  isAuthenticated: boolean;
  onFollow: (id: string) => void;
}
export default function UserCard({ user, isFollowing, busy, isAuthenticated, onFollow }: Props) {
  return (
    <article className={styles.personCard}>
      <div className={styles.identity}>
        <Link
          to={`/user/${user.id}`}
          className={styles.personLink}
          aria-label={`Open profile for ${user.name}`}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className={styles.personAvatar}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className={styles.personInitials}>
              {(user.name || 'User')
                .trim()
                .split(/\s+/)
                .map((x) => x[0] || '')
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </span>
          )}
        </Link>
        <div className={styles.personInfo}>
          <Link to={`/user/${user.id}`}>
            <strong>{user.name}</strong>
          </Link>
          <small>{user.recipesCount} recipes</small>
          <button
            type="button"
            className={styles.outlineButton}
            onClick={() => onFollow(user.id)}
            disabled={busy || !isAuthenticated}
            aria-pressed={isFollowing}
          >
            {busy ? 'Updating…' : isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      </div>
      {user.recipes.length > 0 && (
        <ul className={styles.latestRecipes} aria-label="Latest recipes">
          {user.recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link to={`/recipe/${recipe.id}`} aria-label={recipe.title}>
                {recipe.thumb ? <img src={recipe.thumb} alt="" loading="lazy" /> : recipe.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        className={styles.iconButton}
        to={`/user/${user.id}`}
        aria-label={`Open ${user.name}'s profile`}
      >
        <Icon name="arrow-up-right" aria-hidden="true" />
      </Link>
    </article>
  );
}

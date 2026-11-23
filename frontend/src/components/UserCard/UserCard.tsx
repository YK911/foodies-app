import { Link } from 'react-router-dom';
import type { ProfileUserCard } from '../../services/userProfileApi';
import styles from '../../pages/UserPage/UserPage.module.css';

interface Props {
  user: ProfileUserCard;
  isFollowing: boolean;
  busy: boolean;
  isAuthenticated: boolean;
  onFollow: (id: string) => void;
  isDemo: boolean;
}
export default function UserCard({
  user,
  isFollowing,
  busy,
  isAuthenticated,
  onFollow,
  isDemo,
}: Props) {
  return (
    <article className={styles.personCard}>
      <Link to={isDemo ? '/user/demo' : `/user/${user.id}`} className={styles.personLink}>
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
        <span>
          <strong>{user.name}</strong>
          <small>{user.recipesCount} recipes</small>
        </span>
      </Link>
      <button
        type="button"
        className={styles.outlineButton}
        onClick={() => onFollow(user.id)}
        disabled={busy || !isAuthenticated}
        aria-pressed={isFollowing}
      >
        {busy ? 'Updating…' : isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </article>
  );
}

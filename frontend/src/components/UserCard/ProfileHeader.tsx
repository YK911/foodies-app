import type { ChangeEvent } from 'react';
import styles from '../../pages/UserPage/UserPage.module.css';
import type { ProfileUser } from '../../services/userProfileApi';
import { MainTitle } from '../Common';

interface Props {
  user: ProfileUser;
  isOwn: boolean;
  isAuthenticated: boolean;
  isFollowing: boolean;
  isBusy: boolean;
  avatarPreview: string | null;
  onFollow: () => void;
  onUpload: (file: File) => void;
}

const abbreviate = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

export default function ProfileHeader({
  user,
  isOwn,
  isAuthenticated,
  isFollowing,
  isBusy,
  avatarPreview,
  onFollow,
  onUpload,
}: Props) {
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = '';
  };
  return (
    <section className={styles.profileHeader} aria-label="User information">
      <div className={styles.avatarWrap}>
        {avatarPreview || user.avatar ? (
          <img
            className={styles.avatar}
            src={avatarPreview || user.avatar || ''}
            alt={`${user.name} avatar`}
            decoding="async"
          />
        ) : (
          <span className={styles.avatarFallback} aria-label={`${user.name} avatar`}>
            {abbreviate(user.name)}
          </span>
        )}
        {isOwn && (
          <label className={styles.avatarUpload} title="Change avatar">
            <span aria-hidden="true">✎</span>
            <span className="visually-hidden">Choose a profile picture</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFile}
              disabled={isBusy}
            />
          </label>
        )}
      </div>
      <div className={styles.profileDetails}>
        <MainTitle as="h2" className={styles.profileName}>{user.name}</MainTitle>
        {user.email && <p className={styles.email}>{user.email}</p>}
        <dl className={styles.stats}>
          <div>
            <dt>Recipes</dt>
            <dd>{user.recipesCount}</dd>
          </div>
          <div>
            <dt>Favorites</dt>
            <dd>{user.favoritesCount}</dd>
          </div>
          <div>
            <dt>Followers</dt>
            <dd>
              {user.followersCount +
                (!isOwn && isFollowing !== user.isFollowing ? (isFollowing ? 1 : -1) : 0)}
            </dd>
          </div>
          <div>
            <dt>Following</dt>
            <dd>{user.followingCount}</dd>
          </div>
        </dl>
        {!isOwn && (
          <button
            type="button"
            className={styles.darkButton}
            onClick={onFollow}
            disabled={isBusy || !isAuthenticated}
            aria-pressed={isFollowing}
          >
            {isBusy ? 'Updating…' : isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
        {!isOwn && !isAuthenticated && <p className={styles.note}>Sign in to follow this user.</p>}
      </div>
    </section>
  );
}

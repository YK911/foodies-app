import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, PathInfo } from '../../components/Common';
import ProfileHeader from '../../components/UserCard/ProfileHeader';
import RecipePreview from '../../components/UserCard/RecipePreview';
import UserCard from '../../components/UserCard/UserCard';
import { setUser } from '../../redux/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  deleteOwnRecipe,
  getProfile,
  getProfileTab,
  setFollow,
  uploadAvatar,
  type ProfileRecipe,
  type ProfileTab,
  type ProfileUser,
  type ProfileUserCard,
} from '../../services/userProfileApi';
import { demoProfile, demoTab, isDemoUser } from './demoProfileData';
import styles from './UserPage.module.css';

const TABS: { id: ProfileTab; label: string }[] = [
  { id: 'recipes', label: 'My recipes' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'followers', label: 'Followers' },
  { id: 'following', label: 'Following' },
];
const PAGE_SIZE = 6;
const isRecipeTab = (tab: ProfileTab): tab is 'recipes' | 'favorites' =>
  tab === 'recipes' || tab === 'favorites';
const isRecipe = (item: ProfileRecipe | ProfileUserCard): item is ProfileRecipe =>
  typeof (item as ProfileRecipe).title === 'string';
const isPerson = (item: ProfileRecipe | ProfileUserCard): item is ProfileUserCard =>
  typeof (item as ProfileUserCard).name === 'string';

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const authUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuth);
  const dispatch = useAppDispatch();
  const demo = isDemoUser(id);
  const own = Boolean(id && (authUser?.id === id || (demo && id === 'demo-self')));
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [tab, setTab] = useState<ProfileTab>('recipes');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Array<ProfileRecipe | ProfileUserCard>>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tabLoading, setTabLoading] = useState(true);
  const [tabError, setTabError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [deletedRecipeIds, setDeletedRecipeIds] = useState<string[]>([]);
  const avatarUrl = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (avatarUrl.current) URL.revokeObjectURL(avatarUrl.current);
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    setProfile(null);
    setActionError(null);
    setAvatarPreview(null);
    setFollowing(false);
    setFollowOverrides({});
    setDeletedRecipeIds([]);
    setTab('recipes');
    setPage(1);
    setProfileLoading(true);
    setProfileError(null);
    if (!id) {
      setProfileError('User ID is missing.');
      setProfileLoading(false);
      return () => controller.abort();
    }
    if (demo) {
      setProfile({ ...demoProfile, id: id === 'demo-self' ? 'demo-self' : demoProfile.id });
      setFollowing(demoProfile.isFollowing);
      setProfileLoading(false);
      return () => controller.abort();
    }
    getProfile(id, controller.signal)
      .then((user) => {
        if (!controller.signal.aborted) {
          setProfile(user);
          setFollowing(user.isFollowing);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setProfileError('Unable to load this profile.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setProfileLoading(false);
      });
    return () => controller.abort();
  }, [id, demo]);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setItems([]);
    setTabLoading(true);
    setTabError(null);
    const request = demo
      ? Promise.resolve(demoTab(tab, page, PAGE_SIZE, deletedRecipeIds))
      : getProfileTab(id, tab, page, PAGE_SIZE, controller.signal);
    request
      .then((data) => {
        if (!controller.signal.aborted) {
          setItems(data.items);
          setTotalPages(Math.max(1, data.totalPages));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setTabError('Unable to load this section.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setTabLoading(false);
      });
    return () => controller.abort();
  }, [id, demo, tab, page, deletedRecipeIds]);

  const changeTab = (next: ProfileTab) => {
    if (tab === next) return;
    setItems([]);
    setTabLoading(true);
    setTabError(null);
    setTab(next);
    setPage(1);
    setActionError(null);
  };
  const followProfile = async () => {
    if (!profile || busy || (!isAuthenticated && !demo) || own) return;
    const next = !following;
    setActionError(null);
    setFollowing(next);
    setBusy('profile-follow');
    try {
      if (!demo) await setFollow(profile.id, next);
    } catch {
      setFollowing(!next);
      setActionError('Could not update follow status. Please try again.');
    } finally {
      setBusy(null);
    }
  };
  const followPerson = async (userId: string) => {
    if (busy || (!isAuthenticated && !demo) || userId === authUser?.id) return;
    const person = items.find((item) => isPerson(item) && item.id === userId) as
      | ProfileUserCard
      | undefined;
    if (!person) return;
    const previous = followOverrides[userId] ?? person.isFollowing;
    const next = !previous;
    setActionError(null);
    setFollowOverrides((current) => ({ ...current, [userId]: next }));
    setBusy(userId);
    try {
      if (!demo) await setFollow(userId, next);
    } catch {
      setFollowOverrides((current) => ({ ...current, [userId]: previous }));
      setActionError('Could not update follow status. Please try again.');
    } finally {
      setBusy(null);
    }
  };
  const removeRecipe = async (recipeId: string) => {
    if (!own || busy || tab !== 'recipes' || !window.confirm('Delete this recipe?')) return;
    setActionError(null);
    setBusy(recipeId);
    try {
      if (!demo) await deleteOwnRecipe(recipeId);
      if (demo)
        setDeletedRecipeIds((current) =>
          current.includes(recipeId) ? current : [...current, recipeId],
        );
      setItems((current) => current.filter((item) => item.id !== recipeId));
      setProfile(
        (current) => current && { ...current, recipesCount: Math.max(0, current.recipesCount - 1) },
      );
    } catch {
      setActionError('Unable to delete this recipe.');
    } finally {
      setBusy(null);
    }
  };
  const changeAvatar = async (file: File) => {
    if (!own || busy) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setActionError('Use a JPG, PNG or WebP image under 5 MB.');
      return;
    }
    setActionError(null);
    setBusy('avatar');
    const nextUrl = URL.createObjectURL(file);
    if (avatarUrl.current) URL.revokeObjectURL(avatarUrl.current);
    avatarUrl.current = nextUrl;
    setAvatarPreview(nextUrl);
    try {
      const storedUrl = demo ? nextUrl : await uploadAvatar(file);
      setProfile((current) => (current ? { ...current, avatar: storedUrl } : current));
      if (!demo && authUser) dispatch(setUser({ ...authUser, avatar: storedUrl }));
      if (!demo) setAvatarPreview(null);
    } catch {
      setAvatarPreview(null);
      setActionError('Avatar upload failed. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className={styles.page}>
      <div className="container">
        {profileLoading ? (
          <div className={styles.status}>
            <Loader label="Loading profile" />
          </div>
        ) : profileError || !profile ? (
          <div className={styles.status} role="alert">
            {profileError || 'Profile not found.'}
          </div>
        ) : (
          <>
            <div className={styles.breadcrumb}>
              <PathInfo items={[{ label: 'Home', to: '/' }, { label: profile.name }]} />
            </div>
            <ProfileHeader
              user={profile}
              isOwn={own}
              isAuthenticated={isAuthenticated || demo}
              isFollowing={following}
              isBusy={busy !== null}
              onFollow={followProfile}
              avatarPreview={avatarPreview}
              onUpload={changeAvatar}
            />
            <section className={styles.content} aria-label="Profile sections">
              <div className={styles.tabs} role="tablist" aria-label="Profile content">
                {TABS.map(({ id: key, label }) => (
                  <button
                    key={key}
                    id={`profile-tab-${key}`}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    aria-controls="profile-tab-panel"
                    tabIndex={tab === key ? 0 : -1}
                    className={`${styles.tab} ${tab === key ? styles.activeTab : ''}`}
                    onClick={() => changeTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {actionError && (
                <p className={styles.error} role="alert">
                  {actionError}
                </p>
              )}
              <div
                id="profile-tab-panel"
                role="tabpanel"
                aria-labelledby={`profile-tab-${tab}`}
                className={styles.panel}
              >
                {tabLoading ? (
                  <div className={styles.status}>
                    <Loader label="Loading items" />
                  </div>
                ) : tabError ? (
                  <p role="alert" className={styles.error}>
                    {tabError}
                  </p>
                ) : items.length === 0 ? (
                  <div className={styles.empty}>Nothing here yet.</div>
                ) : isRecipeTab(tab) ? (
                  <div className={styles.recipesGrid}>
                    {items.filter(isRecipe).map((recipe) => (
                      <RecipePreview
                        key={recipe.id}
                        recipe={recipe}
                        canRemove={own && tab === 'recipes'}
                        busy={busy === recipe.id}
                        isDemo={demo}
                        onRemove={removeRecipe}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.peopleGrid}>
                    {items.filter(isPerson).map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        isFollowing={followOverrides[user.id] ?? user.isFollowing}
                        isAuthenticated={isAuthenticated || demo}
                        busy={busy === user.id}
                        onFollow={followPerson}
                        isDemo={demo}
                      />
                    ))}
                  </div>
                )}
              </div>
              {!tabLoading && !tabError && totalPages > 1 && (
                <nav className={styles.pagination} aria-label="Profile pagination">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </nav>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

import api from './api';

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  recipesCount: number;
  favoritesCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface ProfileRecipe {
  id: string;
  title: string;
  description: string;
  thumb: string | null;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string | null;
}

export interface ProfileUserCard {
  id: string;
  name: string;
  avatar: string | null;
  recipesCount: number;
  recipes: Pick<ProfileRecipe, 'id' | 'title' | 'thumb'>[];
  isFollowing: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

export type ProfileTab = 'recipes' | 'favorites' | 'followers' | 'following';

export const getProfile = async (id: string, signal?: AbortSignal): Promise<ProfileUser> =>
  (await api.get<ProfileUser>(`/users/${encodeURIComponent(id)}`, { signal })).data;

export const getProfileTab = async (
  id: string, tab: ProfileTab, page: number, limit = 6, signal?: AbortSignal,
): Promise<Paginated<ProfileRecipe | ProfileUserCard>> =>
  (await api.get<Paginated<ProfileRecipe | ProfileUserCard>>(
    `/users/${encodeURIComponent(id)}/${tab}`,
    { params: { page, limit }, signal },
  )).data;

export const setFollow = async (id: string, following: boolean): Promise<void> => {
  const url = `/users/${encodeURIComponent(id)}/follow`;
  if (following) await api.post(url);
  else await api.delete(url);
};

export const uploadAvatar = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('avatar', file);
  const { data } = await api.patch<{ avatar: string }>('/users/avatar', form);
  return data.avatar;
};

export const deleteOwnRecipe = async (id: string): Promise<void> => {
  await api.delete(`/recipes/${encodeURIComponent(id)}`);
};

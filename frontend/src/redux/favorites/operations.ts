import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { addToFavorites, fetchFavoriteIds, removeFromFavorites } from '../../services/recipesApi';
import { getErrorMessage } from '../../utils/getErrorMessage';
import type { RootState } from '../store';
import {
  setFavorite,
  setFavoriteIds,
  setFavoritePending,
  setFavoritesLoading,
} from './favoritesSlice';

type FavoritesThunk = ThunkAction<Promise<void>, RootState, unknown, UnknownAction>;

// Loads the current user's favorite ids once per session.
export const fetchFavorites = (): FavoritesThunk => async (dispatch, getState) => {
  const { auth, favorites } = getState();

  if (!auth.isAuth || favorites.isLoaded || favorites.isLoading) {
    return;
  }

  dispatch(setFavoritesLoading(true));

  try {
    dispatch(setFavoriteIds(await fetchFavoriteIds()));
  } catch {
    // Hearts simply start empty; toggling still works and corrects the state.
  } finally {
    dispatch(setFavoritesLoading(false));
  }
};

// Optimistically flips the heart and rolls back if the request fails.
export const toggleFavorite =
  (recipeId: string): FavoritesThunk =>
  async (dispatch, getState) => {
    const { ids, pendingIds } = getState().favorites;

    if (pendingIds.includes(recipeId)) {
      return;
    }

    const wasFavorite = ids.includes(recipeId);

    dispatch(setFavoritePending({ id: recipeId, isPending: true }));
    dispatch(setFavorite({ id: recipeId, isFavorite: !wasFavorite }));

    try {
      if (wasFavorite) {
        await removeFromFavorites(recipeId);
      } else {
        await addToFavorites(recipeId);
      }
    } catch (error) {
      dispatch(setFavorite({ id: recipeId, isFavorite: wasFavorite }));
      toast.error(getErrorMessage(error));
    } finally {
      dispatch(setFavoritePending({ id: recipeId, isPending: false }));
    }
  };

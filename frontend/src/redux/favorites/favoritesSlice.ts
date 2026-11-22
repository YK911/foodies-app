import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { logOut, setCredentials } from '../auth/authSlice';

export interface FavoritesState {
  ids: string[];
  // Recipes with a request in flight; their heart button is disabled.
  pendingIds: string[];
  isLoaded: boolean;
  isLoading: boolean;
}

const initialState: FavoritesState = {
  ids: [],
  pendingIds: [],
  isLoaded: false,
  isLoading: false,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavoriteIds: (state, action: PayloadAction<string[]>) => {
      state.ids = action.payload;
      state.isLoaded = true;
    },
    setFavoritesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setFavorite: (state, action: PayloadAction<{ id: string; isFavorite: boolean }>) => {
      const { id, isFavorite } = action.payload;
      const hasId = state.ids.includes(id);

      if (isFavorite && !hasId) {
        state.ids.push(id);
      }

      if (!isFavorite && hasId) {
        state.ids = state.ids.filter((favoriteId) => favoriteId !== id);
      }
    },
    setFavoritePending: (state, action: PayloadAction<{ id: string; isPending: boolean }>) => {
      const { id, isPending } = action.payload;

      state.pendingIds = isPending
        ? [...state.pendingIds, id]
        : state.pendingIds.filter((pendingId) => pendingId !== id);
    },
  },
  extraReducers: (builder) => {
    // Favorites belong to one user: drop them when the user changes.
    builder.addCase(logOut, () => initialState);
    builder.addCase(setCredentials, () => initialState);
  },
});

export const { setFavoriteIds, setFavoritesLoading, setFavorite, setFavoritePending } =
  favoritesSlice.actions;

export default favoritesSlice.reducer;

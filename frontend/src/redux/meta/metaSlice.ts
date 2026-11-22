import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Category {
  id: string;
  name: string;
}

export interface Area {
  id: string;
  name: string;
}

export interface Ingredient {
  id: string;
  name: string;
  desc: string | null;
  img: string | null;
}

export interface MetaState {
  ingredients: Ingredient[];
  categories: Category[];
  areas: Area[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MetaState = {
  ingredients: [],
  categories: [],
  areas: [],
  isLoading: false,
  error: null,
};

const metaSlice = createSlice({
  name: 'meta',
  initialState,
  reducers: {
    setIngredients: (state, action: PayloadAction<Ingredient[]>) => {
      state.ingredients = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setAreas: (state, action: PayloadAction<Area[]>) => {
      state.areas = action.payload;
    },
    setMetaLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setMetaError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetMeta: () => initialState,
  },
});

export const { setIngredients, setCategories, setAreas, setMetaLoading, setMetaError, resetMeta } =
  metaSlice.actions;

export default metaSlice.reducer;

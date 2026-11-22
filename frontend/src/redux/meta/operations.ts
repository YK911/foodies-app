import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import type { RootState } from '../store';
import {
  setAreas,
  setCategories,
  setIngredients,
  setMetaError,
  setMetaLoading,
  type Area,
  type Category,
  type Ingredient,
} from './metaSlice';

type MetaThunk = ThunkAction<Promise<void>, RootState, unknown, UnknownAction>;

const unwrapList = <T,>(payload: unknown, key: string): T[] => {
  let value: unknown = payload;
  for (let i = 0; i < 3; i += 1) {
    if (Array.isArray(value)) return value as T[];
    if (typeof value !== 'object' || value === null) return [];
    const obj: Record<string, unknown> = value as Record<string, unknown>;
    value = obj[key] ?? obj.data ?? obj.items ?? obj.results;
  }
  return [];
};

// Loads categories, areas and ingredients once; lists already in the store are not requested again.
export const fetchLookups = (): MetaThunk => async (dispatch, getState) => {
  const { categories, areas, ingredients, isLoading } = getState().meta;

  if (isLoading) {
    return;
  }

  const requests: Promise<void>[] = [];

  if (!categories.length) {
    requests.push(
      api.get<Category[]>('/categories').then(({ data }) => {
        dispatch(setCategories(unwrapList<Category>(data, 'categories')));
      }),
    );
  }

  if (!areas.length) {
    requests.push(
      api.get<Area[]>('/areas').then(({ data }) => {
        dispatch(setAreas(unwrapList<Area>(data, 'areas')));
      }),
    );
  }

  if (!ingredients.length) {
    requests.push(
      api.get<Ingredient[]>('/ingredients').then(({ data }) => {
        dispatch(setIngredients(unwrapList<Ingredient>(data, 'ingredients')));
      }),
    );
  }

  if (!requests.length) {
    return;
  }

  dispatch(setMetaLoading(true));
  dispatch(setMetaError(null));

  try {
    await Promise.all(requests);
  } catch (error) {
    dispatch(setMetaError(getErrorMessage(error)));
  } finally {
    dispatch(setMetaLoading(false));
  }
};

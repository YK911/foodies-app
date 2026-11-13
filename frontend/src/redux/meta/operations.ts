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
        dispatch(setCategories(data));
      }),
    );
  }

  if (!areas.length) {
    requests.push(
      api.get<Area[]>('/areas').then(({ data }) => {
        dispatch(setAreas(data));
      }),
    );
  }

  if (!ingredients.length) {
    requests.push(
      api.get<Ingredient[]>('/ingredients').then(({ data }) => {
        dispatch(setIngredients(data));
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

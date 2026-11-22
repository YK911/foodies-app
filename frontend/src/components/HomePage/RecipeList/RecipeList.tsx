import { useEffect } from 'react';
import { RecipeCard } from '../../RecipeCard';
import type { RecipeListItem } from '../../../services/recipesApi';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { fetchFavorites, toggleFavorite } from '../../../redux/favorites/operations';
import { openAuthModal } from '../../../redux/ui/uiSlice';
import css from './RecipeList.module.css';

interface RecipeListProps {
  recipes: RecipeListItem[];
}

export const RecipeList = ({ recipes }: RecipeListProps) => {
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector((state) => state.auth.isAuth);
  const favoriteIds = useAppSelector((state) => state.favorites.ids);
  const pendingIds = useAppSelector((state) => state.favorites.pendingIds);

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, isAuth]);

  const handleToggleFavorite = (recipeId: string) => {
    if (!isAuth) {
      dispatch(openAuthModal('signIn'));
      return;
    }

    dispatch(toggleFavorite(recipeId));
  };

  return (
    <ul className={css.list}>
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <RecipeCard
            recipe={recipe}
            isFavorite={isAuth && favoriteIds.includes(recipe.id)}
            isFavoritePending={pendingIds.includes(recipe.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        </li>
      ))}
    </ul>
  );
};

export default RecipeList;

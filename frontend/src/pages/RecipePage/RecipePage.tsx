import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader, PathInfo } from '../../components/Common';
import PopularRecipes from '../../components/RecipeDetails/PopularRecipes';
import RecipeIngredients from '../../components/RecipeDetails/RecipeIngredients';
import RecipeMainInfo from '../../components/RecipeDetails/RecipeMainInfo';
import RecipePreparation from '../../components/RecipeDetails/RecipePreparation';
import { useAppSelector } from '../../redux/hooks';
import {
  getPopularRecipes,
  getRecipe,
  updateFavorite,
  type RecipeDetails,
} from '../../services/recipeDetailsApi';
import './recipe-page.css';

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuth);
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [popular, setPopular] = useState<RecipeDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popularError, setPopularError] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setRecipe(null);
    setError(null);
    setFavoriteError(null);
    setLoading(true);
    if (!id) {
      setError('Recipe ID is missing.');
      setLoading(false);
      return () => controller.abort();
    }
    getRecipe(id, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setRecipe(result);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          isAxiosError(err) && err.response?.status === 404
            ? 'Recipe not found.'
            : 'Unable to load this recipe. Please try again later.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    setPopularError(null);
    setPopularLoading(true);
    getPopularRecipes(controller.signal)
      .then((results) => {
        if (!controller.signal.aborted)
          setPopular(results.filter((item) => item.id !== id).slice(0, 4));
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setPopularError('Popular recipes are currently unavailable.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setPopularLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  const toggleFavorite = async () => {
    if (!recipe || saving) return;
    setFavoriteError(null);

    if (!isAuthenticated) {
      setFavoriteError('Please sign in to add recipes to your favorites.');
      return;
    }
    const next = !recipe.isFavorite;
    setSaving(true);
    try {
      await updateFavorite(recipe.id, next);
      setRecipe((current) =>
        current?.id === recipe.id ? { ...current, isFavorite: next } : current,
      );
    } catch {
      setFavoriteError('Could not update favorites. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="recipe-page">
      <div className="recipe-container">
        {loading ? (
          <div className="recipe-page-message">
            <Loader label="Loading recipe" />
          </div>
        ) : error || !recipe ? (
          <div className="recipe-page-message" role="alert">
            <h1>Recipe unavailable</h1>
            <p>{error ?? 'Recipe not found.'}</p>
            <Link to="/">Go home</Link>
          </div>
        ) : (
          <>
            <PathInfo
              className="recipe-path-info"
              items={[{ label: 'Home', to: '/' }, { label: recipe.title }]}
            />
            <div className="recipe-content-grid">
              <RecipeMainInfo recipe={recipe}>
                <RecipeIngredients ingredients={recipe.ingredients} />
                <RecipePreparation
                  steps={recipe.instructions}
                  isFavorite={recipe.isFavorite}
                  isAuthenticated={isAuthenticated}
                  isSaving={saving}
                  onToggleFavorite={toggleFavorite}
                />
                {favoriteError && (
                  <p role="alert" className="recipe-action-error">
                    {favoriteError}
                  </p>
                )}
              </RecipeMainInfo>
            </div>
          </>
        )}
        <PopularRecipes recipes={popular} isLoading={popularLoading} error={popularError} />
      </div>
    </main>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArrowLeftIcon from '../../assets/icons/arrow-left.svg?react';
import { Loader, MainTitle, Subtitle } from '../Common';
import { RecipeFilters, type RecipeFiltersValue } from '../RecipeFilters';
import { RecipeList } from '../RecipeList';
import { RecipePagination } from '../RecipePagination';
import { fetchRecipes, type RecipesPage } from '../../services/recipesApi';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import css from './Recipes.module.css';

// URL search params are the single source of truth, so filters and page survive reloads
// and the browser back button.
export const CATEGORY_PARAM = 'category';
const INGREDIENT_PARAM = 'ingredient';
const AREA_PARAM = 'area';
const PAGE_PARAM = 'page';

const MOBILE_LIMIT = 8;
const DEFAULT_LIMIT = 12;

const DESCRIPTION =
  'Go on a taste journey, where every sip is a sophisticated creative chord, and every dessert is an expression of the most refined gastronomic desires.';

const parsePage = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const Recipes = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 767.98px)');
  const limit = isMobile ? MOBILE_LIMIT : DEFAULT_LIMIT;

  const category = searchParams.get(CATEGORY_PARAM) ?? '';
  const ingredient = searchParams.get(INGREDIENT_PARAM) ?? '';
  const area = searchParams.get(AREA_PARAM) ?? '';
  const page = parsePage(searchParams.get(PAGE_PARAM));

  const [result, setResult] = useState<RecipesPage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    fetchRecipes({ category, ingredient, area, page, limit }, controller.signal)
      .then(setResult)
      .catch((fetchError: unknown) => {
        if (!controller.signal.aborted) {
          setResult(null);
          setError(getErrorMessage(fetchError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [category, ingredient, area, page, limit]);

  const updateParams = (changes: Record<string, string | number | null>) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      Object.entries(changes).forEach(([key, value]) => {
        if (value === null || value === '' || (key === PAGE_PARAM && value === 1)) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      return next;
    });
  };

  // Any filter change starts again from the first page.
  const handleFiltersChange = (filters: RecipeFiltersValue) => {
    updateParams({
      [INGREDIENT_PARAM]: filters.ingredient,
      [AREA_PARAM]: filters.area,
      [PAGE_PARAM]: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({ [PAGE_PARAM]: nextPage });
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBack = () => {
    updateParams({
      [CATEGORY_PARAM]: null,
      [INGREDIENT_PARAM]: null,
      [AREA_PARAM]: null,
      [PAGE_PARAM]: null,
    });
  };

  const recipes = result?.recipes ?? [];
  const totalPages = result?.totalPages ?? 1;

  const renderContent = () => {
    if (isLoading && !result) {
      return <Loader className={css.loader} label="Loading recipes" />;
    }

    if (error) {
      return (
        <p className={css.message} role="alert">
          {error}
        </p>
      );
    }

    if (!recipes.length) {
      return (
        <p className={css.message}>
          No recipes match these filters yet. Try another ingredient or area.
        </p>
      );
    }

    return (
      <div className={css.results} aria-busy={isLoading}>
        <RecipeList recipes={recipes} />
        <RecipePagination
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    );
  };

  return (
    <section ref={sectionRef} className={css.section} aria-labelledby="recipes-title">
      <div className="container">
        <div className={css.heading}>
          <button type="button" className={css.backButton} onClick={handleBack}>
            <ArrowLeftIcon className={css.backIcon} aria-hidden="true" />
            Back
          </button>
          <MainTitle as="h2" id="recipes-title">
            {category || 'All recipes'}
          </MainTitle>
          <Subtitle className={css.subtitle}>{DESCRIPTION}</Subtitle>
        </div>

        <div className={css.layout}>
          <RecipeFilters
            className={css.filters}
            value={{ ingredient, area }}
            onChange={handleFiltersChange}
          />
          <div className={css.content}>{renderContent()}</div>
        </div>
      </div>
    </section>
  );
};

export default Recipes;

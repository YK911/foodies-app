import api from './api';

export interface NewRecipeIngredient {
  id: string;
  measure: string;
}

export interface NewRecipe {
  thumb: File;
  title: string;
  description: string;
  category: string;
  area: string;
  time: number;
  ingredients: NewRecipeIngredient[];
  instructions: string;
}

// The create-recipe endpoint is not merged yet. Field names follow the Prisma Recipe model:
// category and area are sent by name, time as minutes, ingredients as a JSON string.
export const buildRecipeFormData = (recipe: NewRecipe): FormData => {
  const formData = new FormData();

  formData.append('title', recipe.title.trim());
  formData.append('description', recipe.description.trim());
  formData.append('category', recipe.category);
  formData.append('area', recipe.area);
  formData.append('time', String(recipe.time));
  formData.append('instructions', recipe.instructions.trim());
  formData.append(
    'ingredients',
    JSON.stringify(recipe.ingredients.map(({ id, measure }) => ({ id, measure: measure.trim() }))),
  );
  formData.append('thumb', recipe.thumb);

  return formData;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {};

// Accepts a plain recipe or a { data } / { recipe } wrapper.
const extractRecipeId = (payload: unknown): string | null => {
  const body = asRecord(payload);
  const recipe = asRecord(body.data ?? body.recipe ?? body);
  const id = recipe.id ?? recipe._id;

  return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
};

// Axios sets the multipart Content-Type (with its boundary) for FormData on its own.
export const createRecipe = async (recipe: NewRecipe): Promise<string> => {
  const { data } = await api.post<unknown>('/recipes', buildRecipeFormData(recipe));
  const id = extractRecipeId(data);

  if (!id) {
    throw new Error('The recipe was saved, but the server did not return its id.');
  }

  return id;
};

// ---------------------------------------------------------------------------
// Recipe search and favorites.
// The backend routes are not merged yet. The client assumes:
//   GET    /recipes?category=&area=&ingredient=&page=&limit=  -> { total, page, limit, recipes }
//   GET    /recipes/favorites                                 -> recipes (array or wrapper)
//   POST   /recipes/:id/favorite
//   DELETE /recipes/:id/favorite
// Parsing below accepts the usual wrapper and field-name variants, so small backend
// differences do not break the UI.
// ---------------------------------------------------------------------------

export interface RecipeOwner {
  id: string;
  name: string;
  avatar: string | null;
}

export interface RecipeListItem {
  id: string;
  title: string;
  description: string;
  thumb: string | null;
  owner: RecipeOwner | null;
}

export interface RecipesQuery {
  category?: string;
  area?: string;
  ingredient?: string;
  page: number;
  limit: number;
}

export interface RecipesPage {
  recipes: RecipeListItem[];
  page: number;
  totalPages: number;
  total: number;
}

const asString = (value: unknown): string | null =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : null;

const asNumber = (value: unknown): number | null => {
  const number = typeof value === 'string' ? Number(value) : value;
  return typeof number === 'number' && Number.isFinite(number) ? number : null;
};

const pickArray = (body: Record<string, unknown>): unknown[] => {
  const candidate = [body.recipes, body.results, body.items, body.data].find(Array.isArray);
  return (candidate as unknown[] | undefined) ?? [];
};

const toOwner = (value: unknown): RecipeOwner | null => {
  const owner = asRecord(value);
  const id = asString(owner.id ?? owner._id);

  if (!id) {
    return null;
  }

  return {
    id,
    name: asString(owner.name) ?? '',
    avatar: asString(owner.avatar),
  };
};

const toRecipe = (value: unknown): RecipeListItem | null => {
  const recipe = asRecord(value);
  const id = asString(recipe.id ?? recipe._id);

  if (!id) {
    return null;
  }

  return {
    id,
    title: asString(recipe.title) ?? '',
    description: asString(recipe.description ?? recipe.instructions) ?? '',
    thumb: asString(recipe.thumb),
    owner: toOwner(recipe.owner),
  };
};

const toRecipes = (items: unknown[]): RecipeListItem[] =>
  items.map(toRecipe).filter((recipe): recipe is RecipeListItem => recipe !== null);

export const fetchRecipes = async (
  { category, area, ingredient, page, limit }: RecipesQuery,
  signal?: AbortSignal,
): Promise<RecipesPage> => {
  const { data } = await api.get<unknown>('/recipes', {
    params: {
      category: category || undefined,
      area: area || undefined,
      ingredient: ingredient || undefined,
      page,
      limit,
    },
    signal,
  });

  const body = Array.isArray(data) ? { recipes: data } : asRecord(data);
  const recipes = toRecipes(pickArray(body));
  const total = asNumber(body.total ?? body.totalCount ?? body.count) ?? recipes.length;
  const totalPages =
    asNumber(body.totalPages ?? body.pages) ?? Math.max(1, Math.ceil(total / limit));

  return {
    recipes,
    total,
    totalPages: Math.max(1, totalPages),
    page: asNumber(body.page) ?? page,
  };
};

export const fetchFavoriteIds = async (): Promise<string[]> => {
  const { data } = await api.get<unknown>('/recipes/favorites');
  const items = Array.isArray(data) ? data : pickArray(asRecord(data));

  return toRecipes(items).map(({ id }) => id);
};

export const addToFavorites = async (recipeId: string): Promise<void> => {
  await api.post(`/recipes/${encodeURIComponent(recipeId)}/favorite`);
};

export const removeFromFavorites = async (recipeId: string): Promise<void> => {
  await api.delete(`/recipes/${encodeURIComponent(recipeId)}/favorite`);
};

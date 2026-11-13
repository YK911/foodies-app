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

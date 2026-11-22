import api from './api';

// The backend recipe/favorites routes are not merged into dev yet.
// Keep endpoint paths in this adapter to avoid coupling page components to routing decisions.
export interface RecipeIngredient {
  id: string;
  name: string;
  img: string | null;
  measure: string;
}

export interface RecipeDetails {
  id: string;
  title: string;
  thumb: string | null;
  category: string;
  area: string;
  description: string;
  instructions: string[];
  time: string;
  owner: { id: string; name: string; avatar: string | null };
  ingredients: RecipeIngredient[];
  isFavorite: boolean;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const asString = (value: unknown): string =>
  typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
const asNullable = (value: unknown): string | null => asString(value) || null;
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

// Supports both a plain Prisma-style response and { data: ... } / { recipe: ... } wrappers.
export function normalizeRecipe(input: unknown): RecipeDetails {
  const envelope = asRecord(input);
  const entity = asRecord(envelope.data ?? envelope.recipe ?? input);
  const owner = asRecord(entity.owner ?? entity.author);
  const category = asRecord(entity.category);
  const area = asRecord(entity.area);
  const rawInstructions = entity.instructions;
  const instructions = Array.isArray(rawInstructions)
    ? rawInstructions.map(asString).filter(Boolean)
    : asString(rawInstructions)
        .split(/\r?\n+/)
        .map((line) => line.trim())
        .filter(Boolean);
  return {
    id: asString(entity.id ?? entity._id),
    title: asString(entity.title),
    thumb: asNullable(entity.thumb ?? entity.image),
    category: asString(entity.categoryName ?? category.name ?? entity.category),
    area: asString(entity.areaName ?? area.name ?? entity.area),
    description: asString(entity.description),
    instructions,
    time: asString(entity.time),
    owner: {
      id: asString(entity.ownerId ?? owner.id ?? owner._id),
      name: asString(owner.name) || 'Unknown author',
      avatar: asNullable(owner.avatar),
    },
    ingredients: asArray(entity.ingredients).map((raw) => {
      const link = asRecord(raw);
      const ingredient = asRecord(link.ingredient);
      return {
        id: asString(link.ingredientId ?? ingredient.id ?? link.id),
        name: asString(ingredient.name ?? link.name),
        img: asNullable(ingredient.img ?? link.img),
        measure: asString(link.measure),
      };
    }),
    isFavorite: Boolean(entity.isFavorite ?? entity.isFavourite),
  };
}

export async function getRecipe(id: string, signal?: AbortSignal): Promise<RecipeDetails> {
  const { data } = await api.get<unknown>(`/recipes/${encodeURIComponent(id)}`, { signal });
  return normalizeRecipe(data);
}

export async function getPopularRecipes(signal?: AbortSignal): Promise<RecipeDetails[]> {
  const { data } = await api.get<unknown>('/recipes/popular', { signal, params: { limit: 5 } });
  const envelope = asRecord(data);
  const array = asArray(Array.isArray(data) ? data : envelope.data ?? envelope.recipes ?? envelope.results);
  return array.map(normalizeRecipe).slice(0, 5);
}

// API contract pending backend implementation. Paths are isolated here for later alignment.
export async function updateFavorite(id: string, favorite: boolean): Promise<void> {
  if (favorite) await api.post(`/recipes/${encodeURIComponent(id)}/favorite`);
  else await api.delete(`/recipes/${encodeURIComponent(id)}/favorite`);
}

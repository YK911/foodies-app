import type { Paginated, ProfileRecipe, ProfileTab, ProfileUser, ProfileUserCard } from '../../services/userProfileApi';

/** FE-09 presentation-only fixture. Production IDs never use demo data. */
export const isDemoUser = (id?: string) => import.meta.env.DEV && (id === 'demo' || id === 'test' || id === 'demo-self');

// Ten different images, so the preview cards do not repeatedly show the same photos.
const photos = [
  'photo-1547592180-85f173990554',
  'photo-1565299624946-b28f40a0ae38',
  'photo-1565958011703-44f9829ba187',
  'photo-1546069901-ba9599a7e63c',
  'photo-1512621776951-a57141f2eefd',
  'photo-1504674900247-0877df9cc836',
  'photo-1555939594-58d7cb561ad1',
  'photo-1473093295043-cdd812d0e601',
  'photo-1540189549336-e6e99c3679fe',
  'photo-1505252585461-04db1eb84625',
].map(photo => `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=720&q=80`);
const names = ['Salmon avocado salad', 'Homemade flatbread', 'Berry cheesecake', 'Buddha bowl', 'Roasted vegetables', 'Garden salad', 'Pasta with herbs', 'Lemon pancakes', 'Cream soup', 'Tropical smoothie'];

export const demoProfile: ProfileUser = {
  id: 'demo', name: 'Nadia Baker', email: 'nadia@example.com', avatar: null,
  recipesCount: 10, favoritesCount: 8, followersCount: 25, followingCount: 14, isFollowing: false,
};

export const demoRecipes: ProfileRecipe[] = names.map((title, i) => ({
  id: `demo-recipe-${i + 1}`, title,
  description: 'A delicious recipe made with fresh ingredients and plenty of love.',
  thumb: photos[i], ownerId: 'demo', ownerName: 'Nadia Baker', ownerAvatar: null,
}));

export const demoPeople: ProfileUserCard[] = [
  'Sophia Green', 'Oliver Scott', 'Olivia Taylor', 'Mason Hill', 'Emma Brown', 'Lucas Martin',
  'Amelia White', 'Henry Ford', 'Isabella King', 'James Wilson', 'Charlotte Hall', 'Ethan Young',
].map((name, i) => ({ id: `user-${i + 1}`, name, avatar: null, recipesCount: 4 + i * 2, isFollowing: i % 3 === 0 }));

export const demoTab = (
  tab: ProfileTab, page: number, limit: number, deletedRecipeIds: string[] = [],
): Paginated<ProfileRecipe | ProfileUserCard> => {
  const availableRecipes = demoRecipes.filter(recipe => !deletedRecipeIds.includes(recipe.id));
  const source = tab === 'favorites' ? demoRecipes.slice(0, 8) : tab === 'recipes' ? availableRecipes : demoPeople;
  const count = source.length;
  const items = source.slice((page - 1) * limit, page * limit);
  return { items, page, total: count, totalPages: Math.max(1, Math.ceil(count / limit)) };
};

import type { RecipeDetails } from '../../services/recipeDetailsApi';

/** Development-only preview fixtures. Never used for production API responses. */
const photo = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

const SALAD: RecipeDetails = {
  id: 'test',
  title: 'Salmon Avocado Salad',
  thumb: photo('photo-1512621776951-a57141f2eefd', 1200),
  category: 'Seafood',
  area: 'European',
  time: '40',
  description:
    'A healthy salad recipe that is big on nutrients and flavor. Moist salmon is layered over fresh spinach, avocado, tomatoes, and red onions, then drizzled with a homemade lemon vinaigrette.',
  instructions: [
    'Rinse the spinach and vegetables. Pat the greens dry, slice the avocado and tomatoes, and thinly slice the red onion.',
    'Season the salmon with salt and pepper. Heat the olive oil in a skillet and sear until cooked through, approximately 3–4 minutes per side, depending on thickness.',
    'Whisk together the lemon juice, olive oil, a pinch of salt, and black pepper to make the dressing.',
    'Arrange the spinach, avocado, tomatoes, and onion on a platter. Place the warm salmon on top, drizzle with the vinaigrette, and serve.',
  ],
  owner: {
    id: 'demo-nadia',
    name: 'Nadia',
    avatar: photo('photo-1534528741775-53994a69daeb', 150),
  },
  ingredients: [
    { id: 'salmon', name: 'Salmon', measure: '400 g', img: photo('photo-1467003909585-2f8a72700288', 150) },
    { id: 'avocado', name: 'Avocado', measure: '2 pcs', img: photo('photo-1523049673857-eb18f1d7b578', 150) },
    { id: 'spinach', name: 'Spinach', measure: '100 g', img: photo('photo-1540420773420-3366772f4999', 150) },
    { id: 'tomato', name: 'Tomatoes', measure: '2 pcs', img: photo('photo-1546470427-e26264be0b0d', 150) },
    { id: 'onion', name: 'Red onion', measure: '1 pc', img: photo('photo-1508747703725-719777637510', 150) },
    { id: 'lemon', name: 'Lemon', measure: '1 pc', img: photo('photo-1590502593747-42a996133562', 150) },
    { id: 'olive-oil', name: 'Olive oil', measure: '3 tbs', img: photo('photo-1474979266404-7eaacbcd87c5', 150) },
  ],
  isFavorite: false,
};

const POPULAR: RecipeDetails[] = [
  {
    ...SALAD,
    id: 'demo-flamiche',
    title: 'Flamiche',
    category: 'Vegetarian',
    thumb: photo('photo-1565299624946-b28f40a0ae38'),
    description: 'A flaky French savory tart filled with leeks, cream, and cheese.',
    owner: { id: 'demo-ivetta', name: 'Ivetta', avatar: photo('photo-1544005313-94ddf0286df2', 150) },
  },
  {
    ...SALAD,
    id: 'demo-beef-wellington',
    title: 'Beef Wellington',
    category: 'Beef',
    thumb: photo('photo-1504674900247-0877df9cc836'),
    description: 'Tender beef and mushrooms wrapped in golden puff pastry.',
    owner: { id: 'demo-michael', name: 'Michael', avatar: photo('photo-1500648767791-00dcc994a43e', 150) },
  },
  {
    ...SALAD,
    id: 'demo-tuna-nicoise',
    title: 'Tuna Nicoise',
    category: 'Seafood',
    thumb: photo('photo-1547592180-85f173990554'),
    description: 'A bright Mediterranean salad with tuna, vegetables, and herbs.',
    owner: { id: 'demo-anna', name: 'Anna', avatar: photo('photo-1531123897727-8f129e1688ce', 150) },
  },
  {
    ...SALAD,
    id: 'demo-grilled-cheese',
    title: 'Grilled Mac and Cheese Sandwich',
    category: 'Pasta',
    thumb: photo('photo-1528735602780-2552fd46c7af'),
    description: 'A comforting toasted sandwich filled with creamy macaroni and cheese.',
    owner: { id: 'demo-alex', name: 'Alex', avatar: photo('photo-1506794778202-cad84cf45f1d', 150) },
  },
];

/** Only /recipe/test, /recipe/demo, and /recipe/demo-* activate demo mode. */
export function isDemoRecipeId(id: string | undefined): boolean {
  return import.meta.env.DEV && Boolean(id) &&
    (id === 'test' || id === 'demo' || POPULAR.some((item) => item.id === id));
}

export function getDemoRecipe(id: string | undefined): RecipeDetails {
  return { ...(POPULAR.find((item) => item.id === id) ?? SALAD), isFavorite: false };
}

export function getDemoPopularRecipes(id: string | undefined): RecipeDetails[] {
  return id === 'test' || id === 'demo' ? POPULAR :
    [...POPULAR.filter((item) => item.id !== id), SALAD].slice(0, 4);
}

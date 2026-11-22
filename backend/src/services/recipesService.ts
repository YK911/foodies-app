import { prisma } from '../db/prisma.js';

interface GetRecipesParams {
  category?: string;
  ingredientId?: string;
  areaId?: string;
  page: number;
  perPage: number;
}

// GET /api/recipes
export const getRecipes = async ({
  category,
  ingredientId,
  areaId,
  page,
  perPage,
}: GetRecipesParams) => {
  const where = {
    ...(category && {
      categoryName: category,
    }),
    ...(ingredientId && {
      ingredients: {
        some: {
          ingredientId,
        },
      },
    }),
    ...(areaId && {
      area: {
        id: areaId,
      },
    }),
  };

  const [recipes, totalItems] = await prisma.$transaction([
    prisma.recipe.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
        area: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    }),
    prisma.recipe.count({ where }),
  ]);

  return {
    recipes,
    page,
    perPage,
    totalItems,
    totalPages: Math.ceil(totalItems / perPage),
  };
};

// GET /api/recipes/popular
export const getPopularRecipes = () => {
  return prisma.recipe.findMany({
    orderBy: {
      favorites: {
        _count: 'desc',
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          favorites: true,
        },
      },
    },
  });
};

// GET /api/recipes/:id
export const getRecipeById = (recipeId: string) => {
  return prisma.recipe.findUnique({
    where: {
      id: recipeId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      category: true,
      area: true,
      ingredients: {
        include: {
          ingredient: true,
        },
      },
      _count: {
        select: {
          favorites: true,
        },
      },
    },
  });
};

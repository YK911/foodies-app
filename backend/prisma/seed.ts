import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();

const DATA_DIR_JSON = path.join(process.cwd(), 'prisma', 'data', 'foodies');
const DATA_DIR_CSV = path.join(process.cwd(), 'prisma', 'data', 'sql_csv');

// Функція для вилучення ID (підтримує як string, так і MongoDB { $oid: '...' })
const extractId = (item: any): string | undefined => {
  if (!item) return undefined;
  const rawId = item._id || item.id;
  if (!rawId) return undefined;

  // Якщо id це об'єкт MongoDB $oid
  if (typeof rawId === 'object' && rawId.$oid) {
    return String(rawId.$oid).trim();
  }
  if (typeof rawId === 'string' && rawId.trim() !== '' && rawId !== '[object Object]') {
    return rawId.trim();
  }
  if (typeof rawId === 'number') {
    return String(rawId);
  }
  return undefined;
};

// Читання JSON
const loadJson = <T>(filename: string): T[] => {
  const filePath = path.join(DATA_DIR_JSON, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// Читання CSV
const loadCsv = (filename: string): Record<string, string>[] => {
  const filePath = path.join(DATA_DIR_CSV, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines: string[] = content.split('\n').filter((line: string) => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers: string[] = lines[0]
    .split(',')
    .map((h: string) => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map((line: string) => {
    const values: string[] = line
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((v: string) => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

    const row: Record<string, string> = {};
    headers.forEach((header: string, index: number) => {
      row[header] = values[index] || '';
    });
    return row;
  });
};

async function main() {
  console.log('🌱 Початок наповнення бази даних Supabase...');

  console.log('🧹 Очищення старих даних...');
  await prisma.recipeIngredient.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.follower.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.user.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.category.deleteMany();
  await prisma.area.deleteMany();
  await prisma.testimonial.deleteMany();

  // =========================================================================
  // 1. Areas
  // =========================================================================
  console.log('📍 Імпорт Areas...');
  let rawAreas = loadJson<any>('areas.json');
  if (rawAreas.length === 0) {
    const csv = loadCsv('1_areas.csv');
    rawAreas = csv.map((r) => ({ id: r.id, name: r.name }));
  }

  const seenAreas = new Set<string>();
  for (const item of rawAreas) {
    const name = item.name?.trim();
    if (!name || seenAreas.has(name)) continue;
    seenAreas.add(name);

    const id = extractId(item);
    await prisma.area.create({
      data: {
        ...(id ? { id } : {}),
        name,
      },
    });
  }

  // =========================================================================
  // 2. Categories
  // =========================================================================
  console.log('📂 Імпорт Categories...');
  let rawCategories = loadJson<any>('categories.json');
  if (rawCategories.length === 0) {
    const csv = loadCsv('2_categories.csv');
    rawCategories = csv.map((r) => ({ id: r.id, name: r.name }));
  }

  const seenCategories = new Set<string>();
  for (const item of rawCategories) {
    const name = item.name?.trim();
    if (!name || seenCategories.has(name)) continue;
    seenCategories.add(name);

    const id = extractId(item);
    await prisma.category.create({
      data: {
        ...(id ? { id } : {}),
        name,
      },
    });
  }

  // =========================================================================
  // 3. Ingredients
  // =========================================================================
  console.log('🥑 Імпорт Ingredients...');
  let rawIngredients = loadJson<any>('ingredients.json');
  if (rawIngredients.length === 0) {
    const csv = loadCsv('3_ingredients.csv');
    rawIngredients = csv.map((r) => ({ id: r.id, name: r.name, desc: r.desc, img: r.img }));
  }

  const seenIngredients = new Set<string>();
  for (const item of rawIngredients) {
    const name = item.name?.trim();
    if (!name || seenIngredients.has(name)) continue;
    seenIngredients.add(name);

    const id = extractId(item);
    await prisma.ingredient.create({
      data: {
        ...(id ? { id } : {}),
        name,
        desc: item.desc || null,
        img: item.img || null,
      },
    });
  }

  // =========================================================================
  // 4. Users
  // =========================================================================
  console.log('👤 Імпорт Users...');
  let rawUsers = loadJson<any>('users.json');
  if (rawUsers.length === 0) {
    const csv = loadCsv('4_users.csv');
    rawUsers = csv.map((r) => ({ id: r.id, name: r.name, email: r.email, password: r.password, avatar: r.avatar }));
  }

  const userMap = new Map<string, string>();
  const userNameMap = new Map<string, string>(); // Зберігаємо ім'я за старим ID
  const seenEmails = new Set<string>();

  for (const item of rawUsers) {
    const email = item.email?.trim().toLowerCase();
    if (!email || seenEmails.has(email)) continue;
    seenEmails.add(email);

    const id = extractId(item);
    const name = item.name?.trim() || 'Anonymous';

    const createdUser = await prisma.user.create({
      data: {
        ...(id ? { id } : {}),
        name,
        email,
        password: item.password || '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5K6p0jS8g3o5i3l9c2g8',
        avatar: item.avatar || null,
      },
    });

    if (id) {
      userMap.set(id, createdUser.id);
      userNameMap.set(id, createdUser.name); // Запам'ятовуємо ім'я
    }
  }

  const fallbackUser = await prisma.user.findFirst();

  // =========================================================================
  // 5. Testimonials
  // =========================================================================
  console.log('💬 Імпорт Testimonials...');
  let rawTestimonials = loadJson<any>('testimonials.json');
  if (rawTestimonials.length === 0) {
    const csv = loadCsv('5_testimonials.csv');
    rawTestimonials = csv.map((r) => ({ id: r.id, ownerName: r.owner || r.ownerName, testimonial: r.testimonial }));
  }

  for (const item of rawTestimonials) {
    const id = extractId(item);

    // Безпечно визначаємо ім'я: якщо це ID користувача — беремо його ім'я з бази
    const ownerId = extractId({ id: item.owner }) || extractId({ id: item.ownerName });
    let resolvedOwnerName = 'Food Lover';

    if (ownerId && userNameMap.has(ownerId)) {
      resolvedOwnerName = userNameMap.get(ownerId)!;
    } else if (typeof item.ownerName === 'string' && item.ownerName.trim()) {
      resolvedOwnerName = item.ownerName.trim();
    } else if (typeof item.owner === 'string' && item.owner.trim()) {
      resolvedOwnerName = item.owner.trim();
    }

    await prisma.testimonial.create({
      data: {
        ...(id ? { id } : {}),
        ownerName: resolvedOwnerName,
        testimonial: typeof item.testimonial === 'string' ? item.testimonial : '',
      },
    });
  }

  // =========================================================================
  // 6. Recipes & RecipeIngredients
  // =========================================================================
  console.log('🍲 Імпорт Recipes...');
  const rawRecipes = loadJson<any>('recipes.json');

  if (rawRecipes.length > 0) {
    for (const r of rawRecipes) {
      const recipeId = extractId(r);
      const rawOwner = extractId({ id: r.owner });
      const ownerId = (rawOwner && userMap.get(rawOwner)) || fallbackUser?.id;

      if (!ownerId) continue;

      const categoryName = r.category?.trim();
      const areaName = r.area?.trim();

      const categoryExists = await prisma.category.findUnique({ where: { name: categoryName } });
      const areaExists = await prisma.area.findUnique({ where: { name: areaName } });

      if (!categoryExists || !areaExists) continue;

      const createdRecipe = await prisma.recipe.create({
        data: {
          ...(recipeId ? { id: recipeId } : {}),
          title: r.title || 'Untitled Recipe',
          categoryName,
          areaName,
          instructions: r.instructions || '',
          description: r.description || '',
          thumb: r.thumb || null,
          time: String(r.time || '30'),
          ownerId,
        },
      });

      if (Array.isArray(r.ingredients)) {
        for (const ing of r.ingredients) {
          const ingId = extractId(ing);
          if (!ingId) continue;

          const dbIngredient = await prisma.ingredient.findUnique({ where: { id: ingId } });
          if (dbIngredient) {
            await prisma.recipeIngredient.create({
              data: {
                recipeId: createdRecipe.id,
                ingredientId: dbIngredient.id,
                measure: ing.measure || '',
              },
            });
          }
        }
      }
    }
  } else {
    const recipesCsv = loadCsv('6_recipes.csv');
    const recipeIngredientsCsv = loadCsv('7_recipe_ingredients.csv');

    for (const r of recipesCsv) {
      const ownerId = (r.owner && userMap.get(r.owner)) || fallbackUser?.id;
      if (!ownerId) continue;

      const recipeId = r.id?.trim();
      const categoryName = r.category?.trim();
      const areaName = r.area?.trim();

      const categoryExists = await prisma.category.findUnique({ where: { name: categoryName } });
      const areaExists = await prisma.area.findUnique({ where: { name: areaName } });
      if (!categoryExists || !areaExists) continue;

      const created = await prisma.recipe.create({
        data: {
          ...(recipeId ? { id: recipeId } : {}),
          title: r.title || 'Delicious Recipe',
          categoryName,
          areaName,
          instructions: r.instructions || '',
          description: r.description || '',
          thumb: r.thumb || null,
          time: r.time || '30',
          ownerId,
        },
      });

      const matchingIngs = recipeIngredientsCsv.filter((ri) => ri.recipe_id === r.id);
      for (const mi of matchingIngs) {
        const dbIng = await prisma.ingredient.findUnique({ where: { id: mi.ingredient_id } });
        if (dbIng) {
          await prisma.recipeIngredient.create({
            data: {
              recipeId: created.id,
              ingredientId: dbIng.id,
              measure: mi.measure || '',
            },
          });
        }
      }
    }
  }

  console.log('✅ Наповнення бази даних успішно завершено!');
}

main()
  .catch((e) => {
    console.error('❌ Помилка під час наповнення бази даних:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

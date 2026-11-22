import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Наповнення БД даними курсу.
//
// Джерела даних (папка prisma/data є в .gitignore):
//   prisma/data/foodies/*.json  — експорт MongoDB (основне джерело)
//   prisma/data/sql_csv/*.csv   — CSV-версія (якщо JSON немає)
//
// npm run seed             — додає лише відсутні записи; наявні дані не змінює
// npm run seed -- --reset  — спершу ВИДАЛЯЄ всі дані з усіх таблиць, потім імпортує заново

const prisma = new PrismaClient();

const DATA_DIR_JSON = path.join(process.cwd(), 'prisma', 'data', 'foodies');
const DATA_DIR_CSV = path.join(process.cwd(), 'prisma', 'data', 'sql_csv');
const RESET = process.argv.includes('--reset');

type MongoId = string | { $oid: string };
type CsvRow = Record<string, string>;

interface SeedData {
  areas: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  ingredients: { id: string; name: string; desc: string | null; img: string | null }[];
  users: { id: string; name: string; email: string; avatar: string | null }[];
  testimonials: { id: string; ownerId: string; testimonial: string }[];
  recipes: {
    id: string;
    title: string;
    category: string;
    area: string;
    instructions: string;
    description: string;
    thumb: string | null;
    time: string;
    ownerId: string;
    ingredients: { id: string; measure: string }[];
  }[];
}

// ObjectId приходить або рядком, або обʼєктом MongoDB { $oid: '...' }
const toId = (value: MongoId | undefined): string =>
  typeof value === 'object' && value !== null ? value.$oid.trim() : String(value ?? '').trim();

// Порожній рядок → null
const orNull = (value: string | null | undefined): string | null => {
  const text = value?.trim() ?? '';
  return text === '' ? null : text;
};

// Парсер CSV (RFC 4180): поля в лапках можуть містити коми, переноси рядків та "" (екранована лапка)
const parseCsv = (content: string): CsvRow[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const text = content.replace(/^﻿/, '');

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headers = [], ...records] = rows.filter((cells) => cells.some((cell) => cell !== ''));
  return records.map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header.trim(), cells[index] ?? ''])),
  );
};

interface JsonNamed {
  _id: MongoId;
  name: string;
}
interface JsonIngredient extends JsonNamed {
  desc?: string;
  img?: string;
}
interface JsonUser extends JsonNamed {
  email: string;
  avatar?: string | null;
}
interface JsonTestimonial {
  _id: MongoId;
  owner: MongoId;
  testimonial?: string;
}
interface JsonRecipe {
  _id: MongoId;
  title?: string;
  category?: string;
  area?: string;
  instructions?: string;
  description?: string;
  thumb?: string;
  time?: string | number;
  owner?: MongoId;
  ingredients?: { id: MongoId; measure?: string }[];
}

const loadFromJson = (): SeedData => {
  const read = <T>(file: string): T[] =>
    JSON.parse(fs.readFileSync(path.join(DATA_DIR_JSON, file), 'utf-8')) as T[];

  return {
    areas: read<JsonNamed>('areas.json').map((a) => ({ id: toId(a._id), name: a.name.trim() })),
    categories: read<JsonNamed>('categories.json').map((c) => ({
      id: toId(c._id),
      name: c.name.trim(),
    })),
    ingredients: read<JsonIngredient>('ingredients.json').map((i) => ({
      id: toId(i._id),
      name: i.name.trim(),
      desc: orNull(i.desc),
      img: orNull(i.img),
    })),
    users: read<JsonUser>('users.json').map((u) => ({
      id: toId(u._id),
      name: u.name?.trim() || 'Anonymous',
      email: u.email.trim().toLowerCase(),
      avatar: orNull(u.avatar),
    })),
    testimonials: read<JsonTestimonial>('testimonials.json').map((t) => ({
      id: toId(t._id),
      ownerId: toId(t.owner),
      testimonial: t.testimonial ?? '',
    })),
    recipes: read<JsonRecipe>('recipes.json').map((r) => ({
      id: toId(r._id),
      title: r.title?.trim() || 'Untitled Recipe',
      category: r.category?.trim() ?? '',
      area: r.area?.trim() ?? '',
      instructions: r.instructions ?? '',
      description: r.description ?? '',
      thumb: orNull(r.thumb),
      time: String(r.time ?? '').trim() || '30',
      ownerId: toId(r.owner),
      ingredients: (r.ingredients ?? []).map((i) => ({
        id: toId(i.id),
        measure: i.measure?.trim() ?? '',
      })),
    })),
  };
};

const loadFromCsv = (): SeedData => {
  const read = (file: string): CsvRow[] =>
    parseCsv(fs.readFileSync(path.join(DATA_DIR_CSV, file), 'utf-8'));

  const ingredientsByRecipe = new Map<string, { id: string; measure: string }[]>();
  for (const link of read('7_recipe_ingredients.csv')) {
    const list = ingredientsByRecipe.get(link.recipe_id) ?? [];
    list.push({ id: link.ingredient_id.trim(), measure: link.measure.trim() });
    ingredientsByRecipe.set(link.recipe_id, list);
  }

  return {
    areas: read('1_areas.csv').map((r) => ({ id: r.id.trim(), name: r.name.trim() })),
    categories: read('2_categories.csv').map((r) => ({ id: r.id.trim(), name: r.name.trim() })),
    ingredients: read('3_ingredients.csv').map((r) => ({
      id: r.id.trim(),
      name: r.name.trim(),
      desc: orNull(r.description),
      img: orNull(r.img),
    })),
    users: read('4_users.csv').map((r) => ({
      id: r.id.trim(),
      name: r.name.trim() || 'Anonymous',
      email: r.email.trim().toLowerCase(),
      avatar: orNull(r.avatar),
    })),
    testimonials: read('5_testimonials.csv').map((r) => ({
      id: r.id.trim(),
      ownerId: r.owner_id.trim(),
      testimonial: r.testimonial,
    })),
    recipes: read('6_recipes.csv').map((r) => ({
      id: r.id.trim(),
      title: r.title.trim() || 'Untitled Recipe',
      category: r.category.trim(),
      area: r.area.trim(),
      instructions: r.instructions,
      description: r.description,
      thumb: orNull(r.thumb),
      time: r.time.trim() || '30',
      ownerId: r.owner_id.trim(),
      ingredients: ingredientsByRecipe.get(r.id) ?? [],
    })),
  };
};

const loadData = (): SeedData => {
  if (fs.existsSync(path.join(DATA_DIR_JSON, 'recipes.json'))) {
    console.log(`📦 Джерело даних: JSON (${DATA_DIR_JSON})`);
    return loadFromJson();
  }
  if (fs.existsSync(path.join(DATA_DIR_CSV, '6_recipes.csv'))) {
    console.log(`📦 Джерело даних: CSV (${DATA_DIR_CSV})`);
    return loadFromCsv();
  }
  throw new Error(
    `Немає даних для seed. Розпакуйте foodies.zip у ${DATA_DIR_JSON} або CSV-файли у ${DATA_DIR_CSV}`,
  );
};

async function main() {
  console.log('🌱 Початок наповнення бази даних...');
  const data = loadData();

  if (RESET) {
    console.log('🧹 --reset: видалення всіх даних з усіх таблиць...');
    await prisma.$transaction([
      prisma.recipeIngredient.deleteMany(),
      prisma.favorite.deleteMany(),
      prisma.follower.deleteMany(),
      prisma.recipe.deleteMany(),
      prisma.testimonial.deleteMany(),
      prisma.user.deleteMany(),
      prisma.ingredient.deleteMany(),
      prisma.category.deleteMany(),
      prisma.area.deleteMany(),
    ]);
  }

  let seedPassword = process.env.SEED_USER_PASSWORD?.trim();
  if (!seedPassword) {
    seedPassword = randomBytes(9).toString('base64url');
    console.log(`🔑 SEED_USER_PASSWORD не задано. Пароль нових seed-користувачів: ${seedPassword}`);
  }
  const passwordHash = await bcrypt.hash(seedPassword, 10);
  const userNames = new Map(data.users.map((u) => [u.id, u.name]));

  // Кожна таблиця вставляється одним запитом; наявні записи (той самий id або унікальне поле)
  // пропускаються, тож повторний запуск нічого не дублює.
  const added: Record<string, number> = {};

  added.areas = (await prisma.area.createMany({ data: data.areas, skipDuplicates: true })).count;
  added.categories = (
    await prisma.category.createMany({ data: data.categories, skipDuplicates: true })
  ).count;
  added.ingredients = (
    await prisma.ingredient.createMany({ data: data.ingredients, skipDuplicates: true })
  ).count;
  added.users = (
    await prisma.user.createMany({
      data: data.users.map((u) => ({ ...u, password: passwordHash })),
      skipDuplicates: true,
    })
  ).count;
  added.testimonials = (
    await prisma.testimonial.createMany({
      data: data.testimonials.map((t) => ({
        id: t.id,
        ownerName: userNames.get(t.ownerId) ?? 'Food Lover',
        testimonial: t.testimonial,
      })),
      skipDuplicates: true,
    })
  ).count;

  // Рецепт імпортується, лише якщо його автор, категорія та регіон є в БД
  const [owners, categories, areas] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: [...new Set(data.recipes.map((r) => r.ownerId))] } },
      select: { id: true },
    }),
    prisma.category.findMany({ select: { name: true } }),
    prisma.area.findMany({ select: { name: true } }),
  ]);
  const ownerIds = new Set(owners.map((u) => u.id));
  const categoryNames = new Set(categories.map((c) => c.name));
  const areaNames = new Set(areas.map((a) => a.name));

  const recipes = data.recipes.filter(
    (r) => ownerIds.has(r.ownerId) && categoryNames.has(r.category) && areaNames.has(r.area),
  );
  const skippedRecipes = data.recipes.length - recipes.length;

  added.recipes = (
    await prisma.recipe.createMany({
      data: recipes.map(({ ingredients: _ingredients, category, area, ...recipe }) => ({
        ...recipe,
        categoryName: category,
        areaName: area,
      })),
      skipDuplicates: true,
    })
  ).count;

  const [savedRecipes, savedIngredients] = await Promise.all([
    prisma.recipe.findMany({
      where: { id: { in: recipes.map((r) => r.id) } },
      select: { id: true },
    }),
    prisma.ingredient.findMany({ select: { id: true } }),
  ]);
  const recipeIds = new Set(savedRecipes.map((r) => r.id));
  const ingredientIds = new Set(savedIngredients.map((i) => i.id));

  const links = recipes
    .filter((r) => recipeIds.has(r.id))
    .flatMap((r) =>
      r.ingredients
        .filter((i) => ingredientIds.has(i.id))
        .map((i) => ({ recipeId: r.id, ingredientId: i.id, measure: i.measure })),
    );
  added.recipeIngredients = (
    await prisma.recipeIngredient.createMany({ data: links, skipDuplicates: true })
  ).count;

  console.log('📊 Додано записів (наявні пропущено):');
  for (const [table, count] of Object.entries(added)) {
    console.log(`   ${table.padEnd(18)} +${count}`);
  }
  if (skippedRecipes > 0) {
    console.warn(`⚠️ Пропущено рецептів без автора, категорії чи регіону в БД: ${skippedRecipes}`);
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

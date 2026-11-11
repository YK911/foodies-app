# Foodies — Fullstack Recipe Platform

Командний проєкт fullstack вебдодатка для пошуку, створення та обміну кулінарними рецептами.

- Frontend: React 18, TypeScript, Vite, Redux Toolkit, React Router DOM, Formik + Yup.
- Backend: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, Swagger UI (OpenAPI 3.1), JWT, Multer, Cloudinary.
- Деплой: Frontend — GitHub Pages, Backend — Render.

## Зміст

1. [Вимоги до оточення](#requirements)
2. [Структура монорепозиторію](#structure)
3. [Швидкий старт](#start)
4. [Робота з базою даних - Prisma & PostgreSQL](#db-settings)
5. [Git Workflow та правила команди](#git-workflow)
6. [Документація API (Swagger)](#swagger)
7. [Корисні команди](#commands)

<a id="requirements"></a>

## Вимоги до оточення

Перед початком роботи переконайтеся, що на вашому комп'ютері встановлено:

- Node.js: версія `20.x` або вище (`node -v`).
- npm: версія `10.x` або вище (`npm -v`).
- Git для контролю версій.

<a id="structure"></a>

## Структура монорепозиторію

```text
foodies-app/
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml      # Deploy Frontend to GitHub Pages
│       ├── deploy-backend.yml       # Deploy Backend to Render
│       └── ci.yml                   # Перевірка TypeScript та лінтингу в PR
├── backend/                         # Серверна частина
│   ├── docs/
│   │   └── openapi.yaml             # Головна специфікація OpenAPI
│   ├── swagger/                     # Модульні файли документації Swagger
│   │   ├── components/              # Схеми моделей та стандартні відповіді (400, 401 тощо)
│   │   └── paths/                   # Описи роутів (/auth, /users, /recipes тощо)
│   ├── prisma/
│   │   ├── schema.prisma            # Схема БД: моделі, зв'язки та типи
│   │   ├── migrations/              # Історія міграцій PostgreSQL (контролюється Git)
│   │   └── seed.ts                  # Скрипт початкового наповнення категоріями/інгредієнтами
│   ├── src/
│   │   ├── controllers/             # Обробники запитів (req, res, next)
│   │   ├── db/
│   │   │   └── prisma.ts            # Екземпляр PrismaClient
│   │   ├── middlewares/             # authenticate, errorHandler, upload, validateBody
│   │   ├── routes/                  # Маршрутизація Express
│   │   ├── services/                # Бізнес-логіка та робота з даними
│   │   ├── types/                   # Декларації типів TypeScript
│   │   ├── server.ts                # Конфігурація Express додатку
│   │   └── index.ts                 # Точка входу: підключення БД та старт сервера
│   ├── .env.template                # Шаблон змінних оточення для бекенду
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                        # Клієнтська частина (Vite + React + TS)
│   ├── public/                      # Статичні файли (favicon.ico)
│   ├── index.html                   # Головний HTML-шаблон для Vite
│   ├── src/
│   │   ├── assets/                  # Шрифти, зображення, icons/sprite.svg
│   │   ├── components/              # React-компоненти (вимога ТЗ: components/)
│   │   │   ├── SharedLayout/        # Header, Footer, навігація
│   │   │   ├── Modals/              # Modal (Esc/backdrop), SignIn, SignUp, LogOut
│   │   │   ├── Common/              # MainTitle, Subtitle, PathInfo, Loader
│   │   │   ├── HomePage/            # Hero, Categories, Recipes, Testimonials
│   │   │   ├── RecipePage/          # RecipeInfo, інгредієнти, інструкції
│   │   │   ├── AddRecipePage/       # AddRecipeForm (Formik + Yup, лічильники)
│   │   │   └── UserPage/            # UserInfo, TabsList, Follow/Unfollow
│   │   ├── pages/                   # Сторінки додатку з lazy loading (вимога ТЗ: pages/)
│   │   ├── redux/                   # Redux Toolkit (вимога ТЗ: redux/)
│   │   │   ├── auth/                # Авторизація, токен, поточний юзер
│   │   │   ├── recipes/             # Стан рецептів, пошук, пагінація
│   │   │   ├── meta/                # Кешування довідників (інгредієнти, країни)
│   │   │   ├── hooks.ts             # Типізовані useAppDispatch та useAppSelector
│   │   │   └── store.ts             # RootState, AppDispatch, redux-persist
│   │   ├── services/
│   │   │   └── api.ts               # Axios instance з baseURL та Bearer токеном
│   │   ├── styles/                  # modern-normalize, variables.css, global.css
│   │   ├── App.tsx                  # Маршрути додатку
│   │   ├── index.tsx                # Рендер у DOM + Redux Provider
│   │   └── vite-env.d.ts            # Типізація ImportMetaEnv
│   ├── .env.template                # Шаблон змінних оточення для фронтенду
│   ├── vite.config.ts               # Конфігурація збирача Vite
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore                       # Загальний файл ігнорування для Git
├── package.json                     # Кореневий файл для запуску спільних команд
└── README.md
```

<a id="start"></a>

## Швидкий старт

### Крок 1. Клонування репозиторію

```bash
git clone https://github.com/YK911/foodies-app.git
cd foodies-app
```

### Крок 2. Налаштування файлів `.env`

Бекенд:

```bash
cp backend/.env.template backend/.env
```

Відкрийте `backend/.env` та вставте спільний `DATABASE_URL`, наприклад:

```env
PORT=5000
DATABASE_URL="postgresql://username:password@ep-xyz.aws.neon.tech/foodies_db?sslmode=require"
JWT_SECRET="foodies_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="7d"
```

Фронтенд:

```bash
cp frontend/.env.template frontend/.env
```

Вміст `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Крок 3. Встановлення пакетів

```bash
# Встановлення залежностей бекенду
cd backend && npm install

# Встановлення залежностей фронтенду
cd ../frontend && npm install

# Повернення в корінь
cd ..
```

### Крок 4. Запуск бази даних та сервера

```bash
# Генерація типів Prisma та застосування міграцій
cd backend
npx prisma generate
npx prisma migrate dev

# Запуск бекенду
npm run dev
```

- Сервер буде доступний за адресою: `http://localhost:5000`
- Документація Swagger UI: `http://localhost:5000/api-docs`

### Крок 5. Запуск фронтенду

У новому вікні термінала:

```bash
cd frontend
npm run dev
```

- Клієнтська частина відкриється у браузері за адресою: `http://localhost:3000`

<a id="db-settings"></a>

## Робота з базою даних (Prisma & PostgreSQL)

Ми використовуємо спільну хмарну PostgreSQL базу даних. Щоб не ламати роботу колег, дотримуйтесь таких правил:

1. Ніколи не змінюйте структуру таблиць вручну через адмінки чи pgAdmin. Усі зміни відбуваються тільки через код.
2. Якщо ви змінюєте `backend/prisma/schema.prisma`:

- Створіть міграцію:
  ```bash
  npx prisma migrate dev --name <короткий_опис_зміни>
  ```
- Обов'язково додайте нову папку з `prisma/migrations/` до вашого коміту в Git.

3. Якщо колеги додали нові міграції (після `git pull origin dev`):

- Застосуйте їх локально однією командою:
  ```bash
  cd backend && npx prisma migrate dev
  ```

4. Перегляд даних через візуальну адмінку (Prisma Studio):
   ```bash
   cd backend && npx prisma studio
   ```

Відкриє вебпанель бази за адресою `http://localhost:5555`.

<a id="git-workflow"></a>

## Git Workflow та правила команди

1. **Гілки:**

- `main` — стабільна продакшн-версія. Прямі пуші заборонені.
- `dev` — основна гілка інтеграції. Усі задачі зливаються сюди.
- `feat/<номер-картки>-<назва>` — гілка під задачу (наприклад, `feat/be-04-auth-endpoints, feat/fe-06-recipe-filters`).
- `fix/<назва-бага>` — виправлення виявлених помилок.

2. **Правила створення Pull Request (PR):**

- PR створюється тільки в гілку dev.
- Назва PR має відповідати назві картки в Trello.
- У PR має бути мінімум 1 схвалення (Approve) від Team Lead або колеги.
- Перед створенням PR переконайтеся, що проект збирається без помилок:
  ```bash
  npm --prefix backend run type-check
  npm --prefix frontend run build
  ```

<a id="#swagger"></a>

## Документація API (Swagger)

Кожен новий бекенд-роут обов'язково має бути задокументований згідно зі специфікацією OpenAPI 3.1:

- Роути додаються окремими файлами у відповідні папки [backend/swagger/paths/<сутності>/<метод>.yaml](backend/swagger/paths/).
- Загальні моделі описуються в [backend/swagger/components/schemas/](backend/swagger/components/schemas/).
- Перевірити документацію локально: `http://localhost:5000/api-docs`.

<a id="#commands"></a>

## Корисні команди

| Команда                              | Опис                                     |
| ------------------------------------ | ---------------------------------------- |
| npm run dev:backend                  | Запуск сервера бекенду з кореня          |
| npm run dev:frontend                 | Запуск клієнта фронтенду (Vite) з кореня |
| cd backend && npx prisma studio      | Відкрити GUI бази даних Prisma Studio    |
| cd backend && npx prisma migrate dev | Застосувати міграції до PostgreSQL       |
| cd frontend && npm run build         | Зібрати фронтенд у папку dist            |
| cd frontend && npm run deploy        | Опублікувати фронтенд на GitHub Pages    |


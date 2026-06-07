# 🚀 LMS — Старт проекту: покрокова інструкція

> Виконай все по порядку перед тим як починати писати код.

---

## КРОК 0 — Що потрібно встановити (один раз)

Перевір що все є:

```bash
node --version      # потрібно v18.17+ або v20+
npm --version       # 9+
git --version
```

Якщо чогось немає — встанови з https://nodejs.org (LTS версія).

Також потрібен Supabase CLI:
```bash
npm install -g supabase
supabase --version
```

---

## КРОК 1 — Створити Next.js проект

```bash
npx create-next-app@latest lms \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

Відповіді на питання:
- `Would you like to use ESLint?` → **Yes**
- `Would you like to use Turbopack?` → **Yes**

```bash
cd lms
code .
```

---

## КРОК 2 — Встановити shadcn/ui

```bash
npx shadcn@latest init
```

Відповіді:
- Style → **Default**
- Base color → **Neutral**
- CSS variables → **Yes**

Встановити компоненти які потрібні для MVP:
```bash
npx shadcn@latest add button card input label badge accordion progress dialog sheet tabs skeleton
```

---

## КРОК 3 — Встановити залежності проекту

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install stripe @stripe/stripe-js
npm install resend
npm install lucide-react
npm install clsx tailwind-merge
```

---

## КРОК 4 — Підключити Supabase

### 4.1 Створити проект на https://supabase.com
- New project → вибери назву `lms-dev`
- Запиши: `Project URL` і `anon key` і `service_role key`

### 4.2 Зв'язати CLI з проектом
```bash
supabase login
supabase link --project-ref <твій-project-id>
```

`project-id` — частина URL після `https://supabase.com/dashboard/project/`

### 4.3 Згенерувати TypeScript типи
```bash
supabase gen types typescript --linked > types/supabase.ts
```

Цей файл **не редагувати вручну** — він перегенерується після кожної міграції.

---

## КРОК 5 — Налаштувати змінні середовища

Створи файл `.env.local` в корені проекту:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Bunny.net
BUNNY_API_KEY=
BUNNY_LIBRARY_ID=
BUNNY_CDN_HOSTNAME=

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ `.env.local` вже є в `.gitignore` за замовчуванням — не додавай його в git.

---

## КРОК 6 — Підключити Design System

### 6.1 Скопіювати токени в globals.css

Відкрий `app/globals.css` і замість дефолтного вмісту вставити:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", Menlo, monospace;

  /* Neutrals */
  --n-0:   oklch(99.2% 0.003 80);
  --n-50:  oklch(97.8% 0.004 80);
  --n-100: oklch(95.5% 0.005 80);
  --n-150: oklch(92.5% 0.006 80);
  --n-200: oklch(88%   0.007 80);
  --n-300: oklch(78%   0.008 80);
  --n-400: oklch(62%   0.009 80);
  --n-500: oklch(48%   0.010 80);
  --n-700: oklch(32%   0.012 80);
  --n-900: oklch(18%   0.010 80);
  --n-950: oklch(12%   0.008 80);

  /* Accent — Indigo */
  --a-50:  oklch(96%  0.025 255);
  --a-100: oklch(92%  0.05  255);
  --a-500: oklch(62%  0.18  255);
  --a-600: oklch(55%  0.19  255);
  --a-700: oklch(47%  0.18  255);

  /* Semantic */
  --success: oklch(62% 0.13 155);
  --warn:    oklch(72% 0.15 75);
  --danger:  oklch(60% 0.19 25);
  --locked:  oklch(55% 0.005 80);

  /* Spacing */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-5: 20px; --s-6: 24px; --s-8: 32px; --s-12: 48px;
  --s-16: 64px; --s-24: 96px;

  /* Radii */
  --r-xs: 4px; --r-sm: 6px; --r-md: 10px; --r-lg: 14px; --r-xl: 20px;

  /* Shadows */
  --sh-1:   0 1px 2px oklch(15% 0.01 80 / 0.04);
  --sh-2:   0 4px 12px oklch(15% 0.01 80 / 0.06);
  --sh-pop: 0 12px 40px oklch(15% 0.01 80 / 0.12);

  /* Layout */
  --sidebar-w: 304px;
  --sidebar-w-narrow: 72px;
  --header-h: 56px;
  --content-max: 820px;
}

.dark {
  --n-0:   oklch(14% 0.006 80);
  --n-50:  oklch(17% 0.006 80);
  --n-100: oklch(20% 0.007 80);
  --n-150: oklch(24% 0.007 80);
  --n-200: oklch(28% 0.008 80);
  --n-300: oklch(36% 0.008 80);
  --n-400: oklch(52% 0.008 80);
  --n-500: oklch(65% 0.008 80);
  --n-700: oklch(82% 0.006 80);
  --n-900: oklch(94% 0.004 80);
  --n-950: oklch(98% 0.003 80);
}

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

body {
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.55;
  color: var(--n-700);
  background: var(--n-0);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5 {
  color: var(--n-900);
  font-weight: 600;
  letter-spacing: -0.015em;
  margin: 0;
  line-height: 1.2;
}

a { color: inherit; text-decoration: none; }
button { font: inherit; cursor: pointer; }
input, textarea, select { font: inherit; }
```

### 6.2 Оновити tailwind.config.ts

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        n: {
          0: 'var(--n-0)', 50: 'var(--n-50)', 100: 'var(--n-100)',
          150: 'var(--n-150)', 200: 'var(--n-200)', 300: 'var(--n-300)',
          400: 'var(--n-400)', 500: 'var(--n-500)',
          700: 'var(--n-700)', 900: 'var(--n-900)', 950: 'var(--n-950)',
        },
        accent: {
          DEFAULT: 'var(--a-500)',
          50: 'var(--a-50)', 100: 'var(--a-100)',
          600: 'var(--a-600)', 700: 'var(--a-700)',
        },
        success: 'var(--success)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
      },
      borderRadius: {
        xs: 'var(--r-xs)', sm: 'var(--r-sm)', md: 'var(--r-md)',
        lg: 'var(--r-lg)', xl: 'var(--r-xl)',
      },
      boxShadow: {
        1: 'var(--sh-1)', 2: 'var(--sh-2)', pop: 'var(--sh-pop)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
```

---

## КРОК 7 — Структура папок

Створи вручну (або через термінал):

```bash
mkdir -p app/{(auth)/login,(auth)/signup,(student)/dashboard,(student)/learn/[slug],(admin)/admin/{courses,students},api/{checkout,webhooks/stripe,progress},courses/[slug]}
mkdir -p components/{ui,course,lesson,quiz,layout}
mkdir -p lib/supabase
mkdir -p types
```

---

## КРОК 8 — Запустити локально

```bash
npm run dev
```

Відкрий http://localhost:3001

Якщо бачиш стандартну Next.js сторінку — все працює ✅

---

## КРОК 9 — Перевірка перед першим компітом

Чеклист:
- [ ] `npm run dev` запускається без помилок
- [ ] `.env.local` заповнений (хоча б Supabase)
- [ ] `types/supabase.ts` згенеровано
- [ ] `globals.css` містить design tokens
- [ ] `tailwind.config.ts` містить кастомні кольори

---

## КРОК 10 — Перший коміт

```bash
git add .
git commit -m "chore: project setup — Next.js + shadcn + design system"
```

---

## Після цього — Спринт 1

Порядок роботи в Спринті 1:

```
1. lib/supabase/server.ts   — Supabase server client (RSC)
2. lib/supabase/client.ts   — Supabase browser client
3. SQL migrations            — схема БД в Supabase Dashboard
4. middleware.ts             — захист роутів
5. app/(auth)/login          — сторінка логіну
6. app/(auth)/signup         — сторінка реєстрації
```

Скажи "Спринт 1" — і ми починаємо з першого файлу.

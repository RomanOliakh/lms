# LMS Design System
> Світла тема в стилі Linear. Джерело принципів — linear.app. Кольори та токени — адаптовано під LMS.

---

## 1. Принципи (з Linear)

- **Мінімалізм** — нічого зайвого. Кожен елемент має функцію.
- **Типографіка керує ієрархією** — розмір і вага замість кольору.
- **Єдиний акцент** — один колір для CTA і активних станів, більше нікуди.
- **8px grid** — всі відступи кратні 8 (або 4 для дрібних елементів).
- **Hairline borders** — тонкі `1px` границі замість тіней там де можливо.
- **Elevation через тінь** — 3 рівні, використовуються рідко і точно.

---

## 2. Кольорова система (Світла тема / LMS)

Кольори в `oklch` — кращий контраст і рівномірне сприйняття.

### Нейтральна шкала (теплі сірі)

| Токен      | Значення                    | Використання                |
|------------|-----------------------------|-----------------------------|
| `--n-0`    | `oklch(99.2% 0.003 80)`     | Фон сторінки                |
| `--n-50`   | `oklch(97.8% 0.004 80)`     | Subtle фон (sidebar, header)|
| `--n-100`  | `oklch(95.5% 0.005 80)`     | Картки, elevated surfaces   |
| `--n-150`  | `oklch(92.5% 0.006 80)`     | Hairline на тонованому фоні |
| `--n-200`  | `oklch(88%   0.007 80)`     | Border, divider             |
| `--n-300`  | `oklch(78%   0.008 80)`     | Divider strong              |
| `--n-400`  | `oklch(62%   0.009 80)`     | Muted text, placeholders    |
| `--n-500`  | `oklch(48%   0.010 80)`     | Secondary text              |
| `--n-700`  | `oklch(32%   0.012 80)`     | Body text                   |
| `--n-900`  | `oklch(18%   0.010 80)`     | Headings                    |
| `--n-950`  | `oklch(12%   0.008 80)`     | Near-black (hover states)   |

### Акцент — Indigo

| Токен      | Значення                    | Використання                     |
|------------|-----------------------------|----------------------------------|
| `--a-50`   | `oklch(96%  0.025 255)`     | Accent tinted bg (chip, badge)   |
| `--a-100`  | `oklch(92%  0.05  255)`     | Accent border                    |
| `--a-500`  | `oklch(62%  0.18  255)`     | Primary CTA, links, focus ring   |
| `--a-600`  | `oklch(55%  0.19  255)`     | CTA hover                        |
| `--a-700`  | `oklch(47%  0.18  255)`     | CTA active / accent text         |

> **Чому Indigo, а не `#00ff05` з Linear?**
> Linear's зелений акцент — брендовий колір самого Linear. Для LMS-платформи Indigo — нейтральніший і читабельніший для освітнього продукту, при цьому зберігаючи той самий "технічний" характер.

### Семантичні кольори

| Токен        | Значення                  | Використання          |
|--------------|---------------------------|-----------------------|
| `--success`  | `oklch(62% 0.13 155)`     | Пройдений квіз, OK    |
| `--warn`     | `oklch(72% 0.15 75)`      | Попередження          |
| `--danger`   | `oklch(60% 0.19 25)`      | Помилка, failed       |
| `--locked`   | `oklch(55% 0.005 80)`     | Заблокований урок     |

### Темна тема (`.dark` клас на `<html>`)

Всі `--n-*` токени інвертуються автоматично. Акцент `--a-*` залишається незмінним.

```css
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
```

---

## 3. Типографіка

**Шрифт:** `Inter Variable` — headings і body (як у Linear).
**Моно:** `JetBrains Mono` — код, технічні мітки.

### Підключення (Next.js `layout.tsx`)

```ts
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans' })
```

### Ієрархія (адаптована з Linear)

| Роль     | Розмір | Вага | Letter-spacing | Використання              |
|----------|--------|------|----------------|---------------------------|
| Display  | 44px   | 600  | -0.03em        | Hero заголовок лендингу   |
| H1       | 32px   | 600  | -0.025em       | Назва курсу, головний h1  |
| H2       | 24px   | 600  | -0.02em        | Розділи, картки           |
| H3       | 20px   | 600  | -0.015em       | Модулі, підрозділи        |
| H4       | 17px   | 600  | -0.01em        | Назви уроків              |
| Body     | 15px   | 400  | -0.011em       | Основний текст            |
| Small    | 13px   | 400  | 0              | Мітки, caption, metadata  |
| Mono     | 12px   | 400  | +0.02em        | Код, технічні мітки       |

> **Linear використовує вагу 510** — Inter Variable підтримує дробові значення. В Tailwind це `font-[510]`.

---

## 4. Spacing Scale

База — 4px. Всі відступи кратні 4 (або 8 для великих).

| Токен   | Значення | Tailwind | Використання          |
|---------|----------|----------|-----------------------|
| `--s-1` | 4px      | `p-1`    | Мікро-відступи        |
| `--s-2` | 8px      | `p-2`    | Елементи              |
| `--s-3` | 12px     | `p-3`    | Елементи              |
| `--s-4` | 16px     | `p-4`    | Padding карток        |
| `--s-5` | 20px     | `p-5`    | Елементи              |
| `--s-6` | 24px     | `p-6`    | Padding секцій        |
| `--s-8` | 32px     | `p-8`    | Великі відступи       |
| `--s-12`| 48px     | `p-12`   | Sections padding      |
| `--s-16`| 64px     | `p-16`   | Hero padding          |
| `--s-24`| 96px     | `p-24`   | Між секціями лендингу |

---

## 5. Border Radius

| Токен     | Значення | Елемент                        |
|-----------|----------|--------------------------------|
| `--r-xs`  | 4px      | Chips, badges, kbd             |
| `--r-sm`  | 6px      | Кнопки, inputs                 |
| `--r-md`  | 10px     | Картки                         |
| `--r-lg`  | 14px     | Модальні вікна, великі картки  |
| `--r-xl`  | 20px     | Плеєр, hero images             |

---

## 6. Тіні (Elevation)

Три рівні. Використовуються рідко — тільки де є реальна глибина.

| Рівень    | Значення                                      | Де                     |
|-----------|-----------------------------------------------|------------------------|
| `--sh-1`  | `0 1px 2px oklch(15% 0.01 80 / 0.04)`        | Картки у списку        |
| `--sh-2`  | `0 4px 12px oklch(15% 0.01 80 / 0.06)`       | Dropdown, popover      |
| `--sh-pop`| `0 12px 40px oklch(15% 0.01 80 / 0.12)`      | Модальні вікна         |

> Тіні теплі (low chroma), не чорні. Це робить elevation "повітряним" а не важким.

---

## 7. Компоненти (Button система)

```css
/* Base */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 36px; padding: 0 14px; border-radius: var(--r-sm);
  font-size: 13px; font-weight: 500;
  transition: all 120ms ease; white-space: nowrap;
}

/* Варіанти */
.btn-primary  { background: var(--n-900); color: var(--n-0); }
.btn-primary:hover { background: var(--n-950); }

.btn-accent   { background: var(--a-500); color: white; }
.btn-accent:hover { background: var(--a-600); }

.btn-ghost    { color: var(--n-700); }
.btn-ghost:hover { background: var(--n-100); }

.btn-outline  { border: 1px solid var(--n-200); color: var(--n-700); background: var(--n-0); }
.btn-outline:hover { background: var(--n-50); }

/* Розміри */
.btn-sm { height: 28px; font-size: 11px; padding: 0 10px; }
.btn-lg { height: 44px; padding: 0 20px; font-size: 15px; }
```

---

## 8. Layout Constants

```css
--sidebar-w:        304px;   /* Sidebar студента/адміна */
--sidebar-w-narrow:  72px;   /* Collapsed sidebar */
--header-h:          56px;   /* Top navigation bar */
--content-max:      820px;   /* Max width для читабельного тексту */
```

---

## 9. Tailwind інтеграція

У `tailwind.config.ts` додати CSS змінні як кастомні кольори:

```ts
theme: {
  extend: {
    colors: {
      n: {
        0: 'var(--n-0)',
        50: 'var(--n-50)',
        100: 'var(--n-100)',
        200: 'var(--n-200)',
        400: 'var(--n-400)',
        500: 'var(--n-500)',
        700: 'var(--n-700)',
        900: 'var(--n-900)',
        950: 'var(--n-950)',
      },
      accent: {
        DEFAULT: 'var(--a-500)',
        50: 'var(--a-50)',
        100: 'var(--a-100)',
        600: 'var(--a-600)',
        700: 'var(--a-700)',
      },
    },
    borderRadius: {
      xs: 'var(--r-xs)',
      sm: 'var(--r-sm)',
      md: 'var(--r-md)',
      lg: 'var(--r-lg)',
      xl: 'var(--r-xl)',
    },
    boxShadow: {
      1: 'var(--sh-1)',
      2: 'var(--sh-2)',
      pop: 'var(--sh-pop)',
    },
    fontFamily: {
      sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      mono: ['var(--font-mono)', 'monospace'],
    },
  },
}
```

Тоді в компонентах: `bg-n-0`, `text-n-900`, `bg-accent`, `rounded-md`, `shadow-2`.

---

## 10. Do's and Don'ts (адаптовано під LMS)

### ✅ Do
- Світлий фон `--n-0` як canvas — не білий `#ffffff`
- Inter Variable для всього тексту
- Один акцент (indigo `--a-500`) — тільки для CTA, активних станів, focus
- Hairline borders (`1px solid var(--n-200)`) замість важких рамок
- Spacing кратний 4px завжди
- Rounded corners на всіх interactive елементах (`--r-sm` мінімум)
- Warmth у тінях — не чорний `rgba(0,0,0)`

### ❌ Don't
- Не використовувати `#00ff05` (це бренд самого Linear, не LMS)
- Не чистий `#ffffff` як фон — він надто різкий
- Не `font-weight: 700` для заголовків — тут 600 або 510 (Inter Variable)
- Не різкі кути `border-radius: 0`
- Не відступи поза сіткою (наприклад, `padding: 7px`)
- Не більше одного акцентного кольору на екрані
- Не додавати декоративні елементи яких немає у wireframes

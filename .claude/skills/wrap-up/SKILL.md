---
name: wrap-up
description: Close out a completed chunk of work in the LMS project — update CLAUDE.md "Current sprint", sync the GitHub Project roadmap board, commit docs, and open/update a PR for the user to review. Use whenever a task, phase, or feature lands; when the user says "заверши", "закрий задачу", "wrap up", "підсумуй роботу", "онови статус/дошку", or asks what's left to close out; and proactively at the natural end of any significant piece of work, even if the user doesn't name this skill.
---

# Wrap-up: закриття шматка роботи

Мета: після завершення задачі вся "бухгалтерія" робиться одним рухом, щоб
джерела правди не розходились. Користувач лише ревʼюїть PR — решта на тобі.

Джерела правди (кожен факт живе в одному місці):
- **CLAUDE.md** — поточний стан проєкту і скоуп (головне джерело; за розбіжності виграє воно)
- **GitHub Project #3** — статус roadmap-карток
- **git/PR** — що саме змінилось у коді

## Кроки

### 1. Зрозумій, що зроблено
`git log --oneline main..HEAD` + `git status`. Сформулюй 1-2 реченнями, який
шматок роботи закривається. Якщо working tree брудний — спершу закоммить
осмисленими conventional-комітами (правило репо: коміт після кожної задачі).

### 2. Онови CLAUDE.md
- Розділ `## Current sprint` — актуальний стан (що done, з датою).
- `### Next tasks` — що далі; блокери познач явно (напр. "blocked: Resend key").
- Якщо завершилась ціла фаза/спринт — додай запис у `## Completed sprints`
  (factual: таблиці/файли/рішення + що свідомо НЕ зроблено).
- НЕ чіпай верифікаційні чеклісти Sprint 1–3 і розділ Product scope
  (скоуп міняється лише окремим рішенням партнерів, не wrap-up'ом).

### 3. Синхронізуй дошку (GitHub Project #3, owner RomanOliakh)
Онови Status карток, які стосуються цього шматка: завершені → Done,
розпочате наступне → In Progress. Якщо з'явилась нова робота, якої немає
на дошці — додай картку (`gh project item-create`).

Project ID стабільний: `PVT_kwHOAkOJg84BaTeD`. ID поля Status та його опцій
діставай динамічно (вони можуть змінюватись):

```bash
gh project field-list 3 --owner RomanOliakh --format json | python3 -c '
import sys,json
for f in json.load(sys.stdin)["fields"]:
    if f.get("name")=="Status":
        print(f["id"], {o["name"]:o["id"] for o in f.get("options",[])})'
# далі: gh project item-list 3 --owner RomanOliakh --format json --limit 50
# і gh project item-edit --id <ITEM> --project-id PVT_kwHOAkOJg84BaTeD \
#     --field-id <STATUS_FIELD> --single-select-option-id <OPTION>
```

Будь чесним зі статусами: якщо картка зроблена частково — НЕ став Done;
лиши In Progress і скажи користувачу, чого бракує.

### 4. Закоммить docs-зміни
Conventional commit (`docs: ...`) на поточній гілці. Футер репо:
`Co-Authored-By:` згідно з git-конвенціями проєкту.

### 5. PR
- Якщо PR для гілки ще немає — **спитай дозволу на push**, потім
  `git push -u origin <branch>` і `gh pr create` (база `main`; body: summary
  по комітах + notes; футер 🤖 згідно з конвенціями).
- Якщо PR вже відкритий — push оновлень достатньо (після дозволу).
- Ніколи не мерджи сам — merge робить користувач (або після його явного ОК).

### 6. Підсумок користувачу
Коротко: що оновлено (CLAUDE.md розділи, які картки куди переїхали),
посилання на PR, і список "що далі / блокери". Якщо щось лишилось
незакритим (часткова картка, незапушений коміт) — скажи прямо.

## Принципи
- Краще недозвітувати, ніж перебрехати: статуси Done тільки для реально
  перевіреного. Сумніваєшся — In Progress + чесна нотатка.
- Wrap-up — не місце для нових фіч чи рефакторингу. Тільки бухгалтерія.
- Якщо CLAUDE.md і дошка суперечать — виправ дошку під CLAUDE.md.

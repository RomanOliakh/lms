# Pricing — B2B v1 (optimized)

> Trimmed from the partner's full pricing strategy (`canadian_learning_platform_pricing_strategy.xlsx`).
> Aligned to what v1 actually ships: **B2B-first, manual invoicing** (Platform Admin sets the plan + seat limit — no self-serve Stripe for companies), shared course catalog, assignments, quizzes, completion report (CSV), PDF certificates. Currency: **CAD**. Final price points to confirm with partner.

## Billing model (decided)
- **Per-company plan, priced by seat band**, billed **annually** (monthly optional). Manual invoice; Platform Admin activates the plan and sets `seat_limit` (already enforced server-side).
- **Annual prepay discount: 15–20%.**
- Per-seat pricing offered only **on request** for small teams (avoids maintaining two parallel public models).

## Offers to sell now

| Plan | Seats | Price (CAD) | Includes |
|------|-------|-------------|----------|
| **Paid Pilot** *(first offer)* | up to 15 | **$3,500–$5,000** one-time (≈3 mo) | 2–3 assigned courses, quizzes, certificates, company report/CSV, 1 intro workshop (service). Goal: validate + case study. |
| **Starter** | up to 25 | **$6,000–$8,000 / yr** | Core platform: assigned courses, quizzes, certificates, company report/CSV, company-admin access |
| **Team** | up to 50 | **$12,000–$15,000 / yr** | + more programs, learning journeys (when shipped), company dashboard |
| **Business** | up to 100 | **$24,000–$30,000 / yr** | + full library, advanced reports |
| **Enterprise** | 100+ | **Custom** | SSO / integrations / branding — *later; don't lead with it* |

**Discounts:** annual prepay 15–20%; paid-pilot 30–50% off for the first 3–5 clients (paid, not free).

## Add-on — Live workshops (service, off-platform for now)
No workshop module in v1, so sell/deliver these **as a service**, two formats only:
- **Short (90 min):** $750–$1,500
- **Half-day (3–4 h):** $3,000–$6,000

## Deferred (not in v1 pricing)
- **B2C** (individual courses / memberships / cohorts) — after B2B traction.
- Extra workshop tiers (full-day, private custom), AI/BA/Process content packages — bring back per client when the content + workshop module exist.
- Non-profit/education discount — optional, later.

## What was cut and why
- Removed the parallel **per-user 3-tier** block → folded into "per-seat on request" (one public model is cleaner).
- **5 workshop formats → 2**; marked as a service (product has no workshop module yet).
- **5 corporate packages → 1** (the pilot); the rest are content-dependent.
- **6 B2C tiers → deferred** (B2B-first per discovery P0 #5).

## Summary (one line)
Start with a **paid pilot ($3.5–5k)** → convert to an **annual per-company plan ($6–30k/yr by seats)**, manual invoice, 15–20% annual discount; workshops as a paid add-on service; B2C later.

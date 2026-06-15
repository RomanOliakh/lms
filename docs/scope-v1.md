# v1 scope — 50 flows mapped

> Trimmed/optimized view of the partner spec (`Learning_Platform_1.xlsx`, 50 flows / 30 modules) against what v1 actually delivers. Legend: **✅ Built** (in `main` or open PR) · **🟡 v1 (adapted/partial)** · **⛔ Later** (out of v1 — see CLAUDE.md OUT list).

## ✅ Built (v1 core, done)
| # | Flow | Where |
|---|------|-------|
| 1 | Create platform admin account | auth + `profiles.role='admin'` |
| 2 | Create company account | `/admin/companies` provisioning |
| 4 | Invite employees | invitations (PR #10, merged) |
| 5 | Employee accepts invitation | `/invite/[token]` accept |
| 8 | Create course | admin course CRUD |
| 9 | Create course modules | curriculum editor |
| 11 | Create quiz | quiz builder |
| 16 | Learner views dashboard | `/dashboard` (assigned + progress) |
| 17 | Learner starts course | lesson player |
| 18 | Learner completes module/lesson | mark-complete + `lesson_progress` |
| 20 | Learner takes quiz | `/api/quiz/submit` (server-validated) |
| 21 | Fails quiz and retries | retry + best/latest attempt |
| 28 | System updates course progress | progress aggregation |
| 29 | Learner completes course | 100% completion |
| 31 | Generate certificate | PDF certificate (PR #12) |
| 32 | Learner downloads certificate | dashboard / report link |
| 34 | Company admin views company report | `/admin/companies/[id]/report` |
| 35 | Company admin exports report | CSV export |
| 45 | Platform admin publishes content | `is_published` toggle |
| 46 | Platform admin updates course content | course/lesson edit |

## 🟡 v1 (adapted or partial)
| # | Flow | Note |
|---|------|------|
| 3 | Configure company profile | name/slug/logo/seat_limit ✅; **departments/teams OUT** |
| 10 | Upload learning materials | text/MDX ✅; video field ✅ but **Bunny 403** (blocked: creds); rich file upload minimal |
| 15 | Assign training to employees + deadline | done as **course assignment** (journey formalism OUT) — PR #9, merged |
| 37 | Company admin manages seats | `seat_limit` enforced ✅; "request more seats" = manual |
| 38 | Platform admin manages subscription | **manual billing** (set plan + seat_limit); no subscription object/Stripe-for-companies (see `docs/pricing.md`) |

## ⛔ Later (out of v1)
| # | Flow | Reason |
|---|------|--------|
| 6 | Assign employee to department/team | teams/departments OUT |
| 7 | Create program | Programs layer OUT (courses only) |
| 12 | Create assignment | assignments+review OUT |
| 13 | Create learning journey | Journeys formalism OUT |
| 14 | Assign journey to company | Journeys + per-company entitlements (future) |
| 19 | Learner downloads resource | content library / resource center later |
| 22 | Learner submits assignment | assignments OUT |
| 23 | Instructor reviews assignment | Instructor role + review OUT |
| 24–27 | Workshop register / join / attendance / feedback | live workshops OUT (sell as service — `docs/pricing.md`) |
| 30 | Complete program/journey | Journeys OUT |
| 33 | Manager views team progress | Manager role merged into company_admin; team reports later |
| 36 | Platform admin monitors company activity | platform analytics later |
| 39–40 | B2C buy course / public workshop | B2C later (P0 #5) |
| 41–42 | Instructor creates / company books workshop | workshops OUT |
| 43–44 | Learner notification / overdue alert | notifications beyond invite later (Resend blocked) |
| 47 | Search resources | search later |
| 48 | AI learning assistant | AI later |
| 49 | Request custom program | CRM/custom content later (content ownership = ours, P0 #1) |
| 50 | Review feedback & improve course | feedback module later |

## Modules (30) — quick status
- **Built/v1:** User & Role Mgmt · Company/Org Mgmt · Multi-Tenant Access Control (RLS) · Course Mgmt · Module/Lesson Mgmt · Quiz & Assessment · Progress Tracking · Certificate · Learner Dashboard · Company Admin Dashboard · Reporting (CSV; BI later) · Platform Admin Dashboard · Security basic.
- **Partial/blocked:** Video Hosting (Bunny creds), Subscription & Billing (manual only).
- **Later:** Program Mgmt · Learning Journey · Learning Goals · Assignment/Practical · Live Workshop (+Attendance/Feedback) · Content Library/Resource Center · Notifications · Public Website · B2C Marketplace · Search/Reco · AI Assistant · Integrations (SSO/HR/Zoom) · System Admin & Settings (templates).

## Takeaway
**v1 delivers the full sellable B2B loop** — provision company → invite → assign course + deadline → learn + quiz → completion report (CSV) → certificate — using courses (not Programs/Journeys) and manual billing. Everything in ⛔ is deliberately deferred per the discovery P0 answers + CLAUDE.md scope.

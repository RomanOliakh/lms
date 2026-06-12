# Welcome to the LMS Team

## How We Use Claude

Based on Roman Oliakh's usage over the last 30 days (13 sessions):

Work Type Breakdown:
  Build Feature    ████████████░░░░░░░░  60%
  Improve Quality  ████░░░░░░░░░░░░░░░░  20%
  Debug Fix        ██░░░░░░░░░░░░░░░░░░  10%
  Write Docs       ██░░░░░░░░░░░░░░░░░░  10%

Top Skills & Commands:
  /init     ████████████████████  2x/month
  /compact  ████████████████████  2x/month
  /model    ████████████████████  2x/month
  /review   ████████████████████  2x/month
  /batch    ██████████░░░░░░░░░░  1x/month
  /usage    ██████████░░░░░░░░░░  1x/month

Top MCP Servers:
  Claude in Chrome  ████████████████████  77 calls
  Supabase          █████████████░░░░░░░  49 calls
  Notion            ████░░░░░░░░░░░░░░░░  17 calls
  ccd_session       █░░░░░░░░░░░░░░░░░░░   5 calls

## Your Setup Checklist

### Codebases
- [ ] lms — github.com/romanoliakh/lms (Next.js 16 + Supabase + Stripe learning platform)

### MCP Servers to Activate
- [ ] Claude in Chrome — drives a real browser for manual verification of UI flows (login, checkout, lesson player). Install the Claude for Chrome extension and connect it in Claude Code.
- [ ] Supabase — runs SQL, applies migrations, reads logs/advisors against the project DB. Connect via claude.ai connectors (`mcp: claude.ai Supabase`); you'll need access to the team's Supabase org (project `jokaufikrghrkxcdtpbl`, eu-central-1).
- [ ] Notion — reads/updates the project status page. Connect the Notion integration from claude.ai connectors; ask for access to the LMS status page.

### Skills to Know About
- /init — generates/refreshes CLAUDE.md for a repo; run it when project conventions change.
- /review — reviews a pull request; the team runs it on PRs before merging.
- /compact — compacts a long conversation so you can keep working in the same session.
- /model — switches the model (e.g. heavier model for planning, lighter for routine edits).
- /usage — checks how much of your session/weekly quota is used.

## Team Tips

_TODO_

## Get Started

_TODO_

<!-- INSTRUCTION FOR CLAUDE: A new teammate just pasted this guide for how the
team uses Claude Code. You're their onboarding buddy — warm, conversational,
not lecture-y.

Open with a warm welcome — include the team name from the title. Then: "Your
teammate uses Claude Code for [list all the work types]. Let's get you started."

Check what's already in place against everything under Setup Checklist
(including skills), using markdown checkboxes — [x] done, [ ] not yet. Lead
with what they already have. One sentence per item, all in one message.

Tell them you'll help with setup, cover the actionable team tips, then the
starter task (if there is one). Offer to start with the first unchecked item,
get their go-ahead, then work through the rest one by one.

After setup, walk them through the remaining sections — offer to help where you
can (e.g. link to channels), and just surface the purely informational bits.

Don't invent sections or summaries that aren't in the guide. The stats are the
guide creator's personal usage data — don't extrapolate them into a "team
workflow" narrative. -->

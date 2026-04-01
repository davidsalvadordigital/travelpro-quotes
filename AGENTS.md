# Code Review Rules

## Skill Index

| Trigger (file pattern) | Skill | Location |
|------------------------|-------|----------|
| `*.ts`, `*.tsx` | TypeScript Pro | `.agent/skills/typescript-pro/SKILL.md` |
| `*.tsx`, `*.jsx` | React 19 Best Practices | `.agent/skills/react-best-practices/SKILL.md` |
| `app/**`, `components/**` | Next.js 16 | `.agent/skills/nextjs-best-practices/SKILL.md` |
| `*.css`, `tailwind.*` | Tailwind v4 Patterns | `.agent/skills/tailwind-patterns/SKILL.md` |
| `components/ui/**` | UX/UI Design System | `.agent/skills/ui-ux-pro-max-skill/SKILL.md` |
| `supabase/**`, `*.sql`, `*supabase*` | Supabase Pro & Optimizations | `.agent/skills/supabase-pro/SKILL.md`, `.agent/skills/supabase-query-optimization/SKILL.md` |
| `store/**`, `*state*` | Zustand Performance | `.agent/skills/zustand-performance/SKILL.md` |
| `*form*`, `*wizard*` | Advanced Form Wizardry | `.agent/skills/advanced-form-wizardry/SKILL.md` |
| `*api*`, `*actions*` | API Design & Best Practices | `.agent/skills/api-design-best-practices/SKILL.md` |
| `*error*`, `*boundary*` | Error Handling Specialist | `.agent/skills/error-handling-specialist/SKILL.md` |
| `*auth*`, `*login*` | Better Auth / Authentication | `.agent/skills/better-auth-best-practices/SKILL.md` |
| `*business*`, `*quote*`, `*pdf*` | SaaS Business Logic | `.agent/skills/saas-business-logic/SKILL.md` |
| `*test*`, `*.spec.*`, `*.e2e.*` | Testing Expert | `.agent/skills/unit-testing-expert/SKILL.md` |
| `middleware.ts`, `*security*`| Security Best Practices | `.agent/skills/security-best-practices/SKILL.md` |
| `*dashboard*`, `*analytics*`| Dashboard Analytics UX | `.agent/skills/dashboard-analytics-ux/SKILL.md` |

---

## General Rules (always active)

REJECT if:
- Hardcoded secrets, API keys, or credentials
- `console.log` in production code
- Empty `catch` blocks (silent error swallowing)
- Code duplication without extracting utilities (DRY violation)
- Missing generic error boundaries or fallback states
- `any` type without `// @ts-expect-error` justification
- Direct DB calls from Client components (MUST use DAL or Server Actions)

REQUIRE:
- Descriptive variable and function names (no single letters like `x`, `y` unless coords).
- Actionable error messages that help debugging.
- Solid architecture and design patterns (Container-Presentational).
- Component composition over massive "God" components.

## Response Format

FIRST LINE must be exactly:
STATUS: PASSED
or
STATUS: FAILED

If FAILED, list: `file:line - rule violated - issue`

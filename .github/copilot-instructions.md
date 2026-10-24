# GitHub Copilot instructions — PRSPRO2 frontend

Follow `AGENTS.md` for project rules. For implementation tasks, prefer the `pms-frontend-implementer` custom agent.

- Make changes on a task branch and deliver a pull request; never push application changes directly to `main`.
- Keep changes scoped and inspect existing implementation before editing.
- Verify backend API contracts in `Saeidesl/PRSPRO2BACKEND` when possible; never guess routes or response shapes.
- Preserve responsive mobile/desktop behavior, Persian RTL, Jalali date handling, and light/dark themes.
- Add regression tests and run actual repository checks; report exact commands and results.
- Do not test against live production Apps Script or modify real Google Sheets.
- Do not merge PRs, publish production changes, or alter deployment/authentication/permissions without explicit task requirements and review.
- Report limitations plainly; passing static tests is not proof of correct live production behavior.

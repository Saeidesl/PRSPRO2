# PMS automation agents — frontend

The frontend agents are read-only CI checks. They report static evidence and fail their own check when a required contract or high-risk pattern is found. They do not modify source code, merge pull requests, access Google Sheets, or deploy Apps Script.

## Agents

- **Cross-repository QA** — `.github/workflows/pms-cross-repo-qa.yml`. Validates frontend JavaScript, local assets and CSS together with backend tests, manifest and critical integration file presence.
- **Frontend contract and diff review** — `.github/workflows/pms-frontend-agent-suite.yml` and `scripts/pms-frontend-agent-review.js`. Checks the event integration failure/retry UX, material-planning UI contract, and added diff lines for dynamic code execution and document.write. New dynamic `innerHTML` additions are warnings for review, not automatic failures.
- **Frontend asset QA** — part of the frontend agent suite; verifies local assets and CSS brace balance.
- **Workflow failure monitor** — `.github/workflows/agent-monitor.yml`; checks failed GitHub Actions runs daily and opens/updates an issue.

## Run manually

In GitHub, open **Actions**, select **PMS frontend agent suite** or **PMS cross-repository QA**, then select **Run workflow**. PRs and pushes to `main` also trigger the configured checks.

## Safety limits

- CI permissions are read-only.
- No autonomous code edits, auto-merge, production-data writes, or Apps Script deploy credentials are used.
- A green static review does not replace browser/mobile acceptance testing or live tenant-configuration verification.

# Project modal accessibility follow-up

Date: 2026-10-25
Branch: `fix/project-modal-accessibility-20261025`
PR: #93

## Change
`js/modules/projects.js` now uses a shared keyboard handler for the project color/size and draft material-consumption dialogs. It supports Escape, traps Tab/Shift+Tab inside the active dialog, focuses the first control, restores focus to the opener, and ignores hidden/non-topmost dialogs.

A regression test was added at `tests/project-modal-accessibility.test.js`, and `frontend-check.yml` now runs it with Node's test runner.

## Validation status
The first frontend syntax/assets run passed. The new regression test is awaiting the workflow run triggered by the latest commit. Browser acceptance remains pending; this is not yet marked fully verified. The staging API is not configured, so authenticated end-to-end coverage remains blocked.

No backend, spreadsheet data, or Apps Script deployment was changed.
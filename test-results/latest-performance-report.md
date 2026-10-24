# PMS UI and Performance Audit

- Generated: 2026-10-24T18:15:13.418Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **authenticated-audit-complete**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 17 |
| loadedRoutes | 17 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 0 |
| visibleButtonsInventoried | 46 |
| visibleInputsAndControlsInventoried | 19 |
| networkRequestsMeasured | 145 |
| failedNetworkRequests | 0 |
| consoleErrors | 2 |
| pageErrors | 0 |
| safeButtonChecks | 14 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Navigation ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---|
| dashboard | loaded | 2689 | 0 | 6 | 2 | no |
| projects | loaded | 2677 | 0 | 1 | 2 | no |
| project-detail | loaded | 2671 | 0 | 2 | 0 | no |
| events | loaded | 2691 | 0 | 7 | 1 | no |
| workflows | loaded | 2671 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2670 | 0 | 1 | 1 | no |
| event-types | loaded | 2673 | 0 | 10 | 1 | no |
| procurement | loaded | 2680 | 0 | 4 | 0 | no |
| attachments | loaded | 2668 | 0 | 1 | 2 | no |
| reports | loaded | 2673 | 0 | 2 | 1 | no |
| users | loaded | 2677 | 0 | 1 | 1 | no |
| departments | loaded | 946 | 0 | 8 | 1 | no |
| roles | loaded | 183 | 0 | 1 | 1 | no |
| permissions | loaded | 177 | 0 | 0 | 1 | no |
| audit | loaded | 178 | 0 | 1 | 1 | no |
| settings | loaded | 172 | 0 | 0 | 2 | no |
| admin | loaded | 171 | 0 | 0 | 0 | no |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

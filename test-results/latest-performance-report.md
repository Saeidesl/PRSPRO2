# PMS UI and Performance Audit

- Generated: 2026-10-24T19:30:27.069Z
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
| visibleFormsInventoried | 9 |
| dynamicFormsInventoried | 9 |
| formOpenersChecked | 11 |
| visibleButtonsInventoried | 69 |
| visibleInputsAndControlsInventoried | 19 |
| networkRequestsMeasured | 253 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 14 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Navigation ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---|
| dashboard | loaded | 6081 | 0 | 6 | 2 | no |
| projects | loaded | 6560 | 0 | 9 | 2 | no |
| project-detail | loaded | 6553 | 0 | 2 | 0 | no |
| events | loaded | 6055 | 0 | 7 | 1 | no |
| workflows | loaded | 5568 | 0 | 1 | 2 | no |
| project-statuses | loaded | 6085 | 0 | 9 | 1 | no |
| event-types | loaded | 6070 | 0 | 10 | 1 | no |
| procurement | loaded | 6547 | 0 | 4 | 0 | no |
| attachments | loaded | 6549 | 0 | 2 | 2 | no |
| reports | loaded | 5546 | 0 | 2 | 1 | no |
| users | loaded | 5547 | 0 | 7 | 1 | no |
| departments | loaded | 6068 | 0 | 8 | 1 | no |
| roles | loaded | 6063 | 0 | 1 | 1 | no |
| permissions | loaded | 5565 | 0 | 0 | 1 | no |
| audit | loaded | 5069 | 0 | 1 | 1 | no |
| settings | loaded | 5036 | 0 | 0 | 2 | no |
| admin | loaded | 3701 | 0 | 0 | 0 | no |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

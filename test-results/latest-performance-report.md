# PMS UI and Performance Audit

- Generated: 2026-10-25T17:12:13.699Z
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
| visibleButtonsInventoried | 127 |
| visibleInputsAndControlsInventoried | 19 |
| networkRequestsMeasured | 310 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 14 |
| failedSafeButtonChecks | 0 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3386 | 6043 | 0 | 5 | 2 | no |
| projects | loaded | 3374 | 6030 | 0 | 5 | 2 | no |
| project-detail | loaded | 2866 | 5519 | 0 | 2 | 0 | no |
| events | loaded | 2868 | 5524 | 0 | 6 | 1 | no |
| workflows | loaded | 3402 | 6057 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3888 | 6543 | 0 | 9 | 1 | no |
| event-types | loaded | 3378 | 6037 | 0 | 43 | 1 | no |
| procurement | loaded | 4371 | 7026 | 0 | 4 | 0 | no |
| attachments | loaded | 2361 | 5015 | 0 | 1 | 2 | no |
| reports | loaded | 2887 | 5542 | 0 | 2 | 1 | no |
| users | loaded | 3876 | 6531 | 0 | 21 | 1 | no |
| departments | loaded | 2867 | 5452 | 0 | 8 | 1 | no |
| roles | loaded | 2880 | 5536 | 0 | 19 | 1 | no |
| permissions | loaded | 2901 | 5554 | 0 | 0 | 1 | no |
| audit | loaded | 2866 | 5522 | 0 | 1 | 1 | no |
| settings | loaded | 2868 | 5521 | 0 | 0 | 2 | no |
| admin | loaded | 2868 | 3372 | 0 | 0 | 0 | no |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

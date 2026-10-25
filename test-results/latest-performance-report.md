# PMS UI and Performance Audit

- Generated: 2026-10-25T17:41:34.286Z
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
| visibleFormsInventoried | 10 |
| dynamicFormsInventoried | 10 |
| formOpenersChecked | 11 |
| visibleButtonsInventoried | 133 |
| visibleInputsAndControlsInventoried | 19 |
| networkRequestsMeasured | 352 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 14 |
| failedSafeButtonChecks | 0 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2389 | 5049 | 0 | 4 | 2 | no |
| projects | loaded | 2881 | 5537 | 0 | 5 | 2 | no |
| project-detail | loaded | 4377 | 7033 | 0 | 2 | 0 | no |
| events | loaded | 2375 | 5030 | 0 | 11 | 1 | no |
| workflows | loaded | 2390 | 5045 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2385 | 5040 | 0 | 9 | 1 | no |
| event-types | loaded | 3891 | 6549 | 0 | 43 | 1 | no |
| procurement | loaded | 3376 | 6031 | 0 | 4 | 0 | no |
| attachments | loaded | 2876 | 5530 | 0 | 1 | 2 | no |
| reports | loaded | 2369 | 5024 | 0 | 2 | 1 | no |
| users | loaded | 2377 | 5013 | 0 | 21 | 1 | no |
| departments | loaded | 2380 | 5034 | 0 | 8 | 1 | no |
| roles | loaded | 2381 | 4891 | 0 | 19 | 1 | no |
| permissions | loaded | 2408 | 5063 | 0 | 0 | 1 | no |
| audit | loaded | 3378 | 6033 | 0 | 1 | 1 | no |
| settings | loaded | 3887 | 6543 | 0 | 0 | 2 | no |
| admin | loaded | 2878 | 3048 | 0 | 0 | 0 | no |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

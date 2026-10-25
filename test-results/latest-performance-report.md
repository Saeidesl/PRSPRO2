# PMS UI and Performance Audit

- Generated: 2026-10-25T07:16:50.755Z
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
| visibleButtonsInventoried | 52 |
| visibleInputsAndControlsInventoried | 19 |
| networkRequestsMeasured | 322 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 14 |
| failedSafeButtonChecks | 0 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2869 | 5525 | 0 | 7 | 2 | no |
| projects | loaded | 2359 | 5014 | 0 | 1 | 2 | no |
| project-detail | loaded | 3349 | 6005 | 0 | 2 | 0 | no |
| events | loaded | 3861 | 6516 | 0 | 8 | 1 | no |
| workflows | loaded | 2863 | 5518 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3883 | 6537 | 0 | 9 | 1 | no |
| event-types | loaded | 2362 | 5016 | 0 | 10 | 1 | no |
| procurement | loaded | 2861 | 5515 | 0 | 4 | 0 | no |
| attachments | loaded | 2854 | 5508 | 0 | 1 | 2 | no |
| reports | loaded | 2364 | 5018 | 0 | 2 | 1 | no |
| users | loaded | 2345 | 4999 | 0 | 1 | 1 | no |
| departments | loaded | 3873 | 6436 | 0 | 2 | 1 | no |
| roles | loaded | 2861 | 5298 | 0 | 3 | 1 | no |
| permissions | loaded | 3884 | 6537 | 0 | 0 | 1 | no |
| audit | loaded | 3856 | 6511 | 0 | 1 | 1 | no |
| settings | loaded | 2355 | 5008 | 0 | 0 | 2 | no |
| admin | loaded | 2348 | 2900 | 0 | 0 | 0 | no |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

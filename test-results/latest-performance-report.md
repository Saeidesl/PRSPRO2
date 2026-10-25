# PMS UI and Performance Audit

- Generated: 2026-10-25T18:17:56.035Z
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
| formOpenersChecked | 12 |
| visibleButtonsInventoried | 126 |
| visibleInputsAndControlsInventoried | 19 |
| networkRequestsMeasured | 332 |
| failedNetworkRequests | 1 |
| consoleErrors | 2 |
| pageErrors | 0 |
| safeButtonChecks | 14 |
| failedSafeButtonChecks | 0 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2917 | 5574 | 0 | 4 | 2 | no |
| projects | loaded | 4910 | 7567 | 0 | 5 | 2 | no |
| project-detail | loaded | 4404 | 7059 | 0 | 2 | 0 | no |
| events | loaded | 7918 | 10574 | 0 | 6 | 1 | no |
| workflows | loaded | 5424 | 8080 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4436 | 7093 | 0 | 9 | 1 | no |
| event-types | loaded | 3406 | 6065 | 0 | 43 | 1 | no |
| procurement | loaded | 2392 | 5047 | 0 | 4 | 0 | no |
| attachments | loaded | 2389 | 5046 | 0 | 1 | 2 | no |
| reports | loaded | 2908 | 5565 | 0 | 2 | 1 | no |
| users | loaded | 2903 | 5561 | 0 | 21 | 1 | no |
| departments | loaded | 2894 | 5550 | 0 | 8 | 1 | no |
| roles | loaded | 3920 | 6577 | 0 | 19 | 1 | no |
| permissions | loaded | 1940 | 4597 | 0 | 0 | 1 | no |
| audit | loaded | 2900 | 5557 | 0 | 1 | 1 | no |
| settings | loaded | 2408 | 5066 | 0 | 0 | 2 | no |
| admin | loaded | 2395 | 2727 | 0 | 0 | 0 | no |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

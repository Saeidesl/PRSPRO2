# PMS UI and Performance Audit

- Generated: 2026-10-24T19:55:47.518Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **needs-attention**

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
| visibleButtonsInventoried | 66 |
| visibleInputsAndControlsInventoried | 19 |
| networkRequestsMeasured | 238 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 14 |
| failedSafeButtonChecks | 9 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3424 | 6081 | 0 | 4 | 2 | no |
| projects | loaded | 2399 | 5057 | 0 | 1 | 2 | no |
| project-detail | loaded | 2921 | 5576 | 0 | 2 | 0 | no |
| events | loaded | 2896 | 5552 | 0 | 7 | 1 | no |
| workflows | loaded | 2929 | 5586 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2919 | 5575 | 0 | 9 | 1 | no |
| event-types | loaded | 2906 | 5562 | 0 | 10 | 1 | no |
| procurement | loaded | 2402 | 5060 | 0 | 4 | 0 | no |
| attachments | loaded | 2891 | 5547 | 0 | 1 | 2 | no |
| reports | loaded | 2889 | 5544 | 0 | 2 | 1 | no |
| users | loaded | 2891 | 5547 | 0 | 7 | 1 | no |
| departments | loaded | 2910 | 5566 | 0 | 8 | 1 | no |
| roles | loaded | 2909 | 5565 | 0 | 7 | 1 | no |
| permissions | loaded | 3434 | 6091 | 0 | 0 | 1 | no |
| audit | loaded | 4400 | 7055 | 0 | 1 | 1 | no |
| settings | loaded | 5411 | 8065 | 0 | 0 | 2 | no |
| admin | loaded | 2899 | 3160 | 0 | 0 | 0 | no |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

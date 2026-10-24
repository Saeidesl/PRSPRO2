# PMS UI and Performance Audit

- Generated: 2026-10-24T20:08:39.990Z
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
| visibleFormsInventoried | 8 |
| dynamicFormsInventoried | 8 |
| formOpenersChecked | 11 |
| visibleButtonsInventoried | 33 |
| visibleInputsAndControlsInventoried | 19 |
| networkRequestsMeasured | 248 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 14 |
| failedSafeButtonChecks | 9 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 4890 | 7547 | 0 | 4 | 2 | no |
| projects | loaded | 3368 | 6023 | 0 | 1 | 2 | no |
| project-detail | loaded | 3372 | 6027 | 0 | 2 | 0 | no |
| events | loaded | 3373 | 6028 | 0 | 5 | 1 | no |
| workflows | loaded | 3878 | 6533 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2872 | 5529 | 0 | 1 | 1 | no |
| event-types | loaded | 2865 | 5520 | 0 | 1 | 1 | no |
| procurement | loaded | 2845 | 5499 | 0 | 4 | 0 | no |
| attachments | loaded | 3864 | 6519 | 0 | 1 | 2 | no |
| reports | loaded | 2352 | 5005 | 0 | 2 | 1 | no |
| users | loaded | 2875 | 5530 | 0 | 3 | 1 | no |
| departments | loaded | 2360 | 5015 | 0 | 2 | 1 | no |
| roles | loaded | 2870 | 5525 | 0 | 3 | 1 | no |
| permissions | loaded | 2366 | 5020 | 0 | 0 | 1 | no |
| audit | loaded | 3877 | 6533 | 0 | 1 | 1 | no |
| settings | loaded | 3358 | 6012 | 0 | 0 | 2 | no |
| admin | loaded | 4371 | 4752 | 0 | 0 | 0 | no |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

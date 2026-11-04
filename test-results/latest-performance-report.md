# PMS UI and Performance Audit

- Generated: 2026-11-04T16:58:39.962Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **needs-attention**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 20 |
| loadedRoutes | 20 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 8 |
| dynamicFormsInventoried | 7 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 452 |
| visibleInputsAndControlsInventoried | 35 |
| networkRequestsMeasured | 189 |
| procurementApiRequestsMeasured | 2 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 0 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 11 |
| failedSafeButtonChecks | 5 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 5437 | 8093 | 0 | 4 | 2 | no |
| projects | loaded | 5395 | 8054 | 0 | 1 | 2 | no |
| project-detail | loaded | 3890 | 6547 | 0 | 2 | 0 | no |
| print-design | loaded | 3383 | 6043 | 1 | 14 | 5 | no |
| print-output | loaded | 3382 | 6040 | 0 | 1 | 2 | no |
| events | loaded | 4402 | 7060 | 0 | 5 | 1 | no |
| workflows | loaded | 3374 | 6032 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3877 | 6534 | 0 | 1 | 1 | no |
| event-types | loaded | 3882 | 6540 | 0 | 1 | 1 | no |
| information-types | loaded | 8078 | 10733 | 0 | 0 | 0 | no |
| procurement | loaded | 4423 | 68393 | 0 | 4 | 0 | no |
| attachments | loaded | 8074 | 10730 | 0 | 0 | 0 | no |
| reports | loaded | 4403 | 7063 | 0 | 8 | 12 | no |
| users | loaded | 4388 | 7044 | 0 | 1 | 1 | no |
| departments | loaded | 3401 | 6058 | 0 | 8 | 1 | no |
| roles | loaded | 3396 | 6054 | 0 | 1 | 1 | no |
| permissions | loaded | 5399 | 8056 | 0 | 0 | 1 | no |
| audit | loaded | 4884 | 7540 | 0 | 1 | 1 | no |
| settings | loaded | 8082 | 10737 | 0 | 0 | 0 | no |
| admin | loaded | 4887 | 7617 | 0 | 399 | 2 | no |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.
- Procurement diagnostic benchmark did not complete: page.waitForFunction: Timeout 60000ms exceeded.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

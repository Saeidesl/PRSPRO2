# PMS UI and Performance Audit

- Generated: 2026-11-01T05:22:06.463Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **needs-attention**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 18 |
| loadedRoutes | 18 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 12 |
| dynamicFormsInventoried | 12 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 433 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 337 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 10 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2507 | 5167 | 0 | 4 | 2 | no |
| projects | loaded | 2418 | 5077 | 0 | 31 | 2 | no |
| project-detail | loaded | 2921 | 5576 | 0 | 2 | 0 | no |
| events | loaded | 2924 | 5580 | 0 | 15 | 1 | no |
| workflows | loaded | 2453 | 5109 | 0 | 3 | 2 | no |
| project-statuses | loaded | 3437 | 6092 | 0 | 9 | 1 | no |
| event-types | loaded | 3449 | 6115 | 0 | 69 | 1 | no |
| information-types | loaded | 2392 | 5048 | 0 | 1 | 1 | no |
| procurement | loaded | 3428 | 29423 | 0 | 9 | 0 | no |
| attachments | loaded | 3915 | 6572 | 0 | 1 | 2 | no |
| reports | loaded | 2922 | 5582 | 0 | 8 | 12 | no |
| users | loaded | 2427 | 5085 | 0 | 1 | 1 | no |
| departments | loaded | 4438 | 7093 | 0 | 8 | 1 | no |
| roles | loaded | 2418 | 5075 | 0 | 19 | 1 | no |
| permissions | loaded | 3939 | 6594 | 0 | 0 | 1 | no |
| audit | loaded | 2940 | 5597 | 0 | 1 | 1 | no |
| settings | loaded | 2522 | 5178 | 0 | 1 | 3 | no |
| admin | loaded | 2407 | 5107 | 0 | 251 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T05:24:03.368Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6416 ms | 4742 ms | /د/س/ت/ر/س/ی/ /1/4/5/2/ /// /ر/و/ت/ر/ /3/2/8/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/0/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/1/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/8/m/s/×/1/ |
| /procurement/orders | 5665 ms | 3521 ms | /د/س/ت/ر/س/ی/ /1/5/0/1/ /// /ر/و/ت/ر/ /2/0/1/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/8/5/m/s/×/1/,/ /g/e/t/A/l/l/:/5/2/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/5/7/m/s/×/1/ |
| /procurement/needs | 3792 ms | 2586 ms | /د/س/ت/ر/س/ی/ /9/4/0/ /// /ر/و/ت/ر/ /1/6/4/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/3/5/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/2/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/9/8/m/s/×/1/ |
| /procurement/dashboard | 3128 ms | 1934 ms | /د/س/ت/ر/س/ی/ /7/4/5/ /// /ر/و/ت/ر/ /1/1/8/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/7/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/5/8/m/s/×/1/,/ /g/e/t/A/l/l/:/1/5/3/m/s/×/1/ |
| /procurement/workspace | 3516 ms | 2324 ms | /د/س/ت/ر/س/ی/ /8/1/5/ /// /ر/و/ت/ر/ /1/5/0/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/3/5/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/3/7/6/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/2/7/1/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

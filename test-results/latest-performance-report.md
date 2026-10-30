# PMS UI and Performance Audit

- Generated: 2026-10-30T19:56:22.796Z
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
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 53 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 242 |
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
| dashboard | loaded | 4430 | 7089 | 0 | 4 | 2 | no |
| projects | loaded | 4389 | 7046 | 0 | 1 | 2 | no |
| project-detail | loaded | 3884 | 6541 | 0 | 2 | 0 | no |
| events | loaded | 3386 | 6044 | 0 | 9 | 1 | no |
| workflows | loaded | 3908 | 6566 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4390 | 7046 | 0 | 1 | 1 | no |
| event-types | loaded | 5396 | 8052 | 0 | 1 | 1 | no |
| information-types | loaded | 3876 | 6531 | 0 | 1 | 1 | no |
| procurement | loaded | 3380 | 42176 | 0 | 9 | 0 | no |
| attachments | loaded | 3870 | 6528 | 0 | 1 | 2 | no |
| reports | loaded | 3884 | 6542 | 0 | 8 | 12 | no |
| users | loaded | 3378 | 6034 | 0 | 1 | 1 | no |
| departments | loaded | 5411 | 8070 | 0 | 8 | 1 | no |
| roles | loaded | 3896 | 6550 | 0 | 1 | 1 | no |
| permissions | loaded | 4385 | 7041 | 0 | 0 | 1 | no |
| audit | loaded | 3371 | 6026 | 0 | 1 | 1 | no |
| settings | loaded | 3893 | 6549 | 0 | 1 | 3 | no |
| admin | loaded | 3869 | 6524 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-30T19:58:51.491Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 9867 ms | 8383 ms | /د/س/ت/ر/س/ی/ /3/1/7/1/ /// /ر/و/ت/ر/ /5/2/1/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/4/8/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/3/2/7/m/s/×/1/,/ /g/e/t/A/l/l/:/9/0/9/m/s/×/1/ |
| /procurement/orders | 5258 ms | 3599 ms | /د/س/ت/ر/س/ی/ /1/5/8/7/ /// /ر/و/ت/ر/ /2/0/1/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/4/0/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/5/1/3/m/s/×/2/,/ /g/e/t/A/l/l/:/4/3/6/m/s/×/1/ |
| /procurement/needs | 6103 ms | 4679 ms | /د/س/ت/ر/س/ی/ /1/5/2/7/ /// /ر/و/ت/ر/ /3/1/5/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/2/1/m/s/×/1/,/ /g/e/t/A/l/l/:/4/1/0/m/s/×/1/,/ /g/e/t/A/l/l/:/4/0/0/m/s/×/1/ |
| /procurement/dashboard | 4688 ms | 3305 ms | /د/س/ت/ر/س/ی/ /1/3/6/8/ /// /ر/و/ت/ر/ /1/9/3/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/4/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/2/0/m/s/×/2/,/ /g/e/t/A/l/l/:/2/8/6/m/s/×/1/ |
| /procurement/workspace | 7391 ms | 5784 ms | /د/س/ت/ر/س/ی/ /1/8/9/0/ /// /ر/و/ت/ر/ /3/8/9/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/6/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/3/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/5/3/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

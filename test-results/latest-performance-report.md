# PMS UI and Performance Audit

- Generated: 2026-10-30T16:59:50.174Z
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
| formOpenersChecked | 12 |
| visibleButtonsInventoried | 76 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 323 |
| procurementApiRequestsMeasured | 7 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 20 |
| failedSafeButtonChecks | 5 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3409 | 6067 | 0 | 4 | 2 | no |
| projects | loaded | 2862 | 5518 | 0 | 1 | 2 | no |
| project-detail | loaded | 3867 | 6522 | 0 | 2 | 0 | no |
| events | loaded | 4877 | 7533 | 0 | 5 | 1 | no |
| workflows | loaded | 3901 | 6558 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3878 | 6533 | 0 | 9 | 1 | no |
| event-types | loaded | 3374 | 6028 | 0 | 1 | 1 | no |
| procurement | loaded | 3860 | 57906 | 0 | 9 | 0 | no |
| attachments | loaded | 3372 | 6029 | 0 | 1 | 2 | no |
| reports | loaded | 3385 | 6043 | 0 | 8 | 12 | no |
| users | loaded | 2870 | 5526 | 0 | 21 | 1 | no |
| departments | loaded | 2877 | 5533 | 0 | 8 | 1 | no |
| roles | loaded | 3889 | 6544 | 0 | 1 | 1 | no |
| permissions | loaded | 3376 | 6030 | 0 | 0 | 1 | no |
| audit | loaded | 2886 | 5541 | 0 | 1 | 1 | no |
| settings | loaded | 2362 | 5019 | 0 | 1 | 3 | no |
| admin | loaded | 4366 | 7023 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-30T17:02:18.609Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 15592 ms | 10117 ms | /د/س/ت/ر/س/ی/ /3/9/2/6/ /// /ر/و/ت/ر/ /6/1/9/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/3/4/0/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/2/3/2/1/m/s/×/1/,/ /g/e/t/A/l/l/:/5/5/8/m/s/×/1/ |
| /procurement/orders | 5259 ms | 3219 ms | /د/س/ت/ر/س/ی/ /1/2/9/2/ /// /ر/و/ت/ر/ /1/9/2/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/5/1/m/s/×/1/,/ /g/e/t/A/l/l/:/3/3/8/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/3/3/7/m/s/×/2/ |
| /procurement/needs | 7340 ms | 5447 ms | /د/س/ت/ر/س/ی/ /1/8/6/7/ /// /ر/و/ت/ر/ /3/5/7/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/6/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/7/4/m/s/×/1/,/ /g/e/t/A/l/l/:/6/9/4/m/s/×/1/ |
| /procurement/dashboard | 7845 ms | 6289 ms | /د/س/ت/ر/س/ی/ /2/1/6/1/ /// /ر/و/ت/ر/ /4/1/2/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/6/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/2/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/8/0/m/s/×/1/ |
| /procurement/workspace | 14528 ms | 5034 ms | /د/س/ت/ر/س/ی/ /2/7/2/5/ /// /ر/و/ت/ر/ /2/3/0/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/0/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/0/2/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/9/3/2/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

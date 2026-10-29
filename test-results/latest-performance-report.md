# PMS UI and Performance Audit

- Generated: 2026-10-29T05:26:15.706Z
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
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 12 |
| visibleButtonsInventoried | 110 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 353 |
| procurementApiRequestsMeasured | 8 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 20 |
| failedSafeButtonChecks | 6 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3414 | 6071 | 0 | 4 | 2 | no |
| projects | loaded | 2879 | 5534 | 0 | 1 | 2 | no |
| project-detail | loaded | 3378 | 6033 | 0 | 2 | 0 | no |
| events | loaded | 3882 | 6540 | 0 | 7 | 1 | no |
| workflows | loaded | 3906 | 6561 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4395 | 7052 | 0 | 1 | 1 | no |
| event-types | loaded | 4381 | 7041 | 0 | 43 | 1 | no |
| procurement | loaded | 2360 | 34940 | 0 | 9 | 0 | no |
| attachments | loaded | 2877 | 5536 | 0 | 1 | 2 | no |
| reports | loaded | 3370 | 6028 | 0 | 8 | 12 | no |
| users | loaded | 2356 | 5008 | 0 | 1 | 1 | no |
| departments | loaded | 3869 | 6524 | 0 | 8 | 1 | no |
| roles | loaded | 4869 | 7523 | 0 | 19 | 1 | no |
| permissions | loaded | 3876 | 6531 | 0 | 0 | 1 | no |
| audit | loaded | 5382 | 8038 | 0 | 1 | 1 | no |
| settings | loaded | 2864 | 5516 | 0 | 1 | 3 | no |
| admin | loaded | 3875 | 6533 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T05:28:15.062Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4249 ms | 2850 ms | /د/س/ت/ر/س/ی/ /8/1/3/ /// /ر/و/ت/ر/ /2/0/3/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/5/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/9/6/m/s/×/1/,/ /g/e/t/A/l/l/:/1/9/7/m/s/×/1/ |
| /procurement/orders | 3980 ms | 2988 ms | /د/س/ت/ر/س/ی/ /1/1/8/3/ /// /ر/و/ت/ر/ /1/8/0/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/5/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/5/3/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/0/m/s/×/1/ |
| /procurement/needs | 6827 ms | 5180 ms | /د/س/ت/ر/س/ی/ /1/8/5/0/ /// /ر/و/ت/ر/ /3/3/3/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/0/2/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/0/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/1/0/m/s/×/1/ |
| /procurement/dashboard | 6431 ms | 4864 ms | /د/س/ت/ر/س/ی/ /2/1/1/2/ /// /ر/و/ت/ر/ /2/7/5/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/0/0/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/4/2/m/s/×/1/,/ /g/e/t/A/l/l/:/4/5/3/m/s/×/1/ |
| /procurement/workspace | 8110 ms | 3876 ms | /د/س/ت/ر/س/ی/ /1/1/2/9/ /// /ر/و/ت/ر/ /2/7/4/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/5/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/0/5/m/s/×/1/,/ /g/e/t/A/l/l/:/2/8/5/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

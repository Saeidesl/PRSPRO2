# PMS UI and Performance Audit

- Generated: 2026-10-31T18:12:05.946Z
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
| visibleButtonsInventoried | 181 |
| visibleInputsAndControlsInventoried | 32 |
| networkRequestsMeasured | 310 |
| procurementApiRequestsMeasured | 7 |
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
| dashboard | loaded | 2934 | 5591 | 0 | 4 | 2 | no |
| projects | loaded | 3398 | 6057 | 0 | 1 | 2 | no |
| project-detail | loaded | 4382 | 7037 | 0 | 2 | 0 | no |
| events | loaded | 2880 | 5535 | 0 | 13 | 1 | no |
| workflows | loaded | 8107 | 10762 | 0 | 0 | 0 | no |
| project-statuses | loaded | 3393 | 6050 | 0 | 1 | 1 | no |
| event-types | loaded | 2385 | 5048 | 0 | 69 | 1 | no |
| information-types | loaded | 2878 | 5536 | 0 | 28 | 1 | no |
| procurement | loaded | 2892 | 30699 | 0 | 9 | 0 | no |
| attachments | loaded | 3385 | 6041 | 0 | 13 | 2 | no |
| reports | loaded | 2392 | 5050 | 0 | 8 | 12 | no |
| users | loaded | 3400 | 6056 | 0 | 1 | 1 | no |
| departments | loaded | 2892 | 5547 | 0 | 8 | 1 | no |
| roles | loaded | 2391 | 5047 | 0 | 19 | 1 | no |
| permissions | loaded | 2389 | 5044 | 0 | 0 | 1 | no |
| audit | loaded | 3399 | 6055 | 0 | 1 | 1 | no |
| settings | loaded | 2915 | 5569 | 0 | 1 | 3 | no |
| admin | loaded | 3376 | 6032 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T18:14:16.594Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6899 ms | 5171 ms | /د/س/ت/ر/س/ی/ /1/7/3/6/ /// /ر/و/ت/ر/ /3/4/3/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/0/5/m/s/×/1/,/ /g/e/t/A/l/l/:/3/4/9/m/s/×/1/,/ /g/e/t/A/l/l/:/3/4/8/m/s/×/1/ |
| /procurement/orders | 3391 ms | 2259 ms | /د/س/ت/ر/س/ی/ /8/5/1/ /// /ر/و/ت/ر/ /1/4/0/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/9/1/m/s/×/1/,/ /g/e/t/A/l/l/:/2/3/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/9/3/m/s/×/1/ |
| /procurement/needs | 3976 ms | 2715 ms | /د/س/ت/ر/س/ی/ /9/8/2/ /// /ر/و/ت/ر/ /1/7/3/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/5/2/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/7/m/s/×/1/,/ /g/e/t/A/l/l/:/2/0/6/m/s/×/1/ |
| /procurement/dashboard | 4257 ms | 2715 ms | /د/س/ت/ر/س/ی/ /9/1/6/ /// /ر/و/ت/ر/ /1/7/9/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/9/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/3/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/2/9/m/s/×/1/ |
| /procurement/workspace | 6598 ms | 3348 ms | /د/س/ت/ر/س/ی/ /1/2/4/1/ /// /ر/و/ت/ر/ /2/1/0/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/8/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/3/2/m/s/×/1/,/ /g/e/t/A/l/l/:/4/2/9/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

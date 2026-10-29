# PMS UI and Performance Audit

- Generated: 2026-10-29T21:39:08.025Z
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
| visibleButtonsInventoried | 284 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 397 |
| procurementApiRequestsMeasured | 8 |
| procurementApiFailedRequests | 1 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 1 |
| consoleErrors | 2 |
| pageErrors | 0 |
| safeButtonChecks | 21 |
| failedSafeButtonChecks | 4 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2884 | 5541 | 0 | 4 | 2 | no |
| projects | loaded | 2864 | 5518 | 0 | 10 | 2 | no |
| project-detail | loaded | 3368 | 6022 | 0 | 2 | 0 | no |
| events | loaded | 3867 | 6522 | 0 | 8 | 1 | no |
| workflows | loaded | 3381 | 6036 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2372 | 5027 | 0 | 9 | 1 | no |
| event-types | loaded | 2869 | 5527 | 0 | 43 | 1 | no |
| procurement | loaded | 2875 | 28858 | 0 | 9 | 0 | no |
| attachments | loaded | 2864 | 5519 | 0 | 7 | 2 | no |
| reports | loaded | 3370 | 6028 | 0 | 8 | 12 | no |
| users | loaded | 2853 | 5508 | 0 | 1 | 1 | no |
| departments | loaded | 2856 | 5511 | 0 | 8 | 1 | no |
| roles | loaded | 2893 | 5549 | 0 | 19 | 1 | no |
| permissions | loaded | 3377 | 6032 | 0 | 0 | 1 | no |
| audit | loaded | 2880 | 5535 | 0 | 1 | 1 | no |
| settings | loaded | 2879 | 5533 | 0 | 1 | 3 | no |
| admin | loaded | 1863 | 4529 | 0 | 151 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T21:40:55.983Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5523 ms | 4102 ms | /د/س/ت/ر/س/ی/ /1/3/0/4/ /// /ر/و/ت/ر/ /2/7/9/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/1/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/7/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/1/4/m/s/×/1/ |
| /procurement/orders | 3042 ms | 1958 ms | /د/س/ت/ر/س/ی/ /7/6/6/ /// /ر/و/ت/ر/ /1/1/9/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/8/8/m/s/×/1/,/ /g/e/t/A/l/l/:/1/5/6/m/s/×/1/,/ /g/e/t/A/l/l/:/1/5/5/m/s/×/1/ |
| /procurement/needs | 4426 ms | 3390 ms | /د/س/ت/ر/س/ی/ /1/1/2/4/ /// /ر/و/ت/ر/ /2/2/6/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/5/4/m/s/×/1/,/ /g/e/t/A/l/l/:/4/1/6/m/s/×/1/,/ /g/e/t/A/l/l/:/3/4/1/m/s/×/1/ |
| /procurement/dashboard | 4197 ms | 2328 ms | /د/س/ت/ر/س/ی/ /8/4/7/ /// /ر/و/ت/ر/ /1/4/8/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/1/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/6/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/4/4/m/s/×/1/ |
| /procurement/workspace | 6034 ms | 4095 ms | /د/س/ت/ر/س/ی/ /1/3/8/3/ /// /ر/و/ت/ر/ /2/7/1/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/9/5/m/s/×/1/,/ /g/e/t/A/l/l/:/3/8/3/m/s/×/1/,/ /g/e/t/A/l/l/:/3/0/7/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

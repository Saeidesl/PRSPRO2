# PMS UI and Performance Audit

- Generated: 2026-10-31T17:55:24.317Z
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
| visibleButtonsInventoried | 385 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 317 |
| procurementApiRequestsMeasured | 8 |
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
| dashboard | loaded | 3486 | 6145 | 0 | 4 | 2 | no |
| projects | loaded | 2418 | 5075 | 0 | 1 | 2 | no |
| project-detail | loaded | 2416 | 5072 | 0 | 2 | 0 | no |
| events | loaded | 3914 | 6571 | 0 | 12 | 1 | no |
| workflows | loaded | 3937 | 6593 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2943 | 5599 | 0 | 9 | 1 | no |
| event-types | loaded | 2928 | 5590 | 0 | 69 | 1 | no |
| information-types | loaded | 2905 | 5560 | 0 | 1 | 1 | no |
| procurement | loaded | 2919 | 29419 | 0 | 9 | 0 | no |
| attachments | loaded | 3911 | 6566 | 0 | 1 | 2 | no |
| reports | loaded | 3430 | 6091 | 0 | 8 | 12 | no |
| users | loaded | 2402 | 5059 | 0 | 21 | 1 | no |
| departments | loaded | 3402 | 6059 | 0 | 8 | 1 | no |
| roles | loaded | 3426 | 6081 | 0 | 1 | 1 | no |
| permissions | loaded | 4431 | 7087 | 0 | 0 | 1 | no |
| audit | loaded | 2961 | 5617 | 0 | 1 | 1 | no |
| settings | loaded | 2452 | 5109 | 0 | 1 | 3 | no |
| admin | loaded | 3400 | 6076 | 0 | 236 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T17:57:26.373Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7375 ms | 5751 ms | /د/س/ت/ر/س/ی/ /1/8/6/0/ /// /ر/و/ت/ر/ /3/8/9/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/3/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/2/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/2/4/m/s/×/1/ |
| /procurement/orders | 4480 ms | 3224 ms | /د/س/ت/ر/س/ی/ /8/0/5/ /// /ر/و/ت/ر/ /2/4/1/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/9/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/1/3/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/9/0/m/s/×/1/ |
| /procurement/needs | 4351 ms | 2791 ms | /د/س/ت/ر/س/ی/ /1/5/7/8/ /// /ر/و/ت/ر/ /1/2/1/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/0/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/9/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/2/8/m/s/×/1/ |
| /procurement/dashboard | 3459 ms | 1944 ms | /د/س/ت/ر/س/ی/ /7/2/8/ /// /ر/و/ت/ر/ /1/2/1/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/6/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/2/3/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/1/7/1/m/s/×/2/ |
| /procurement/workspace | 4085 ms | 2989 ms | /د/س/ت/ر/س/ی/ /1/0/1/1/ /// /ر/و/ت/ر/ /1/9/7/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/8/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/2/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/9/9/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

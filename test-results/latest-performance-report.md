# PMS UI and Performance Audit

- Generated: 2026-11-01T06:42:28.143Z
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
| visibleFormsInventoried | 13 |
| dynamicFormsInventoried | 13 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 443 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 344 |
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
| dashboard | loaded | 2464 | 5123 | 0 | 4 | 2 | no |
| projects | loaded | 2908 | 5571 | 0 | 1 | 2 | no |
| project-detail | loaded | 2910 | 5566 | 0 | 2 | 0 | no |
| events | loaded | 3409 | 6067 | 0 | 15 | 1 | no |
| workflows | loaded | 2934 | 5591 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2426 | 5082 | 0 | 9 | 1 | no |
| event-types | loaded | 2415 | 5076 | 0 | 73 | 1 | no |
| information-types | loaded | 2418 | 5076 | 0 | 1 | 1 | no |
| procurement | loaded | 2417 | 25556 | 0 | 9 | 0 | no |
| attachments | loaded | 2900 | 5555 | 0 | 1 | 2 | no |
| reports | loaded | 3441 | 6101 | 0 | 8 | 12 | no |
| users | loaded | 2899 | 5558 | 0 | 21 | 1 | no |
| departments | loaded | 3433 | 6089 | 0 | 8 | 1 | no |
| roles | loaded | 3420 | 5978 | 0 | 19 | 1 | no |
| permissions | loaded | 2923 | 5448 | 0 | 0 | 1 | no |
| audit | loaded | 3417 | 6075 | 0 | 1 | 1 | no |
| settings | loaded | 3509 | 6166 | 0 | 1 | 3 | no |
| admin | loaded | 1896 | 4577 | 0 | 267 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T06:44:16.020Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4593 ms | 3690 ms | /د/س/ت/ر/س/ی/ /9/1/2/ /// /ر/و/ت/ر/ /2/7/7/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/4/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/9/5/m/s/×/1/,/ /g/e/t/A/l/l/:/6/3/5/m/s/×/1/ |
| /procurement/orders | 3414 ms | 2370 ms | /د/س/ت/ر/س/ی/ /9/9/8/ /// /ر/و/ت/ر/ /1/3/7/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/3/0/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/1/4/m/s/×/1/ |
| /procurement/needs | 4606 ms | 3091 ms | /د/س/ت/ر/س/ی/ /1/3/6/0/ /// /ر/و/ت/ر/ /1/7/3/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/8/0/m/s/×/1/,/ /g/e/t/A/l/l/:/4/5/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/9/9/m/s/×/1/ |
| /procurement/dashboard | 3399 ms | 2038 ms | /د/س/ت/ر/س/ی/ /8/7/4/ /// /ر/و/ت/ر/ /1/1/6/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/8/9/m/s/×/1/,/ /g/e/t/A/l/l/:/2/7/7/m/s/×/1/,/ /g/e/t/A/l/l/:/1/4/5/m/s/×/1/ |
| /procurement/workspace | 4422 ms | 2119 ms | /د/س/ت/ر/س/ی/ /7/5/4/ /// /ر/و/ت/ر/ /1/3/6/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/3/0/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/7/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/4/8/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

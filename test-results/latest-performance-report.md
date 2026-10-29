# PMS UI and Performance Audit

- Generated: 2026-10-29T05:42:42.208Z
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
| visibleButtonsInventoried | 240 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 387 |
| procurementApiRequestsMeasured | 10 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 21 |
| failedSafeButtonChecks | 5 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2923 | 5582 | 0 | 4 | 2 | no |
| projects | loaded | 2913 | 5570 | 0 | 1 | 2 | no |
| project-detail | loaded | 2413 | 5068 | 0 | 2 | 0 | no |
| events | loaded | 2911 | 5567 | 0 | 7 | 1 | no |
| workflows | loaded | 3437 | 6092 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3930 | 6585 | 0 | 1 | 1 | no |
| event-types | loaded | 2939 | 5601 | 0 | 43 | 1 | no |
| procurement | loaded | 2900 | 31707 | 0 | 9 | 0 | no |
| attachments | loaded | 2918 | 5574 | 0 | 1 | 2 | no |
| reports | loaded | 3416 | 6075 | 0 | 8 | 12 | no |
| users | loaded | 3398 | 6052 | 0 | 1 | 1 | no |
| departments | loaded | 3925 | 6586 | 0 | 8 | 1 | no |
| roles | loaded | 2419 | 5076 | 0 | 19 | 1 | no |
| permissions | loaded | 4433 | 7089 | 0 | 0 | 1 | no |
| audit | loaded | 3911 | 6566 | 0 | 1 | 1 | no |
| settings | loaded | 2948 | 5603 | 0 | 1 | 3 | no |
| admin | loaded | 1904 | 4573 | 0 | 133 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T05:44:34.928Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7112 ms | 5689 ms | /د/س/ت/ر/س/ی/ /1/7/9/4/ /// /ر/و/ت/ر/ /3/8/9/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/7/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/8/7/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/5/9/m/s/×/1/ |
| /procurement/orders | 5202 ms | 3815 ms | /د/س/ت/ر/س/ی/ /1/3/6/6/ /// /ر/و/ت/ر/ /2/4/4/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/6/7/m/s/×/1/,/ /g/e/t/A/l/l/:/5/4/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/2/3/m/s/×/2/ |
| /procurement/needs | 4730 ms | 3411 ms | /د/س/ت/ر/س/ی/ /1/0/8/1/ /// /ر/و/ت/ر/ /2/3/3/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/5/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/7/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/0/8/m/s/×/1/ |
| /procurement/dashboard | 2979 ms | 2085 ms | /د/س/ت/ر/س/ی/ /8/8/8/ /// /ر/و/ت/ر/ /1/1/9/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/7/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/6/2/m/s/×/1/,/ /g/e/t/A/l/l/:/2/2/7/m/s/×/1/ |
| /procurement/workspace | 6078 ms | 3426 ms | /د/س/ت/ر/س/ی/ /1/4/9/8/ /// /ر/و/ت/ر/ /1/9/2/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/7/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/5/9/m/s/×/1/,/ /g/e/t/A/l/l/:/2/9/5/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

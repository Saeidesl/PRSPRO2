# PMS UI and Performance Audit

- Generated: 2026-11-03T06:20:08.056Z
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
| visibleFormsInventoried | 12 |
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 177 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 314 |
| procurementApiRequestsMeasured | 7 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 12 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3480 | 6142 | 0 | 4 | 2 | no |
| projects | loaded | 3419 | 6075 | 0 | 1 | 2 | no |
| project-detail | loaded | 3410 | 6068 | 0 | 2 | 0 | no |
| print-design | loaded | 4417 | 7078 | 1 | 14 | 5 | no |
| print-output | loaded | 3921 | 6576 | 0 | 1 | 2 | no |
| events | loaded | 3437 | 6092 | 0 | 5 | 1 | no |
| workflows | loaded | 3428 | 6086 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4444 | 7100 | 0 | 9 | 1 | no |
| event-types | loaded | 2947 | 5613 | 0 | 55 | 1 | no |
| information-types | loaded | 3911 | 6570 | 0 | 34 | 1 | no |
| procurement | loaded | 3422 | 39832 | 0 | 9 | 0 | no |
| attachments | loaded | 2903 | 5562 | 0 | 1 | 2 | no |
| reports | loaded | 2449 | 5109 | 0 | 8 | 12 | no |
| users | loaded | 2946 | 5601 | 0 | 1 | 1 | no |
| departments | loaded | 3904 | 6563 | 0 | 8 | 1 | no |
| roles | loaded | 3429 | 6086 | 0 | 19 | 1 | no |
| permissions | loaded | 3928 | 6584 | 0 | 0 | 1 | no |
| audit | loaded | 2931 | 5587 | 0 | 1 | 1 | no |
| settings | loaded | 3933 | 6587 | 0 | 1 | 3 | no |
| admin | loaded | 3913 | 6568 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-03T06:22:36.638Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6738 ms | 5500 ms | /د/س/ت/ر/س/ی/ /1/9/7/0/ /// /ر/و/ت/ر/ /3/5/3/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/0/1/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/3/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/8/6/3/m/s/×/1/ |
| /procurement/orders | 6832 ms | 5083 ms | /د/س/ت/ر/س/ی/ /2/2/2/6/ /// /ر/و/ت/ر/ /2/8/5/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/2/9/m/s/×/1/,/ /g/e/t/A/l/l/:/8/0/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/2/9/m/s/×/1/ |
| /procurement/needs | 3600 ms | 2249 ms | /د/س/ت/ر/س/ی/ /8/9/3/ /// /ر/و/ت/ر/ /1/3/5/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/7/8/m/s/×/1/,/ /g/e/t/A/l/l/:/2/2/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/7/7/m/s/×/1/ |
| /procurement/dashboard | 4170 ms | 2827 ms | /د/س/ت/ر/س/ی/ /9/4/3/ /// /ر/و/ت/ر/ /1/8/8/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/4/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/8/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/1/0/m/s/×/1/ |
| /procurement/workspace | 12377 ms | 7079 ms | /د/س/ت/ر/س/ی/ /4/2/6/8/ /// /ر/و/ت/ر/ /2/8/1/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/2/8/7/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/5/7/m/s/×/1/,/ /g/e/t/A/l/l/:/4/4/9/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

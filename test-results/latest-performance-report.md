# PMS UI and Performance Audit

- Generated: 2026-11-04T20:22:58.013Z
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
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 10 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 188 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 333 |
| procurementApiRequestsMeasured | 6 |
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
| dashboard | loaded | 3482 | 6142 | 0 | 4 | 2 | no |
| projects | loaded | 4499 | 7157 | 0 | 1 | 2 | no |
| project-detail | loaded | 3430 | 6085 | 0 | 2 | 0 | no |
| print-design | loaded | 2408 | 5070 | 1 | 14 | 5 | no |
| print-output | loaded | 4945 | 7600 | 0 | 1 | 2 | no |
| events | loaded | 3414 | 6074 | 0 | 37 | 1 | no |
| workflows | loaded | 4415 | 7070 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4469 | 7125 | 0 | 1 | 1 | no |
| event-types | loaded | 3433 | 6094 | 0 | 55 | 1 | no |
| information-types | loaded | 3413 | 6068 | 0 | 1 | 1 | no |
| procurement | loaded | 3436 | 34157 | 0 | 9 | 0 | no |
| attachments | loaded | 2937 | 5597 | 0 | 1 | 2 | no |
| reports | loaded | 3440 | 6102 | 0 | 8 | 12 | no |
| users | loaded | 7944 | 10603 | 0 | 21 | 1 | no |
| departments | loaded | 3425 | 6081 | 0 | 8 | 1 | no |
| roles | loaded | 2920 | 5577 | 0 | 19 | 1 | no |
| permissions | loaded | 3926 | 6582 | 0 | 0 | 1 | no |
| audit | loaded | 3908 | 6563 | 0 | 1 | 1 | no |
| settings | loaded | 4934 | 7592 | 0 | 1 | 3 | no |
| admin | loaded | 2903 | 5560 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-04T20:25:25.012Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6127 ms | 4931 ms | /د/س/ت/ر/س/ی/ /6/9/2/ /// /ر/و/ت/ر/ /4/2/3/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/2/7/9/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/7/5/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/4/2/m/s/×/1/ |
| /procurement/orders | 5264 ms | 3759 ms | /د/س/ت/ر/س/ی/ /1/0/9/8/ /// /ر/و/ت/ر/ /2/6/6/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/8/9/m/s/×/2/,/ /g/e/t/A/l/l/:/5/8/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/0/9/m/s/×/1/ |
| /procurement/needs | 3799 ms | 2067 ms | /د/س/ت/ر/س/ی/ /8/1/9/ /// /ر/و/ت/ر/ /1/2/4/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/4/9/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/3/9/m/s/×/2/ |
| /procurement/dashboard | 5182 ms | 3904 ms | /د/س/ت/ر/س/ی/ /1/6/1/8/ /// /ر/و/ت/ر/ /2/2/8/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/2/9/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/8/6/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/8/6/6/m/s/×/2/ |
| /procurement/workspace | 5865 ms | 1932 ms | /د/س/ت/ر/س/ی/ /7/8/7/ /// /ر/و/ت/ر/ /1/1/4/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/5/4/m/s/×/1/,/ /g/e/t/A/l/l/:/2/0/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/5/8/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

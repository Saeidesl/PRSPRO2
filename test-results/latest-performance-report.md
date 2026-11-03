# PMS UI and Performance Audit

- Generated: 2026-11-03T09:52:17.060Z
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
| visibleButtonsInventoried | 64 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 245 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 12 |
| failedSafeButtonChecks | 2 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 4495 | 7151 | 0 | 4 | 2 | no |
| projects | loaded | 3421 | 6078 | 0 | 1 | 2 | no |
| project-detail | loaded | 3407 | 6065 | 0 | 2 | 0 | no |
| print-design | loaded | 3412 | 6073 | 1 | 14 | 5 | no |
| print-output | loaded | 3912 | 6571 | 0 | 1 | 2 | no |
| events | loaded | 3914 | 6572 | 0 | 5 | 1 | no |
| workflows | loaded | 4925 | 7582 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2928 | 5585 | 0 | 1 | 1 | no |
| event-types | loaded | 3923 | 6581 | 0 | 1 | 1 | no |
| information-types | loaded | 4412 | 7070 | 0 | 1 | 1 | no |
| procurement | loaded | 3427 | 49695 | 0 | 9 | 0 | no |
| attachments | loaded | 3904 | 6561 | 0 | 1 | 2 | no |
| reports | loaded | 3922 | 6584 | 0 | 8 | 12 | no |
| users | loaded | 5412 | 8068 | 0 | 1 | 1 | no |
| departments | loaded | 5410 | 8069 | 0 | 8 | 1 | no |
| roles | loaded | 3923 | 6581 | 0 | 1 | 1 | no |
| permissions | loaded | 4926 | 7583 | 0 | 0 | 1 | no |
| audit | loaded | 3905 | 6563 | 0 | 1 | 1 | no |
| settings | loaded | 4907 | 7564 | 0 | 1 | 3 | no |
| admin | loaded | 4402 | 7060 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-03T09:55:05.307Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 8247 ms | 6698 ms | /د/س/ت/ر/س/ی/ /1/8/5/8/ /// /ر/و/ت/ر/ /4/8/4/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/0/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/0/9/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/6/5/m/s/×/1/ |
| /procurement/orders | 10476 ms | 8056 ms | /د/س/ت/ر/س/ی/ /2/9/2/9/ /// /ر/و/ت/ر/ /5/1/2/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/4/1/9/m/s/×/1/,/ /g/e/t/A/l/l/:/1/0/5/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/3/7/m/s/×/1/ |
| /procurement/needs | 6101 ms | 4574 ms | /د/س/ت/ر/س/ی/ /1/8/8/6/ /// /ر/و/ت/ر/ /2/6/8/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/7/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/6/5/m/s/×/2/,/ /g/e/t/A/l/l/:/5/2/7/m/s/×/1/ |
| /procurement/dashboard | 5911 ms | 4281 ms | /د/س/ت/ر/س/ی/ /1/5/3/2/ /// /ر/و/ت/ر/ /2/7/4/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/8/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/8/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/7/9/m/s/×/1/ |
| /procurement/workspace | 12666 ms | 5180 ms | /د/س/ت/ر/س/ی/ /2/9/6/6/ /// /ر/و/ت/ر/ /2/2/1/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/2/9/6/m/s/×/1/,/ /g/e/t/A/l/l/:/4/3/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/6/4/m/s/×/2/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

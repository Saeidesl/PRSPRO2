# PMS UI and Performance Audit

- Generated: 2026-11-05T06:17:23.708Z
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
| visibleButtonsInventoried | 176 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 337 |
| procurementApiRequestsMeasured | 8 |
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
| dashboard | loaded | 4494 | 7155 | 0 | 4 | 2 | no |
| projects | loaded | 3437 | 6094 | 0 | 1 | 2 | no |
| project-detail | loaded | 2926 | 5582 | 0 | 2 | 0 | no |
| print-design | loaded | 4430 | 7090 | 1 | 14 | 5 | no |
| print-output | loaded | 3929 | 6584 | 0 | 1 | 2 | no |
| events | loaded | 3424 | 6084 | 0 | 37 | 1 | no |
| workflows | loaded | 2918 | 5574 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3948 | 6605 | 0 | 9 | 1 | no |
| event-types | loaded | 4000 | 6663 | 0 | 55 | 1 | no |
| information-types | loaded | 2410 | 5068 | 0 | 1 | 1 | no |
| procurement | loaded | 2932 | 33568 | 0 | 9 | 0 | no |
| attachments | loaded | 3913 | 6571 | 0 | 1 | 2 | no |
| reports | loaded | 3468 | 6129 | 0 | 8 | 12 | no |
| users | loaded | 3441 | 6099 | 0 | 1 | 1 | no |
| departments | loaded | 3928 | 6583 | 0 | 8 | 1 | no |
| roles | loaded | 2932 | 5589 | 0 | 19 | 1 | no |
| permissions | loaded | 3434 | 6090 | 0 | 0 | 1 | no |
| audit | loaded | 3412 | 6071 | 0 | 1 | 1 | no |
| settings | loaded | 4023 | 6682 | 0 | 1 | 3 | no |
| admin | loaded | 3418 | 6075 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-05T06:19:47.015Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4568 ms | 3514 ms | /د/س/ت/ر/س/ی/ /9/6/4/ /// /ر/و/ت/ر/ /2/5/5/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/3/9/1/m/s/×/1/,/ /g/e/t/A/l/l/:/3/7/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/4/1/m/s/×/1/ |
| /procurement/orders | 4451 ms | 2801 ms | /د/س/ت/ر/س/ی/ /1/0/9/0/ /// /ر/و/ت/ر/ /1/7/1/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/8/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/5/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/2/9/m/s/×/1/ |
| /procurement/needs | 4249 ms | 2696 ms | /د/س/ت/ر/س/ی/ /9/5/7/ /// /ر/و/ت/ر/ /1/7/3/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/5/2/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/1/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/0/m/s/×/1/ |
| /procurement/dashboard | 5940 ms | 3613 ms | /د/س/ت/ر/س/ی/ /1/6/6/3/ /// /ر/و/ت/ر/ /1/9/4/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/7/3/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/4/5/2/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/4/2/4/m/s/×/1/ |
| /procurement/workspace | 7445 ms | 3599 ms | /د/س/ت/ر/س/ی/ /8/6/8/ /// /ر/و/ت/ر/ /2/7/3/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/3/3/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/8/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/2/8/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

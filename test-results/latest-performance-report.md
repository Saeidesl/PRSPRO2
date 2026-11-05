# PMS UI and Performance Audit

- Generated: 2026-11-05T06:00:46.432Z
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
| visibleButtonsInventoried | 676 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 333 |
| procurementApiRequestsMeasured | 9 |
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
| dashboard | loaded | 3495 | 6173 | 0 | 44 | 2 | no |
| projects | loaded | 4454 | 7110 | 0 | 1 | 2 | no |
| project-detail | loaded | 3931 | 6590 | 0 | 2 | 0 | no |
| print-design | loaded | 4939 | 7602 | 1 | 14 | 5 | no |
| print-output | loaded | 2955 | 5612 | 0 | 1 | 2 | no |
| events | loaded | 2940 | 5602 | 0 | 37 | 1 | no |
| workflows | loaded | 2427 | 5088 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4456 | 7114 | 0 | 1 | 1 | no |
| event-types | loaded | 2936 | 5604 | 0 | 55 | 1 | no |
| information-types | loaded | 2957 | 5618 | 0 | 34 | 1 | no |
| procurement | loaded | 2943 | 34567 | 0 | 9 | 0 | no |
| attachments | loaded | 2917 | 5576 | 0 | 1 | 2 | no |
| reports | loaded | 2940 | 5603 | 0 | 8 | 12 | no |
| users | loaded | 2919 | 5578 | 0 | 1 | 1 | no |
| departments | loaded | 2973 | 5631 | 0 | 8 | 1 | no |
| roles | loaded | 2934 | 5591 | 0 | 19 | 1 | no |
| permissions | loaded | 2929 | 5586 | 0 | 0 | 1 | no |
| audit | loaded | 3463 | 6121 | 0 | 1 | 1 | no |
| settings | loaded | 6452 | 9112 | 0 | 1 | 3 | no |
| admin | loaded | 4452 | 7158 | 0 | 438 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-05T06:03:08.776Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4514 ms | 3413 ms | /د/س/ت/ر/س/ی/ /1/1/7/7/ /// /ر/و/ت/ر/ /2/2/3/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/7/4/m/s/×/1/,/ /g/e/t/A/l/l/:/3/5/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/7/9/m/s/×/2/ |
| /procurement/orders | 6255 ms | 4694 ms | /د/س/ت/ر/س/ی/ /1/8/0/1/ /// /ر/و/ت/ر/ /2/8/9/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/2/4/m/s/×/1/,/ /g/e/t/A/l/l/:/5/2/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/9/7/m/s/×/1/ |
| /procurement/needs | 6330 ms | 4474 ms | /د/س/ت/ر/س/ی/ /1/6/9/1/ /// /ر/و/ت/ر/ /2/7/8/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/8/1/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/5/6/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/7/0/m/s/×/2/ |
| /procurement/dashboard | 4178 ms | 2508 ms | /د/س/ت/ر/س/ی/ /9/9/8/ /// /ر/و/ت/ر/ /1/5/1/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/2/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/8/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/6/1/m/s/×/1/ |
| /procurement/workspace | 6358 ms | 2929 ms | /د/س/ت/ر/س/ی/ /7/8/0/ /// /ر/و/ت/ر/ /2/1/4/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/9/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/4/9/m/s/×/1/,/ /g/e/t/A/l/l/:/4/4/6/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

# PMS UI and Performance Audit

- Generated: 2026-11-04T19:24:58.293Z
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
| visibleFormsInventoried | 9 |
| dynamicFormsInventoried | 8 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 168 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 239 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 12 |
| failedSafeButtonChecks | 6 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2421 | 5077 | 0 | 4 | 2 | no |
| projects | loaded | 4895 | 7552 | 0 | 1 | 2 | no |
| project-detail | loaded | 3887 | 6544 | 0 | 2 | 0 | no |
| print-design | loaded | 3389 | 6048 | 1 | 14 | 5 | no |
| print-output | loaded | 3378 | 6034 | 0 | 1 | 2 | no |
| events | loaded | 3402 | 6062 | 0 | 37 | 1 | no |
| workflows | loaded | 3378 | 6035 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4376 | 7033 | 0 | 1 | 1 | no |
| event-types | loaded | 3393 | 6055 | 0 | 55 | 1 | no |
| information-types | loaded | 3381 | 6039 | 0 | 1 | 1 | no |
| procurement | loaded | 3377 | 37953 | 0 | 9 | 0 | no |
| attachments | loaded | 3376 | 6033 | 0 | 1 | 2 | no |
| reports | loaded | 2910 | 5571 | 0 | 8 | 12 | no |
| users | loaded | 3380 | 6034 | 0 | 1 | 1 | no |
| departments | loaded | 3399 | 6054 | 0 | 8 | 1 | no |
| roles | loaded | 3377 | 6034 | 0 | 19 | 1 | no |
| permissions | loaded | 3896 | 6550 | 0 | 0 | 1 | no |
| audit | loaded | 3878 | 6534 | 0 | 1 | 1 | no |
| settings | loaded | 3878 | 6532 | 0 | 1 | 3 | no |
| admin | loaded | 3405 | 6062 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-04T19:27:36.839Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7129 ms | 5202 ms | /د/س/ت/ر/س/ی/ /1/9/5/4/ /// /ر/و/ت/ر/ /3/2/4/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/5/7/m/s/×/1/,/ /g/e/t/A/l/l/:/5/1/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/4/8/m/s/×/1/ |
| /procurement/orders | 6911 ms | 5287 ms | /د/س/ت/ر/س/ی/ /2/1/7/2/ /// /ر/و/ت/ر/ /3/1/1/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/8/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/4/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/8/6/m/s/×/1/ |
| /procurement/needs | 5069 ms | 3762 ms | /د/س/ت/ر/س/ی/ /1/0/9/1/ /// /ر/و/ت/ر/ /2/6/7/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/9/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/4/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/8/5/m/s/×/1/ |
| /procurement/dashboard | 6888 ms | 5032 ms | /د/س/ت/ر/س/ی/ /2/0/1/0/ /// /ر/و/ت/ر/ /3/0/2/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/2/4/5/m/s/×/1/,/ /g/e/t/A/l/l/:/1/0/6/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/7/9/m/s/×/1/ |
| /procurement/workspace | 5874 ms | 3236 ms | /د/س/ت/ر/س/ی/ /1/0/0/2/ /// /ر/و/ت/ر/ /2/2/3/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/6/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/2/1/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/1/9/8/m/s/×/2/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

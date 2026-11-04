# PMS UI and Performance Audit

- Generated: 2026-11-04T18:18:29.686Z
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
| visibleButtonsInventoried | 145 |
| visibleInputsAndControlsInventoried | 39 |
| networkRequestsMeasured | 267 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 11 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 4435 | 7095 | 0 | 4 | 2 | no |
| projects | loaded | 8083 | 10739 | 0 | 0 | 0 | no |
| project-detail | loaded | 6901 | 9557 | 0 | 2 | 0 | no |
| print-design | loaded | 2377 | 5036 | 1 | 14 | 5 | no |
| print-output | loaded | 3891 | 6547 | 0 | 1 | 2 | no |
| events | loaded | 3390 | 6049 | 0 | 34 | 1 | no |
| workflows | loaded | 3904 | 6561 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2916 | 5574 | 0 | 1 | 1 | no |
| event-types | loaded | 2902 | 5559 | 0 | 1 | 1 | no |
| information-types | loaded | 4382 | 7040 | 0 | 34 | 1 | no |
| procurement | loaded | 5411 | 39859 | 0 | 9 | 0 | no |
| attachments | loaded | 5405 | 8062 | 0 | 1 | 2 | no |
| reports | loaded | 4426 | 7086 | 0 | 8 | 12 | no |
| users | loaded | 4385 | 7043 | 0 | 21 | 1 | no |
| departments | loaded | 3877 | 6535 | 0 | 8 | 1 | no |
| roles | loaded | 4391 | 7049 | 0 | 1 | 1 | no |
| permissions | loaded | 3903 | 6560 | 0 | 0 | 1 | no |
| audit | loaded | 4887 | 7543 | 0 | 1 | 1 | no |
| settings | loaded | 3383 | 6040 | 0 | 1 | 3 | no |
| admin | loaded | 3883 | 6536 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-04T18:21:09.625Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7906 ms | 6514 ms | /د/س/ت/ر/س/ی/ /2/1/0/0/ /// /ر/و/ت/ر/ /4/4/1/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/4/2/m/s/×/1/,/ /g/e/t/A/l/l/:/8/3/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/4/5/m/s/×/1/ |
| /procurement/orders | 4415 ms | 3310 ms | /د/س/ت/ر/س/ی/ /1/8/2/7/ /// /ر/و/ت/ر/ /1/4/8/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/5/4/m/s/×/1/,/ /g/e/t/A/l/l/:/6/0/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/3/3/m/s/×/1/ |
| /procurement/needs | 4755 ms | 3330 ms | /د/س/ت/ر/س/ی/ /7/6/0/ /// /ر/و/ت/ر/ /2/5/6/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/6/8/m/s/×/2/,/ /g/e/t/A/l/l/:/5/1/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/7/1/m/s/×/1/ |
| /procurement/dashboard | 5144 ms | 3465 ms | /د/س/ت/ر/س/ی/ /1/1/8/7/ /// /ر/و/ت/ر/ /2/2/7/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/2/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/6/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/4/8/m/s/×/1/ |
| /procurement/workspace | 8251 ms | 5402 ms | /د/س/ت/ر/س/ی/ /1/5/9/9/ /// /ر/و/ت/ر/ /3/8/0/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/5/3/3/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/1/3/9/3/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/5/5/4/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

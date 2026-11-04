# PMS UI and Performance Audit

- Generated: 2026-11-04T18:30:22.421Z
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
| visibleButtonsInventoried | 78 |
| visibleInputsAndControlsInventoried | 36 |
| networkRequestsMeasured | 178 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 9 |
| failedSafeButtonChecks | 4 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3480 | 6141 | 0 | 4 | 2 | no |
| projects | loaded | 4930 | 7589 | 0 | 1 | 2 | no |
| project-detail | loaded | 3924 | 6582 | 0 | 2 | 0 | no |
| print-design | loaded | 2914 | 5573 | 1 | 14 | 5 | no |
| print-output | loaded | 8109 | 10766 | 0 | 0 | 0 | no |
| events | loaded | 3443 | 6103 | 0 | 5 | 1 | no |
| workflows | loaded | 4406 | 7061 | 0 | 1 | 2 | no |
| project-statuses | loaded | 8117 | 10773 | 0 | 0 | 0 | no |
| event-types | loaded | 5440 | 8096 | 0 | 1 | 1 | no |
| information-types | loaded | 8116 | 10773 | 0 | 0 | 0 | no |
| procurement | loaded | 3429 | 40415 | 0 | 9 | 0 | no |
| attachments | loaded | 3912 | 6570 | 0 | 1 | 2 | no |
| reports | loaded | 2928 | 5590 | 0 | 8 | 12 | no |
| users | loaded | 8097 | 10753 | 0 | 0 | 0 | no |
| departments | loaded | 3964 | 6621 | 0 | 8 | 1 | no |
| roles | loaded | 3924 | 6584 | 0 | 19 | 1 | no |
| permissions | loaded | 4408 | 7063 | 0 | 0 | 1 | no |
| audit | loaded | 3923 | 6581 | 0 | 1 | 1 | no |
| settings | loaded | 3913 | 6570 | 0 | 1 | 3 | no |
| admin | loaded | 5414 | 8072 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-04T18:33:18.722Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7934 ms | 5331 ms | /د/س/ت/ر/س/ی/ /1/9/7/2/ /// /ر/و/ت/ر/ /3/3/5/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/6/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/5/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/5/4/m/s/×/1/ |
| /procurement/orders | 7032 ms | 5578 ms | /د/س/ت/ر/س/ی/ /1/9/4/1/ /// /ر/و/ت/ر/ /3/6/3/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/1/0/1/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/1/0/7/8/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/8/2/7/m/s/×/2/ |
| /procurement/needs | 4105 ms | 2374 ms | /د/س/ت/ر/س/ی/ /8/2/9/ /// /ر/و/ت/ر/ /1/5/4/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/3/6/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/2/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/7/9/m/s/×/2/ |
| /procurement/dashboard | 6250 ms | 4664 ms | /د/س/ت/ر/س/ی/ /1/5/6/1/ /// /ر/و/ت/ر/ /3/1/0/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/8/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/3/8/m/s/×/1/,/ /g/e/t/A/l/l/:/3/8/8/m/s/×/1/ |
| /procurement/workspace | 7681 ms | 3363 ms | /د/س/ت/ر/س/ی/ /8/9/5/ /// /ر/و/ت/ر/ /2/4/6/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/4/2/m/s/×/1/,/ /g/e/t/A/l/l/:/6/0/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/7/4/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

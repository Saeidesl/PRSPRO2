# PMS UI and Performance Audit

- Generated: 2026-11-05T17:02:20.933Z
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
| visibleButtonsInventoried | 89 |
| visibleInputsAndControlsInventoried | 44 |
| networkRequestsMeasured | 264 |
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
| dashboard | loaded | 3454 | 6114 | 0 | 4 | 2 | no |
| projects | loaded | 4399 | 7054 | 0 | 1 | 2 | no |
| project-detail | loaded | 3894 | 6551 | 0 | 2 | 0 | no |
| print-design | loaded | 3889 | 6549 | 1 | 17 | 8 | no |
| print-output | loaded | 3389 | 6045 | 0 | 1 | 2 | no |
| events | loaded | 4411 | 7068 | 0 | 7 | 1 | no |
| workflows | loaded | 3889 | 6545 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4402 | 7059 | 0 | 1 | 1 | no |
| event-types | loaded | 3416 | 6072 | 0 | 1 | 1 | no |
| information-types | loaded | 5395 | 8049 | 0 | 1 | 1 | no |
| procurement | loaded | 4423 | 42879 | 0 | 9 | 0 | no |
| attachments | loaded | 3882 | 6538 | 0 | 1 | 2 | no |
| reports | loaded | 2911 | 5571 | 0 | 8 | 12 | no |
| users | loaded | 4385 | 7043 | 0 | 21 | 1 | no |
| departments | loaded | 3879 | 6537 | 0 | 8 | 1 | no |
| roles | loaded | 4398 | 7055 | 0 | 1 | 1 | no |
| permissions | loaded | 3902 | 6559 | 0 | 0 | 1 | no |
| audit | loaded | 4895 | 7552 | 0 | 1 | 1 | no |
| settings | loaded | 4385 | 7041 | 0 | 1 | 3 | no |
| admin | loaded | 4912 | 7570 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-05T17:05:07.083Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6379 ms | 4855 ms | /د/س/ت/ر/س/ی/ /1/5/1/9/ /// /ر/و/ت/ر/ /3/3/3/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/3/7/m/s/×/1/,/ /g/e/t/A/l/l/:/4/2/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/4/7/m/s/×/1/ |
| /procurement/orders | 6627 ms | 4211 ms | /د/س/ت/ر/س/ی/ /2/0/2/6/ /// /ر/و/ت/ر/ /2/1/8/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/3/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/0/4/m/s/×/1/,/ /g/e/t/A/l/l/:/5/6/3/m/s/×/1/ |
| /procurement/needs | 7325 ms | 5515 ms | /د/س/ت/ر/س/ی/ /2/0/0/6/ /// /ر/و/ت/ر/ /3/5/0/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/6/0/m/s/×/1/,/ /g/e/t/A/l/l/:/5/6/0/m/s/×/1/,/ /g/e/t/A/l/l/:/5/2/7/m/s/×/1/ |
| /procurement/dashboard | 5118 ms | 3670 ms | /د/س/ت/ر/س/ی/ /1/1/6/4/ /// /ر/و/ت/ر/ /2/5/0/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/1/2/m/s/×/1/,/ /g/e/t/A/l/l/:/2/5/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/5/1/m/s/×/2/ |
| /procurement/workspace | 7024 ms | 5423 ms | /د/س/ت/ر/س/ی/ /2/2/4/6/ /// /ر/و/ت/ر/ /3/1/7/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/9/9/m/s/×/1/,/ /g/e/t/A/l/l/:/6/2/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/8/7/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

# PMS UI and Performance Audit

- Generated: 2026-11-03T05:24:50.779Z
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
| visibleButtonsInventoried | 165 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 316 |
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
| dashboard | loaded | 5008 | 7670 | 0 | 24 | 2 | no |
| projects | loaded | 3440 | 6097 | 0 | 1 | 2 | no |
| project-detail | loaded | 2914 | 5571 | 0 | 2 | 0 | no |
| print-design | loaded | 2909 | 5569 | 1 | 14 | 5 | no |
| print-output | loaded | 3930 | 6588 | 0 | 1 | 2 | no |
| events | loaded | 3418 | 6073 | 0 | 5 | 1 | no |
| workflows | loaded | 2472 | 5128 | 0 | 3 | 2 | no |
| project-statuses | loaded | 3413 | 6070 | 0 | 9 | 1 | no |
| event-types | loaded | 3433 | 6095 | 0 | 55 | 1 | no |
| information-types | loaded | 3914 | 6572 | 0 | 1 | 1 | no |
| procurement | loaded | 2422 | 40075 | 0 | 9 | 0 | no |
| attachments | loaded | 3925 | 6583 | 0 | 18 | 2 | no |
| reports | loaded | 3497 | 6160 | 0 | 8 | 12 | no |
| users | loaded | 3444 | 6101 | 0 | 1 | 1 | no |
| departments | loaded | 2910 | 5566 | 0 | 8 | 1 | no |
| roles | loaded | 3935 | 6590 | 0 | 1 | 1 | no |
| permissions | loaded | 2929 | 5584 | 0 | 0 | 1 | no |
| audit | loaded | 2924 | 5579 | 0 | 1 | 1 | no |
| settings | loaded | 2907 | 5564 | 0 | 1 | 3 | no |
| admin | loaded | 3912 | 6567 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-03T05:27:23.545Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 8375 ms | 6656 ms | /د/س/ت/ر/س/ی/ /1/9/4/8/ /// /ر/و/ت/ر/ /4/7/0/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/5/4/m/s/×/1/,/ /g/e/t/A/l/l/:/6/5/5/m/s/×/1/,/ /g/e/t/A/l/l/:/6/2/9/m/s/×/1/ |
| /procurement/orders | 5292 ms | 3876 ms | /د/س/ت/ر/س/ی/ /1/6/3/7/ /// /ر/و/ت/ر/ /2/2/3/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/2/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/9/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/4/0/m/s/×/1/ |
| /procurement/needs | 5684 ms | 4578 ms | /د/س/ت/ر/س/ی/ /1/5/4/3/ /// /ر/و/ت/ر/ /3/0/3/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/3/5/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/9/0/3/m/s/×/1/,/ /g/e/t/A/l/l/:/5/8/3/m/s/×/1/ |
| /procurement/dashboard | 3858 ms | 2694 ms | /د/س/ت/ر/س/ی/ /8/8/8/ /// /ر/و/ت/ر/ /1/8/0/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/7/0/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/5/0/8/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/3/4/8/m/s/×/1/ |
| /procurement/workspace | 9455 ms | 3544 ms | /د/س/ت/ر/س/ی/ /1/1/4/7/ /// /ر/و/ت/ر/ /2/3/9/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/4/0/m/s/×/1/,/ /g/e/t/A/l/l/:/4/0/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/0/9/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

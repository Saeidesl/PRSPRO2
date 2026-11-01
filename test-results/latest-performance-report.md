# PMS UI and Performance Audit

- Generated: 2026-11-01T17:43:36.847Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **needs-attention**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 18 |
| loadedRoutes | 18 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 489 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 301 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 10 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2902 | 5560 | 0 | 4 | 2 | no |
| projects | loaded | 3375 | 6032 | 0 | 1 | 2 | no |
| project-detail | loaded | 3379 | 6036 | 0 | 2 | 0 | no |
| events | loaded | 3875 | 6534 | 0 | 15 | 1 | no |
| workflows | loaded | 3393 | 6047 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3392 | 6047 | 0 | 1 | 1 | no |
| event-types | loaded | 2906 | 5587 | 0 | 73 | 1 | no |
| information-types | loaded | 3370 | 6028 | 0 | 34 | 1 | no |
| procurement | loaded | 4387 | 40039 | 0 | 9 | 0 | no |
| attachments | loaded | 3876 | 6533 | 0 | 1 | 2 | no |
| reports | loaded | 2887 | 5546 | 0 | 8 | 12 | no |
| users | loaded | 3394 | 6048 | 0 | 1 | 1 | no |
| departments | loaded | 2873 | 5529 | 0 | 8 | 1 | no |
| roles | loaded | 3390 | 6052 | 0 | 19 | 1 | no |
| permissions | loaded | 3426 | 6084 | 0 | 0 | 1 | no |
| audit | loaded | 3395 | 6050 | 0 | 1 | 1 | no |
| settings | loaded | 3370 | 6025 | 0 | 1 | 3 | no |
| admin | loaded | 4380 | 7120 | 0 | 310 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T17:45:52.130Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7495 ms | 5619 ms | /د/س/ت/ر/س/ی/ /1/6/1/7/ /// /ر/و/ت/ر/ /4/0/0/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/3/8/m/s/×/1/,/ /g/e/t/A/l/l/:/6/3/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/9/7/m/s/×/1/ |
| /procurement/orders | 6605 ms | 4925 ms | /د/س/ت/ر/س/ی/ /1/5/2/4/ /// /ر/و/ت/ر/ /3/4/0/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/0/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/7/4/m/s/×/2/,/ /g/e/t/A/l/l/:/5/5/1/m/s/×/1/ |
| /procurement/needs | 4580 ms | 3447 ms | /د/س/ت/ر/س/ی/ /1/4/1/0/ /// /ر/و/ت/ر/ /2/0/3/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/3/2/m/s/×/1/,/ /g/e/t/A/l/l/:/3/4/9/m/s/×/1/,/ /g/e/t/A/l/l/:/3/4/1/m/s/×/1/ |
| /procurement/dashboard | 4594 ms | 3200 ms | /د/س/ت/ر/س/ی/ /1/2/1/7/ /// /ر/و/ت/ر/ /1/9/8/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/4/5/m/s/×/1/,/ /g/e/t/A/l/l/:/2/5/0/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/8/m/s/×/1/ |
| /procurement/workspace | 9684 ms | 3089 ms | /د/س/ت/ر/س/ی/ /1/3/5/7/ /// /ر/و/ت/ر/ /1/7/3/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/2/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/5/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/9/8/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

# PMS UI and Performance Audit

- Generated: 2026-11-03T18:39:48.605Z
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
| visibleButtonsInventoried | 112 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 290 |
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
| dashboard | loaded | 3935 | 6594 | 0 | 4 | 2 | no |
| projects | loaded | 4433 | 7091 | 0 | 31 | 2 | no |
| project-detail | loaded | 4936 | 7594 | 0 | 2 | 0 | no |
| print-design | loaded | 3926 | 6586 | 1 | 14 | 5 | no |
| print-output | loaded | 3913 | 6570 | 0 | 1 | 2 | no |
| events | loaded | 3921 | 6580 | 0 | 15 | 1 | no |
| workflows | loaded | 4939 | 7596 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2422 | 5078 | 0 | 9 | 1 | no |
| event-types | loaded | 2931 | 5588 | 0 | 1 | 1 | no |
| information-types | loaded | 2404 | 5062 | 0 | 1 | 1 | no |
| procurement | loaded | 3934 | 41665 | 0 | 9 | 0 | no |
| attachments | loaded | 4445 | 7103 | 0 | 1 | 2 | no |
| reports | loaded | 4443 | 7107 | 0 | 8 | 12 | no |
| users | loaded | 2903 | 5560 | 0 | 1 | 1 | no |
| departments | loaded | 3403 | 6062 | 0 | 8 | 1 | no |
| roles | loaded | 4429 | 7087 | 0 | 1 | 1 | no |
| permissions | loaded | 4429 | 7083 | 0 | 0 | 1 | no |
| audit | loaded | 2947 | 5605 | 0 | 1 | 1 | no |
| settings | loaded | 4412 | 7067 | 0 | 1 | 3 | no |
| admin | loaded | 3912 | 6568 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-03T18:42:20.420Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6551 ms | 4645 ms | /د/س/ت/ر/س/ی/ /1/8/5/5/ /// /ر/و/ت/ر/ /2/7/9/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/8/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/1/0/m/s/×/1/,/ /g/e/t/A/l/l/:/4/3/9/m/s/×/1/ |
| /procurement/orders | 5603 ms | 4290 ms | /د/س/ت/ر/س/ی/ /1/2/9/2/ /// /ر/و/ت/ر/ /2/9/9/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/6/4/m/s/×/1/,/ /g/e/t/A/l/l/:/5/5/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/3/m/s/×/1/ |
| /procurement/needs | 5642 ms | 3725 ms | /د/س/ت/ر/س/ی/ /1/2/6/6/ /// /ر/و/ت/ر/ /2/4/5/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/0/3/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/4/7/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/9/0/m/s/×/2/ |
| /procurement/dashboard | 6702 ms | 4917 ms | /د/س/ت/ر/س/ی/ /2/3/9/3/ /// /ر/و/ت/ر/ /2/5/2/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/0/7/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/7/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/2/m/s/×/1/ |
| /procurement/workspace | 8759 ms | 5022 ms | /د/س/ت/ر/س/ی/ /1/6/4/7/ /// /ر/و/ت/ر/ /3/3/7/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/3/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/0/6/m/s/×/1/,/ /g/e/t/A/l/l/:/5/3/4/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

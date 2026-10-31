# PMS UI and Performance Audit

- Generated: 2026-10-31T11:52:18.973Z
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
| visibleFormsInventoried | 12 |
| dynamicFormsInventoried | 12 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 380 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 297 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 1 |
| consoleErrors | 2 |
| pageErrors | 0 |
| safeButtonChecks | 10 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2930 | 5588 | 0 | 12 | 2 | no |
| projects | loaded | 2889 | 5547 | 0 | 13 | 2 | no |
| project-detail | loaded | 3380 | 6036 | 0 | 2 | 0 | no |
| events | loaded | 2878 | 5533 | 0 | 9 | 1 | no |
| workflows | loaded | 3406 | 6061 | 0 | 3 | 2 | no |
| project-statuses | loaded | 4898 | 7555 | 0 | 1 | 1 | no |
| event-types | loaded | 3887 | 6548 | 0 | 65 | 1 | no |
| information-types | loaded | 3396 | 6052 | 0 | 13 | 1 | no |
| procurement | loaded | 3390 | 35849 | 0 | 9 | 0 | no |
| attachments | loaded | 2870 | 5527 | 0 | 1 | 2 | no |
| reports | loaded | 3399 | 6057 | 0 | 8 | 12 | no |
| users | loaded | 2876 | 5530 | 0 | 1 | 1 | no |
| departments | loaded | 3396 | 6064 | 0 | 8 | 1 | no |
| roles | loaded | 3395 | 6052 | 0 | 19 | 1 | no |
| permissions | loaded | 2394 | 5052 | 0 | 0 | 1 | no |
| audit | loaded | 2897 | 5576 | 0 | 1 | 1 | no |
| settings | loaded | 2395 | 5048 | 0 | 1 | 3 | no |
| admin | loaded | 5385 | 8059 | 0 | 214 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T11:54:28.217Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6365 ms | 5400 ms | /د/س/ت/ر/س/ی/ /1/6/7/7/ /// /ر/و/ت/ر/ /3/7/2/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/4/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/8/6/m/s/×/1/,/ /g/e/t/A/l/l/:/4/9/5/m/s/×/1/ |
| /procurement/orders | 4570 ms | 3224 ms | /د/س/ت/ر/س/ی/ /1/1/0/3/ /// /ر/و/ت/ر/ /2/1/2/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/6/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/1/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/4/4/m/s/×/2/ |
| /procurement/needs | 4740 ms | 3370 ms | /د/س/ت/ر/س/ی/ /1/4/1/0/ /// /ر/و/ت/ر/ /1/9/5/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/6/4/m/s/×/1/,/ /g/e/t/A/l/l/:/3/5/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/1/6/m/s/×/1/ |
| /procurement/dashboard | 5040 ms | 4017 ms | /د/س/ت/ر/س/ی/ /1/7/9/5/ /// /ر/و/ت/ر/ /2/2/2/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/1/2/m/s/×/1/,/ /g/e/t/A/l/l/:/5/4/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/5/3/m/s/×/1/ |
| /procurement/workspace | 6754 ms | 4514 ms | /د/س/ت/ر/س/ی/ /1/5/6/7/ /// /ر/و/ت/ر/ /2/9/4/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/8/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/3/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/2/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

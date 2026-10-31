# PMS UI and Performance Audit

- Generated: 2026-10-31T06:52:52.693Z
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
| visibleButtonsInventoried | 67 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 250 |
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
| dashboard | loaded | 3985 | 6646 | 0 | 4 | 2 | no |
| projects | loaded | 3933 | 6592 | 0 | 1 | 2 | no |
| project-detail | loaded | 4918 | 7578 | 0 | 2 | 0 | no |
| events | loaded | 4423 | 7081 | 0 | 5 | 1 | no |
| workflows | loaded | 4453 | 7111 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4469 | 7127 | 0 | 1 | 1 | no |
| event-types | loaded | 5943 | 8599 | 0 | 1 | 1 | no |
| information-types | loaded | 4920 | 7578 | 0 | 1 | 1 | no |
| procurement | loaded | 4954 | 63730 | 0 | 9 | 0 | no |
| attachments | loaded | 4420 | 7076 | 0 | 1 | 2 | no |
| reports | loaded | 4439 | 7104 | 0 | 8 | 12 | no |
| users | loaded | 3457 | 6114 | 0 | 1 | 1 | no |
| departments | loaded | 2907 | 5563 | 0 | 8 | 1 | no |
| roles | loaded | 3461 | 6121 | 0 | 19 | 1 | no |
| permissions | loaded | 5450 | 8107 | 0 | 0 | 1 | no |
| audit | loaded | 3410 | 6066 | 0 | 1 | 1 | no |
| settings | loaded | 4922 | 7580 | 0 | 1 | 3 | no |
| admin | loaded | 2933 | 5592 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T06:55:49.384Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 8190 ms | 6853 ms | /د/س/ت/ر/س/ی/ /2/3/9/8/ /// /ر/و/ت/ر/ /4/4/5/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/5/3/m/s/×/1/,/ /g/e/t/A/l/l/:/5/8/5/m/s/×/1/,/ /g/e/t/A/l/l/:/5/8/5/m/s/×/1/ |
| /procurement/orders | 7681 ms | 6078 ms | /د/س/ت/ر/س/ی/ /2/4/4/5/ /// /ر/و/ت/ر/ /3/6/3/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/8/1/m/s/×/1/,/ /g/e/t/A/l/l/:/7/3/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/0/3/m/s/×/1/ |
| /procurement/needs | 8536 ms | 7322 ms | /د/س/ت/ر/س/ی/ /2/9/1/2/ /// /ر/و/ت/ر/ /4/4/1/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/4/6/0/m/s/×/1/,/ /g/e/t/A/l/l/:/9/8/2/m/s/×/1/,/ /g/e/t/A/l/l/:/8/2/6/m/s/×/1/ |
| /procurement/dashboard | 9960 ms | 8652 ms | /د/س/ت/ر/س/ی/ /2/9/5/2/ /// /ر/و/ت/ر/ /5/7/0/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/0/6/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/0/6/1/m/s/×/2/,/ /g/e/t/A/l/l/:/1/0/4/3/m/s/×/1/ |
| /procurement/workspace | 18422 ms | 8276 ms | /د/س/ت/ر/س/ی/ /2/3/9/5/ /// /ر/و/ت/ر/ /5/8/8/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/8/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/8/1/7/m/s/×/1/,/ /g/e/t/A/l/l/:/7/9/1/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

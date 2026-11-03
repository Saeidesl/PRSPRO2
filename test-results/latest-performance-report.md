# PMS UI and Performance Audit

- Generated: 2026-11-03T15:40:00.909Z
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
| visibleButtonsInventoried | 64 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 261 |
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
| dashboard | loaded | 4993 | 7653 | 0 | 4 | 2 | no |
| projects | loaded | 4918 | 7574 | 0 | 1 | 2 | no |
| project-detail | loaded | 4928 | 7586 | 0 | 2 | 0 | no |
| print-design | loaded | 5419 | 8081 | 1 | 14 | 5 | no |
| print-output | loaded | 3918 | 6575 | 0 | 1 | 2 | no |
| events | loaded | 4432 | 7091 | 0 | 5 | 1 | no |
| workflows | loaded | 5439 | 8096 | 0 | 1 | 2 | no |
| project-statuses | loaded | 5944 | 8598 | 0 | 1 | 1 | no |
| event-types | loaded | 3433 | 6089 | 0 | 1 | 1 | no |
| information-types | loaded | 3414 | 6071 | 0 | 1 | 1 | no |
| procurement | loaded | 3451 | 39478 | 0 | 9 | 0 | no |
| attachments | loaded | 4411 | 7068 | 0 | 1 | 2 | no |
| reports | loaded | 5938 | 8599 | 0 | 8 | 12 | no |
| users | loaded | 4910 | 7567 | 0 | 1 | 1 | no |
| departments | loaded | 2897 | 5553 | 0 | 8 | 1 | no |
| roles | loaded | 3421 | 6077 | 0 | 1 | 1 | no |
| permissions | loaded | 4930 | 7587 | 0 | 0 | 1 | no |
| audit | loaded | 3916 | 6574 | 0 | 1 | 1 | no |
| settings | loaded | 4009 | 6667 | 0 | 1 | 3 | no |
| admin | loaded | 3906 | 6565 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-03T15:42:43.935Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 8318 ms | 6278 ms | /د/س/ت/ر/س/ی/ /1/9/8/1/ /// /ر/و/ت/ر/ /4/2/9/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/1/1/5/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/7/2/8/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/6/6/7/m/s/×/2/ |
| /procurement/orders | 5633 ms | 4116 ms | /د/س/ت/ر/س/ی/ /1/5/2/2/ /// /ر/و/ت/ر/ /2/5/9/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/4/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/2/7/m/s/×/1/,/ /g/e/t/A/l/l/:/3/0/1/m/s/×/1/ |
| /procurement/needs | 6480 ms | 5181 ms | /د/س/ت/ر/س/ی/ /1/7/8/8/ /// /ر/و/ت/ر/ /3/3/9/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/8/1/7/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/1/7/3/3/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/7/7/8/m/s/×/1/ |
| /procurement/dashboard | 5440 ms | 4298 ms | /د/س/ت/ر/س/ی/ /1/8/2/4/ /// /ر/و/ت/ر/ /2/4/7/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/5/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/1/8/m/s/×/1/,/ /g/e/t/A/l/l/:/4/6/9/m/s/×/1/ |
| /procurement/workspace | 5660 ms | 3733 ms | /د/س/ت/ر/س/ی/ /1/7/4/3/ /// /ر/و/ت/ر/ /1/9/9/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/7/1/m/s/×/1/,/ /g/e/t/A/l/l/:/4/6/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/4/5/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

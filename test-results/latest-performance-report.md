# PMS UI and Performance Audit

- Generated: 2026-11-01T14:22:17.666Z
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
| visibleButtonsInventoried | 123 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 295 |
| procurementApiRequestsMeasured | 7 |
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
| dashboard | loaded | 4481 | 7142 | 0 | 4 | 2 | no |
| projects | loaded | 3446 | 6104 | 0 | 1 | 2 | no |
| project-detail | loaded | 2918 | 5575 | 0 | 2 | 0 | no |
| events | loaded | 3422 | 6077 | 0 | 5 | 1 | no |
| workflows | loaded | 2950 | 5607 | 0 | 3 | 2 | no |
| project-statuses | loaded | 3449 | 6104 | 0 | 1 | 1 | no |
| event-types | loaded | 3433 | 6096 | 0 | 73 | 1 | no |
| information-types | loaded | 2915 | 5572 | 0 | 1 | 1 | no |
| procurement | loaded | 3432 | 34447 | 0 | 9 | 0 | no |
| attachments | loaded | 3411 | 6067 | 0 | 1 | 2 | no |
| reports | loaded | 2914 | 5574 | 0 | 8 | 12 | no |
| users | loaded | 3432 | 6086 | 0 | 1 | 1 | no |
| departments | loaded | 3414 | 6072 | 0 | 8 | 1 | no |
| roles | loaded | 3931 | 6589 | 0 | 1 | 1 | no |
| permissions | loaded | 4444 | 7101 | 0 | 0 | 1 | no |
| audit | loaded | 3416 | 6072 | 0 | 1 | 1 | no |
| settings | loaded | 2935 | 5590 | 0 | 1 | 3 | no |
| admin | loaded | 3406 | 6064 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T14:24:24.868Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6679 ms | 5627 ms | /د/س/ت/ر/س/ی/ /2/7/0/9/ /// /ر/و/ت/ر/ /2/9/1/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/6/4/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/1/4/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/9/5/m/s/×/1/ |
| /procurement/orders | 4747 ms | 3256 ms | /د/س/ت/ر/س/ی/ /1/3/8/6/ /// /ر/و/ت/ر/ /1/8/7/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/9/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/7/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/6/7/m/s/×/1/ |
| /procurement/needs | 4853 ms | 3227 ms | /د/س/ت/ر/س/ی/ /1/3/0/3/ /// /ر/و/ت/ر/ /1/9/2/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/7/0/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/4/8/m/s/×/2/ |
| /procurement/dashboard | 3672 ms | 2444 ms | /د/س/ت/ر/س/ی/ /9/8/9/ /// /ر/و/ت/ر/ /1/4/5/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/4/1/m/s/×/1/,/ /g/e/t/A/l/l/:/2/7/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/2/7/m/s/×/1/ |
| /procurement/workspace | 7091 ms | 4441 ms | /د/س/ت/ر/س/ی/ /1/3/7/5/ /// /ر/و/ت/ر/ /3/0/6/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/1/9/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/8/2/4/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/5/9/9/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

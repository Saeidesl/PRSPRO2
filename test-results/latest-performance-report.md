# PMS UI and Performance Audit

- Generated: 2026-11-01T20:05:30.432Z
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
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 162 |
| visibleInputsAndControlsInventoried | 36 |
| networkRequestsMeasured | 326 |
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
| dashboard | loaded | 2933 | 5593 | 0 | 4 | 2 | no |
| projects | loaded | 3895 | 6552 | 0 | 1 | 2 | no |
| project-detail | loaded | 2388 | 5040 | 0 | 2 | 0 | no |
| print-design | loaded | 2389 | 5046 | 0 | 1 | 1 | no |
| print-output | loaded | 2392 | 5049 | 0 | 2 | 1 | no |
| events | loaded | 2889 | 5543 | 0 | 15 | 1 | no |
| workflows | loaded | 3917 | 6572 | 0 | 3 | 2 | no |
| project-statuses | loaded | 3417 | 6073 | 0 | 9 | 1 | no |
| event-types | loaded | 2895 | 5555 | 0 | 73 | 1 | no |
| information-types | loaded | 3384 | 6040 | 0 | 1 | 1 | no |
| procurement | loaded | 2904 | 31366 | 0 | 9 | 0 | no |
| attachments | loaded | 2902 | 5557 | 0 | 1 | 2 | no |
| reports | loaded | 2401 | 5062 | 0 | 8 | 12 | no |
| users | loaded | 2379 | 5032 | 0 | 1 | 1 | no |
| departments | loaded | 2377 | 5033 | 0 | 8 | 1 | no |
| roles | loaded | 2892 | 5552 | 0 | 19 | 1 | no |
| permissions | loaded | 3882 | 6349 | 0 | 0 | 1 | no |
| audit | loaded | 2406 | 5062 | 0 | 1 | 1 | no |
| settings | loaded | 2969 | 5625 | 0 | 1 | 3 | no |
| admin | loaded | 2381 | 5038 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T20:07:44.847Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4506 ms | 3137 ms | /د/س/ت/ر/س/ی/ /7/5/0/ /// /ر/و/ت/ر/ /2/3/8/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/7/4/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/6/1/5/m/s/×/3/,/ /g/e/t/A/l/l/:/3/2/9/m/s/×/1/ |
| /procurement/orders | 5474 ms | 4190 ms | /د/س/ت/ر/س/ی/ /1/6/0/6/ /// /ر/و/ت/ر/ /2/5/8/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/2/1/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/5/1/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/8/5/m/s/×/2/ |
| /procurement/needs | 4759 ms | 3480 ms | /د/س/ت/ر/س/ی/ /1/2/6/5/ /// /ر/و/ت/ر/ /2/2/1/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/1/3/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/3/9/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/3/7/m/s/×/1/ |
| /procurement/dashboard | 3484 ms | 2064 ms | /د/س/ت/ر/س/ی/ /8/5/5/ /// /ر/و/ت/ر/ /1/2/0/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/6/2/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/1/9/8/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/1/7/1/m/s/×/2/ |
| /procurement/workspace | 6270 ms | 3954 ms | /د/س/ت/ر/س/ی/ /1/2/4/6/ /// /ر/و/ت/ر/ /2/7/0/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/0/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/0/3/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/2/7/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

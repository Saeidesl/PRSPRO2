# PMS UI and Performance Audit

- Generated: 2026-10-30T19:04:58.325Z
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
| visibleButtonsInventoried | 152 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 285 |
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
| dashboard | loaded | 4473 | 7133 | 0 | 4 | 2 | no |
| projects | loaded | 3921 | 6581 | 0 | 10 | 2 | no |
| project-detail | loaded | 2907 | 5564 | 0 | 2 | 0 | no |
| events | loaded | 4421 | 7079 | 0 | 8 | 1 | no |
| workflows | loaded | 3447 | 6104 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2924 | 5580 | 0 | 9 | 1 | no |
| event-types | loaded | 3426 | 6089 | 0 | 46 | 1 | no |
| information-types | loaded | 2939 | 5596 | 0 | 1 | 1 | no |
| procurement | loaded | 2919 | 36113 | 0 | 9 | 0 | no |
| attachments | loaded | 3903 | 6560 | 0 | 1 | 2 | no |
| reports | loaded | 2943 | 5603 | 0 | 8 | 12 | no |
| users | loaded | 3451 | 6110 | 0 | 21 | 1 | no |
| departments | loaded | 4440 | 7099 | 0 | 8 | 1 | no |
| roles | loaded | 3939 | 6597 | 0 | 19 | 1 | no |
| permissions | loaded | 4460 | 7117 | 0 | 0 | 1 | no |
| audit | loaded | 3412 | 6067 | 0 | 1 | 1 | no |
| settings | loaded | 3406 | 6062 | 0 | 1 | 3 | no |
| admin | loaded | 4408 | 7065 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-30T19:07:11.624Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7331 ms | 5800 ms | /د/س/ت/ر/س/ی/ /1/5/9/8/ /// /ر/و/ت/ر/ /4/2/0/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/9/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/3/6/m/s/×/1/,/ /g/e/t/A/l/l/:/4/6/9/m/s/×/1/ |
| /procurement/orders | 4965 ms | 3465 ms | /د/س/ت/ر/س/ی/ /1/6/9/1/ /// /ر/و/ت/ر/ /1/7/7/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/6/3/m/s/×/1/,/ /g/e/t/A/l/l/:/4/7/5/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/4/5/6/m/s/×/2/ |
| /procurement/needs | 3867 ms | 2382 ms | /د/س/ت/ر/س/ی/ /8/2/1/ /// /ر/و/ت/ر/ /1/5/6/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/6/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/0/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/2/2/m/s/×/1/ |
| /procurement/dashboard | 4173 ms | 2734 ms | /د/س/ت/ر/س/ی/ /1/0/2/5/ /// /ر/و/ت/ر/ /1/7/0/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/8/0/m/s/×/1/,/ /g/e/t/A/l/l/:/2/3/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/1/9/m/s/×/2/ |
| /procurement/workspace | 9383 ms | 4137 ms | /د/س/ت/ر/س/ی/ /1/4/3/1/ /// /ر/و/ت/ر/ /2/7/0/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/1/0/m/s/×/1/,/ /g/e/t/A/l/l/:/5/1/0/m/s/×/1/,/ /g/e/t/A/l/l/:/4/3/1/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

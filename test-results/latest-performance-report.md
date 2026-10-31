# PMS UI and Performance Audit

- Generated: 2026-10-31T13:02:33.381Z
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
| visibleButtonsInventoried | 378 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 297 |
| procurementApiRequestsMeasured | 8 |
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
| dashboard | loaded | 4374 | 7033 | 0 | 4 | 2 | no |
| projects | loaded | 2869 | 5525 | 0 | 1 | 2 | no |
| project-detail | loaded | 3368 | 6024 | 0 | 2 | 0 | no |
| events | loaded | 3355 | 6010 | 0 | 9 | 1 | no |
| workflows | loaded | 4880 | 7535 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3879 | 6534 | 0 | 1 | 1 | no |
| event-types | loaded | 2385 | 5053 | 0 | 65 | 1 | no |
| information-types | loaded | 3868 | 6524 | 0 | 13 | 1 | no |
| procurement | loaded | 3870 | 32032 | 0 | 9 | 0 | no |
| attachments | loaded | 3357 | 6011 | 0 | 9 | 2 | no |
| reports | loaded | 3887 | 6544 | 0 | 8 | 12 | no |
| users | loaded | 2359 | 5016 | 0 | 21 | 1 | no |
| departments | loaded | 3358 | 6012 | 0 | 8 | 1 | no |
| roles | loaded | 3367 | 6020 | 0 | 1 | 1 | no |
| permissions | loaded | 3870 | 6526 | 0 | 0 | 1 | no |
| audit | loaded | 3858 | 6513 | 0 | 1 | 1 | no |
| settings | loaded | 4880 | 7535 | 0 | 1 | 3 | no |
| admin | loaded | 3355 | 6023 | 0 | 224 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T13:04:43.720Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6119 ms | 4012 ms | /د/س/ت/ر/س/ی/ /1/3/2/9/ /// /ر/و/ت/ر/ /2/6/8/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/4/9/m/s/×/1/,/ /g/e/t/A/l/l/:/3/2/3/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/9/m/s/×/1/ |
| /procurement/orders | 4117 ms | 2972 ms | /د/س/ت/ر/س/ی/ /1/4/6/9/ /// /ر/و/ت/ر/ /1/5/0/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/8/0/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/4/9/9/m/s/×/2/,/ /g/e/t/A/l/l/:/3/6/1/m/s/×/1/ |
| /procurement/needs | 5075 ms | 3674 ms | /د/س/ت/ر/س/ی/ /1/2/2/7/ /// /ر/و/ت/ر/ /2/4/4/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/7/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/9/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/2/8/m/s/×/1/ |
| /procurement/dashboard | 5076 ms | 3444 ms | /د/س/ت/ر/س/ی/ /1/3/1/8/ /// /ر/و/ت/ر/ /2/1/2/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/7/2/m/s/×/1/,/ /g/e/t/A/l/l/:/2/7/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/7/0/m/s/×/2/ |
| /procurement/workspace | 4292 ms | 2778 ms | /د/س/ت/ر/س/ی/ /1/1/6/1/ /// /ر/و/ت/ر/ /1/6/1/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/1/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/4/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/6/1/m/s/×/2/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

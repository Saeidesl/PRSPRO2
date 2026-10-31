# PMS UI and Performance Audit

- Generated: 2026-10-31T18:36:16.693Z
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
| visibleButtonsInventoried | 454 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 337 |
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
| dashboard | loaded | 3421 | 6081 | 0 | 20 | 2 | no |
| projects | loaded | 2889 | 5547 | 0 | 25 | 2 | no |
| project-detail | loaded | 2880 | 5536 | 0 | 2 | 0 | no |
| events | loaded | 4891 | 7547 | 0 | 13 | 1 | no |
| workflows | loaded | 2926 | 5581 | 0 | 3 | 2 | no |
| project-statuses | loaded | 4907 | 7562 | 0 | 1 | 1 | no |
| event-types | loaded | 2889 | 5549 | 0 | 69 | 1 | no |
| information-types | loaded | 2883 | 5539 | 0 | 1 | 1 | no |
| procurement | loaded | 3394 | 27879 | 0 | 9 | 0 | no |
| attachments | loaded | 3384 | 6042 | 0 | 13 | 2 | no |
| reports | loaded | 2401 | 5064 | 0 | 8 | 12 | no |
| users | loaded | 2901 | 5559 | 0 | 21 | 1 | no |
| departments | loaded | 2903 | 5559 | 0 | 8 | 1 | no |
| roles | loaded | 3398 | 6057 | 0 | 19 | 1 | no |
| permissions | loaded | 3937 | 6592 | 0 | 0 | 1 | no |
| audit | loaded | 3384 | 6040 | 0 | 1 | 1 | no |
| settings | loaded | 2379 | 5033 | 0 | 1 | 3 | no |
| admin | loaded | 3916 | 6592 | 0 | 240 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T18:38:17.049Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4849 ms | 3917 ms | /د/س/ت/ر/س/ی/ /1/0/1/8/ /// /ر/و/ت/ر/ /2/8/9/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/8/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/1/6/m/s/×/1/,/ /g/e/t/A/l/l/:/4/1/3/m/s/×/1/ |
| /procurement/orders | 3872 ms | 2649 ms | /د/س/ت/ر/س/ی/ /1/1/5/1/ /// /ر/و/ت/ر/ /1/4/9/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/3/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/2/1/m/s/×/1/,/ /g/e/t/A/l/l/:/1/9/5/m/s/×/1/ |
| /procurement/needs | 4333 ms | 2737 ms | /د/س/ت/ر/س/ی/ /1/0/8/8/ /// /ر/و/ت/ر/ /1/6/4/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/7/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/4/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/9/0/m/s/×/1/ |
| /procurement/dashboard | 3292 ms | 2064 ms | /د/س/ت/ر/س/ی/ /9/1/6/ /// /ر/و/ت/ر/ /1/1/4/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/8/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/8/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/6/0/m/s/×/2/ |
| /procurement/workspace | 5441 ms | 2790 ms | /د/س/ت/ر/س/ی/ /1/3/2/3/ /// /ر/و/ت/ر/ /1/4/6/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/0/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/4/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/7/4/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

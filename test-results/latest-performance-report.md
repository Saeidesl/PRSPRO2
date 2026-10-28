# PMS UI and Performance Audit

- Generated: 2026-10-28T19:33:04.796Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **needs-attention**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 17 |
| loadedRoutes | 17 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 12 |
| visibleButtonsInventoried | 93 |
| visibleInputsAndControlsInventoried | 32 |
| networkRequestsMeasured | 345 |
| procurementApiRequestsMeasured | 10 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 20 |
| failedSafeButtonChecks | 4 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3989 | 6650 | 0 | 4 | 2 | no |
| projects | loaded | 2937 | 5595 | 0 | 7 | 2 | no |
| project-detail | loaded | 2927 | 5584 | 0 | 2 | 0 | no |
| events | loaded | 2920 | 5580 | 0 | 7 | 1 | no |
| workflows | loaded | 3447 | 6101 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3439 | 6094 | 0 | 1 | 1 | no |
| event-types | loaded | 2933 | 5589 | 0 | 1 | 1 | no |
| procurement | loaded | 3913 | 34347 | 0 | 9 | 0 | no |
| attachments | loaded | 3404 | 6064 | 0 | 1 | 2 | no |
| reports | loaded | 3937 | 6599 | 0 | 8 | 12 | no |
| users | loaded | 5942 | 8601 | 0 | 21 | 1 | no |
| departments | loaded | 3457 | 6113 | 0 | 8 | 1 | no |
| roles | loaded | 2937 | 5596 | 0 | 19 | 1 | no |
| permissions | loaded | 3449 | 6103 | 0 | 0 | 1 | no |
| audit | loaded | 4973 | 7631 | 0 | 1 | 1 | no |
| settings | loaded | 3943 | 6599 | 0 | 0 | 2 | no |
| admin | loaded | 2412 | 5071 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-28T19:35:04.865Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4303 ms | 3401 ms | /د/س/ت/ر/س/ی/ /1/7/2/5/ /// /ر/و/ت/ر/ /1/6/7/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/7/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/0/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/7/0/m/s/×/1/ |
| /procurement/orders | 4165 ms | 2953 ms | /د/س/ت/ر/س/ی/ /8/2/4/ /// /ر/و/ت/ر/ /2/1/2/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/1/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/4/7/m/s/×/1/,/ /g/e/t/A/l/l/:/5/2/6/m/s/×/1/ |
| /procurement/needs | 5742 ms | 3950 ms | /د/س/ت/ر/س/ی/ /1/1/4/3/ /// /ر/و/ت/ر/ /2/8/0/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/8/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/1/7/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/6/8/6/m/s/×/1/ |
| /procurement/dashboard | 6265 ms | 5097 ms | /د/س/ت/ر/س/ی/ /8/1/4/ /// /ر/و/ت/ر/ /4/2/8/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/5/0/5/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/1/4/5/0/m/s/×/2/,/ /g/e/t/A/l/l/:/1/3/9/1/m/s/×/1/ |
| /procurement/workspace | 5457 ms | 4345 ms | /د/س/ت/ر/س/ی/ /2/2/2/0/ /// /ر/و/ت/ر/ /2/1/2/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/2/1/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/9/9/m/s/×/1/,/ /g/e/t/A/l/l/:/6/4/4/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

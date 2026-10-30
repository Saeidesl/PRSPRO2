# PMS UI and Performance Audit

- Generated: 2026-10-30T17:16:26.017Z
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
| visibleFormsInventoried | 10 |
| dynamicFormsInventoried | 10 |
| formOpenersChecked | 12 |
| visibleButtonsInventoried | 149 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 341 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 20 |
| failedSafeButtonChecks | 5 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 4468 | 7128 | 0 | 4 | 2 | no |
| projects | loaded | 4921 | 7577 | 0 | 10 | 2 | no |
| project-detail | loaded | 3417 | 6074 | 0 | 2 | 0 | no |
| events | loaded | 3408 | 6066 | 0 | 8 | 1 | no |
| workflows | loaded | 2920 | 5577 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3915 | 6572 | 0 | 1 | 1 | no |
| event-types | loaded | 3412 | 6072 | 0 | 46 | 1 | no |
| procurement | loaded | 4421 | 40501 | 0 | 9 | 0 | no |
| attachments | loaded | 3405 | 6061 | 0 | 7 | 2 | no |
| reports | loaded | 3416 | 6075 | 0 | 8 | 12 | no |
| users | loaded | 2890 | 5549 | 0 | 21 | 1 | no |
| departments | loaded | 4402 | 7059 | 0 | 8 | 1 | no |
| roles | loaded | 3419 | 6077 | 0 | 19 | 1 | no |
| permissions | loaded | 4423 | 7078 | 0 | 0 | 1 | no |
| audit | loaded | 2422 | 5076 | 0 | 1 | 1 | no |
| settings | loaded | 3902 | 6557 | 0 | 1 | 3 | no |
| admin | loaded | 3427 | 6085 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-30T17:18:37.200Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 9490 ms | 7832 ms | /د/س/ت/ر/س/ی/ /2/0/4/2/ /// /ر/و/ت/ر/ /5/7/9/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/3/1/9/m/s/×/1/,/ /g/e/t/A/l/l/:/1/2/8/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/2/0/0/m/s/×/1/ |
| /procurement/orders | 5184 ms | 3880 ms | /د/س/ت/ر/س/ی/ /1/2/3/2/ /// /ر/و/ت/ر/ /2/6/4/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/2/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/5/5/m/s/×/1/,/ /g/e/t/A/l/l/:/3/4/0/m/s/×/1/ |
| /procurement/needs | 6911 ms | 5527 ms | /د/س/ت/ر/س/ی/ /1/6/4/2/ /// /ر/و/ت/ر/ /3/8/8/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/4/4/m/s/×/2/,/ /g/e/t/A/l/l/:/7/7/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/1/9/m/s/×/2/ |
| /procurement/dashboard | 4797 ms | 3173 ms | /د/س/ت/ر/س/ی/ /9/1/2/ /// /ر/و/ت/ر/ /2/2/6/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/1/6/m/s/×/1/,/ /g/e/t/A/l/l/:/3/9/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/2/4/m/s/×/1/ |
| /procurement/workspace | 5715 ms | 3157 ms | /د/س/ت/ر/س/ی/ /1/4/2/1/ /// /ر/و/ت/ر/ /1/7/3/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/3/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/7/8/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/6/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

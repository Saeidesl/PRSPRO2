# PMS UI and Performance Audit

- Generated: 2026-11-01T06:13:29.174Z
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
| visibleButtonsInventoried | 199 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 322 |
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
| dashboard | loaded | 2503 | 5162 | 0 | 4 | 2 | no |
| projects | loaded | 3417 | 6075 | 0 | 1 | 2 | no |
| project-detail | loaded | 3416 | 6073 | 0 | 2 | 0 | no |
| events | loaded | 2917 | 5573 | 0 | 5 | 1 | no |
| workflows | loaded | 3455 | 6111 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2433 | 5090 | 0 | 9 | 1 | no |
| event-types | loaded | 2924 | 5586 | 0 | 69 | 1 | no |
| information-types | loaded | 3413 | 6073 | 0 | 40 | 1 | no |
| procurement | loaded | 2926 | 34985 | 0 | 9 | 0 | no |
| attachments | loaded | 3907 | 6563 | 0 | 18 | 2 | no |
| reports | loaded | 3426 | 6085 | 0 | 8 | 12 | no |
| users | loaded | 3454 | 6112 | 0 | 1 | 1 | no |
| departments | loaded | 3434 | 6090 | 0 | 8 | 1 | no |
| roles | loaded | 3426 | 6051 | 0 | 19 | 1 | no |
| permissions | loaded | 3454 | 6110 | 0 | 0 | 1 | no |
| audit | loaded | 3414 | 6072 | 0 | 1 | 1 | no |
| settings | loaded | 3470 | 6107 | 0 | 1 | 3 | no |
| admin | loaded | 3410 | 6065 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T06:15:37.956Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6594 ms | 4288 ms | /د/س/ت/ر/س/ی/ /1/0/9/8/ /// /ر/و/ت/ر/ /3/1/9/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/8/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/1/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/6/3/m/s/×/2/ |
| /procurement/orders | 6779 ms | 4849 ms | /د/س/ت/ر/س/ی/ /1/4/5/1/ /// /ر/و/ت/ر/ /3/3/9/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/4/2/m/s/×/1/,/ /g/e/t/A/l/l/:/6/2/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/2/8/m/s/×/1/ |
| /procurement/needs | 4354 ms | 3094 ms | /د/س/ت/ر/س/ی/ /1/1/7/8/ /// /ر/و/ت/ر/ /1/9/1/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/8/4/m/s/×/1/,/ /g/e/t/A/l/l/:/4/2/5/m/s/×/1/,/ /g/e/t/A/l/l/:/2/9/2/m/s/×/1/ |
| /procurement/dashboard | 3810 ms | 2415 ms | /د/س/ت/ر/س/ی/ /1/0/2/9/ /// /ر/و/ت/ر/ /1/3/8/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/4/1/m/s/×/1/,/ /g/e/t/A/l/l/:/3/2/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/6/1/m/s/×/1/ |
| /procurement/workspace | 7828 ms | 2185 ms | /د/س/ت/ر/س/ی/ /8/1/6/ /// /ر/و/ت/ر/ /1/3/6/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/9/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/0/1/m/s/×/2/,/ /g/e/t/A/l/l/:/1/7/6/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

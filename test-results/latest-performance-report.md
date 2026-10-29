# PMS UI and Performance Audit

- Generated: 2026-10-29T14:09:25.802Z
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
| visibleButtonsInventoried | 90 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 328 |
| procurementApiRequestsMeasured | 7 |
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
| dashboard | loaded | 2922 | 5580 | 0 | 4 | 2 | no |
| projects | loaded | 4390 | 7048 | 0 | 1 | 2 | no |
| project-detail | loaded | 4887 | 7544 | 0 | 2 | 0 | no |
| events | loaded | 4383 | 7038 | 0 | 5 | 1 | no |
| workflows | loaded | 3390 | 6045 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4393 | 7049 | 0 | 1 | 1 | no |
| event-types | loaded | 4415 | 7075 | 0 | 43 | 1 | no |
| procurement | loaded | 3876 | 39527 | 0 | 9 | 0 | no |
| attachments | loaded | 3891 | 6548 | 0 | 1 | 2 | no |
| reports | loaded | 2885 | 5543 | 0 | 8 | 12 | no |
| users | loaded | 3880 | 6537 | 0 | 1 | 1 | no |
| departments | loaded | 4885 | 7540 | 0 | 8 | 1 | no |
| roles | loaded | 3896 | 6552 | 0 | 1 | 1 | no |
| permissions | loaded | 4901 | 7555 | 0 | 0 | 1 | no |
| audit | loaded | 3380 | 6035 | 0 | 1 | 1 | no |
| settings | loaded | 3388 | 6042 | 0 | 1 | 3 | no |
| admin | loaded | 2901 | 5558 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T14:11:34.820Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 9361 ms | 7641 ms | /د/س/ت/ر/س/ی/ /2/4/5/3/ /// /ر/و/ت/ر/ /5/1/8/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/3/3/6/m/s/×/1/,/ /g/e/t/A/l/l/:/1/2/1/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/5/3/m/s/×/1/ |
| /procurement/orders | 6256 ms | 4923 ms | /د/س/ت/ر/س/ی/ /1/8/5/4/ /// /ر/و/ت/ر/ /3/0/6/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/8/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/2/9/m/s/×/1/,/ /g/e/t/A/l/l/:/3/8/5/m/s/×/1/ |
| /procurement/needs | 5743 ms | 4741 ms | /د/س/ت/ر/س/ی/ /1/3/8/3/ /// /ر/و/ت/ر/ /3/3/5/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/4/8/m/s/×/1/,/ /g/e/t/A/l/l/:/8/4/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/8/0/3/m/s/×/1/ |
| /procurement/dashboard | 3888 ms | 2461 ms | /د/س/ت/ر/س/ی/ /9/8/0/ /// /ر/و/ت/ر/ /1/4/7/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/9/3/m/s/×/1/,/ /g/e/t/A/l/l/:/2/1/0/m/s/×/1/,/ /g/e/t/A/l/l/:/2/0/0/m/s/×/1/ |
| /procurement/workspace | 5918 ms | 4575 ms | /د/س/ت/ر/س/ی/ /1/6/3/8/ /// /ر/و/ت/ر/ /2/9/3/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/3/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/4/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/2/5/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

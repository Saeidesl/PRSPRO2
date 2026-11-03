# PMS UI and Performance Audit

- Generated: 2026-11-03T15:29:37.530Z
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
| networkRequestsMeasured | 255 |
| procurementApiRequestsMeasured | 6 |
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
| dashboard | loaded | 5489 | 8151 | 0 | 4 | 2 | no |
| projects | loaded | 3920 | 6577 | 0 | 1 | 2 | no |
| project-detail | loaded | 5428 | 8087 | 0 | 2 | 0 | no |
| print-design | loaded | 3408 | 6070 | 1 | 14 | 5 | no |
| print-output | loaded | 3411 | 6070 | 0 | 1 | 2 | no |
| events | loaded | 3920 | 6578 | 0 | 5 | 1 | no |
| workflows | loaded | 3930 | 6588 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4929 | 7586 | 0 | 1 | 1 | no |
| event-types | loaded | 3427 | 6085 | 0 | 1 | 1 | no |
| information-types | loaded | 3409 | 6066 | 0 | 1 | 1 | no |
| procurement | loaded | 3429 | 47026 | 0 | 9 | 0 | no |
| attachments | loaded | 3400 | 6057 | 0 | 1 | 2 | no |
| reports | loaded | 3933 | 6597 | 0 | 8 | 12 | no |
| users | loaded | 3411 | 6068 | 0 | 1 | 1 | no |
| departments | loaded | 4907 | 7563 | 0 | 8 | 1 | no |
| roles | loaded | 3957 | 6613 | 0 | 1 | 1 | no |
| permissions | loaded | 5431 | 8089 | 0 | 0 | 1 | no |
| audit | loaded | 5409 | 8068 | 0 | 1 | 1 | no |
| settings | loaded | 6460 | 9116 | 0 | 1 | 3 | no |
| admin | loaded | 3412 | 6067 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-03T15:32:25.520Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 8385 ms | 6294 ms | /د/س/ت/ر/س/ی/ /2/1/2/8/ /// /ر/و/ت/ر/ /4/1/6/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/0/2/m/s/×/1/,/ /g/e/t/A/l/l/:/5/1/3/m/s/×/1/,/ /g/e/t/A/l/l/:/4/9/9/m/s/×/1/ |
| /procurement/orders | 9104 ms | 7254 ms | /د/س/ت/ر/س/ی/ /3/5/5/2/ /// /ر/و/ت/ر/ /3/7/0/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/2/8/2/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/1/2/5/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/2/2/4/m/s/×/1/ |
| /procurement/needs | 8120 ms | 6017 ms | /د/س/ت/ر/س/ی/ /2/5/3/4/ /// /ر/و/ت/ر/ /3/4/8/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/2/3/9/m/s/×/1/,/ /g/e/t/A/l/l/:/9/3/3/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/8/8/9/m/s/×/2/ |
| /procurement/dashboard | 8187 ms | 5933 ms | /د/س/ت/ر/س/ی/ /1/8/5/7/ /// /ر/و/ت/ر/ /4/0/7/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/7/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/6/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/5/8/m/s/×/1/ |
| /procurement/workspace | 5310 ms | 3396 ms | /د/س/ت/ر/س/ی/ /1/2/0/9/ /// /ر/و/ت/ر/ /2/1/8/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/8/8/m/s/×/1/,/ /g/e/t/A/l/l/:/3/8/0/m/s/×/1/,/ /g/e/t/A/l/l/:/3/3/3/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

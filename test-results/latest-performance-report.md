# PMS UI and Performance Audit

- Generated: 2026-11-05T15:04:23.314Z
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
| visibleFormsInventoried | 10 |
| dynamicFormsInventoried | 9 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 67 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 306 |
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
| dashboard | loaded | 6458 | 9118 | 0 | 4 | 2 | no |
| projects | loaded | 3923 | 6581 | 0 | 1 | 2 | no |
| project-detail | loaded | 2930 | 5588 | 0 | 2 | 0 | no |
| print-design | loaded | 2918 | 5577 | 1 | 15 | 5 | no |
| print-output | loaded | 4939 | 7596 | 0 | 1 | 2 | no |
| events | loaded | 3916 | 6573 | 0 | 7 | 1 | no |
| workflows | loaded | 4417 | 7074 | 0 | 1 | 2 | no |
| project-statuses | loaded | 6453 | 9108 | 0 | 1 | 1 | no |
| event-types | loaded | 4933 | 7587 | 0 | 1 | 1 | no |
| information-types | loaded | 4418 | 7074 | 0 | 1 | 1 | no |
| procurement | loaded | 4938 | 52180 | 0 | 9 | 0 | no |
| attachments | loaded | 2920 | 5577 | 0 | 1 | 2 | no |
| reports | loaded | 3430 | 6091 | 0 | 8 | 12 | no |
| users | loaded | 4410 | 7068 | 0 | 1 | 1 | no |
| departments | loaded | 3402 | 6059 | 0 | 8 | 1 | no |
| roles | loaded | 3436 | 6092 | 0 | 1 | 1 | no |
| permissions | loaded | 4935 | 7591 | 0 | 0 | 1 | no |
| audit | loaded | 5933 | 8589 | 0 | 1 | 1 | no |
| settings | loaded | 2912 | 5570 | 0 | 1 | 3 | no |
| admin | loaded | 4942 | 7599 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-05T15:07:21.317Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7330 ms | 5543 ms | /د/س/ت/ر/س/ی/ /1/7/1/6/ /// /ر/و/ت/ر/ /3/8/2/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/7/9/m/s/×/1/,/ /g/e/t/A/l/l/:/5/9/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/6/6/m/s/×/1/ |
| /procurement/orders | 5602 ms | 3802 ms | /د/س/ت/ر/س/ی/ /1/4/1/1/ /// /ر/و/ت/ر/ /2/3/9/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/1/6/m/s/×/1/,/ /g/e/t/A/l/l/:/3/6/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/0/6/m/s/×/2/ |
| /procurement/needs | 8069 ms | 5593 ms | /د/س/ت/ر/س/ی/ /2/0/0/3/ /// /ر/و/ت/ر/ /3/5/8/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/9/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/8/1/0/m/s/×/1/,/ /g/e/t/A/l/l/:/7/3/5/m/s/×/1/ |
| /procurement/dashboard | 8766 ms | 6786 ms | /د/س/ت/ر/س/ی/ /2/9/2/8/ /// /ر/و/ت/ر/ /3/8/5/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/6/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/9/5/8/m/s/×/1/,/ /g/e/t/A/l/l/:/7/5/0/m/s/×/1/ |
| /procurement/workspace | 12989 ms | 5985 ms | /د/س/ت/ر/س/ی/ /2/6/5/4/ /// /ر/و/ت/ر/ /3/3/2/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/0/3/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/1/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/8/7/5/m/s/×/2/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

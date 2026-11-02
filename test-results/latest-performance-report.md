# PMS UI and Performance Audit

- Generated: 2026-11-02T10:47:44.077Z
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
| visibleButtonsInventoried | 487 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 292 |
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
| dashboard | loaded | 2977 | 5639 | 0 | 24 | 2 | no |
| projects | loaded | 3949 | 6607 | 0 | 1 | 2 | no |
| project-detail | loaded | 4427 | 7084 | 0 | 2 | 0 | no |
| print-design | loaded | 2925 | 5586 | 1 | 14 | 5 | no |
| print-output | loaded | 3913 | 6570 | 0 | 1 | 2 | no |
| events | loaded | 4443 | 7098 | 0 | 5 | 1 | no |
| workflows | loaded | 3947 | 6603 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3962 | 6619 | 0 | 1 | 1 | no |
| event-types | loaded | 3449 | 6112 | 0 | 73 | 1 | no |
| information-types | loaded | 5431 | 8090 | 0 | 1 | 1 | no |
| procurement | loaded | 5446 | 46605 | 0 | 9 | 0 | no |
| attachments | loaded | 3908 | 6566 | 0 | 1 | 2 | no |
| reports | loaded | 3937 | 6600 | 0 | 8 | 12 | no |
| users | loaded | 3934 | 6592 | 0 | 1 | 1 | no |
| departments | loaded | 3408 | 6066 | 0 | 8 | 1 | no |
| roles | loaded | 3435 | 6093 | 0 | 1 | 1 | no |
| permissions | loaded | 3930 | 6588 | 0 | 0 | 1 | no |
| audit | loaded | 3425 | 6082 | 0 | 1 | 1 | no |
| settings | loaded | 3472 | 6131 | 0 | 1 | 3 | no |
| admin | loaded | 3918 | 6699 | 0 | 334 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-02T10:50:28.898Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7411 ms | 5583 ms | /د/س/ت/ر/س/ی/ /1/9/6/3/ /// /ر/و/ت/ر/ /3/6/2/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/1/6/m/s/×/1/,/ /g/e/t/A/l/l/:/6/8/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/0/8/m/s/×/1/ |
| /procurement/orders | 8097 ms | 6354 ms | /د/س/ت/ر/س/ی/ /2/5/3/5/ /// /ر/و/ت/ر/ /3/8/1/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/2/1/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/9/6/3/m/s/×/2/,/ /g/e/t/A/l/l/:/8/6/9/m/s/×/1/ |
| /procurement/needs | 6155 ms | 4190 ms | /د/س/ت/ر/س/ی/ /1/7/1/2/ /// /ر/و/ت/ر/ /2/4/7/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/8/1/m/s/×/1/,/ /g/e/t/A/l/l/:/4/4/7/m/s/×/1/,/ /g/e/t/A/l/l/:/3/5/1/m/s/×/1/ |
| /procurement/dashboard | 6465 ms | 4962 ms | /د/س/ت/ر/س/ی/ /2/4/6/1/ /// /ر/و/ت/ر/ /2/5/0/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/5/6/3/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/1/3/1/2/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/4/2/5/m/s/×/2/ |
| /procurement/workspace | 7046 ms | 4448 ms | /د/س/ت/ر/س/ی/ /1/7/8/8/ /// /ر/و/ت/ر/ /2/6/5/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/7/6/m/s/×/1/,/ /g/e/t/A/l/l/:/5/3/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/9/8/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

# PMS UI and Performance Audit

- Generated: 2026-11-04T17:26:10.815Z
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
| visibleButtonsInventoried | 615 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 310 |
| procurementApiRequestsMeasured | 7 |
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
| dashboard | loaded | 3942 | 6605 | 0 | 4 | 2 | no |
| projects | loaded | 3930 | 6593 | 0 | 76 | 2 | no |
| project-detail | loaded | 3927 | 6583 | 0 | 2 | 0 | no |
| print-design | loaded | 3412 | 6072 | 1 | 14 | 5 | no |
| print-output | loaded | 4936 | 7592 | 0 | 1 | 2 | no |
| events | loaded | 2940 | 5601 | 0 | 30 | 1 | no |
| workflows | loaded | 3464 | 6121 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2931 | 5590 | 0 | 1 | 1 | no |
| event-types | loaded | 4944 | 7610 | 0 | 55 | 1 | no |
| information-types | loaded | 4959 | 7618 | 0 | 1 | 1 | no |
| procurement | loaded | 3947 | 45837 | 0 | 9 | 0 | no |
| attachments | loaded | 3442 | 6100 | 0 | 1 | 2 | no |
| reports | loaded | 3431 | 6095 | 0 | 8 | 12 | no |
| users | loaded | 3924 | 6580 | 0 | 1 | 1 | no |
| departments | loaded | 3914 | 6572 | 0 | 8 | 1 | no |
| roles | loaded | 4452 | 7107 | 0 | 1 | 1 | no |
| permissions | loaded | 2930 | 5588 | 0 | 0 | 1 | no |
| audit | loaded | 4923 | 7581 | 0 | 1 | 1 | no |
| settings | loaded | 4104 | 6763 | 0 | 1 | 3 | no |
| admin | loaded | 5418 | 8135 | 0 | 400 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-04T17:28:53.136Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 8235 ms | 5712 ms | /د/س/ت/ر/س/ی/ /1/4/7/2/ /// /ر/و/ت/ر/ /4/2/4/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/3/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/0/3/8/m/s/×/1/,/ /g/e/t/A/l/l/:/6/7/7/m/s/×/1/ |
| /procurement/orders | 6413 ms | 4461 ms | /د/س/ت/ر/س/ی/ /1/5/5/8/ /// /ر/و/ت/ر/ /2/9/0/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/5/9/m/s/×/1/,/ /g/e/t/A/l/l/:/4/5/9/m/s/×/1/,/ /g/e/t/A/l/l/:/3/9/9/m/s/×/1/ |
| /procurement/needs | 5679 ms | 4037 ms | /د/س/ت/ر/س/ی/ /1/9/6/0/ /// /ر/و/ت/ر/ /2/0/7/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/0/3/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/0/6/m/s/×/1/,/ /g/e/t/A/l/l/:/3/7/3/m/s/×/1/ |
| /procurement/dashboard | 3968 ms | 2555 ms | /د/س/ت/ر/س/ی/ /1/0/1/0/ /// /ر/و/ت/ر/ /1/5/4/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/0/2/m/s/×/1/,/ /g/e/t/A/l/l/:/2/2/3/m/s/×/1/,/ /g/e/t/A/l/l/:/2/0/3/m/s/×/1/ |
| /procurement/workspace | 14095 ms | 7008 ms | /د/س/ت/ر/س/ی/ /1/6/4/8/ /// /ر/و/ت/ر/ /5/3/6/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/8/5/m/s/×/1/,/ /g/e/t/A/l/l/:/7/7/0/m/s/×/1/,/ /g/e/t/A/l/l/:/7/7/0/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

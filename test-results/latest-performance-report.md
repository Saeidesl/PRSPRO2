# PMS UI and Performance Audit

- Generated: 2026-11-04T17:54:01.395Z
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
| visibleButtonsInventoried | 186 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 302 |
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
| dashboard | loaded | 4484 | 7145 | 0 | 4 | 2 | no |
| projects | loaded | 3424 | 6082 | 0 | 1 | 2 | no |
| project-detail | loaded | 3408 | 6063 | 0 | 2 | 0 | no |
| print-design | loaded | 4418 | 7078 | 1 | 14 | 5 | no |
| print-output | loaded | 4433 | 7089 | 0 | 1 | 2 | no |
| events | loaded | 3420 | 6079 | 0 | 30 | 1 | no |
| workflows | loaded | 4942 | 7600 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3448 | 6104 | 0 | 9 | 1 | no |
| event-types | loaded | 3943 | 6607 | 0 | 55 | 1 | no |
| information-types | loaded | 2906 | 5564 | 0 | 1 | 1 | no |
| procurement | loaded | 3931 | 35036 | 0 | 9 | 0 | no |
| attachments | loaded | 3944 | 6602 | 0 | 18 | 2 | no |
| reports | loaded | 3438 | 6098 | 0 | 8 | 12 | no |
| users | loaded | 4417 | 7075 | 0 | 1 | 1 | no |
| departments | loaded | 2907 | 5563 | 0 | 8 | 1 | no |
| roles | loaded | 2934 | 5593 | 0 | 19 | 1 | no |
| permissions | loaded | 2936 | 5593 | 0 | 0 | 1 | no |
| audit | loaded | 2942 | 5601 | 0 | 1 | 1 | no |
| settings | loaded | 3410 | 6065 | 0 | 1 | 3 | no |
| admin | loaded | 3915 | 6571 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-04T17:56:34.626Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6759 ms | 5358 ms | /د/س/ت/ر/س/ی/ /1/5/4/9/ /// /ر/و/ت/ر/ /3/8/0/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/8/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/5/6/m/s/×/1/,/ /g/e/t/A/l/l/:/5/1/3/m/s/×/1/ |
| /procurement/orders | 4596 ms | 3539 ms | /د/س/ت/ر/س/ی/ /8/0/4/ /// /ر/و/ت/ر/ /2/7/3/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/8/7/m/s/×/1/,/ /g/e/t/A/l/l/:/7/3/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/3/8/m/s/×/1/ |
| /procurement/needs | 5613 ms | 3970 ms | /د/س/ت/ر/س/ی/ /1/4/2/0/ /// /ر/و/ت/ر/ /2/5/5/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/8/5/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/5/5/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/5/0/m/s/×/2/ |
| /procurement/dashboard | 4472 ms | 3482 ms | /د/س/ت/ر/س/ی/ /1/6/2/8/ /// /ر/و/ت/ر/ /1/8/5/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/6/3/m/s/×/1/,/ /g/e/t/A/l/l/:/5/5/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/9/5/m/s/×/1/ |
| /procurement/workspace | 4674 ms | 2977 ms | /د/س/ت/ر/س/ی/ /1/2/2/2/ /// /ر/و/ت/ر/ /1/7/5/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/0/2/m/s/×/1/,/ /g/e/t/A/l/l/:/3/0/0/m/s/×/1/,/ /g/e/t/A/l/l/:/2/5/5/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

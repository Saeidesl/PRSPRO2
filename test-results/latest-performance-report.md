# PMS UI and Performance Audit

- Generated: 2026-11-05T15:41:40.595Z
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
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 10 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 533 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 364 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 46 |
| consoleErrors | 0 |
| pageErrors | 46 |
| safeButtonChecks | 12 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 5967 | 8626 | 0 | 4 | 2 | no |
| projects | loaded | 3392 | 6049 | 0 | 1 | 2 | no |
| project-detail | loaded | 3887 | 6544 | 0 | 2 | 0 | no |
| print-design | loaded | 4392 | 4683 | 1 | 15 | 5 | no |
| print-output | loaded | 4890 | 5185 | 0 | 1 | 2 | no |
| events | loaded | 3383 | 6041 | 0 | 7 | 1 | no |
| workflows | loaded | 4388 | 7046 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2917 | 5573 | 0 | 1 | 1 | no |
| event-types | loaded | 4398 | 7053 | 0 | 1 | 1 | no |
| information-types | loaded | 3887 | 6545 | 0 | 1 | 1 | no |
| procurement | loaded | 4899 | 42881 | 0 | 9 | 0 | no |
| attachments | loaded | 3882 | 6539 | 0 | 1 | 2 | no |
| reports | loaded | 2925 | 5586 | 0 | 8 | 12 | no |
| users | loaded | 4887 | 7544 | 0 | 1 | 1 | no |
| departments | loaded | 2906 | 5563 | 0 | 8 | 1 | no |
| roles | loaded | 3390 | 6048 | 0 | 19 | 1 | no |
| permissions | loaded | 2889 | 5546 | 0 | 0 | 1 | no |
| audit | loaded | 3403 | 6060 | 0 | 1 | 1 | no |
| settings | loaded | 3876 | 6534 | 0 | 1 | 3 | no |
| admin | loaded | 4392 | 7127 | 0 | 451 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-05T15:44:15.292Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4602 ms | 3429 ms | /د/س/ت/ر/س/ی/ /9/3/9/ /// /ر/و/ت/ر/ /2/4/8/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/3/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/8/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/2/8/m/s/×/1/ |
| /procurement/orders | 5179 ms | 3647 ms | /د/س/ت/ر/س/ی/ /1/3/5/4/ /// /ر/و/ت/ر/ /2/2/9/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/6/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/2/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/9/0/m/s/×/1/ |
| /procurement/needs | 4447 ms | 2812 ms | /د/س/ت/ر/س/ی/ /1/0/3/9/ /// /ر/و/ت/ر/ /1/7/7/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/7/3/m/s/×/1/,/ /g/e/t/A/l/l/:/2/7/6/m/s/×/1/,/ /g/e/t/A/l/l/:/2/3/6/m/s/×/1/ |
| /procurement/dashboard | 8137 ms | 6168 ms | /د/س/ت/ر/س/ی/ /2/2/0/0/ /// /ر/و/ت/ر/ /3/9/6/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/6/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/3/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/6/6/m/s/×/1/ |
| /procurement/workspace | 11627 ms | 8173 ms | /د/س/ت/ر/س/ی/ /3/5/4/6/ /// /ر/و/ت/ر/ /4/6/2/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/9/5/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/4/5/5/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/1/3/0/7/m/s/×/2/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

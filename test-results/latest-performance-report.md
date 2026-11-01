# PMS UI and Performance Audit

- Generated: 2026-11-01T11:23:47.496Z
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
| visibleButtonsInventoried | 161 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 311 |
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
| dashboard | loaded | 2442 | 5099 | 0 | 4 | 2 | no |
| projects | loaded | 3393 | 6050 | 0 | 1 | 2 | no |
| project-detail | loaded | 3374 | 6031 | 0 | 2 | 0 | no |
| events | loaded | 2889 | 5544 | 0 | 5 | 1 | no |
| workflows | loaded | 3905 | 6561 | 0 | 3 | 2 | no |
| project-statuses | loaded | 3905 | 6562 | 0 | 1 | 1 | no |
| event-types | loaded | 3401 | 6059 | 0 | 73 | 1 | no |
| information-types | loaded | 2875 | 5530 | 0 | 1 | 1 | no |
| procurement | loaded | 4902 | 40482 | 0 | 9 | 0 | no |
| attachments | loaded | 3380 | 6038 | 0 | 1 | 2 | no |
| reports | loaded | 3394 | 6054 | 0 | 8 | 12 | no |
| users | loaded | 3391 | 6049 | 0 | 21 | 1 | no |
| departments | loaded | 3444 | 6100 | 0 | 8 | 1 | no |
| roles | loaded | 3404 | 6061 | 0 | 19 | 1 | no |
| permissions | loaded | 3906 | 6560 | 0 | 0 | 1 | no |
| audit | loaded | 3424 | 6079 | 0 | 1 | 1 | no |
| settings | loaded | 3383 | 6039 | 0 | 1 | 3 | no |
| admin | loaded | 3889 | 6544 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T11:26:01.337Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7945 ms | 6538 ms | /د/س/ت/ر/س/ی/ /2/4/2/3/ /// /ر/و/ت/ر/ /4/1/1/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/2/6/5/m/s/×/1/,/ /g/e/t/A/l/l/:/8/2/5/m/s/×/1/,/ /g/e/t/A/l/l/:/6/1/2/m/s/×/1/ |
| /procurement/orders | 6322 ms | 4723 ms | /د/س/ت/ر/س/ی/ /1/6/0/8/ /// /ر/و/ت/ر/ /3/1/1/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/7/7/m/s/×/1/,/ /g/e/t/A/l/l/:/4/0/9/m/s/×/1/,/ /g/e/t/A/l/l/:/3/2/9/m/s/×/1/ |
| /procurement/needs | 4632 ms | 3372 ms | /د/س/ت/ر/س/ی/ /1/6/2/7/ /// /ر/و/ت/ر/ /1/7/4/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/2/9/m/s/×/1/,/ /g/e/t/A/l/l/:/4/9/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/6/7/m/s/×/1/ |
| /procurement/dashboard | 4090 ms | 2890 ms | /د/س/ت/ر/س/ی/ /1/3/1/1/ /// /ر/و/ت/ر/ /1/5/7/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/9/9/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/4/9/3/m/s/×/2/,/ /g/e/t/A/l/l/:/2/0/6/m/s/×/1/ |
| /procurement/workspace | 9731 ms | 2612 ms | /د/س/ت/ر/س/ی/ /9/9/5/ /// /ر/و/ت/ر/ /1/6/1/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/6/6/m/s/×/1/,/ /g/e/t/A/l/l/:/2/3/4/m/s/×/1/,/ /g/e/t/A/l/l/:/2/1/5/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

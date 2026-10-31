# PMS UI and Performance Audit

- Generated: 2026-10-31T09:21:25.350Z
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
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 166 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 300 |
| procurementApiRequestsMeasured | 7 |
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
| dashboard | loaded | 2485 | 5143 | 0 | 4 | 2 | no |
| projects | loaded | 3910 | 6567 | 0 | 13 | 2 | no |
| project-detail | loaded | 2905 | 5561 | 0 | 2 | 0 | no |
| events | loaded | 2910 | 5565 | 0 | 9 | 1 | no |
| workflows | loaded | 2441 | 5097 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3944 | 6599 | 0 | 9 | 1 | no |
| event-types | loaded | 4429 | 7091 | 0 | 65 | 1 | no |
| information-types | loaded | 2405 | 5060 | 0 | 10 | 1 | no |
| procurement | loaded | 2916 | 36348 | 0 | 9 | 0 | no |
| attachments | loaded | 3902 | 6560 | 0 | 1 | 2 | no |
| reports | loaded | 3417 | 6077 | 0 | 8 | 12 | no |
| users | loaded | 3903 | 6560 | 0 | 21 | 1 | no |
| departments | loaded | 2394 | 5050 | 0 | 8 | 1 | no |
| roles | loaded | 2924 | 5578 | 0 | 1 | 1 | no |
| permissions | loaded | 3924 | 6579 | 0 | 0 | 1 | no |
| audit | loaded | 4921 | 7578 | 0 | 1 | 1 | no |
| settings | loaded | 3454 | 6109 | 0 | 1 | 3 | no |
| admin | loaded | 2915 | 5571 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T09:23:34.382Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5363 ms | 3720 ms | /د/س/ت/ر/س/ی/ /1/2/1/8/ /// /ر/و/ت/ر/ /2/5/0/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/1/4/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/8/m/s/×/1/,/ /g/e/t/A/l/l/:/2/5/1/m/s/×/1/ |
| /procurement/orders | 5676 ms | 4465 ms | /د/س/ت/ر/س/ی/ /1/7/7/6/ /// /ر/و/ت/ر/ /2/6/8/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/8/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/0/8/m/s/×/1/ |
| /procurement/needs | 6998 ms | 5300 ms | /د/س/ت/ر/س/ی/ /1/6/3/7/ /// /ر/و/ت/ر/ /3/6/6/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/7/4/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/6/3/5/m/s/×/1/,/ /g/e/t/A/l/l/:/3/3/9/m/s/×/1/ |
| /procurement/dashboard | 6264 ms | 4860 ms | /د/س/ت/ر/س/ی/ /2/2/9/9/ /// /ر/و/ت/ر/ /2/5/6/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/1/5/m/s/×/1/,/ /g/e/t/A/l/l/:/6/6/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/5/9/m/s/×/1/ |
| /procurement/workspace | 5648 ms | 3969 ms | /د/س/ت/ر/س/ی/ /1/7/7/9/ /// /ر/و/ت/ر/ /2/1/9/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/7/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/3/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/8/8/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

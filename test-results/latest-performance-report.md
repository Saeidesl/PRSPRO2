# PMS UI and Performance Audit

- Generated: 2026-10-31T13:19:57.565Z
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
| visibleButtonsInventoried | 157 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 299 |
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
| dashboard | loaded | 4430 | 7089 | 0 | 4 | 2 | no |
| projects | loaded | 3888 | 6545 | 0 | 1 | 2 | no |
| project-detail | loaded | 3888 | 6543 | 0 | 2 | 0 | no |
| events | loaded | 3388 | 6042 | 0 | 9 | 1 | no |
| workflows | loaded | 4412 | 7067 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3903 | 6558 | 0 | 9 | 1 | no |
| event-types | loaded | 4395 | 7056 | 0 | 65 | 1 | no |
| information-types | loaded | 2898 | 5555 | 0 | 13 | 1 | no |
| procurement | loaded | 2891 | 32413 | 0 | 9 | 0 | no |
| attachments | loaded | 3376 | 6032 | 0 | 1 | 2 | no |
| reports | loaded | 3892 | 6551 | 0 | 8 | 12 | no |
| users | loaded | 2873 | 5531 | 0 | 21 | 1 | no |
| departments | loaded | 2874 | 5532 | 0 | 8 | 1 | no |
| roles | loaded | 3898 | 6553 | 0 | 1 | 1 | no |
| permissions | loaded | 3426 | 6082 | 0 | 0 | 1 | no |
| audit | loaded | 3380 | 6034 | 0 | 1 | 1 | no |
| settings | loaded | 3902 | 6557 | 0 | 1 | 3 | no |
| admin | loaded | 2872 | 5529 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T13:22:10.593Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5652 ms | 4390 ms | /د/س/ت/ر/س/ی/ /1/0/8/0/ /// /ر/و/ت/ر/ /3/3/1/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/7/9/m/s/×/1/,/ /g/e/t/A/l/l/:/5/5/1/m/s/×/1/,/ /g/e/t/A/l/l/:/5/2/3/m/s/×/1/ |
| /procurement/orders | 5458 ms | 3936 ms | /د/س/ت/ر/س/ی/ /1/4/7/3/ /// /ر/و/ت/ر/ /2/4/6/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/6/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/9/0/m/s/×/1/,/ /g/e/t/A/l/l/:/5/6/4/m/s/×/1/ |
| /procurement/needs | 5102 ms | 3818 ms | /د/س/ت/ر/س/ی/ /1/3/2/5/ /// /ر/و/ت/ر/ /2/4/9/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/0/5/m/s/×/1/,/ /g/e/t/A/l/l/:/4/8/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/8/7/m/s/×/1/ |
| /procurement/dashboard | 3165 ms | 2204 ms | /د/س/ت/ر/س/ی/ /7/0/1/ /// /ر/و/ت/ر/ /1/5/0/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/3/4/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/6/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/5/4/m/s/×/2/ |
| /procurement/workspace | 5654 ms | 3039 ms | /د/س/ت/ر/س/ی/ /1/1/1/0/ /// /ر/و/ت/ر/ /1/9/2/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/9/9/m/s/×/1/,/ /g/e/t/A/l/l/:/2/8/6/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/7/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

# PMS UI and Performance Audit

- Generated: 2026-11-02T10:15:12.856Z
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
| visibleButtonsInventoried | 82 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 269 |
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
| dashboard | loaded | 4402 | 7061 | 0 | 4 | 2 | no |
| projects | loaded | 4386 | 7043 | 0 | 1 | 2 | no |
| project-detail | loaded | 3374 | 6031 | 0 | 2 | 0 | no |
| print-design | loaded | 3376 | 6033 | 1 | 14 | 5 | no |
| print-output | loaded | 3386 | 6043 | 0 | 1 | 2 | no |
| events | loaded | 3875 | 6532 | 0 | 5 | 1 | no |
| workflows | loaded | 2883 | 5539 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2910 | 5567 | 0 | 1 | 1 | no |
| event-types | loaded | 2881 | 5539 | 0 | 1 | 1 | no |
| information-types | loaded | 4870 | 7527 | 0 | 1 | 1 | no |
| procurement | loaded | 3382 | 45206 | 0 | 9 | 0 | no |
| attachments | loaded | 3887 | 6543 | 0 | 1 | 2 | no |
| reports | loaded | 4898 | 7559 | 0 | 8 | 12 | no |
| users | loaded | 4369 | 7026 | 0 | 1 | 1 | no |
| departments | loaded | 5382 | 8036 | 0 | 8 | 1 | no |
| roles | loaded | 3374 | 6033 | 0 | 19 | 1 | no |
| permissions | loaded | 5404 | 8061 | 0 | 0 | 1 | no |
| audit | loaded | 5381 | 8037 | 0 | 1 | 1 | no |
| settings | loaded | 3363 | 6020 | 0 | 1 | 3 | no |
| admin | loaded | 4869 | 7526 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-02T10:17:50.463Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 9483 ms | 7851 ms | /د/س/ت/ر/س/ی/ /2/9/8/8/ /// /ر/و/ت/ر/ /4/8/6/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/3/3/2/m/s/×/1/,/ /g/e/t/A/l/l/:/8/1/4/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/7/4/1/m/s/×/2/ |
| /procurement/orders | 8786 ms | 7413 ms | /د/س/ت/ر/س/ی/ /1/6/7/2/ /// /ر/و/ت/ر/ /5/7/4/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/4/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/9/1/m/s/×/1/,/ /g/e/t/A/l/l/:/6/7/6/m/s/×/1/ |
| /procurement/needs | 6557 ms | 5019 ms | /د/س/ت/ر/س/ی/ /2/5/8/1/ /// /ر/و/ت/ر/ /2/4/3/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/0/8/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/1/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/0/0/m/s/×/1/ |
| /procurement/dashboard | 4393 ms | 3351 ms | /د/س/ت/ر/س/ی/ /1/2/8/7/ /// /ر/و/ت/ر/ /2/0/6/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/1/1/m/s/×/1/,/ /g/e/t/A/l/l/:/2/8/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/6/8/m/s/×/2/ |
| /procurement/workspace | 8638 ms | 4252 ms | /د/س/ت/ر/س/ی/ /1/7/1/4/ /// /ر/و/ت/ر/ /2/5/3/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/3/4/m/s/×/1/,/ /g/e/t/A/l/l/:/5/2/4/m/s/×/1/,/ /g/e/t/A/l/l/:/4/9/6/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

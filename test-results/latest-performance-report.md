# PMS UI and Performance Audit

- Generated: 2026-11-02T18:59:11.507Z
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
| visibleButtonsInventoried | 118 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 287 |
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
| dashboard | loaded | 3949 | 6610 | 0 | 4 | 2 | no |
| projects | loaded | 4430 | 7088 | 0 | 1 | 2 | no |
| project-detail | loaded | 2898 | 5556 | 0 | 2 | 0 | no |
| print-design | loaded | 2903 | 5562 | 1 | 14 | 5 | no |
| print-output | loaded | 3912 | 6569 | 0 | 1 | 2 | no |
| events | loaded | 3925 | 6583 | 0 | 5 | 1 | no |
| workflows | loaded | 3922 | 6580 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3421 | 6078 | 0 | 1 | 1 | no |
| event-types | loaded | 4401 | 7068 | 0 | 55 | 1 | no |
| information-types | loaded | 3400 | 6057 | 0 | 1 | 1 | no |
| procurement | loaded | 5448 | 38013 | 0 | 9 | 0 | no |
| attachments | loaded | 2895 | 5553 | 0 | 1 | 2 | no |
| reports | loaded | 4428 | 7092 | 0 | 8 | 12 | no |
| users | loaded | 3402 | 6059 | 0 | 1 | 1 | no |
| departments | loaded | 4402 | 7058 | 0 | 8 | 1 | no |
| roles | loaded | 3435 | 6094 | 0 | 1 | 1 | no |
| permissions | loaded | 3914 | 6570 | 0 | 0 | 1 | no |
| audit | loaded | 3405 | 6063 | 0 | 1 | 1 | no |
| settings | loaded | 2926 | 5581 | 0 | 1 | 3 | no |
| admin | loaded | 2405 | 5063 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-02T19:01:43.611Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5172 ms | 3368 ms | /د/س/ت/ر/س/ی/ /1/1/3/3/ /// /ر/و/ت/ر/ /2/2/3/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/6/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/4/1/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/3/6/7/m/s/×/3/ |
| /procurement/orders | 5183 ms | 3652 ms | /د/س/ت/ر/س/ی/ /1/2/1/4/ /// /ر/و/ت/ر/ /2/4/3/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/5/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/5/1/m/s/×/1/,/ /g/e/t/A/l/l/:/2/7/7/m/s/×/1/ |
| /procurement/needs | 5267 ms | 4129 ms | /د/س/ت/ر/س/ی/ /1/5/1/4/ /// /ر/و/ت/ر/ /2/6/1/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/2/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/9/4/m/s/×/2/,/ /g/e/t/A/l/l/:/3/4/4/m/s/×/1/ |
| /procurement/dashboard | 4560 ms | 2858 ms | /د/س/ت/ر/س/ی/ /1/0/9/4/ /// /ر/و/ت/ر/ /1/7/6/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/0/9/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/4/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/2/m/s/×/1/ |
| /procurement/workspace | 8902 ms | 4900 ms | /د/س/ت/ر/س/ی/ /1/8/1/3/ /// /ر/و/ت/ر/ /3/0/8/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/9/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/1/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/3/4/m/s/×/2/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

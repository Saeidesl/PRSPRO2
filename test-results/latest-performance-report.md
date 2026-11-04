# PMS UI and Performance Audit

- Generated: 2026-11-04T19:47:27.394Z
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
| visibleFormsInventoried | 9 |
| dynamicFormsInventoried | 8 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 283 |
| visibleInputsAndControlsInventoried | 39 |
| networkRequestsMeasured | 230 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 10 |
| failedSafeButtonChecks | 5 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2516 | 5177 | 0 | 4 | 2 | no |
| projects | loaded | 5442 | 8110 | 0 | 91 | 2 | no |
| project-detail | loaded | 2922 | 5577 | 0 | 2 | 0 | no |
| print-design | loaded | 4440 | 7102 | 1 | 14 | 5 | no |
| print-output | loaded | 5433 | 8092 | 0 | 1 | 2 | no |
| events | loaded | 2939 | 5599 | 0 | 37 | 1 | no |
| workflows | loaded | 3412 | 6069 | 0 | 1 | 2 | no |
| project-statuses | loaded | 8100 | 10756 | 0 | 0 | 0 | no |
| event-types | loaded | 2428 | 5089 | 0 | 55 | 1 | no |
| information-types | loaded | 2914 | 5574 | 0 | 34 | 1 | no |
| procurement | loaded | 4442 | 32305 | 0 | 9 | 0 | no |
| attachments | loaded | 2908 | 5567 | 0 | 20 | 2 | no |
| reports | loaded | 3442 | 6106 | 0 | 8 | 12 | no |
| users | loaded | 2911 | 5569 | 0 | 1 | 1 | no |
| departments | loaded | 3409 | 6068 | 0 | 1 | 1 | no |
| roles | loaded | 3910 | 6565 | 0 | 1 | 1 | no |
| permissions | loaded | 3944 | 6600 | 0 | 0 | 1 | no |
| audit | loaded | 8127 | 10782 | 0 | 0 | 0 | no |
| settings | loaded | 3409 | 6066 | 0 | 1 | 3 | no |
| admin | loaded | 3910 | 6568 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-04T19:50:01.750Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4821 ms | 3515 ms | /د/س/ت/ر/س/ی/ /1/5/1/8/ /// /ر/و/ت/ر/ /1/9/9/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/6/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/0/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/5/2/m/s/×/1/ |
| /procurement/orders | 4876 ms | 3636 ms | /د/س/ت/ر/س/ی/ /1/5/1/9/ /// /ر/و/ت/ر/ /2/1/1/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/3/7/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/3/8/8/m/s/×/2/,/ /g/e/t/A/l/l/:/3/2/0/m/s/×/1/ |
| /procurement/needs | 3826 ms | 2665 ms | /د/س/ت/ر/س/ی/ /1/0/3/7/ /// /ر/و/ت/ر/ /1/6/2/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/9/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/1/9/m/s/×/1/,/ /g/e/t/A/l/l/:/2/0/7/m/s/×/1/ |
| /procurement/dashboard | 4631 ms | 3420 ms | /د/س/ت/ر/س/ی/ /9/7/9/ /// /ر/و/ت/ر/ /2/4/4/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/7/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/0/0/m/s/×/1/,/ /g/e/t/A/l/l/:/4/6/5/m/s/×/1/ |
| /procurement/workspace | 5209 ms | 4233 ms | /د/س/ت/ر/س/ی/ /9/5/8/ /// /ر/و/ت/ر/ /3/2/7/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/0/9/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/0/2/9/m/s/×/1/,/ /g/e/t/A/l/l/:/6/8/3/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

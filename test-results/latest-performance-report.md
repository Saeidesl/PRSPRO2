# PMS UI and Performance Audit

- Generated: 2026-11-03T18:14:24.659Z
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
| visibleButtonsInventoried | 64 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 296 |
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
| dashboard | loaded | 4980 | 7639 | 0 | 4 | 2 | no |
| projects | loaded | 4929 | 7584 | 0 | 1 | 2 | no |
| project-detail | loaded | 4421 | 7080 | 0 | 2 | 0 | no |
| print-design | loaded | 3417 | 6078 | 1 | 14 | 5 | no |
| print-output | loaded | 4929 | 7585 | 0 | 1 | 2 | no |
| events | loaded | 3916 | 6574 | 0 | 5 | 1 | no |
| workflows | loaded | 2950 | 5609 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3438 | 6095 | 0 | 1 | 1 | no |
| event-types | loaded | 3425 | 6082 | 0 | 1 | 1 | no |
| information-types | loaded | 4441 | 7099 | 0 | 1 | 1 | no |
| procurement | loaded | 3944 | 39576 | 0 | 9 | 0 | no |
| attachments | loaded | 4413 | 7070 | 0 | 1 | 2 | no |
| reports | loaded | 4956 | 7618 | 0 | 8 | 12 | no |
| users | loaded | 3911 | 6568 | 0 | 1 | 1 | no |
| departments | loaded | 4412 | 7071 | 0 | 8 | 1 | no |
| roles | loaded | 3435 | 6089 | 0 | 1 | 1 | no |
| permissions | loaded | 2924 | 5579 | 0 | 0 | 1 | no |
| audit | loaded | 2912 | 5570 | 0 | 1 | 1 | no |
| settings | loaded | 4411 | 7069 | 0 | 1 | 3 | no |
| admin | loaded | 4919 | 7578 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-03T18:17:03.412Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6289 ms | 5083 ms | /د/س/ت/ر/س/ی/ /1/1/2/0/ /// /ر/و/ت/ر/ /3/9/6/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/5/3/m/s/×/1/,/ /g/e/t/A/l/l/:/4/9/5/m/s/×/1/,/ /g/e/t/A/l/l/:/4/3/0/m/s/×/1/ |
| /procurement/orders | 7340 ms | 5293 ms | /د/س/ت/ر/س/ی/ /1/7/6/1/ /// /ر/و/ت/ر/ /3/5/3/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/5/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/2/2/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/6/4/7/m/s/×/1/ |
| /procurement/needs | 5241 ms | 3996 ms | /د/س/ت/ر/س/ی/ /1/4/7/8/ /// /ر/و/ت/ر/ /2/5/1/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/1/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/2/6/m/s/×/1/,/ /g/e/t/A/l/l/:/5/1/5/m/s/×/1/ |
| /procurement/dashboard | 4630 ms | 3309 ms | /د/س/ت/ر/س/ی/ /1/4/3/0/ /// /ر/و/ت/ر/ /1/8/7/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/0/9/m/s/×/1/,/ /g/e/t/A/l/l/:/6/4/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/1/4/m/s/×/1/ |
| /procurement/workspace | 8659 ms | 4492 ms | /د/س/ت/ر/س/ی/ /1/9/0/8/ /// /ر/و/ت/ر/ /2/5/8/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/8/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/0/4/m/s/×/1/,/ /g/e/t/A/l/l/:/4/0/1/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

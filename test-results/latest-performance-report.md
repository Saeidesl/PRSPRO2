# PMS UI and Performance Audit

- Generated: 2026-11-04T20:09:23.182Z
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
| visibleButtonsInventoried | 285 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 312 |
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
| dashboard | loaded | 3433 | 6094 | 0 | 4 | 2 | no |
| projects | loaded | 5936 | 8600 | 0 | 91 | 2 | no |
| project-detail | loaded | 2908 | 5563 | 0 | 2 | 0 | no |
| print-design | loaded | 3910 | 6570 | 1 | 14 | 5 | no |
| print-output | loaded | 4413 | 7069 | 0 | 1 | 2 | no |
| events | loaded | 2909 | 5566 | 0 | 37 | 1 | no |
| workflows | loaded | 3899 | 6554 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3935 | 6592 | 0 | 9 | 1 | no |
| event-types | loaded | 4429 | 7091 | 0 | 55 | 1 | no |
| information-types | loaded | 2905 | 5563 | 0 | 1 | 1 | no |
| procurement | loaded | 3915 | 33877 | 0 | 9 | 0 | no |
| attachments | loaded | 4918 | 7576 | 0 | 20 | 2 | no |
| reports | loaded | 2930 | 5590 | 0 | 8 | 12 | no |
| users | loaded | 3913 | 6571 | 0 | 1 | 1 | no |
| departments | loaded | 3408 | 6064 | 0 | 8 | 1 | no |
| roles | loaded | 3428 | 6085 | 0 | 19 | 1 | no |
| permissions | loaded | 3433 | 6090 | 0 | 0 | 1 | no |
| audit | loaded | 3411 | 6068 | 0 | 1 | 1 | no |
| settings | loaded | 3411 | 6069 | 0 | 1 | 3 | no |
| admin | loaded | 3414 | 6069 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-04T20:11:48.892Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4524 ms | 3250 ms | /د/س/ت/ر/س/ی/ /8/7/3/ /// /ر/و/ت/ر/ /2/3/7/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/6/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/0/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/4/9/m/s/×/1/ |
| /procurement/orders | 4846 ms | 2782 ms | /د/س/ت/ر/س/ی/ /7/5/3/ /// /ر/و/ت/ر/ /2/0/2/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/4/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/6/9/m/s/×/1/,/ /g/e/t/A/l/l/:/3/5/0/m/s/×/1/ |
| /procurement/needs | 5027 ms | 3554 ms | /د/س/ت/ر/س/ی/ /1/3/4/8/ /// /ر/و/ت/ر/ /2/2/0/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/5/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/7/5/m/s/×/1/,/ /g/e/t/A/l/l/:/5/3/0/m/s/×/1/ |
| /procurement/dashboard | 4618 ms | 3088 ms | /د/س/ت/ر/س/ی/ /1/1/9/4/ /// /ر/و/ت/ر/ /1/8/9/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/3/7/m/s/×/1/,/ /g/e/t/A/l/l/:/4/2/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/6/3/m/s/×/1/ |
| /procurement/workspace | 6458 ms | 2815 ms | /د/س/ت/ر/س/ی/ /9/3/8/ /// /ر/و/ت/ر/ /1/8/7/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/1/3/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/4/4/3/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/3/3/4/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

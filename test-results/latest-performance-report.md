# PMS UI and Performance Audit

- Generated: 2026-11-05T05:27:46.281Z
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
| visibleButtonsInventoried | 193 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 303 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 12 |
| failedSafeButtonChecks | 2 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2993 | 5660 | 0 | 44 | 2 | no |
| projects | loaded | 2971 | 5626 | 0 | 1 | 2 | no |
| project-detail | loaded | 2917 | 5576 | 0 | 2 | 0 | no |
| print-design | loaded | 3936 | 6598 | 1 | 14 | 5 | no |
| print-output | loaded | 2920 | 5578 | 0 | 1 | 2 | no |
| events | loaded | 3421 | 6077 | 0 | 7 | 1 | no |
| workflows | loaded | 3404 | 6060 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2952 | 5610 | 0 | 1 | 1 | no |
| event-types | loaded | 3933 | 6596 | 0 | 55 | 1 | no |
| information-types | loaded | 3439 | 6098 | 0 | 34 | 1 | no |
| procurement | loaded | 2434 | 29392 | 0 | 9 | 0 | no |
| attachments | loaded | 3922 | 6580 | 0 | 1 | 2 | no |
| reports | loaded | 2944 | 5604 | 0 | 8 | 12 | no |
| users | loaded | 3915 | 6569 | 0 | 1 | 1 | no |
| departments | loaded | 3438 | 6095 | 0 | 8 | 1 | no |
| roles | loaded | 5448 | 8104 | 0 | 1 | 1 | no |
| permissions | loaded | 3949 | 6605 | 0 | 0 | 1 | no |
| audit | loaded | 3436 | 6090 | 0 | 1 | 1 | no |
| settings | loaded | 3431 | 6085 | 0 | 1 | 3 | no |
| admin | loaded | 3430 | 6086 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-05T05:30:01.993Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4498 ms | 2988 ms | /د/س/ت/ر/س/ی/ /9/0/0/ /// /ر/و/ت/ر/ /2/0/8/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/2/2/m/s/×/1/,/ /g/e/t/A/l/l/:/2/1/6/m/s/×/1/,/ /g/e/t/A/l/l/:/2/0/3/m/s/×/1/ |
| /procurement/orders | 5388 ms | 3566 ms | /د/س/ت/ر/س/ی/ /1/1/2/4/ /// /ر/و/ت/ر/ /2/4/4/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/9/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/8/1/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/7/2/m/s/×/1/ |
| /procurement/needs | 4310 ms | 2450 ms | /د/س/ت/ر/س/ی/ /1/0/0/0/ /// /ر/و/ت/ر/ /1/4/5/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/4/3/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/9/3/m/s/×/1/ |
| /procurement/dashboard | 3562 ms | 2172 ms | /د/س/ت/ر/س/ی/ /8/5/0/ /// /ر/و/ت/ر/ /1/3/2/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/0/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/8/7/m/s/×/1/,/ /g/e/t/A/l/l/:/1/8/7/m/s/×/1/ |
| /procurement/workspace | 5203 ms | 3453 ms | /د/س/ت/ر/س/ی/ /1/0/8/3/ /// /ر/و/ت/ر/ /2/3/7/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/7/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/0/1/m/s/×/1/,/ /g/e/t/A/l/l/:/4/5/8/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

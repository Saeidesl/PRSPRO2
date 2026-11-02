# PMS UI and Performance Audit

- Generated: 2026-11-02T07:27:45.275Z
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
| visibleButtonsInventoried | 182 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 300 |
| procurementApiRequestsMeasured | 7 |
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
| dashboard | loaded | 4446 | 7107 | 0 | 4 | 2 | no |
| projects | loaded | 2928 | 5586 | 0 | 1 | 2 | no |
| project-detail | loaded | 3423 | 6078 | 0 | 2 | 0 | no |
| print-design | loaded | 3914 | 6571 | 1 | 10 | 5 | no |
| print-output | loaded | 6427 | 9083 | 0 | 1 | 2 | no |
| events | loaded | 3919 | 6578 | 0 | 15 | 1 | no |
| workflows | loaded | 2936 | 5591 | 0 | 3 | 2 | no |
| project-statuses | loaded | 6460 | 9121 | 0 | 1 | 1 | no |
| event-types | loaded | 3429 | 6091 | 0 | 73 | 1 | no |
| information-types | loaded | 4950 | 7607 | 0 | 1 | 1 | no |
| procurement | loaded | 4433 | 33885 | 0 | 9 | 0 | no |
| attachments | loaded | 3918 | 6576 | 0 | 1 | 2 | no |
| reports | loaded | 3937 | 6599 | 0 | 8 | 12 | no |
| users | loaded | 3924 | 6584 | 0 | 21 | 1 | no |
| departments | loaded | 3409 | 6065 | 0 | 8 | 1 | no |
| roles | loaded | 3964 | 6621 | 0 | 19 | 1 | no |
| permissions | loaded | 3434 | 6088 | 0 | 0 | 1 | no |
| audit | loaded | 2405 | 5060 | 0 | 1 | 1 | no |
| settings | loaded | 3439 | 6096 | 0 | 1 | 3 | no |
| admin | loaded | 3909 | 6567 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-02T07:30:18.403Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6242 ms | 4497 ms | /د/س/ت/ر/س/ی/ /1/7/3/7/ /// /ر/و/ت/ر/ /2/7/5/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/1/8/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/6/6/9/m/s/×/2/,/ /g/e/t/A/l/l/:/4/6/5/m/s/×/1/ |
| /procurement/orders | 4713 ms | 3441 ms | /د/س/ت/ر/س/ی/ /1/4/6/8/ /// /ر/و/ت/ر/ /1/9/7/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/1/3/m/s/×/1/,/ /g/e/t/A/l/l/:/5/1/1/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/3/2/5/m/s/×/2/ |
| /procurement/needs | 4415 ms | 3264 ms | /د/س/ت/ر/س/ی/ /1/3/1/1/ /// /ر/و/ت/ر/ /1/9/5/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/5/3/m/s/×/1/,/ /g/e/t/A/l/l/:/4/9/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/0/7/m/s/×/1/ |
| /procurement/dashboard | 3694 ms | 2837 ms | /د/س/ت/ر/س/ی/ /9/7/1/ /// /ر/و/ت/ر/ /1/8/6/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/8/0/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/2/6/m/s/×/1/ |
| /procurement/workspace | 6406 ms | 2920 ms | /د/س/ت/ر/س/ی/ /1/0/2/7/ /// /ر/و/ت/ر/ /1/8/9/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/9/5/m/s/×/1/,/ /g/e/t/A/l/l/:/3/3/0/m/s/×/1/,/ /g/e/t/A/l/l/:/3/3/0/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

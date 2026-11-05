# PMS UI and Performance Audit

- Generated: 2026-11-05T15:21:00.802Z
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
| visibleButtonsInventoried | 159 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 373 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 46 |
| consoleErrors | 0 |
| pageErrors | 46 |
| safeButtonChecks | 12 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3942 | 6603 | 0 | 4 | 2 | no |
| projects | loaded | 4479 | 7137 | 0 | 1 | 2 | no |
| project-detail | loaded | 3920 | 6578 | 0 | 2 | 0 | no |
| print-design | loaded | 2915 | 3495 | 1 | 15 | 5 | no |
| print-output | loaded | 4440 | 4828 | 0 | 1 | 2 | no |
| events | loaded | 3416 | 6074 | 0 | 7 | 1 | no |
| workflows | loaded | 3417 | 6075 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4937 | 7594 | 0 | 1 | 1 | no |
| event-types | loaded | 3928 | 6596 | 0 | 55 | 1 | no |
| information-types | loaded | 3925 | 6582 | 0 | 1 | 1 | no |
| procurement | loaded | 3428 | 48773 | 0 | 9 | 0 | no |
| attachments | loaded | 3409 | 6067 | 0 | 1 | 2 | no |
| reports | loaded | 3929 | 6590 | 0 | 8 | 12 | no |
| users | loaded | 3947 | 6604 | 0 | 21 | 1 | no |
| departments | loaded | 3937 | 6592 | 0 | 8 | 1 | no |
| roles | loaded | 5436 | 8093 | 0 | 19 | 1 | no |
| permissions | loaded | 3928 | 6584 | 0 | 0 | 1 | no |
| audit | loaded | 3407 | 6066 | 0 | 1 | 1 | no |
| settings | loaded | 3916 | 6575 | 0 | 1 | 3 | no |
| admin | loaded | 4919 | 7577 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-05T15:23:44.308Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 9783 ms | 8127 ms | /د/س/ت/ر/س/ی/ /1/9/7/5/ /// /ر/و/ت/ر/ /6/1/5/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/1/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/0/9/6/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/9/6/1/m/s/×/3/ |
| /procurement/orders | 7071 ms | 5377 ms | /د/س/ت/ر/س/ی/ /1/9/7/9/ /// /ر/و/ت/ر/ /3/3/9/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/8/8/m/s/×/1/,/ /g/e/t/A/l/l/:/6/3/4/m/s/×/1/,/ /g/e/t/A/l/l/:/4/3/1/m/s/×/1/ |
| /procurement/needs | 6852 ms | 5050 ms | /د/س/ت/ر/س/ی/ /2/1/5/0/ /// /ر/و/ت/ر/ /2/9/0/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/3/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/6/2/m/s/×/1/,/ /g/e/t/A/l/l/:/6/9/7/m/s/×/1/ |
| /procurement/dashboard | 6588 ms | 4166 ms | /د/س/ت/ر/س/ی/ /1/3/6/8/ /// /ر/و/ت/ر/ /2/7/9/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/4/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/8/6/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/6/7/m/s/×/1/ |
| /procurement/workspace | 9565 ms | 5826 ms | /د/س/ت/ر/س/ی/ /2/1/8/0/ /// /ر/و/ت/ر/ /3/6/4/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/5/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/0/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/9/4/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

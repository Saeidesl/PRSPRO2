# PMS UI and Performance Audit

- Generated: 2026-11-01T13:44:39.695Z
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
| visibleFormsInventoried | 12 |
| dynamicFormsInventoried | 12 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 190 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 293 |
| procurementApiRequestsMeasured | 6 |
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
| dashboard | loaded | 3946 | 6605 | 0 | 4 | 2 | no |
| projects | loaded | 3405 | 6063 | 0 | 1 | 2 | no |
| project-detail | loaded | 3405 | 6059 | 0 | 2 | 0 | no |
| events | loaded | 3905 | 6561 | 0 | 15 | 1 | no |
| workflows | loaded | 3436 | 6094 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3917 | 6573 | 0 | 9 | 1 | no |
| event-types | loaded | 2909 | 5572 | 0 | 73 | 1 | no |
| information-types | loaded | 3397 | 6056 | 0 | 34 | 1 | no |
| procurement | loaded | 3419 | 33640 | 0 | 9 | 0 | no |
| attachments | loaded | 3419 | 6076 | 0 | 1 | 2 | no |
| reports | loaded | 2905 | 5565 | 0 | 8 | 12 | no |
| users | loaded | 3892 | 6549 | 0 | 1 | 1 | no |
| departments | loaded | 4426 | 7083 | 0 | 8 | 1 | no |
| roles | loaded | 3412 | 6069 | 0 | 19 | 1 | no |
| permissions | loaded | 3420 | 6075 | 0 | 0 | 1 | no |
| audit | loaded | 3915 | 6600 | 0 | 1 | 1 | no |
| settings | loaded | 2452 | 5108 | 0 | 1 | 3 | no |
| admin | loaded | 3895 | 6552 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T13:46:51.491Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6042 ms | 4685 ms | /د/س/ت/ر/س/ی/ /1/5/9/1/ /// /ر/و/ت/ر/ /3/0/9/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/7/2/m/s/×/1/,/ /g/e/t/A/l/l/:/4/4/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/5/5/m/s/×/1/ |
| /procurement/orders | 6577 ms | 4808 ms | /د/س/ت/ر/س/ی/ /1/4/1/7/ /// /ر/و/ت/ر/ /3/3/9/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/0/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/8/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/6/7/m/s/×/1/ |
| /procurement/needs | 3917 ms | 2860 ms | /د/س/ت/ر/س/ی/ /1/3/8/9/ /// /ر/و/ت/ر/ /1/4/7/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/7/6/m/s/×/1/,/ /g/e/t/A/l/l/:/3/0/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/9/9/m/s/×/1/ |
| /procurement/dashboard | 4035 ms | 2403 ms | /د/س/ت/ر/س/ی/ /9/3/4/ /// /ر/و/ت/ر/ /1/4/6/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/7/1/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/2/0/1/m/s/×/2/,/ /g/e/t/A/l/l/:/1/9/0/m/s/×/1/ |
| /procurement/workspace | 6171 ms | 3636 ms | /د/س/ت/ر/س/ی/ /1/5/1/5/ /// /ر/و/ت/ر/ /2/1/1/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/7/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/9/7/m/s/×/1/,/ /g/e/t/A/l/l/:/4/6/7/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

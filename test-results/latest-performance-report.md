# PMS UI and Performance Audit

- Generated: 2026-11-01T05:45:13.119Z
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
| visibleButtonsInventoried | 241 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 320 |
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
| dashboard | loaded | 3462 | 6123 | 0 | 24 | 2 | no |
| projects | loaded | 2917 | 5576 | 0 | 1 | 2 | no |
| project-detail | loaded | 2901 | 5558 | 0 | 2 | 0 | no |
| events | loaded | 2907 | 5563 | 0 | 5 | 1 | no |
| workflows | loaded | 2459 | 5114 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2918 | 5575 | 0 | 9 | 1 | no |
| event-types | loaded | 2418 | 5085 | 0 | 69 | 1 | no |
| information-types | loaded | 2900 | 5559 | 0 | 40 | 1 | no |
| procurement | loaded | 3946 | 35341 | 0 | 9 | 0 | no |
| attachments | loaded | 3405 | 6064 | 0 | 18 | 2 | no |
| reports | loaded | 2921 | 5581 | 0 | 8 | 12 | no |
| users | loaded | 3904 | 6563 | 0 | 21 | 1 | no |
| departments | loaded | 3937 | 6595 | 0 | 8 | 1 | no |
| roles | loaded | 3450 | 6109 | 0 | 19 | 1 | no |
| permissions | loaded | 3424 | 6080 | 0 | 0 | 1 | no |
| audit | loaded | 2909 | 5627 | 0 | 1 | 1 | no |
| settings | loaded | 2971 | 5626 | 0 | 1 | 3 | no |
| admin | loaded | 2938 | 5594 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T05:47:20.851Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4850 ms | 3757 ms | /د/س/ت/ر/س/ی/ /1/1/8/2/ /// /ر/و/ت/ر/ /2/5/7/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/4/2/m/s/×/1/,/ /g/e/t/A/l/l/:/3/2/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/5/4/m/s/×/1/ |
| /procurement/orders | 4495 ms | 3102 ms | /د/س/ت/ر/س/ی/ /1/1/5/3/ /// /ر/و/ت/ر/ /1/9/4/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/2/8/m/s/×/1/,/ /g/e/t/A/l/l/:/2/9/8/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/4/m/s/×/1/ |
| /procurement/needs | 5588 ms | 4068 ms | /د/س/ت/ر/س/ی/ /2/2/9/7/ /// /ر/و/ت/ر/ /1/7/7/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/4/2/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/1/6/6/m/s/×/1/,/ /g/e/t/A/l/l/:/3/7/0/m/s/×/1/ |
| /procurement/dashboard | 5243 ms | 4120 ms | /د/س/ت/ر/س/ی/ /2/6/3/7/ /// /ر/و/ت/ر/ /1/4/8/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/1/5/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/0/8/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/0/7/9/m/s/×/1/ |
| /procurement/workspace | 8342 ms | 4278 ms | /د/س/ت/ر/س/ی/ /1/6/5/3/ /// /ر/و/ت/ر/ /2/6/2/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/3/6/m/s/×/1/,/ /g/e/t/A/l/l/:/4/9/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/8/5/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

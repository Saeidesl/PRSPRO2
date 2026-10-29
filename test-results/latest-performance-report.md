# PMS UI and Performance Audit

- Generated: 2026-10-29T06:54:18.533Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **needs-attention**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 17 |
| loadedRoutes | 17 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 10 |
| dynamicFormsInventoried | 10 |
| formOpenersChecked | 12 |
| visibleButtonsInventoried | 118 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 356 |
| procurementApiRequestsMeasured | 7 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 20 |
| failedSafeButtonChecks | 5 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2970 | 5629 | 0 | 4 | 2 | no |
| projects | loaded | 3909 | 6566 | 0 | 1 | 2 | no |
| project-detail | loaded | 2908 | 5564 | 0 | 2 | 0 | no |
| events | loaded | 4411 | 7068 | 0 | 5 | 1 | no |
| workflows | loaded | 3428 | 6085 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2920 | 5577 | 0 | 9 | 1 | no |
| event-types | loaded | 2909 | 5569 | 0 | 43 | 1 | no |
| procurement | loaded | 2898 | 40278 | 0 | 9 | 0 | no |
| attachments | loaded | 4407 | 7064 | 0 | 1 | 2 | no |
| reports | loaded | 4424 | 7083 | 0 | 8 | 12 | no |
| users | loaded | 3909 | 6568 | 0 | 21 | 1 | no |
| departments | loaded | 3906 | 6563 | 0 | 8 | 1 | no |
| roles | loaded | 3448 | 6105 | 0 | 1 | 1 | no |
| permissions | loaded | 3427 | 6082 | 0 | 0 | 1 | no |
| audit | loaded | 4410 | 7066 | 0 | 1 | 1 | no |
| settings | loaded | 3910 | 6566 | 0 | 1 | 3 | no |
| admin | loaded | 3903 | 6559 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T06:56:20.476Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6973 ms | 5373 ms | /د/س/ت/ر/س/ی/ /1/8/2/6/ /// /ر/و/ت/ر/ /3/5/4/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/7/9/m/s/×/1/,/ /g/e/t/A/l/l/:/4/3/3/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/3/9/7/m/s/×/2/ |
| /procurement/orders | 7898 ms | 6549 ms | /د/س/ت/ر/س/ی/ /2/6/2/2/ /// /ر/و/ت/ر/ /3/9/2/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/9/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/0/8/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/8/0/0/m/s/×/1/ |
| /procurement/needs | 7372 ms | 5974 ms | /د/س/ت/ر/س/ی/ /2/3/1/1/ /// /ر/و/ت/ر/ /3/6/6/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/6/7/m/s/×/1/,/ /g/e/t/A/l/l/:/7/3/4/m/s/×/1/,/ /g/e/t/A/l/l/:/5/7/8/m/s/×/1/ |
| /procurement/dashboard | 4950 ms | 3662 ms | /د/س/ت/ر/س/ی/ /1/3/9/8/ /// /ر/و/ت/ر/ /2/2/6/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/1/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/3/9/m/s/×/1/ |
| /procurement/workspace | 6214 ms | 4490 ms | /د/س/ت/ر/س/ی/ /1/6/4/7/ /// /ر/و/ت/ر/ /2/8/4/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/0/6/m/s/×/1/,/ /g/e/t/A/l/l/:/5/9/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/6/5/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

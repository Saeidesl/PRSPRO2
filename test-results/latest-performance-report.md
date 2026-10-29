# PMS UI and Performance Audit

- Generated: 2026-10-29T14:19:55.497Z
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
| visibleButtonsInventoried | 104 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 319 |
| procurementApiRequestsMeasured | 6 |
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
| dashboard | loaded | 4390 | 7048 | 0 | 4 | 2 | no |
| projects | loaded | 3886 | 6541 | 0 | 10 | 2 | no |
| project-detail | loaded | 3382 | 6039 | 0 | 2 | 0 | no |
| events | loaded | 5885 | 8540 | 0 | 8 | 1 | no |
| workflows | loaded | 2387 | 5039 | 0 | 3 | 2 | no |
| project-statuses | loaded | 5401 | 8057 | 0 | 1 | 1 | no |
| event-types | loaded | 3886 | 6543 | 0 | 43 | 1 | no |
| procurement | loaded | 3368 | 43643 | 0 | 9 | 0 | no |
| attachments | loaded | 2876 | 5532 | 0 | 1 | 2 | no |
| reports | loaded | 2892 | 5549 | 0 | 8 | 12 | no |
| users | loaded | 4396 | 7053 | 0 | 1 | 1 | no |
| departments | loaded | 3873 | 6531 | 0 | 8 | 1 | no |
| roles | loaded | 3888 | 6544 | 0 | 1 | 1 | no |
| permissions | loaded | 3395 | 6050 | 0 | 0 | 1 | no |
| audit | loaded | 3889 | 6545 | 0 | 1 | 1 | no |
| settings | loaded | 4378 | 7035 | 0 | 1 | 3 | no |
| admin | loaded | 3373 | 6026 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T14:22:06.909Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7151 ms | 5646 ms | /د/س/ت/ر/س/ی/ /1/3/8/7/ /// /ر/و/ت/ر/ /4/2/5/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/0/8/5/m/s/×/1/,/ /g/e/t/A/l/l/:/5/8/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/0/6/m/s/×/1/ |
| /procurement/orders | 8553 ms | 6633 ms | /د/س/ت/ر/س/ی/ /2/3/9/6/ /// /ر/و/ت/ر/ /4/2/3/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/3/6/7/m/s/×/1/,/ /g/e/t/A/l/l/:/1/1/9/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/1/0/7/m/s/×/1/ |
| /procurement/needs | 5403 ms | 4349 ms | /د/س/ت/ر/س/ی/ /1/1/5/6/ /// /ر/و/ت/ر/ /3/1/9/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/9/0/m/s/×/1/,/ /g/e/t/A/l/l/:/6/5/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/6/8/m/s/×/1/ |
| /procurement/dashboard | 4690 ms | 3088 ms | /د/س/ت/ر/س/ی/ /1/0/4/5/ /// /ر/و/ت/ر/ /2/0/4/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/8/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/5/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/9/7/m/s/×/2/ |
| /procurement/workspace | 11489 ms | 5946 ms | /د/س/ت/ر/س/ی/ /3/1/6/0/ /// /ر/و/ت/ر/ /2/7/8/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/7/9/9/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/1/1/7/1/m/s/×/2/,/ /g/e/t/A/l/l/:/7/5/3/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

# PMS UI and Performance Audit

- Generated: 2026-11-01T08:33:56.435Z
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
| visibleButtonsInventoried | 254 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 333 |
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
| dashboard | loaded | 3477 | 6138 | 0 | 24 | 2 | no |
| projects | loaded | 3428 | 6089 | 0 | 31 | 2 | no |
| project-detail | loaded | 2429 | 5084 | 0 | 2 | 0 | no |
| events | loaded | 3932 | 6592 | 0 | 15 | 1 | no |
| workflows | loaded | 2455 | 5110 | 0 | 3 | 2 | no |
| project-statuses | loaded | 3940 | 6594 | 0 | 1 | 1 | no |
| event-types | loaded | 3433 | 6094 | 0 | 73 | 1 | no |
| information-types | loaded | 3413 | 6072 | 0 | 34 | 1 | no |
| procurement | loaded | 2924 | 26546 | 0 | 9 | 0 | no |
| attachments | loaded | 2908 | 5563 | 0 | 1 | 2 | no |
| reports | loaded | 3926 | 6585 | 0 | 8 | 12 | no |
| users | loaded | 2434 | 5094 | 0 | 21 | 1 | no |
| departments | loaded | 3952 | 6608 | 0 | 8 | 1 | no |
| roles | loaded | 2928 | 5586 | 0 | 19 | 1 | no |
| permissions | loaded | 2960 | 5615 | 0 | 0 | 1 | no |
| audit | loaded | 2421 | 5079 | 0 | 1 | 1 | no |
| settings | loaded | 2993 | 5649 | 0 | 1 | 3 | no |
| admin | loaded | 2415 | 5072 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T08:35:56.353Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4891 ms | 3589 ms | /د/س/ت/ر/س/ی/ /1/3/3/0/ /// /ر/و/ت/ر/ /2/2/5/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/9/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/8/8/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/6/m/s/×/1/ |
| /procurement/orders | 4409 ms | 2924 ms | /د/س/ت/ر/س/ی/ /1/5/2/6/ /// /ر/و/ت/ر/ /1/3/9/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/7/5/m/s/×/1/,/ /g/e/t/A/l/l/:/5/6/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/0/9/m/s/×/1/ |
| /procurement/needs | 4154 ms | 2458 ms | /د/س/ت/ر/س/ی/ /9/1/1/ /// /ر/و/ت/ر/ /1/5/4/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/1/3/m/s/×/1/,/ /g/e/t/A/l/l/:/2/7/4/m/s/×/1/,/ /g/e/t/A/l/l/:/2/0/6/m/s/×/1/ |
| /procurement/dashboard | 3173 ms | 1979 ms | /د/س/ت/ر/س/ی/ /7/5/7/ /// /ر/و/ت/ر/ /1/2/2/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/7/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/7/5/m/s/×/2/,/ /g/e/t/A/l/l/:/1/6/3/m/s/×/1/ |
| /procurement/workspace | 4286 ms | 2353 ms | /د/س/ت/ر/س/ی/ /6/9/9/ /// /ر/و/ت/ر/ /1/6/5/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/2/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/6/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/4/1/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

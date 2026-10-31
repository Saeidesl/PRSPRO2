# PMS UI and Performance Audit

- Generated: 2026-10-31T11:31:36.031Z
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
| visibleButtonsInventoried | 348 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 295 |
| procurementApiRequestsMeasured | 7 |
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
| dashboard | loaded | 3487 | 6147 | 0 | 4 | 2 | no |
| projects | loaded | 3451 | 6109 | 0 | 13 | 2 | no |
| project-detail | loaded | 3418 | 6073 | 0 | 2 | 0 | no |
| events | loaded | 3919 | 6577 | 0 | 9 | 1 | no |
| workflows | loaded | 4963 | 7620 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2940 | 5595 | 0 | 1 | 1 | no |
| event-types | loaded | 2933 | 5597 | 0 | 65 | 1 | no |
| information-types | loaded | 3412 | 6068 | 0 | 1 | 1 | no |
| procurement | loaded | 3940 | 37930 | 0 | 9 | 0 | no |
| attachments | loaded | 2919 | 5576 | 0 | 1 | 2 | no |
| reports | loaded | 2929 | 5589 | 0 | 8 | 12 | no |
| users | loaded | 3906 | 6568 | 0 | 1 | 1 | no |
| departments | loaded | 2939 | 5599 | 0 | 8 | 1 | no |
| roles | loaded | 3939 | 6598 | 0 | 19 | 1 | no |
| permissions | loaded | 3937 | 6593 | 0 | 0 | 1 | no |
| audit | loaded | 2448 | 5104 | 0 | 1 | 1 | no |
| settings | loaded | 2902 | 5558 | 0 | 1 | 3 | no |
| admin | loaded | 3415 | 6093 | 0 | 204 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T11:33:55.462Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5222 ms | 3790 ms | /د/س/ت/ر/س/ی/ /1/0/3/8/ /// /ر/و/ت/ر/ /2/7/5/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/8/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/2/4/m/s/×/1/,/ /g/e/t/A/l/l/:/4/0/0/m/s/×/1/ |
| /procurement/orders | 4968 ms | 3277 ms | /د/س/ت/ر/س/ی/ /1/1/2/3/ /// /ر/و/ت/ر/ /2/1/5/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/8/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/1/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/0/6/m/s/×/1/ |
| /procurement/needs | 4174 ms | 3182 ms | /د/س/ت/ر/س/ی/ /1/3/1/3/ /// /ر/و/ت/ر/ /1/8/6/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/7/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/8/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/4/3/m/s/×/2/ |
| /procurement/dashboard | 6883 ms | 5394 ms | /د/س/ت/ر/س/ی/ /1/9/6/7/ /// /ر/و/ت/ر/ /3/4/2/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/4/7/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/6/3/3/m/s/×/1/,/ /g/e/t/A/l/l/:/5/5/2/m/s/×/1/ |
| /procurement/workspace | 9251 ms | 4688 ms | /د/س/ت/ر/س/ی/ /1/5/1/9/ /// /ر/و/ت/ر/ /3/1/6/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/6/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/2/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/4/4/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

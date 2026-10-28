# PMS UI and Performance Audit

- Generated: 2026-10-28T18:36:50.204Z
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
| visibleButtonsInventoried | 201 |
| visibleInputsAndControlsInventoried | 32 |
| networkRequestsMeasured | 366 |
| procurementApiRequestsMeasured | 7 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 21 |
| failedSafeButtonChecks | 5 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 4509 | 7169 | 0 | 4 | 2 | no |
| projects | loaded | 5912 | 8566 | 0 | 1 | 2 | no |
| project-detail | loaded | 3904 | 6560 | 0 | 2 | 0 | no |
| events | loaded | 3905 | 6561 | 0 | 6 | 1 | no |
| workflows | loaded | 3409 | 6064 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2383 | 5039 | 0 | 1 | 1 | no |
| event-types | loaded | 3408 | 6068 | 0 | 43 | 1 | no |
| procurement | loaded | 2890 | 34548 | 0 | 9 | 0 | no |
| attachments | loaded | 3398 | 6055 | 0 | 1 | 2 | no |
| reports | loaded | 4927 | 7587 | 0 | 8 | 12 | no |
| users | loaded | 3418 | 6074 | 0 | 21 | 1 | no |
| departments | loaded | 3388 | 6043 | 0 | 8 | 1 | no |
| roles | loaded | 2415 | 5071 | 0 | 1 | 1 | no |
| permissions | loaded | 3917 | 6572 | 0 | 0 | 1 | no |
| audit | loaded | 3430 | 6087 | 0 | 1 | 1 | no |
| settings | loaded | 3414 | 6068 | 0 | 0 | 2 | no |
| admin | loaded | 4401 | 7066 | 0 | 92 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-28T18:38:50.565Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5509 ms | 4069 ms | /د/س/ت/ر/س/ی/ /1/2/1/4/ /// /ر/و/ت/ر/ /2/8/5/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/9/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/5/m/s/×/1/,/ /g/e/t/A/l/l/:/3/4/4/m/s/×/1/ |
| /procurement/orders | 3903 ms | 2504 ms | /د/س/ت/ر/س/ی/ /1/0/2/8/ /// /ر/و/ت/ر/ /1/4/7/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/7/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/3/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/1/5/m/s/×/2/ |
| /procurement/needs | 4276 ms | 3214 ms | /د/س/ت/ر/س/ی/ /1/2/9/0/ /// /ر/و/ت/ر/ /1/9/2/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/0/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/3/6/m/s/×/1/,/ /g/e/t/A/l/l/:/4/1/3/m/s/×/1/ |
| /procurement/dashboard | 5030 ms | 3653 ms | /د/س/ت/ر/س/ی/ /1/4/0/6/ /// /ر/و/ت/ر/ /2/2/4/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/1/5/m/s/×/1/,/ /g/e/t/A/l/l/:/5/8/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/6/3/m/s/×/1/ |
| /procurement/workspace | 10256 ms | 5133 ms | /د/س/ت/ر/س/ی/ /1/0/8/1/ /// /ر/و/ت/ر/ /4/0/5/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/2/2/1/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/9/6/m/s/×/1/,/ /g/e/t/A/l/l/:/2/3/9/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

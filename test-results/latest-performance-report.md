# PMS UI and Performance Audit

- Generated: 2026-10-30T17:36:15.546Z
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
| visibleButtonsInventoried | 123 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 329 |
| procurementApiRequestsMeasured | 8 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 20 |
| failedSafeButtonChecks | 4 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 5411 | 8070 | 0 | 4 | 2 | no |
| projects | loaded | 3377 | 6031 | 0 | 10 | 2 | no |
| project-detail | loaded | 3371 | 6027 | 0 | 2 | 0 | no |
| events | loaded | 2864 | 5521 | 0 | 8 | 1 | no |
| workflows | loaded | 3393 | 6048 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3375 | 6032 | 0 | 1 | 1 | no |
| event-types | loaded | 4430 | 7091 | 0 | 46 | 1 | no |
| procurement | loaded | 4370 | 39062 | 0 | 9 | 0 | no |
| attachments | loaded | 3865 | 6522 | 0 | 1 | 2 | no |
| reports | loaded | 8078 | 10736 | 0 | 8 | 12 | no |
| users | loaded | 2852 | 5508 | 0 | 1 | 1 | no |
| departments | loaded | 3856 | 6514 | 0 | 8 | 1 | no |
| roles | loaded | 3372 | 6027 | 0 | 19 | 1 | no |
| permissions | loaded | 3876 | 6531 | 0 | 0 | 1 | no |
| audit | loaded | 3884 | 6537 | 0 | 1 | 1 | no |
| settings | loaded | 3362 | 6017 | 0 | 1 | 3 | no |
| admin | loaded | 3362 | 6018 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-30T17:38:23.490Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6295 ms | 4815 ms | /د/س/ت/ر/س/ی/ /1/6/5/1/ /// /ر/و/ت/ر/ /3/1/6/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/0/9/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/4/1/4/m/s/×/2/,/ /g/e/t/A/l/l/:/3/3/4/m/s/×/1/ |
| /procurement/orders | 4842 ms | 3368 ms | /د/س/ت/ر/س/ی/ /1/7/1/3/ /// /ر/و/ت/ر/ /1/6/5/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/4/5/m/s/×/1/,/ /g/e/t/A/l/l/:/5/0/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/3/6/m/s/×/1/ |
| /procurement/needs | 5684 ms | 4076 ms | /د/س/ت/ر/س/ی/ /1/3/7/0/ /// /ر/و/ت/ر/ /2/7/0/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/4/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/9/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/9/2/m/s/×/1/ |
| /procurement/dashboard | 5779 ms | 4322 ms | /د/س/ت/ر/س/ی/ /2/0/4/3/ /// /ر/و/ت/ر/ /2/2/7/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/7/7/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/7/4/5/m/s/×/2/,/ /g/e/t/A/l/l/:/6/0/8/m/s/×/1/ |
| /procurement/workspace | 8623 ms | 3831 ms | /د/س/ت/ر/س/ی/ /1/5/5/4/ /// /ر/و/ت/ر/ /2/2/7/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/2/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/3/5/m/s/×/1/,/ /g/e/t/A/l/l/:/3/1/0/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

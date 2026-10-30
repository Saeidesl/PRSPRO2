# PMS UI and Performance Audit

- Generated: 2026-10-30T19:17:36.032Z
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
| visibleButtonsInventoried | 157 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 319 |
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
| dashboard | loaded | 4462 | 7120 | 0 | 10 | 2 | no |
| projects | loaded | 3413 | 6070 | 0 | 1 | 2 | no |
| project-detail | loaded | 3910 | 6568 | 0 | 2 | 0 | no |
| events | loaded | 2907 | 5566 | 0 | 22 | 1 | no |
| workflows | loaded | 2941 | 5596 | 0 | 3 | 2 | no |
| project-statuses | loaded | 3414 | 6068 | 0 | 1 | 1 | no |
| event-types | loaded | 3417 | 6077 | 0 | 46 | 1 | no |
| information-types | loaded | 3899 | 6554 | 0 | 1 | 1 | no |
| procurement | loaded | 3417 | 36453 | 0 | 9 | 0 | no |
| attachments | loaded | 4400 | 7055 | 0 | 1 | 2 | no |
| reports | loaded | 2920 | 5580 | 0 | 8 | 12 | no |
| users | loaded | 3401 | 6058 | 0 | 21 | 1 | no |
| departments | loaded | 3425 | 6081 | 0 | 8 | 1 | no |
| roles | loaded | 4933 | 7591 | 0 | 19 | 1 | no |
| permissions | loaded | 2929 | 5584 | 0 | 0 | 1 | no |
| audit | loaded | 3900 | 6556 | 0 | 1 | 1 | no |
| settings | loaded | 2400 | 5056 | 0 | 1 | 3 | no |
| admin | loaded | 2927 | 5583 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-30T19:19:49.559Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6738 ms | 5310 ms | /د/س/ت/ر/س/ی/ /1/4/7/2/ /// /ر/و/ت/ر/ /3/8/3/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/2/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/5/3/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/5/9/6/m/s/×/1/ |
| /procurement/orders | 4607 ms | 3609 ms | /د/س/ت/ر/س/ی/ /1/1/4/0/ /// /ر/و/ت/ر/ /2/4/6/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/1/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/5/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/4/0/m/s/×/1/ |
| /procurement/needs | 5594 ms | 4463 ms | /د/س/ت/ر/س/ی/ /1/8/9/7/ /// /ر/و/ت/ر/ /2/5/6/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/3/7/m/s/×/1/,/ /g/e/t/A/l/l/:/5/4/4/m/s/×/1/,/ /g/e/t/A/l/l/:/4/8/8/m/s/×/1/ |
| /procurement/dashboard | 5177 ms | 3793 ms | /د/س/ت/ر/س/ی/ /1/7/2/4/ /// /ر/و/ت/ر/ /2/0/6/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/1/1/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/8/3/m/s/×/1/,/ /g/e/t/A/l/l/:/4/1/8/m/s/×/1/ |
| /procurement/workspace | 7435 ms | 4129 ms | /د/س/ت/ر/س/ی/ /1/5/1/7/ /// /ر/و/ت/ر/ /2/6/1/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/3/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/1/7/5/m/s/×/1/,/ /g/e/t/A/l/l/:/6/8/8/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

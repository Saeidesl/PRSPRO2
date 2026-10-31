# PMS UI and Performance Audit

- Generated: 2026-10-31T11:00:39.997Z
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
| visibleButtonsInventoried | 387 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 313 |
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
| dashboard | loaded | 3483 | 6143 | 0 | 4 | 2 | no |
| projects | loaded | 2422 | 5080 | 0 | 13 | 2 | no |
| project-detail | loaded | 3433 | 6091 | 0 | 2 | 0 | no |
| events | loaded | 2923 | 5580 | 0 | 9 | 1 | no |
| workflows | loaded | 2939 | 5597 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3435 | 6094 | 0 | 9 | 1 | no |
| event-types | loaded | 2958 | 5621 | 0 | 65 | 1 | no |
| information-types | loaded | 2907 | 5565 | 0 | 13 | 1 | no |
| procurement | loaded | 2920 | 34103 | 0 | 9 | 0 | no |
| attachments | loaded | 3413 | 6069 | 0 | 1 | 2 | no |
| reports | loaded | 4428 | 7091 | 0 | 8 | 12 | no |
| users | loaded | 3937 | 6595 | 0 | 21 | 1 | no |
| departments | loaded | 2961 | 5616 | 0 | 8 | 1 | no |
| roles | loaded | 2924 | 5582 | 0 | 19 | 1 | no |
| permissions | loaded | 2427 | 5083 | 0 | 0 | 1 | no |
| audit | loaded | 3415 | 6070 | 0 | 1 | 1 | no |
| settings | loaded | 3400 | 6055 | 0 | 1 | 3 | no |
| admin | loaded | 3404 | 6089 | 0 | 203 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T11:02:48.926Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4598 ms | 3154 ms | /د/س/ت/ر/س/ی/ /1/2/8/9/ /// /ر/و/ت/ر/ /1/8/6/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/7/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/3/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/0/4/m/s/×/1/ |
| /procurement/orders | 6578 ms | 5039 ms | /د/س/ت/ر/س/ی/ /2/0/4/4/ /// /ر/و/ت/ر/ /2/9/9/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/6/5/m/s/×/1/,/ /g/e/t/A/l/l/:/7/6/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/4/9/m/s/×/1/ |
| /procurement/needs | 4896 ms | 3455 ms | /د/س/ت/ر/س/ی/ /1/4/1/8/ /// /ر/و/ت/ر/ /2/0/3/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/7/4/m/s/×/1/,/ /g/e/t/A/l/l/:/3/3/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/1/4/m/s/×/1/ |
| /procurement/dashboard | 4491 ms | 3101 ms | /د/س/ت/ر/س/ی/ /8/6/8/ /// /ر/و/ت/ر/ /2/2/3/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/0/6/m/s/×/1/,/ /g/e/t/A/l/l/:/1/9/7/m/s/×/1/,/ /g/e/t/A/l/l/:/1/9/5/m/s/×/1/ |
| /procurement/workspace | 7913 ms | 4049 ms | /د/س/ت/ر/س/ی/ /1/4/2/3/ /// /ر/و/ت/ر/ /2/6/2/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/4/3/m/s/×/1/,/ /g/e/t/A/l/l/:/6/3/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/5/8/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

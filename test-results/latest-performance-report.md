# PMS UI and Performance Audit

- Generated: 2026-10-28T18:17:55.058Z
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
| visibleButtonsInventoried | 116 |
| visibleInputsAndControlsInventoried | 32 |
| networkRequestsMeasured | 341 |
| procurementApiRequestsMeasured | 7 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 20 |
| failedSafeButtonChecks | 6 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2886 | 5543 | 0 | 5 | 2 | no |
| projects | loaded | 3384 | 6039 | 0 | 1 | 2 | no |
| project-detail | loaded | 2866 | 5524 | 0 | 2 | 0 | no |
| events | loaded | 2875 | 5533 | 0 | 5 | 1 | no |
| workflows | loaded | 3896 | 6551 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2393 | 5049 | 0 | 9 | 1 | no |
| event-types | loaded | 2885 | 5543 | 0 | 43 | 1 | no |
| procurement | loaded | 3873 | 33974 | 0 | 9 | 0 | no |
| attachments | loaded | 3369 | 6025 | 0 | 1 | 2 | no |
| reports | loaded | 4395 | 7053 | 0 | 8 | 12 | no |
| users | loaded | 4876 | 7531 | 0 | 1 | 1 | no |
| departments | loaded | 3366 | 6023 | 0 | 8 | 1 | no |
| roles | loaded | 2381 | 5036 | 0 | 19 | 1 | no |
| permissions | loaded | 3887 | 6543 | 0 | 0 | 1 | no |
| audit | loaded | 3882 | 6537 | 0 | 1 | 1 | no |
| settings | loaded | 3375 | 6028 | 0 | 0 | 2 | no |
| admin | loaded | 3370 | 6024 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-28T18:19:46.819Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4838 ms | 3341 ms | /د/س/ت/ر/س/ی/ /9/1/4/ /// /ر/و/ت/ر/ /2/4/2/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/7/8/m/s/×/1/,/ /g/e/t/A/l/l/:/5/1/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/3/7/m/s/×/1/ |
| /procurement/orders | 4601 ms | 3316 ms | /د/س/ت/ر/س/ی/ /1/9/3/5/ /// /ر/و/ت/ر/ /1/3/8/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/0/1/9/m/s/×/1/,/ /g/e/t/A/l/l/:/3/8/1/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/3/1/8/m/s/×/2/ |
| /procurement/needs | 4409 ms | 2903 ms | /د/س/ت/ر/س/ی/ /1/5/6/7/ /// /ر/و/ت/ر/ /1/3/3/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/4/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/6/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/4/0/m/s/×/1/ |
| /procurement/dashboard | 4985 ms | 3735 ms | /د/س/ت/ر/س/ی/ /1/8/7/7/ /// /ر/و/ت/ر/ /1/8/5/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/9/3/m/s/×/1/,/ /g/e/t/A/l/l/:/6/9/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/3/7/m/s/×/1/ |
| /procurement/workspace | 8281 ms | 3998 ms | /د/س/ت/ر/س/ی/ /1/5/0/0/ /// /ر/و/ت/ر/ /2/4/9/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/5/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/6/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/8/3/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

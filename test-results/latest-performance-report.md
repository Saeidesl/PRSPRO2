# PMS UI and Performance Audit

- Generated: 2026-11-02T10:38:23.755Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **needs-attention**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 20 |
| loadedRoutes | 20 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 13 |
| dynamicFormsInventoried | 12 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 92 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 303 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 12 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2876 | 5534 | 0 | 4 | 2 | no |
| projects | loaded | 3370 | 6027 | 0 | 1 | 2 | no |
| project-detail | loaded | 3372 | 6025 | 0 | 2 | 0 | no |
| print-design | loaded | 3884 | 6543 | 1 | 14 | 5 | no |
| print-output | loaded | 3865 | 6521 | 0 | 1 | 2 | no |
| events | loaded | 4875 | 7533 | 0 | 15 | 1 | no |
| workflows | loaded | 2883 | 5539 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4382 | 7039 | 0 | 1 | 1 | no |
| event-types | loaded | 3370 | 6026 | 0 | 1 | 1 | no |
| information-types | loaded | 3383 | 6040 | 0 | 1 | 1 | no |
| procurement | loaded | 3882 | 43248 | 0 | 9 | 0 | no |
| attachments | loaded | 4373 | 7027 | 0 | 1 | 2 | no |
| reports | loaded | 6395 | 9054 | 0 | 8 | 12 | no |
| users | loaded | 3362 | 6017 | 0 | 1 | 1 | no |
| departments | loaded | 3889 | 6545 | 0 | 8 | 1 | no |
| roles | loaded | 4396 | 7051 | 0 | 19 | 1 | no |
| permissions | loaded | 4903 | 7561 | 0 | 0 | 1 | no |
| audit | loaded | 3374 | 6088 | 0 | 1 | 1 | no |
| settings | loaded | 6446 | 9102 | 0 | 1 | 3 | no |
| admin | loaded | 4878 | 7537 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-02T10:41:03.482Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7640 ms | 5537 ms | /د/س/ت/ر/س/ی/ /1/4/2/1/ /// /ر/و/ت/ر/ /4/1/1/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/8/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/1/8/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/1/2/m/s/×/1/ |
| /procurement/orders | 5518 ms | 4264 ms | /د/س/ت/ر/س/ی/ /1/6/8/2/ /// /ر/و/ت/ر/ /2/5/8/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/8/5/m/s/×/1/,/ /g/e/t/A/l/l/:/5/5/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/6/7/m/s/×/1/ |
| /procurement/needs | 8102 ms | 6510 ms | /د/س/ت/ر/س/ی/ /2/6/4/3/ /// /ر/و/ت/ر/ /3/8/6/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/1/1/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/8/2/m/s/×/1/,/ /g/e/t/A/l/l/:/9/7/5/m/s/×/1/ |
| /procurement/dashboard | 5870 ms | 4413 ms | /د/س/ت/ر/س/ی/ /1/1/6/5/ /// /ر/و/ت/ر/ /3/2/4/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/1/2/0/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/1/0/1/3/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/4/6/9/m/s/×/1/ |
| /procurement/workspace | 9265 ms | 4958 ms | /د/س/ت/ر/س/ی/ /1/6/5/0/ /// /ر/و/ت/ر/ /3/3/0/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/3/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/1/5/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/1/3/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

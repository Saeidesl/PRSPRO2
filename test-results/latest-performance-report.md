# PMS UI and Performance Audit

- Generated: 2026-10-30T19:42:58.290Z
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
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 98 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 269 |
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
| dashboard | loaded | 3470 | 6129 | 0 | 4 | 2 | no |
| projects | loaded | 4923 | 7582 | 0 | 1 | 2 | no |
| project-detail | loaded | 3419 | 6078 | 0 | 2 | 0 | no |
| events | loaded | 3927 | 6584 | 0 | 9 | 1 | no |
| workflows | loaded | 3981 | 6638 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4452 | 7109 | 0 | 1 | 1 | no |
| event-types | loaded | 3430 | 6093 | 0 | 46 | 1 | no |
| information-types | loaded | 4435 | 7093 | 0 | 1 | 1 | no |
| procurement | loaded | 3929 | 52040 | 0 | 9 | 0 | no |
| attachments | loaded | 5916 | 8572 | 0 | 1 | 2 | no |
| reports | loaded | 4933 | 7595 | 0 | 8 | 12 | no |
| users | loaded | 3910 | 6568 | 0 | 1 | 1 | no |
| departments | loaded | 4405 | 7061 | 0 | 8 | 1 | no |
| roles | loaded | 3430 | 6086 | 0 | 1 | 1 | no |
| permissions | loaded | 4971 | 7629 | 0 | 0 | 1 | no |
| audit | loaded | 4927 | 7584 | 0 | 1 | 1 | no |
| settings | loaded | 3432 | 6089 | 0 | 1 | 3 | no |
| admin | loaded | 3913 | 6570 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-30T19:45:36.734Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 12532 ms | 10915 ms | /د/س/ت/ر/س/ی/ /2/4/8/2/ /// /ر/و/ت/ر/ /8/4/3/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/6/5/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/4/0/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/0/4/9/m/s/×/2/ |
| /procurement/orders | 6272 ms | 4795 ms | /د/س/ت/ر/س/ی/ /1/7/7/1/ /// /ر/و/ت/ر/ /3/0/2/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/9/2/m/s/×/1/,/ /g/e/t/A/l/l/:/5/2/2/m/s/×/1/,/ /g/e/t/A/l/l/:/4/4/2/m/s/×/1/ |
| /procurement/needs | 8540 ms | 6737 ms | /د/س/ت/ر/س/ی/ /2/7/1/9/ /// /ر/و/ت/ر/ /4/0/1/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/2/9/m/s/×/1/,/ /g/e/t/A/l/l/:/6/8/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/6/4/m/s/×/2/ |
| /procurement/dashboard | 6491 ms | 5443 ms | /د/س/ت/ر/س/ی/ /1/8/0/8/ /// /ر/و/ت/ر/ /3/6/3/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/8/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/8/1/1/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/7/0/0/m/s/×/1/ |
| /procurement/workspace | 9288 ms | 4793 ms | /د/س/ت/ر/س/ی/ /2/1/3/1/ /// /ر/و/ت/ر/ /2/6/6/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/9/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/6/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/9/4/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

# PMS UI and Performance Audit

- Generated: 2026-11-01T08:26:59.075Z
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
| visibleButtonsInventoried | 468 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 324 |
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
| dashboard | loaded | 2893 | 5552 | 0 | 24 | 2 | no |
| projects | loaded | 2894 | 5550 | 0 | 1 | 2 | no |
| project-detail | loaded | 3887 | 6544 | 0 | 2 | 0 | no |
| events | loaded | 3379 | 6037 | 0 | 15 | 1 | no |
| workflows | loaded | 3422 | 6077 | 0 | 3 | 2 | no |
| project-statuses | loaded | 3394 | 6051 | 0 | 9 | 1 | no |
| event-types | loaded | 2891 | 5553 | 0 | 73 | 1 | no |
| information-types | loaded | 2403 | 5060 | 0 | 1 | 1 | no |
| procurement | loaded | 2897 | 32768 | 0 | 9 | 0 | no |
| attachments | loaded | 2875 | 5531 | 0 | 1 | 2 | no |
| reports | loaded | 3895 | 6552 | 0 | 8 | 12 | no |
| users | loaded | 2876 | 5532 | 0 | 21 | 1 | no |
| departments | loaded | 4929 | 7585 | 0 | 8 | 1 | no |
| roles | loaded | 2909 | 5566 | 0 | 19 | 1 | no |
| permissions | loaded | 3903 | 6558 | 0 | 0 | 1 | no |
| audit | loaded | 3883 | 6540 | 0 | 1 | 1 | no |
| settings | loaded | 3488 | 5928 | 0 | 1 | 3 | no |
| admin | loaded | 3375 | 6055 | 0 | 272 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T08:29:03.659Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4870 ms | 3624 ms | /د/س/ت/ر/س/ی/ /1/1/2/0/ /// /ر/و/ت/ر/ /2/5/0/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/0/3/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/4/1/m/s/×/1/ |
| /procurement/orders | 4156 ms | 2817 ms | /د/س/ت/ر/س/ی/ /1/1/0/8/ /// /ر/و/ت/ر/ /1/7/0/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/7/4/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/3/1/m/s/×/1/ |
| /procurement/needs | 4082 ms | 2342 ms | /د/س/ت/ر/س/ی/ /7/9/6/ /// /ر/و/ت/ر/ /1/5/4/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/3/5/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/8/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/7/7/m/s/×/1/ |
| /procurement/dashboard | 4828 ms | 3492 ms | /د/س/ت/ر/س/ی/ /1/1/5/7/ /// /ر/و/ت/ر/ /2/3/3/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/8/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/7/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/3/5/m/s/×/1/ |
| /procurement/workspace | 9247 ms | 5388 ms | /د/س/ت/ر/س/ی/ /2/0/6/7/ /// /ر/و/ت/ر/ /3/3/2/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/1/1/2/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/1/0/0/2/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/7/5/5/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

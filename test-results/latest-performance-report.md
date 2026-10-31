# PMS UI and Performance Audit

- Generated: 2026-10-31T16:17:49.993Z
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
| visibleButtonsInventoried | 379 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 307 |
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
| dashboard | loaded | 2443 | 5102 | 0 | 4 | 2 | no |
| projects | loaded | 2884 | 5541 | 0 | 1 | 2 | no |
| project-detail | loaded | 3387 | 6043 | 0 | 2 | 0 | no |
| events | loaded | 4391 | 7048 | 0 | 10 | 1 | no |
| workflows | loaded | 3394 | 6049 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2888 | 5543 | 0 | 9 | 1 | no |
| event-types | loaded | 2384 | 5046 | 0 | 69 | 1 | no |
| information-types | loaded | 3389 | 6045 | 0 | 1 | 1 | no |
| procurement | loaded | 2389 | 26980 | 0 | 9 | 0 | no |
| attachments | loaded | 2377 | 5035 | 0 | 1 | 2 | no |
| reports | loaded | 4404 | 7062 | 0 | 8 | 12 | no |
| users | loaded | 2377 | 5034 | 0 | 21 | 1 | no |
| departments | loaded | 3378 | 6035 | 0 | 8 | 1 | no |
| roles | loaded | 3898 | 6553 | 0 | 1 | 1 | no |
| permissions | loaded | 2889 | 5543 | 0 | 0 | 1 | no |
| audit | loaded | 3382 | 6035 | 0 | 1 | 1 | no |
| settings | loaded | 3377 | 6032 | 0 | 1 | 3 | no |
| admin | loaded | 2875 | 5550 | 0 | 232 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T16:19:49.198Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 3964 ms | 2528 ms | /د/س/ت/ر/س/ی/ /9/6/2/ /// /ر/و/ت/ر/ /1/5/6/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/9/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/4/0/m/s/×/1/,/ /g/e/t/A/l/l/:/3/1/5/m/s/×/1/ |
| /procurement/orders | 4219 ms | 2758 ms | /د/س/ت/ر/س/ی/ /1/1/3/7/ /// /ر/و/ت/ر/ /1/6/2/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/3/7/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/4/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/1/3/m/s/×/1/ |
| /procurement/needs | 3546 ms | 2548 ms | /د/س/ت/ر/س/ی/ /9/9/5/ /// /ر/و/ت/ر/ /1/5/5/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/2/2/m/s/×/1/,/ /g/e/t/A/l/l/:/2/3/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/9/8/m/s/×/1/ |
| /procurement/dashboard | 4106 ms | 3072 ms | /د/س/ت/ر/س/ی/ /1/2/7/5/ /// /ر/و/ت/ر/ /1/7/9/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/1/1/m/s/×/1/,/ /g/e/t/A/l/l/:/4/6/4/m/s/×/1/,/ /g/e/t/A/l/l/:/3/5/7/m/s/×/1/ |
| /procurement/workspace | 5892 ms | 3041 ms | /د/س/ت/ر/س/ی/ /1/3/5/0/ /// /ر/و/ت/ر/ /1/6/9/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/0/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/4/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/1/0/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

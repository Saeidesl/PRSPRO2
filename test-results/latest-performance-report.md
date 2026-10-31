# PMS UI and Performance Audit

- Generated: 2026-10-31T17:12:24.841Z
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
| visibleButtonsInventoried | 327 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 292 |
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
| dashboard | loaded | 3409 | 6066 | 0 | 4 | 2 | no |
| projects | loaded | 3385 | 6043 | 0 | 1 | 2 | no |
| project-detail | loaded | 2372 | 5029 | 0 | 2 | 0 | no |
| events | loaded | 3374 | 6030 | 0 | 5 | 1 | no |
| workflows | loaded | 2895 | 5552 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2913 | 5569 | 0 | 1 | 1 | no |
| event-types | loaded | 3386 | 6040 | 0 | 1 | 1 | no |
| information-types | loaded | 3877 | 6531 | 0 | 1 | 1 | no |
| procurement | loaded | 3381 | 32912 | 0 | 9 | 0 | no |
| attachments | loaded | 3372 | 6027 | 0 | 11 | 2 | no |
| reports | loaded | 2875 | 5534 | 0 | 8 | 12 | no |
| users | loaded | 3363 | 6019 | 0 | 21 | 1 | no |
| departments | loaded | 2877 | 5533 | 0 | 8 | 1 | no |
| roles | loaded | 3883 | 6539 | 0 | 19 | 1 | no |
| permissions | loaded | 4393 | 7048 | 0 | 0 | 1 | no |
| audit | loaded | 3370 | 6024 | 0 | 1 | 1 | no |
| settings | loaded | 2879 | 5534 | 0 | 1 | 3 | no |
| admin | loaded | 3358 | 6033 | 0 | 233 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T17:14:31.030Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 3717 ms | 2562 ms | /د/س/ت/ر/س/ی/ /8/5/0/ /// /ر/و/ت/ر/ /1/7/1/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/6/4/m/s/×/1/,/ /g/e/t/A/l/l/:/1/7/6/m/s/×/1/,/ /g/e/t/A/l/l/:/1/7/3/m/s/×/1/ |
| /procurement/orders | 6904 ms | 4910 ms | /د/س/ت/ر/س/ی/ /2/5/3/0/ /// /ر/و/ت/ر/ /2/3/8/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/7/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/6/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/7/0/m/s/×/1/ |
| /procurement/needs | 3773 ms | 2491 ms | /د/س/ت/ر/س/ی/ /9/4/9/ /// /ر/و/ت/ر/ /1/5/4/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/3/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/9/8/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/2/0/3/m/s/×/1/ |
| /procurement/dashboard | 4568 ms | 3122 ms | /د/س/ت/ر/س/ی/ /1/2/5/4/ /// /ر/و/ت/ر/ /1/8/6/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/9/2/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/9/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/5/m/s/×/1/ |
| /procurement/workspace | 7874 ms | 3638 ms | /د/س/ت/ر/س/ی/ /1/2/6/8/ /// /ر/و/ت/ر/ /2/3/7/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/4/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/0/8/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/6/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

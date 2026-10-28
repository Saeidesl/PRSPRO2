# PMS UI and Performance Audit

- Generated: 2026-10-28T17:51:13.616Z
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
| visibleButtonsInventoried | 121 |
| visibleInputsAndControlsInventoried | 32 |
| networkRequestsMeasured | 349 |
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
| dashboard | loaded | 3472 | 6131 | 0 | 5 | 2 | no |
| projects | loaded | 2905 | 5562 | 0 | 5 | 2 | no |
| project-detail | loaded | 2397 | 5052 | 0 | 2 | 0 | no |
| events | loaded | 3418 | 6076 | 0 | 6 | 1 | no |
| workflows | loaded | 2913 | 5571 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2919 | 5574 | 0 | 9 | 1 | no |
| event-types | loaded | 2404 | 5066 | 0 | 43 | 1 | no |
| procurement | loaded | 2389 | 29324 | 0 | 9 | 0 | no |
| attachments | loaded | 2909 | 5566 | 0 | 1 | 2 | no |
| reports | loaded | 7436 | 10097 | 0 | 8 | 12 | no |
| users | loaded | 4416 | 7073 | 0 | 1 | 1 | no |
| departments | loaded | 3918 | 6576 | 0 | 8 | 1 | no |
| roles | loaded | 3930 | 6223 | 0 | 19 | 1 | no |
| permissions | loaded | 2921 | 5576 | 0 | 0 | 1 | no |
| audit | loaded | 2903 | 5559 | 0 | 1 | 1 | no |
| settings | loaded | 2421 | 5077 | 0 | 0 | 2 | no |
| admin | loaded | 2394 | 5050 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-28T17:53:00.890Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4816 ms | 3422 ms | /د/س/ت/ر/س/ی/ /9/2/5/ /// /ر/و/ت/ر/ /2/4/9/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/1/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/6/1/m/s/×/1/,/ /g/e/t/A/l/l/:/3/5/7/m/s/×/1/ |
| /procurement/orders | 4953 ms | 3104 ms | /د/س/ت/ر/س/ی/ /9/5/6/ /// /ر/و/ت/ر/ /2/1/4/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/0/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/5/8/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/3/7/4/m/s/×/2/ |
| /procurement/needs | 3688 ms | 2130 ms | /د/س/ت/ر/س/ی/ /8/4/4/ /// /ر/و/ت/ر/ /1/2/8/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/1/4/m/s/×/1/,/ /g/e/t/A/l/l/:/1/9/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/9/2/m/s/×/1/ |
| /procurement/dashboard | 4139 ms | 2925 ms | /د/س/ت/ر/س/ی/ /1/1/2/8/ /// /ر/و/ت/ر/ /1/7/9/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/0/3/m/s/×/1/,/ /g/e/t/A/l/l/:/5/1/3/m/s/×/1/,/ /g/e/t/A/l/l/:/2/5/2/m/s/×/1/ |
| /procurement/workspace | 6635 ms | 2487 ms | /د/س/ت/ر/س/ی/ /8/4/0/ /// /ر/و/ت/ر/ /1/6/4/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/9/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/4/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/9/0/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

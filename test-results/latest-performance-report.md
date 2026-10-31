# PMS UI and Performance Audit

- Generated: 2026-10-31T14:23:41.210Z
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
| visibleButtonsInventoried | 153 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 284 |
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
| dashboard | loaded | 2983 | 5641 | 0 | 4 | 2 | no |
| projects | loaded | 2427 | 5082 | 0 | 1 | 2 | no |
| project-detail | loaded | 8111 | 10766 | 0 | 2 | 0 | no |
| events | loaded | 3925 | 6581 | 0 | 5 | 1 | no |
| workflows | loaded | 4457 | 7114 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2938 | 5594 | 0 | 1 | 1 | no |
| event-types | loaded | 3937 | 6602 | 0 | 69 | 1 | no |
| information-types | loaded | 2930 | 5590 | 0 | 28 | 1 | no |
| procurement | loaded | 2927 | 32751 | 0 | 9 | 0 | no |
| attachments | loaded | 3413 | 6070 | 0 | 10 | 2 | no |
| reports | loaded | 3431 | 6093 | 0 | 8 | 12 | no |
| users | loaded | 2412 | 5070 | 0 | 1 | 1 | no |
| departments | loaded | 3959 | 6617 | 0 | 8 | 1 | no |
| roles | loaded | 3940 | 6595 | 0 | 1 | 1 | no |
| permissions | loaded | 3437 | 6093 | 0 | 0 | 1 | no |
| audit | loaded | 2924 | 5578 | 0 | 1 | 1 | no |
| settings | loaded | 3443 | 6098 | 0 | 1 | 3 | no |
| admin | loaded | 2407 | 5065 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T14:25:51.475Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5497 ms | 4265 ms | /د/س/ت/ر/س/ی/ /1/4/5/0/ /// /ر/و/ت/ر/ /2/8/1/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/3/4/m/s/×/1/,/ /g/e/t/A/l/l/:/3/3/1/m/s/×/1/,/ /g/e/t/A/l/l/:/3/1/1/m/s/×/1/ |
| /procurement/orders | 5779 ms | 3801 ms | /د/س/ت/ر/س/ی/ /1/7/1/3/ /// /ر/و/ت/ر/ /2/0/8/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/3/1/m/s/×/1/,/ /g/e/t/A/l/l/:/4/0/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/1/9/m/s/×/1/ |
| /procurement/needs | 6300 ms | 5109 ms | /د/س/ت/ر/س/ی/ /1/9/7/5/ /// /ر/و/ت/ر/ /3/1/3/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/3/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/1/4/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/8/6/0/m/s/×/1/ |
| /procurement/dashboard | 3828 ms | 2565 ms | /د/س/ت/ر/س/ی/ /9/2/9/ /// /ر/و/ت/ر/ /1/6/3/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/3/5/m/s/×/1/,/ /g/e/t/A/l/l/:/2/3/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/9/9/m/s/×/1/ |
| /procurement/workspace | 4439 ms | 2668 ms | /د/س/ت/ر/س/ی/ /8/4/0/ /// /ر/و/ت/ر/ /1/8/2/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/6/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/7/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/1/9/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

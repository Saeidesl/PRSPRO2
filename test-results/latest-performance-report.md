# PMS UI and Performance Audit

- Generated: 2026-11-01T19:40:43.483Z
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
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 199 |
| visibleInputsAndControlsInventoried | 36 |
| networkRequestsMeasured | 342 |
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
| dashboard | loaded | 2426 | 5086 | 0 | 4 | 2 | no |
| projects | loaded | 2412 | 5069 | 0 | 1 | 2 | no |
| project-detail | loaded | 2919 | 5575 | 0 | 2 | 0 | no |
| print-design | loaded | 2907 | 5564 | 0 | 1 | 1 | no |
| print-output | loaded | 2908 | 5565 | 0 | 2 | 1 | no |
| events | loaded | 2909 | 5566 | 0 | 15 | 1 | no |
| workflows | loaded | 3424 | 6080 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2928 | 5584 | 0 | 9 | 1 | no |
| event-types | loaded | 3453 | 6116 | 0 | 73 | 1 | no |
| information-types | loaded | 2432 | 5088 | 0 | 1 | 1 | no |
| procurement | loaded | 2431 | 28624 | 0 | 9 | 0 | no |
| attachments | loaded | 3402 | 6059 | 0 | 18 | 2 | no |
| reports | loaded | 3424 | 6084 | 0 | 8 | 12 | no |
| users | loaded | 2403 | 5061 | 0 | 21 | 1 | no |
| departments | loaded | 2899 | 5554 | 0 | 8 | 1 | no |
| roles | loaded | 3417 | 6076 | 0 | 19 | 1 | no |
| permissions | loaded | 3929 | 6583 | 0 | 0 | 1 | no |
| audit | loaded | 3914 | 6570 | 0 | 1 | 1 | no |
| settings | loaded | 3010 | 5666 | 0 | 1 | 3 | no |
| admin | loaded | 2910 | 5566 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T19:42:53.254Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4099 ms | 2804 ms | /د/س/ت/ر/س/ی/ /9/3/9/ /// /ر/و/ت/ر/ /1/8/6/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/8/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/1/6/m/s/×/1/,/ /g/e/t/A/l/l/:/1/9/0/m/s/×/1/ |
| /procurement/orders | 3815 ms | 2468 ms | /د/س/ت/ر/س/ی/ /9/8/1/ /// /ر/و/ت/ر/ /1/4/8/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/2/4/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/9/m/s/×/1/,/ /g/e/t/A/l/l/:/2/2/8/m/s/×/1/ |
| /procurement/needs | 4371 ms | 2863 ms | /د/س/ت/ر/س/ی/ /9/5/9/ /// /ر/و/ت/ر/ /1/9/0/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/4/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/1/7/m/s/×/2/,/ /g/e/t/A/l/l/:/2/1/6/m/s/×/1/ |
| /procurement/dashboard | 4729 ms | 3298 ms | /د/س/ت/ر/س/ی/ /1/1/6/7/ /// /ر/و/ت/ر/ /2/1/3/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/0/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/2/2/m/s/×/1/ |
| /procurement/workspace | 6466 ms | 3535 ms | /د/س/ت/ر/س/ی/ /1/4/8/8/ /// /ر/و/ت/ر/ /2/0/4/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/6/0/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/4/5/5/m/s/×/2/,/ /g/e/t/A/l/l/:/3/6/7/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

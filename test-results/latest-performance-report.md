# PMS UI and Performance Audit

- Generated: 2026-11-01T20:36:12.072Z
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
| visibleFormsInventoried | 12 |
| dynamicFormsInventoried | 12 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 189 |
| visibleInputsAndControlsInventoried | 35 |
| networkRequestsMeasured | 319 |
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
| dashboard | loaded | 3892 | 6551 | 0 | 4 | 2 | no |
| projects | loaded | 3396 | 6053 | 0 | 31 | 2 | no |
| project-detail | loaded | 2875 | 5532 | 0 | 2 | 0 | no |
| print-design | loaded | 8078 | 10733 | 0 | 0 | 0 | no |
| print-output | loaded | 2874 | 5529 | 0 | 2 | 1 | no |
| events | loaded | 2877 | 5532 | 0 | 15 | 1 | no |
| workflows | loaded | 3393 | 6046 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3395 | 6050 | 0 | 9 | 1 | no |
| event-types | loaded | 2891 | 5552 | 0 | 73 | 1 | no |
| information-types | loaded | 3378 | 6034 | 0 | 1 | 1 | no |
| procurement | loaded | 2891 | 29570 | 0 | 9 | 0 | no |
| attachments | loaded | 3881 | 6538 | 0 | 1 | 2 | no |
| reports | loaded | 2901 | 5560 | 0 | 8 | 12 | no |
| users | loaded | 3373 | 6028 | 0 | 1 | 1 | no |
| departments | loaded | 2897 | 5550 | 0 | 8 | 1 | no |
| roles | loaded | 3392 | 6049 | 0 | 19 | 1 | no |
| permissions | loaded | 3392 | 6047 | 0 | 0 | 1 | no |
| audit | loaded | 2871 | 5525 | 0 | 1 | 1 | no |
| settings | loaded | 2873 | 5527 | 0 | 1 | 3 | no |
| admin | loaded | 2879 | 5535 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T20:38:32.333Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4831 ms | 3638 ms | /د/س/ت/ر/س/ی/ /9/1/3/ /// /ر/و/ت/ر/ /2/7/2/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/0/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/4/0/m/s/×/1/,/ /g/e/t/A/l/l/:/4/3/0/m/s/×/1/ |
| /procurement/orders | 3557 ms | 2129 ms | /د/س/ت/ر/س/ی/ /8/3/6/ /// /ر/و/ت/ر/ /1/2/9/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/9/4/m/s/×/1/,/ /g/e/t/A/l/l/:/1/8/4/m/s/×/1/,/ /g/e/t/A/l/l/:/1/8/2/m/s/×/1/ |
| /procurement/needs | 3291 ms | 2030 ms | /د/س/ت/ر/س/ی/ /7/3/7/ /// /ر/و/ت/ر/ /1/2/9/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/8/6/m/s/×/1/,/ /g/e/t/A/l/l/:/1/8/7/m/s/×/1/,/ /g/e/t/A/l/l/:/1/6/5/m/s/×/1/ |
| /procurement/dashboard | 4468 ms | 3250 ms | /د/س/ت/ر/س/ی/ /1/1/1/0/ /// /ر/و/ت/ر/ /2/1/4/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/6/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/0/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/8/9/m/s/×/1/ |
| /procurement/workspace | 7060 ms | 2282 ms | /د/س/ت/ر/س/ی/ /9/2/2/ /// /ر/و/ت/ر/ /1/3/5/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/6/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/0/6/m/s/×/1/,/ /g/e/t/A/l/l/:/1/9/8/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

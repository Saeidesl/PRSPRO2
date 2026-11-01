# PMS UI and Performance Audit

- Generated: 2026-11-01T07:20:45.753Z
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
| visibleButtonsInventoried | 480 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 322 |
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
| dashboard | loaded | 2404 | 5062 | 0 | 24 | 2 | no |
| projects | loaded | 5913 | 8572 | 0 | 1 | 2 | no |
| project-detail | loaded | 2884 | 5538 | 0 | 2 | 0 | no |
| events | loaded | 2882 | 5537 | 0 | 15 | 1 | no |
| workflows | loaded | 2908 | 5564 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3386 | 6046 | 0 | 9 | 1 | no |
| event-types | loaded | 2878 | 5538 | 0 | 73 | 1 | no |
| information-types | loaded | 2870 | 5526 | 0 | 1 | 1 | no |
| procurement | loaded | 3396 | 35613 | 0 | 9 | 0 | no |
| attachments | loaded | 2361 | 5028 | 0 | 18 | 2 | no |
| reports | loaded | 2898 | 5556 | 0 | 8 | 12 | no |
| users | loaded | 3372 | 6029 | 0 | 21 | 1 | no |
| departments | loaded | 2893 | 5548 | 0 | 8 | 1 | no |
| roles | loaded | 2925 | 5560 | 0 | 19 | 1 | no |
| permissions | loaded | 1903 | 4557 | 0 | 0 | 1 | no |
| audit | loaded | 2361 | 4946 | 0 | 1 | 1 | no |
| settings | loaded | 3429 | 6085 | 0 | 1 | 3 | no |
| admin | loaded | 3401 | 6070 | 0 | 269 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T07:22:51.516Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7150 ms | 5755 ms | /د/س/ت/ر/س/ی/ /1/6/2/4/ /// /ر/و/ت/ر/ /4/1/3/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/5/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/7/5/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/7/6/5/m/s/×/1/ |
| /procurement/orders | 3893 ms | 2902 ms | /د/س/ت/ر/س/ی/ /1/2/3/3/ /// /ر/و/ت/ر/ /1/6/6/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/9/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/9/8/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/4/8/3/m/s/×/1/ |
| /procurement/needs | 7184 ms | 5527 ms | /د/س/ت/ر/س/ی/ /3/0/0/4/ /// /ر/و/ت/ر/ /2/5/2/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/4/3/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/6/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/9/1/1/m/s/×/1/ |
| /procurement/dashboard | 4616 ms | 3477 ms | /د/س/ت/ر/س/ی/ /1/4/0/7/ /// /ر/و/ت/ر/ /2/0/7/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/7/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/6/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/9/7/m/s/×/1/ |
| /procurement/workspace | 5916 ms | 2446 ms | /د/س/ت/ر/س/ی/ /1/1/4/0/ /// /ر/و/ت/ر/ /1/3/0/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/3/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/7/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/3/7/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

# PMS UI and Performance Audit

- Generated: 2026-10-31T18:05:00.680Z
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
| visibleFormsInventoried | 13 |
| dynamicFormsInventoried | 13 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 198 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 318 |
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
| dashboard | loaded | 3472 | 6131 | 0 | 4 | 2 | no |
| projects | loaded | 2910 | 5567 | 0 | 1 | 2 | no |
| project-detail | loaded | 2908 | 5563 | 0 | 2 | 0 | no |
| events | loaded | 2911 | 5568 | 0 | 13 | 1 | no |
| workflows | loaded | 3932 | 6587 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2441 | 5097 | 0 | 9 | 1 | no |
| event-types | loaded | 2925 | 5588 | 0 | 69 | 1 | no |
| information-types | loaded | 3434 | 6092 | 0 | 28 | 1 | no |
| procurement | loaded | 3450 | 28671 | 0 | 9 | 0 | no |
| attachments | loaded | 3897 | 6555 | 0 | 1 | 2 | no |
| reports | loaded | 2917 | 5576 | 0 | 8 | 12 | no |
| users | loaded | 5417 | 8075 | 0 | 21 | 1 | no |
| departments | loaded | 3427 | 6083 | 0 | 8 | 1 | no |
| roles | loaded | 3413 | 6072 | 0 | 19 | 1 | no |
| permissions | loaded | 2923 | 5578 | 0 | 0 | 1 | no |
| audit | loaded | 2900 | 5557 | 0 | 1 | 1 | no |
| settings | loaded | 2962 | 5617 | 0 | 1 | 3 | no |
| admin | loaded | 3926 | 6581 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T18:07:00.319Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4430 ms | 3426 ms | /د/س/ت/ر/س/ی/ /1/3/2/4/ /// /ر/و/ت/ر/ /2/1/0/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/5/0/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/3/7/5/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/3/2/5/m/s/×/1/ |
| /procurement/orders | 3731 ms | 2421 ms | /د/س/ت/ر/س/ی/ /8/5/1/ /// /ر/و/ت/ر/ /1/5/6/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/4/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/9/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/2/6/m/s/×/1/ |
| /procurement/needs | 3742 ms | 2597 ms | /د/س/ت/ر/س/ی/ /9/5/3/ /// /ر/و/ت/ر/ /1/6/4/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/5/8/m/s/×/1/,/ /g/e/t/A/l/l/:/2/3/4/m/s/×/1/,/ /g/e/t/A/l/l/:/2/1/8/m/s/×/1/ |
| /procurement/dashboard | 6281 ms | 4705 ms | /د/س/ت/ر/س/ی/ /2/2/3/3/ /// /ر/و/ت/ر/ /2/4/7/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/7/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/9/1/m/s/×/1/,/ /g/e/t/A/l/l/:/4/1/0/m/s/×/1/ |
| /procurement/workspace | 4320 ms | 2671 ms | /د/س/ت/ر/س/ی/ /1/3/7/3/ /// /ر/و/ت/ر/ /1/2/9/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/6/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/8/1/m/s/×/1/,/ /g/e/t/A/l/l/:/1/8/0/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

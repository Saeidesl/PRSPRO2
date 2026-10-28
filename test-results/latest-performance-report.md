# PMS UI and Performance Audit

- Generated: 2026-10-28T20:16:39.309Z
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
| visibleButtonsInventoried | 117 |
| visibleInputsAndControlsInventoried | 32 |
| networkRequestsMeasured | 339 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 20 |
| failedSafeButtonChecks | 5 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 4495 | 7164 | 0 | 8 | 2 | no |
| projects | loaded | 3922 | 6581 | 0 | 1 | 2 | no |
| project-detail | loaded | 4908 | 7564 | 0 | 2 | 0 | no |
| events | loaded | 3925 | 6582 | 0 | 7 | 1 | no |
| workflows | loaded | 2431 | 5087 | 0 | 3 | 2 | no |
| project-statuses | loaded | 3932 | 6588 | 0 | 1 | 1 | no |
| event-types | loaded | 3428 | 6091 | 0 | 43 | 1 | no |
| procurement | loaded | 3942 | 36898 | 0 | 9 | 0 | no |
| attachments | loaded | 2410 | 5064 | 0 | 1 | 2 | no |
| reports | loaded | 3427 | 6088 | 0 | 8 | 12 | no |
| users | loaded | 2912 | 5571 | 0 | 21 | 1 | no |
| departments | loaded | 2895 | 5553 | 0 | 8 | 1 | no |
| roles | loaded | 3417 | 6072 | 0 | 1 | 1 | no |
| permissions | loaded | 3426 | 6083 | 0 | 0 | 1 | no |
| audit | loaded | 3445 | 6101 | 0 | 1 | 1 | no |
| settings | loaded | 3405 | 6061 | 0 | 0 | 2 | no |
| admin | loaded | 2899 | 5556 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-28T20:18:42.018Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7479 ms | 6080 ms | /د/س/ت/ر/س/ی/ /2/1/6/6/ /// /ر/و/ت/ر/ /3/9/1/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/2/6/6/m/s/×/1/,/ /g/e/t/A/l/l/:/8/3/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/7/0/m/s/×/2/ |
| /procurement/orders | 4116 ms | 2663 ms | /د/س/ت/ر/س/ی/ /9/4/9/ /// /ر/و/ت/ر/ /1/7/1/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/0/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/3/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/2/8/m/s/×/1/ |
| /procurement/needs | 7019 ms | 5968 ms | /د/س/ت/ر/س/ی/ /1/4/5/9/ /// /ر/و/ت/ر/ /4/5/0/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/4/3/5/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/1/3/8/2/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/8/5/4/m/s/×/1/ |
| /procurement/dashboard | 3584 ms | 2434 ms | /د/س/ت/ر/س/ی/ /1/0/5/0/ /// /ر/و/ت/ر/ /1/3/8/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/2/6/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/3/5/8/m/s/×/2/,/ /g/e/t/A/l/l/:/2/2/3/m/s/×/1/ |
| /procurement/workspace | 7268 ms | 4801 ms | /د/س/ت/ر/س/ی/ /2/2/2/0/ /// /ر/و/ت/ر/ /2/5/8/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/6/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/5/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/0/9/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

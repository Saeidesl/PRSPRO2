# PMS UI and Performance Audit

- Generated: 2026-10-31T08:20:06.750Z
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
| visibleButtonsInventoried | 373 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 313 |
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
| dashboard | loaded | 4380 | 7038 | 0 | 12 | 2 | no |
| projects | loaded | 3876 | 6530 | 0 | 1 | 2 | no |
| project-detail | loaded | 3364 | 6018 | 0 | 2 | 0 | no |
| events | loaded | 2865 | 5519 | 0 | 24 | 1 | no |
| workflows | loaded | 2890 | 5544 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2383 | 5038 | 0 | 9 | 1 | no |
| event-types | loaded | 3881 | 6542 | 0 | 61 | 1 | no |
| information-types | loaded | 2865 | 5519 | 0 | 1 | 1 | no |
| procurement | loaded | 2882 | 34208 | 0 | 9 | 0 | no |
| attachments | loaded | 2852 | 5509 | 0 | 1 | 2 | no |
| reports | loaded | 3367 | 6026 | 0 | 8 | 12 | no |
| users | loaded | 2860 | 5514 | 0 | 21 | 1 | no |
| departments | loaded | 2860 | 5515 | 0 | 8 | 1 | no |
| roles | loaded | 3391 | 6047 | 0 | 19 | 1 | no |
| permissions | loaded | 2872 | 5526 | 0 | 0 | 1 | no |
| audit | loaded | 3359 | 6012 | 0 | 1 | 1 | no |
| settings | loaded | 3379 | 6033 | 0 | 1 | 3 | no |
| admin | loaded | 2370 | 5037 | 0 | 192 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T08:22:16.520Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5477 ms | 4598 ms | /د/س/ت/ر/س/ی/ /1/3/4/2/ /// /ر/و/ت/ر/ /3/2/5/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/1/9/m/s/×/1/,/ /g/e/t/A/l/l/:/3/7/6/m/s/×/1/,/ /g/e/t/A/l/l/:/3/1/8/m/s/×/1/ |
| /procurement/orders | 5370 ms | 3866 ms | /د/س/ت/ر/س/ی/ /1/7/6/2/ /// /ر/و/ت/ر/ /2/1/0/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/5/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/5/5/m/s/×/1/,/ /g/e/t/A/l/l/:/3/4/4/m/s/×/1/ |
| /procurement/needs | 4797 ms | 3706 ms | /د/س/ت/ر/س/ی/ /1/8/7/9/ /// /ر/و/ت/ر/ /1/8/2/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/8/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/4/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/0/0/m/s/×/1/ |
| /procurement/dashboard | 3772 ms | 2826 ms | /د/س/ت/ر/س/ی/ /9/1/1/ /// /ر/و/ت/ر/ /1/9/1/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/4/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/3/4/m/s/×/2/,/ /g/e/t/A/l/l/:/2/3/4/m/s/×/1/ |
| /procurement/workspace | 8439 ms | 6335 ms | /د/س/ت/ر/س/ی/ /2/5/0/7/ /// /ر/و/ت/ر/ /3/8/2/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/9/0/m/s/×/1/,/ /g/e/t/A/l/l/:/7/0/0/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/6/6/3/m/s/×/2/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

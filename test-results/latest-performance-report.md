# PMS UI and Performance Audit

- Generated: 2026-10-29T05:12:38.831Z
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
| visibleButtonsInventoried | 84 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 365 |
| procurementApiRequestsMeasured | 9 |
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
| dashboard | loaded | 3383 | 6039 | 0 | 4 | 2 | no |
| projects | loaded | 3356 | 6010 | 0 | 7 | 2 | no |
| project-detail | loaded | 3856 | 6510 | 0 | 2 | 0 | no |
| events | loaded | 3357 | 6010 | 0 | 7 | 1 | no |
| workflows | loaded | 2363 | 5016 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2862 | 5515 | 0 | 9 | 1 | no |
| event-types | loaded | 3863 | 6518 | 0 | 1 | 1 | no |
| procurement | loaded | 2363 | 35397 | 0 | 9 | 0 | no |
| attachments | loaded | 2867 | 5520 | 0 | 1 | 2 | no |
| reports | loaded | 2873 | 5530 | 0 | 8 | 12 | no |
| users | loaded | 3348 | 6004 | 0 | 21 | 1 | no |
| departments | loaded | 3362 | 6018 | 0 | 8 | 1 | no |
| roles | loaded | 5396 | 8050 | 0 | 1 | 1 | no |
| permissions | loaded | 3885 | 6539 | 0 | 0 | 1 | no |
| audit | loaded | 3358 | 6011 | 0 | 1 | 1 | no |
| settings | loaded | 2858 | 5512 | 0 | 1 | 3 | no |
| admin | loaded | 3859 | 6516 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T05:14:34.805Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5345 ms | 4275 ms | /د/س/ت/ر/س/ی/ /1/2/0/1/ /// /ر/و/ت/ر/ /3/0/7/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/2/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/4/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/9/m/s/×/1/ |
| /procurement/orders | 4735 ms | 2956 ms | /د/س/ت/ر/س/ی/ /1/2/8/5/ /// /ر/و/ت/ر/ /1/6/7/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/2/7/m/s/×/1/,/ /g/e/t/A/l/l/:/3/4/5/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/2/7/7/m/s/×/2/ |
| /procurement/needs | 5736 ms | 4348 ms | /د/س/ت/ر/س/ی/ /1/6/6/5/ /// /ر/و/ت/ر/ /2/6/8/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/7/1/m/s/×/1/,/ /g/e/t/A/l/l/:/3/9/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/7/4/m/s/×/1/ |
| /procurement/dashboard | 4605 ms | 3351 ms | /د/س/ت/ر/س/ی/ /1/0/4/8/ /// /ر/و/ت/ر/ /2/3/0/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/0/4/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/3/5/m/s/×/1/,/ /g/e/t/A/l/l/:/2/5/4/m/s/×/1/ |
| /procurement/workspace | 9843 ms | 5522 ms | /د/س/ت/ر/س/ی/ /1/7/9/6/ /// /ر/و/ت/ر/ /3/7/2/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/4/0/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/3/0/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/1/1/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

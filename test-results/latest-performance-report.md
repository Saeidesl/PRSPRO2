# PMS UI and Performance Audit

- Generated: 2026-10-28T16:36:05.570Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **needs-attention**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 1 |
| loadedRoutes | 1 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 3 |
| dynamicFormsInventoried | 3 |
| formOpenersChecked | 3 |
| visibleButtonsInventoried | 9 |
| visibleInputsAndControlsInventoried | 0 |
| networkRequestsMeasured | 49 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 3 |
| failedSafeButtonChecks | 2 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| procurement | loaded | 4484 | 44079 | 0 | 9 | 0 | no |

## Procurement API timings

- Requests measured: 6
- Failed requests: 0
- Timings below are observed by the browser and include network/backend response time.
- Backend repository and Google Sheets timings are recorded separately in `PMS_PerformanceDiagnostics`.

| Endpoint | Requests | Failed | Average ms | Median ms | P95 ms | Max ms |
|---|---:|---:|---:|---:|---:|---:|
| GET /api/procurement/workspace | 2 | 0 | 7054 | 6205 | 7902 | 7902 |
| GET /api/procurement/dashboard | 1 | 0 | 5724 | 5724 | 5724 | 5724 |
| GET /api/procurement/needs | 1 | 0 | 9329 | 9329 | 9329 | 9329 |
| GET /api/procurement/orders | 1 | 0 | 4545 | 4545 | 4545 | 4545 |
| GET /api/procurement/reports | 1 | 0 | 6378 | 6378 | 6378 | 6378 |

## Procurement backend diagnostics

- Measured at: 2026-10-28T16:36:57.952Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6446 ms | 4894 ms | /د/س/ت/ر/س/ی/ /1/7/7/9/ /// /ر/و/ت/ر/ /3/1/1/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/7/5/m/s/×/1/,/ /g/e/t/A/l/l/:/5/6/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/9/3/m/s/×/2/ |
| /procurement/orders | 4645 ms | 3111 ms | /د/س/ت/ر/س/ی/ /1/4/1/6/ /// /ر/و/ت/ر/ /1/6/9/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/0/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/3/5/m/s/×/1/ |
| /procurement/needs | 9408 ms | 7161 ms | /د/س/ت/ر/س/ی/ /2/6/5/9/ /// /ر/و/ت/ر/ /4/5/0/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/5/9/m/s/×/1/,/ /g/e/t/A/l/l/:/7/4/5/m/s/×/1/,/ /g/e/t/A/l/l/:/7/1/6/m/s/×/1/ |
| /procurement/dashboard | 8344 ms | 4724 ms | /د/س/ت/ر/س/ی/ /1/3/2/0/ /// /ر/و/ت/ر/ /3/4/0/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/5/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/8/2/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/2/7/8/m/s/×/1/ |
| /procurement/workspace | 7982 ms | 3808 ms | /د/س/ت/ر/س/ی/ /1/2/9/6/ /// /ر/و/ت/ر/ /2/5/1/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/4/8/m/s/×/2/,/ /g/e/t/A/l/l/:/6/2/3/m/s/×/3/,/ /g/e/t/H/e/a/d/e/r/s/:/5/6/8/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

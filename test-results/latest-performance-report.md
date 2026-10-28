# PMS UI and Performance Audit

- Generated: 2026-10-28T17:11:19.726Z
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
| networkRequestsMeasured | 53 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 3 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| procurement | loaded | 4434 | 39272 | 0 | 9 | 0 | no |

## Procurement API timings

- Requests measured: 6
- Failed requests: 0
- Timings below are observed by the browser and include network/backend response time.
- Backend repository and Google Sheets timings are recorded separately in `PMS_PerformanceDiagnostics`.

| Endpoint | Requests | Failed | Average ms | Median ms | P95 ms | Max ms |
|---|---:|---:|---:|---:|---:|---:|
| GET /api/procurement/workspace | 2 | 0 | 6976 | 6661 | 7291 | 7291 |
| GET /api/procurement/dashboard | 1 | 0 | 5458 | 5458 | 5458 | 5458 |
| GET /api/procurement/needs | 1 | 0 | 6267 | 6267 | 6267 | 6267 |
| GET /api/procurement/orders | 1 | 0 | 4804 | 4804 | 4804 | 4804 |
| GET /api/procurement/reports | 1 | 0 | 5969 | 5969 | 5969 | 5969 |

## Procurement backend diagnostics

- Measured at: 2026-10-28T17:12:05.223Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6076 ms | 4975 ms | /د/س/ت/ر/س/ی/ /1/3/8/5/ /// /ر/و/ت/ر/ /3/5/8/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/1/2/m/s/×/1/,/ /g/e/t/A/l/l/:/6/5/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/5/2/m/s/×/1/ |
| /procurement/orders | 4936 ms | 3774 ms | /د/س/ت/ر/س/ی/ /1/5/4/7/ /// /ر/و/ت/ر/ /2/2/2/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/0/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/3/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/2/7/m/s/×/1/ |
| /procurement/needs | 6361 ms | 4769 ms | /د/س/ت/ر/س/ی/ /1/6/9/1/ /// /ر/و/ت/ر/ /3/0/7/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/7/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/0/4/m/s/×/1/,/ /g/e/t/A/l/l/:/5/6/5/m/s/×/1/ |
| /procurement/dashboard | 5564 ms | 4309 ms | /د/س/ت/ر/س/ی/ /1/5/9/3/ /// /ر/و/ت/ر/ /2/7/1/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/1/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/5/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/5/7/m/s/×/2/ |
| /procurement/workspace | 7414 ms | 4292 ms | /د/س/ت/ر/س/ی/ /2/2/0/0/ /// /ر/و/ت/ر/ /2/0/9/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/0/5/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/5/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/1/1/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

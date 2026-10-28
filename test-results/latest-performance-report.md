# PMS UI and Performance Audit

- Generated: 2026-10-28T16:45:08.818Z
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
| networkRequestsMeasured | 54 |
| procurementApiRequestsMeasured | 7 |
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
| procurement | loaded | 2959 | 45957 | 0 | 9 | 0 | no |

## Procurement API timings

- Requests measured: 7
- Failed requests: 0
- Timings below are observed by the browser and include network/backend response time.
- Backend repository and Google Sheets timings are recorded separately in `PMS_PerformanceDiagnostics`.

| Endpoint | Requests | Failed | Average ms | Median ms | P95 ms | Max ms |
|---|---:|---:|---:|---:|---:|---:|
| GET /api/procurement/workspace | 3 | 0 | 5378 | 4515 | 8088 | 8088 |
| GET /api/procurement/dashboard | 1 | 0 | 7801 | 7801 | 7801 | 7801 |
| GET /api/procurement/needs | 1 | 0 | 4206 | 4206 | 4206 | 4206 |
| GET /api/procurement/orders | 1 | 0 | 8419 | 8419 | 8419 | 8419 |
| GET /api/procurement/reports | 1 | 0 | 9978 | 9978 | 9978 | 9978 |

## Procurement backend diagnostics

- Measured at: 2026-10-28T16:46:01.878Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 10067 ms | 8215 ms | /د/س/ت/ر/س/ی/ /2/7/7/4/ /// /ر/و/ت/ر/ /5/4/4/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/4/7/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/3/3/6/m/s/×/1/,/ /g/e/t/A/l/l/:/9/3/0/m/s/×/1/ |
| /procurement/orders | 8538 ms | 6918 ms | /د/س/ت/ر/س/ی/ /2/2/4/6/ /// /ر/و/ت/ر/ /4/6/7/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/4/2/3/m/s/×/1/,/ /g/e/t/A/l/l/:/7/5/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/8/9/m/s/×/2/ |
| /procurement/needs | 4296 ms | 3325 ms | /د/س/ت/ر/س/ی/ /1/3/9/9/ /// /ر/و/ت/ر/ /1/9/2/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/9/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/5/0/m/s/×/1/,/ /g/e/t/A/l/l/:/3/8/6/m/s/×/1/ |
| /procurement/dashboard | 7919 ms | 5297 ms | /د/س/ت/ر/س/ی/ /1/5/5/5/ /// /ر/و/ت/ر/ /3/7/4/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/0/2/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/2/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/9/4/m/s/×/1/ |
| /procurement/workspace | 8192 ms | 4930 ms | /د/س/ت/ر/س/ی/ /1/8/1/3/ /// /ر/و/ت/ر/ /3/1/1/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/4/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/7/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/3/3/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

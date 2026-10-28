# PMS UI and Performance Audit

- Generated: 2026-10-28T16:15:13.198Z
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
| networkRequestsMeasured | 55 |
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
| procurement | loaded | 4495 | 49533 | 0 | 9 | 0 | no |

## Procurement API timings

- Requests measured: 6
- Failed requests: 0
- Timings below are observed by the browser and include network/backend response time.
- Backend repository and Google Sheets timings are recorded separately in `PMS_PerformanceDiagnostics`.

| Endpoint | Requests | Failed | Average ms | Median ms | P95 ms | Max ms |
|---|---:|---:|---:|---:|---:|---:|
| GET /api/procurement/workspace | 2 | 0 | 10097 | 9367 | 10826 | 10826 |
| GET /api/procurement/dashboard | 1 | 0 | 8496 | 8496 | 8496 | 8496 |
| GET /api/procurement/needs | 1 | 0 | 5389 | 5389 | 5389 | 5389 |
| GET /api/procurement/orders | 1 | 0 | 8956 | 8956 | 8956 | 8956 |
| GET /api/procurement/reports | 1 | 0 | 6924 | 6924 | 6924 | 6924 |

## Procurement backend diagnostics

- Measured at: 2026-10-28T16:16:12.017Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7001 ms | 5584 ms | /د/س/ت/ر/س/ی/ /2/3/3/8/ /// /ر/و/ت/ر/ /3/2/4/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/1/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/5/5/m/s/×/1/,/ /g/e/t/A/l/l/:/5/3/6/m/s/×/2/ |
| /procurement/orders | 9045 ms | 7957 ms | /د/س/ت/ر/س/ی/ /3/3/7/7/ /// /ر/و/ت/ر/ /4/5/7/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/9/0/2/m/s/×/1/,/ /g/e/t/A/l/l/:/1/3/0/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/1/7/9/m/s/×/1/ |
| /procurement/needs | 5528 ms | 4269 ms | /د/س/ت/ر/س/ی/ /1/6/2/1/ /// /ر/و/ت/ر/ /2/6/4/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/4/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/5/6/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/5/7/9/m/s/×/2/ |
| /procurement/dashboard | 8560 ms | 6924 ms | /د/س/ت/ر/س/ی/ /2/4/9/9/ /// /ر/و/ت/ر/ /4/4/2/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/6/8/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/1/0/4/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/9/2/2/m/s/×/1/ |
| /procurement/workspace | 10910 ms | 4175 ms | /د/س/ت/ر/س/ی/ /2/0/9/8/ /// /ر/و/ت/ر/ /2/0/7/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/9/3/m/s/×/1/,/ /g/e/t/A/l/l/:/6/3/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/4/4/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

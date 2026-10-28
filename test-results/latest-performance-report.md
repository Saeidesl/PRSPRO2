# PMS UI and Performance Audit

- Generated: 2026-10-28T17:01:03.897Z
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
| procurement | loaded | 3928 | 40215 | 0 | 9 | 0 | no |

## Procurement API timings

- Requests measured: 6
- Failed requests: 0
- Timings below are observed by the browser and include network/backend response time.
- Backend repository and Google Sheets timings are recorded separately in `PMS_PerformanceDiagnostics`.

| Endpoint | Requests | Failed | Average ms | Median ms | P95 ms | Max ms |
|---|---:|---:|---:|---:|---:|---:|
| GET /api/procurement/workspace | 2 | 0 | 7535 | 5510 | 9560 | 9560 |
| GET /api/procurement/dashboard | 1 | 0 | 3821 | 3821 | 3821 | 3821 |
| GET /api/procurement/needs | 1 | 0 | 5576 | 5576 | 5576 | 5576 |
| GET /api/procurement/orders | 1 | 0 | 5423 | 5423 | 5423 | 5423 |
| GET /api/procurement/reports | 1 | 0 | 7300 | 7300 | 7300 | 7300 |

## Procurement backend diagnostics

- Measured at: 2026-10-28T17:01:51.307Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7456 ms | 5016 ms | /د/س/ت/ر/س/ی/ /1/7/0/5/ /// /ر/و/ت/ر/ /3/3/1/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/9/5/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/6/7/7/m/s/×/2/,/ /g/e/t/A/l/l/:/4/6/5/m/s/×/1/ |
| /procurement/orders | 5540 ms | 4175 ms | /د/س/ت/ر/س/ی/ /1/4/3/8/ /// /ر/و/ت/ر/ /2/7/3/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/7/8/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/8/0/2/m/s/×/2/,/ /g/e/t/A/l/l/:/5/3/7/m/s/×/1/ |
| /procurement/needs | 5692 ms | 4021 ms | /د/س/ت/ر/س/ی/ /1/8/4/4/ /// /ر/و/ت/ر/ /2/1/7/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/9/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/8/7/m/s/×/1/,/ /g/e/t/A/l/l/:/4/8/4/m/s/×/1/ |
| /procurement/dashboard | 3935 ms | 2652 ms | /د/س/ت/ر/س/ی/ /1/0/7/7/ /// /ر/و/ت/ر/ /1/5/7/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/9/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/2/1/m/s/×/2/,/ /g/e/t/A/l/l/:/2/2/0/m/s/×/1/ |
| /procurement/workspace | 9676 ms | 6718 ms | /د/س/ت/ر/س/ی/ /3/1/8/2/ /// /ر/و/ت/ر/ /3/5/3/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/4/1/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/5/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/5/0/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

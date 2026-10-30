# PMS UI and Performance Audit

- Generated: 2026-10-30T20:55:25.872Z
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
| visibleButtonsInventoried | 291 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 231 |
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
| dashboard | loaded | 3898 | 6557 | 0 | 4 | 2 | no |
| projects | loaded | 4900 | 7556 | 0 | 1 | 2 | no |
| project-detail | loaded | 4406 | 7063 | 0 | 2 | 0 | no |
| events | loaded | 8079 | 10736 | 0 | 5 | 1 | no |
| workflows | loaded | 5903 | 8558 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4908 | 7563 | 0 | 1 | 1 | no |
| event-types | loaded | 4397 | 7060 | 0 | 61 | 1 | no |
| information-types | loaded | 5401 | 8059 | 0 | 1 | 1 | no |
| procurement | loaded | 4900 | 55913 | 0 | 9 | 0 | no |
| attachments | loaded | 4383 | 7040 | 0 | 1 | 2 | no |
| reports | loaded | 3901 | 6560 | 0 | 8 | 12 | no |
| users | loaded | 3887 | 6544 | 0 | 1 | 1 | no |
| departments | loaded | 5919 | 8575 | 0 | 8 | 1 | no |
| roles | loaded | 4413 | 7070 | 0 | 1 | 1 | no |
| permissions | loaded | 4907 | 7564 | 0 | 0 | 1 | no |
| audit | loaded | 3879 | 6534 | 0 | 1 | 1 | no |
| settings | loaded | 3880 | 6535 | 0 | 1 | 3 | no |
| admin | loaded | 2904 | 5607 | 0 | 185 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-30T20:58:27.048Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 8883 ms | 7476 ms | /د/س/ت/ر/س/ی/ /2/5/1/5/ /// /ر/و/ت/ر/ /4/9/6/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/9/4/m/s/×/1/,/ /g/e/t/A/l/l/:/7/9/0/m/s/×/1/,/ /g/e/t/A/l/l/:/6/8/0/m/s/×/1/ |
| /procurement/orders | 7204 ms | 5684 ms | /د/س/ت/ر/س/ی/ /1/7/1/2/ /// /ر/و/ت/ر/ /3/9/7/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/5/0/m/s/×/1/,/ /g/e/t/A/l/l/:/4/0/6/m/s/×/1/,/ /g/e/t/A/l/l/:/4/0/4/m/s/×/1/ |
| /procurement/needs | 7241 ms | 5459 ms | /د/س/ت/ر/س/ی/ /1/9/3/3/ /// /ر/و/ت/ر/ /3/5/2/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/3/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/3/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/5/7/m/s/×/1/ |
| /procurement/dashboard | 9602 ms | 8295 ms | /د/س/ت/ر/س/ی/ /3/0/1/8/ /// /ر/و/ت/ر/ /5/2/7/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/7/2/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/5/6/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/3/8/9/m/s/×/1/ |
| /procurement/workspace | 14112 ms | 6979 ms | /د/س/ت/ر/س/ی/ /2/3/6/8/ /// /ر/و/ت/ر/ /4/6/1/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/8/9/m/s/×/1/,/ /g/e/t/A/l/l/:/7/5/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/1/1/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

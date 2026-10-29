# PMS UI and Performance Audit

- Generated: 2026-10-29T09:35:17.613Z
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
| visibleButtonsInventoried | 61 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 330 |
| procurementApiRequestsMeasured | 7 |
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
| dashboard | loaded | 4481 | 7141 | 0 | 4 | 2 | no |
| projects | loaded | 3407 | 6064 | 0 | 7 | 2 | no |
| project-detail | loaded | 3414 | 6071 | 0 | 2 | 0 | no |
| events | loaded | 3904 | 6562 | 0 | 7 | 1 | no |
| workflows | loaded | 3430 | 6088 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3932 | 6590 | 0 | 1 | 1 | no |
| event-types | loaded | 5425 | 8082 | 0 | 1 | 1 | no |
| procurement | loaded | 5911 | 56437 | 0 | 9 | 0 | no |
| attachments | loaded | 3404 | 6060 | 0 | 6 | 2 | no |
| reports | loaded | 5940 | 8602 | 0 | 8 | 12 | no |
| users | loaded | 4427 | 7084 | 0 | 1 | 1 | no |
| departments | loaded | 4402 | 7060 | 0 | 8 | 1 | no |
| roles | loaded | 3422 | 6078 | 0 | 1 | 1 | no |
| permissions | loaded | 2924 | 5580 | 0 | 0 | 1 | no |
| audit | loaded | 3427 | 6082 | 0 | 1 | 1 | no |
| settings | loaded | 3902 | 6557 | 0 | 1 | 3 | no |
| admin | loaded | 3909 | 6567 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T09:37:51.789Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7876 ms | 6151 ms | /د/س/ت/ر/س/ی/ /1/5/7/9/ /// /ر/و/ت/ر/ /4/5/7/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/2/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/1/3/5/m/s/×/1/,/ /g/e/t/A/l/l/:/7/1/1/m/s/×/1/ |
| /procurement/orders | 17016 ms | 15145 ms | /د/س/ت/ر/س/ی/ /1/0/9/0/2/ /// /ر/و/ت/ر/ /4/2/4/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/1/1/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/8/0/1/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/6/0/8/m/s/×/1/ |
| /procurement/needs | 5276 ms | 3720 ms | /د/س/ت/ر/س/ی/ /1/4/0/7/ /// /ر/و/ت/ر/ /2/3/1/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/0/3/m/s/×/1/,/ /g/e/t/A/l/l/:/3/5/8/m/s/×/1/,/ /g/e/t/A/l/l/:/3/0/5/m/s/×/1/ |
| /procurement/dashboard | 7034 ms | 5259 ms | /د/س/ت/ر/س/ی/ /2/1/7/3/ /// /ر/و/ت/ر/ /3/0/8/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/3/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/1/3/m/s/×/1/,/ /g/e/t/A/l/l/:/6/3/9/m/s/×/1/ |
| /procurement/workspace | 10456 ms | 5325 ms | /د/س/ت/ر/س/ی/ /2/7/2/9/ /// /ر/و/ت/ر/ /2/5/9/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/0/6/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/0/3/2/m/s/×/1/,/ /g/e/t/A/l/l/:/5/2/6/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

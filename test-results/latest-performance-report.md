# PMS UI and Performance Audit

- Generated: 2026-11-01T05:02:03.409Z
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
| visibleButtonsInventoried | 495 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 329 |
| procurementApiRequestsMeasured | 9 |
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
| dashboard | loaded | 2981 | 5640 | 0 | 4 | 2 | no |
| projects | loaded | 3425 | 6085 | 0 | 31 | 2 | no |
| project-detail | loaded | 2921 | 5577 | 0 | 2 | 0 | no |
| events | loaded | 2411 | 5068 | 0 | 15 | 1 | no |
| workflows | loaded | 2433 | 5090 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2425 | 5083 | 0 | 1 | 1 | no |
| event-types | loaded | 2948 | 5610 | 0 | 69 | 1 | no |
| information-types | loaded | 3919 | 6580 | 0 | 40 | 1 | no |
| procurement | loaded | 3429 | 31018 | 0 | 9 | 0 | no |
| attachments | loaded | 2406 | 5066 | 0 | 18 | 2 | no |
| reports | loaded | 3939 | 6599 | 0 | 8 | 12 | no |
| users | loaded | 2411 | 5068 | 0 | 21 | 1 | no |
| departments | loaded | 3418 | 6078 | 0 | 8 | 1 | no |
| roles | loaded | 3436 | 6093 | 0 | 19 | 1 | no |
| permissions | loaded | 2941 | 5596 | 0 | 0 | 1 | no |
| audit | loaded | 3446 | 6104 | 0 | 1 | 1 | no |
| settings | loaded | 2998 | 5654 | 0 | 1 | 3 | no |
| admin | loaded | 3417 | 6101 | 0 | 247 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T05:04:01.283Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4718 ms | 3483 ms | /د/س/ت/ر/س/ی/ /1/1/8/4/ /// /ر/و/ت/ر/ /2/2/9/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/1/5/m/s/×/1/,/ /g/e/t/A/l/l/:/3/8/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/5/3/m/s/×/1/ |
| /procurement/orders | 4737 ms | 3348 ms | /د/س/ت/ر/س/ی/ /9/5/9/ /// /ر/و/ت/ر/ /2/3/8/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/8/6/m/s/×/1/,/ /g/e/t/A/l/l/:/1/9/2/m/s/×/1/,/ /g/e/t/A/l/l/:/1/8/4/m/s/×/1/ |
| /procurement/needs | 6209 ms | 4474 ms | /د/س/ت/ر/س/ی/ /1/5/4/1/ /// /ر/و/ت/ر/ /2/9/3/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/3/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/1/0/m/s/×/1/,/ /g/e/t/A/l/l/:/4/4/7/m/s/×/1/ |
| /procurement/dashboard | 3445 ms | 2407 ms | /د/س/ت/ر/س/ی/ /7/6/5/ /// /ر/و/ت/ر/ /1/6/4/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/5/8/m/s/×/1/,/ /g/e/t/A/l/l/:/1/7/9/m/s/×/1/,/ /g/e/t/A/l/l/:/1/5/6/m/s/×/1/ |
| /procurement/workspace | 5715 ms | 2213 ms | /د/س/ت/ر/س/ی/ /8/6/5/ /// /ر/و/ت/ر/ /1/3/4/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/8/7/m/s/×/1/,/ /g/e/t/A/l/l/:/2/0/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/8/3/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

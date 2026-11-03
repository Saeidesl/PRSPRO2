# PMS UI and Performance Audit

- Generated: 2026-11-03T09:35:31.808Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **needs-attention**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 20 |
| loadedRoutes | 20 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 12 |
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 138 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 283 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 12 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 4484 | 7142 | 0 | 4 | 2 | no |
| projects | loaded | 3926 | 6584 | 0 | 1 | 2 | no |
| project-detail | loaded | 3940 | 6598 | 0 | 2 | 0 | no |
| print-design | loaded | 3419 | 6081 | 1 | 14 | 5 | no |
| print-output | loaded | 3421 | 6080 | 0 | 1 | 2 | no |
| events | loaded | 3429 | 6087 | 0 | 5 | 1 | no |
| workflows | loaded | 3435 | 6089 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3944 | 6602 | 0 | 1 | 1 | no |
| event-types | loaded | 6421 | 9085 | 0 | 55 | 1 | no |
| information-types | loaded | 3410 | 6067 | 0 | 1 | 1 | no |
| procurement | loaded | 3455 | 44167 | 0 | 9 | 0 | no |
| attachments | loaded | 4415 | 7073 | 0 | 1 | 2 | no |
| reports | loaded | 2933 | 5597 | 0 | 8 | 12 | no |
| users | loaded | 3419 | 6077 | 0 | 21 | 1 | no |
| departments | loaded | 2905 | 5562 | 0 | 8 | 1 | no |
| roles | loaded | 3963 | 6620 | 0 | 1 | 1 | no |
| permissions | loaded | 4425 | 7080 | 0 | 0 | 1 | no |
| audit | loaded | 4415 | 7073 | 0 | 1 | 1 | no |
| settings | loaded | 5420 | 8078 | 0 | 1 | 3 | no |
| admin | loaded | 4914 | 7569 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-03T09:38:15.031Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5802 ms | 4627 ms | /د/س/ت/ر/س/ی/ /1/3/8/0/ /// /ر/و/ت/ر/ /3/2/4/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/5/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/7/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/5/m/s/×/1/ |
| /procurement/orders | 5662 ms | 4157 ms | /د/س/ت/ر/س/ی/ /1/8/8/4/ /// /ر/و/ت/ر/ /2/2/7/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/4/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/6/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/5/3/m/s/×/1/ |
| /procurement/needs | 5143 ms | 3713 ms | /د/س/ت/ر/س/ی/ /1/5/7/8/ /// /ر/و/ت/ر/ /2/1/3/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/9/2/m/s/×/1/,/ /g/e/t/A/l/l/:/5/1/0/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/3/6/8/m/s/×/2/ |
| /procurement/dashboard | 6431 ms | 4720 ms | /د/س/ت/ر/س/ی/ /2/7/0/1/ /// /ر/و/ت/ر/ /2/0/1/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/3/6/7/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/4/7/7/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/4/7/4/m/s/×/1/ |
| /procurement/workspace | 14199 ms | 7050 ms | /د/س/ت/ر/س/ی/ /2/3/7/5/ /// /ر/و/ت/ر/ /4/6/7/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/6/7/0/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/1/5/2/2/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/1/0/0/3/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

# PMS UI and Performance Audit

- Generated: 2026-10-29T05:00:58.272Z
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
| visibleButtonsInventoried | 266 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 382 |
| procurementApiRequestsMeasured | 10 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 21 |
| failedSafeButtonChecks | 4 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 4476 | 7136 | 0 | 8 | 2 | no |
| projects | loaded | 2913 | 5573 | 0 | 1 | 2 | no |
| project-detail | loaded | 4410 | 7066 | 0 | 2 | 0 | no |
| events | loaded | 3414 | 6070 | 0 | 7 | 1 | no |
| workflows | loaded | 2924 | 5579 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3424 | 6080 | 0 | 9 | 1 | no |
| event-types | loaded | 3423 | 6083 | 0 | 43 | 1 | no |
| procurement | loaded | 4409 | 37157 | 0 | 9 | 0 | no |
| attachments | loaded | 2401 | 5059 | 0 | 1 | 2 | no |
| reports | loaded | 2921 | 5581 | 0 | 8 | 12 | no |
| users | loaded | 3401 | 6059 | 0 | 21 | 1 | no |
| departments | loaded | 2902 | 5558 | 0 | 8 | 1 | no |
| roles | loaded | 3951 | 6609 | 0 | 19 | 1 | no |
| permissions | loaded | 4931 | 7587 | 0 | 0 | 1 | no |
| audit | loaded | 2924 | 5580 | 0 | 1 | 1 | no |
| settings | loaded | 2399 | 5053 | 0 | 1 | 3 | no |
| admin | loaded | 2927 | 5597 | 0 | 127 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T05:02:59.019Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7425 ms | 4563 ms | /د/س/ت/ر/س/ی/ /1/8/6/3/ /// /ر/و/ت/ر/ /2/7/0/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/9/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/9/4/m/s/×/1/,/ /g/e/t/A/l/l/:/3/9/2/m/s/×/1/ |
| /procurement/orders | 3871 ms | 2768 ms | /د/س/ت/ر/س/ی/ /1/1/3/4/ /// /ر/و/ت/ر/ /1/6/3/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/5/1/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/3/5/m/s/×/1/ |
| /procurement/needs | 5870 ms | 4471 ms | /د/س/ت/ر/س/ی/ /1/9/7/4/ /// /ر/و/ت/ر/ /2/4/9/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/5/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/9/8/m/s/×/1/,/ /g/e/t/A/l/l/:/3/6/6/m/s/×/1/ |
| /procurement/dashboard | 5841 ms | 3811 ms | /د/س/ت/ر/س/ی/ /1/6/2/3/ /// /ر/و/ت/ر/ /2/1/8/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/9/2/m/s/×/1/,/ /g/e/t/A/l/l/:/6/2/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/1/1/m/s/×/1/ |
| /procurement/workspace | 5754 ms | 3707 ms | /د/س/ت/ر/س/ی/ /1/4/8/6/ /// /ر/و/ت/ر/ /2/2/2/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/2/0/m/s/×/1/,/ /g/e/t/A/l/l/:/6/1/0/m/s/×/1/,/ /g/e/t/A/l/l/:/3/2/5/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

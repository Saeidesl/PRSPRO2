# PMS UI and Performance Audit

- Generated: 2026-11-01T09:35:57.897Z
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
| visibleButtonsInventoried | 164 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 280 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 10 |
| failedSafeButtonChecks | 2 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3457 | 6118 | 0 | 4 | 2 | no |
| projects | loaded | 4417 | 7074 | 0 | 1 | 2 | no |
| project-detail | loaded | 3902 | 6557 | 0 | 2 | 0 | no |
| events | loaded | 4417 | 7074 | 0 | 5 | 1 | no |
| workflows | loaded | 2926 | 5581 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2963 | 5620 | 0 | 9 | 1 | no |
| event-types | loaded | 3420 | 6084 | 0 | 73 | 1 | no |
| information-types | loaded | 3396 | 6052 | 0 | 1 | 1 | no |
| procurement | loaded | 4443 | 39437 | 0 | 9 | 0 | no |
| attachments | loaded | 3396 | 6054 | 0 | 18 | 2 | no |
| reports | loaded | 3919 | 6583 | 0 | 8 | 12 | no |
| users | loaded | 3902 | 6558 | 0 | 1 | 1 | no |
| departments | loaded | 2897 | 5552 | 0 | 8 | 1 | no |
| roles | loaded | 3921 | 6553 | 0 | 19 | 1 | no |
| permissions | loaded | 3925 | 6579 | 0 | 0 | 1 | no |
| audit | loaded | 3917 | 6574 | 0 | 1 | 1 | no |
| settings | loaded | 2992 | 5647 | 0 | 1 | 3 | no |
| admin | loaded | 3931 | 6591 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T09:38:13.391Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6106 ms | 4544 ms | /د/س/ت/ر/س/ی/ /1/7/7/1/ /// /ر/و/ت/ر/ /2/7/7/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/8/8/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/7/3/2/m/s/×/2/,/ /g/e/t/A/l/l/:/4/5/8/m/s/×/1/ |
| /procurement/orders | 5765 ms | 4068 ms | /د/س/ت/ر/س/ی/ /1/5/5/6/ /// /ر/و/ت/ر/ /2/5/1/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/5/1/m/s/×/1/,/ /g/e/t/A/l/l/:/4/8/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/9/0/m/s/×/1/ |
| /procurement/needs | 4061 ms | 2679 ms | /د/س/ت/ر/س/ی/ /9/2/9/ /// /ر/و/ت/ر/ /1/7/5/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/3/8/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/6/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/0/0/m/s/×/2/ |
| /procurement/dashboard | 5501 ms | 4074 ms | /د/س/ت/ر/س/ی/ /1/4/9/1/ /// /ر/و/ت/ر/ /2/5/8/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/4/9/m/s/×/1/,/ /g/e/t/A/l/l/:/5/1/4/m/s/×/1/,/ /g/e/t/A/l/l/:/3/0/0/m/s/×/1/ |
| /procurement/workspace | 10087 ms | 5144 ms | /د/س/ت/ر/س/ی/ /2/6/0/2/ /// /ر/و/ت/ر/ /2/5/4/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/3/6/7/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/1/0/6/8/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/5/7/9/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

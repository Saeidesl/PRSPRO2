# PMS UI and Performance Audit

- Generated: 2026-10-31T08:54:55.671Z
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
| visibleButtonsInventoried | 133 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 299 |
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
| dashboard | loaded | 3434 | 6092 | 0 | 4 | 2 | no |
| projects | loaded | 3442 | 6100 | 0 | 13 | 2 | no |
| project-detail | loaded | 2911 | 5569 | 0 | 2 | 0 | no |
| events | loaded | 3417 | 6073 | 0 | 9 | 1 | no |
| workflows | loaded | 3938 | 6596 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2934 | 5588 | 0 | 9 | 1 | no |
| event-types | loaded | 3930 | 6591 | 0 | 61 | 1 | no |
| information-types | loaded | 3912 | 6567 | 0 | 1 | 1 | no |
| procurement | loaded | 2443 | 37155 | 0 | 9 | 0 | no |
| attachments | loaded | 2909 | 5566 | 0 | 1 | 2 | no |
| reports | loaded | 2931 | 5592 | 0 | 8 | 12 | no |
| users | loaded | 2946 | 5600 | 0 | 1 | 1 | no |
| departments | loaded | 2905 | 5562 | 0 | 8 | 1 | no |
| roles | loaded | 2932 | 5586 | 0 | 1 | 1 | no |
| permissions | loaded | 3428 | 6084 | 0 | 0 | 1 | no |
| audit | loaded | 2402 | 5058 | 0 | 1 | 1 | no |
| settings | loaded | 3424 | 6079 | 0 | 1 | 3 | no |
| admin | loaded | 2396 | 5051 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T08:57:08.639Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6182 ms | 4833 ms | /د/س/ت/ر/س/ی/ /1/6/8/9/ /// /ر/و/ت/ر/ /3/1/4/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/0/8/m/s/×/1/,/ /g/e/t/A/l/l/:/4/3/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/3/7/m/s/×/1/ |
| /procurement/orders | 4675 ms | 3157 ms | /د/س/ت/ر/س/ی/ /1/4/6/3/ /// /ر/و/ت/ر/ /1/6/9/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/9/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/3/6/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/2/8/4/m/s/×/2/ |
| /procurement/needs | 7057 ms | 5398 ms | /د/س/ت/ر/س/ی/ /2/6/9/4/ /// /ر/و/ت/ر/ /2/7/0/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/0/8/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/8/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/2/8/m/s/×/1/ |
| /procurement/dashboard | 8085 ms | 6456 ms | /د/س/ت/ر/س/ی/ /3/0/4/8/ /// /ر/و/ت/ر/ /3/4/0/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/9/2/6/m/s/×/1/,/ /g/e/t/A/l/l/:/6/2/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/5/3/m/s/×/1/ |
| /procurement/workspace | 6020 ms | 2603 ms | /د/س/ت/ر/س/ی/ /9/6/2/ /// /ر/و/ت/ر/ /1/6/4/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/7/9/m/s/×/1/,/ /g/e/t/A/l/l/:/2/2/0/m/s/×/1/,/ /g/e/t/A/l/l/:/2/0/2/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

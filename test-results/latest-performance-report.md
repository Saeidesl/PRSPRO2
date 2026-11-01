# PMS UI and Performance Audit

- Generated: 2026-11-01T19:20:21.114Z
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
| visibleButtonsInventoried | 212 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 322 |
| procurementApiRequestsMeasured | 7 |
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
| dashboard | loaded | 3408 | 6074 | 0 | 24 | 2 | no |
| projects | loaded | 2910 | 5567 | 0 | 1 | 2 | no |
| project-detail | loaded | 2882 | 5538 | 0 | 2 | 0 | no |
| events | loaded | 2898 | 5553 | 0 | 15 | 1 | no |
| workflows | loaded | 2912 | 5568 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2402 | 5057 | 0 | 9 | 1 | no |
| event-types | loaded | 2395 | 5057 | 0 | 73 | 1 | no |
| information-types | loaded | 2882 | 5541 | 0 | 34 | 1 | no |
| procurement | loaded | 3924 | 28457 | 0 | 9 | 0 | no |
| attachments | loaded | 2384 | 5041 | 0 | 1 | 2 | no |
| reports | loaded | 2903 | 5561 | 0 | 8 | 12 | no |
| users | loaded | 2394 | 5052 | 0 | 1 | 1 | no |
| departments | loaded | 3391 | 5988 | 0 | 8 | 1 | no |
| roles | loaded | 2896 | 5553 | 0 | 19 | 1 | no |
| permissions | loaded | 4438 | 7093 | 0 | 0 | 1 | no |
| audit | loaded | 3397 | 6098 | 0 | 1 | 1 | no |
| settings | loaded | 4994 | 7650 | 0 | 1 | 3 | no |
| admin | loaded | 2384 | 5040 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T19:22:17.945Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 3335 ms | 2164 ms | /د/س/ت/ر/س/ی/ /5/7/7/ /// /ر/و/ت/ر/ /1/4/8/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/0/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/7/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/1/9/m/s/×/1/ |
| /procurement/orders | 4150 ms | 2888 ms | /د/س/ت/ر/س/ی/ /1/1/0/9/ /// /ر/و/ت/ر/ /1/7/7/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/5/8/m/s/×/1/,/ /g/e/t/A/l/l/:/4/4/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/7/6/m/s/×/1/ |
| /procurement/needs | 2710 ms | 1592 ms | /د/س/ت/ر/س/ی/ /6/2/2/ /// /ر/و/ت/ر/ /9/7/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/3/8/m/s/×/1/,/ /g/e/t/A/l/l/:/1/5/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/2/1/m/s/×/1/ |
| /procurement/dashboard | 5984 ms | 4430 ms | /د/س/ت/ر/س/ی/ /1/4/3/5/ /// /ر/و/ت/ر/ /2/9/9/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/4/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/5/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/1/9/m/s/×/1/ |
| /procurement/workspace | 5646 ms | 2425 ms | /د/س/ت/ر/س/ی/ /8/5/4/ /// /ر/و/ت/ر/ /1/5/7/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/4/4/m/s/×/1/,/ /g/e/t/A/l/l/:/3/3/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/9/8/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

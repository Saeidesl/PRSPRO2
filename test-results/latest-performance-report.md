# PMS UI and Performance Audit

- Generated: 2026-10-31T18:50:03.498Z
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
| visibleFormsInventoried | 12 |
| dynamicFormsInventoried | 12 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 175 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 304 |
| procurementApiRequestsMeasured | 7 |
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
| dashboard | loaded | 4932 | 7593 | 0 | 4 | 2 | no |
| projects | loaded | 3386 | 6043 | 0 | 25 | 2 | no |
| project-detail | loaded | 3389 | 6043 | 0 | 2 | 0 | no |
| events | loaded | 2879 | 5533 | 0 | 13 | 1 | no |
| workflows | loaded | 2395 | 5052 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2896 | 5550 | 0 | 9 | 1 | no |
| event-types | loaded | 3895 | 6557 | 0 | 69 | 1 | no |
| information-types | loaded | 2901 | 5556 | 0 | 1 | 1 | no |
| procurement | loaded | 3387 | 37531 | 0 | 9 | 0 | no |
| attachments | loaded | 2871 | 5528 | 0 | 1 | 2 | no |
| reports | loaded | 2890 | 5549 | 0 | 8 | 12 | no |
| users | loaded | 2887 | 5543 | 0 | 1 | 1 | no |
| departments | loaded | 2396 | 5053 | 0 | 8 | 1 | no |
| roles | loaded | 2391 | 5047 | 0 | 19 | 1 | no |
| permissions | loaded | 4900 | 7553 | 0 | 0 | 1 | no |
| audit | loaded | 4425 | 7080 | 0 | 1 | 1 | no |
| settings | loaded | 2934 | 5590 | 0 | 1 | 3 | no |
| admin | loaded | 2868 | 5524 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T18:52:16.186Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7843 ms | 6299 ms | /د/س/ت/ر/س/ی/ /1/9/2/0/ /// /ر/و/ت/ر/ /4/3/7/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/4/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/1/4/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/9/3/m/s/×/1/ |
| /procurement/orders | 4778 ms | 3425 ms | /د/س/ت/ر/س/ی/ /1/1/9/3/ /// /ر/و/ت/ر/ /2/2/3/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/9/9/m/s/×/1/,/ /g/e/t/A/l/l/:/4/9/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/9/4/m/s/×/1/ |
| /procurement/needs | 4443 ms | 3385 ms | /د/س/ت/ر/س/ی/ /1/9/8/8/ /// /ر/و/ت/ر/ /1/3/9/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/4/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/8/0/m/s/×/1/,/ /g/e/t/A/l/l/:/5/9/3/m/s/×/1/ |
| /procurement/dashboard | 6552 ms | 5516 ms | /د/س/ت/ر/س/ی/ /1/9/7/7/ /// /ر/و/ت/ر/ /3/5/3/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/0/3/9/m/s/×/1/,/ /g/e/t/A/l/l/:/9/7/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/7/1/m/s/×/1/ |
| /procurement/workspace | 7045 ms | 3525 ms | /د/س/ت/ر/س/ی/ /1/9/2/7/ /// /ر/و/ت/ر/ /1/5/9/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/5/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/7/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/6/5/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

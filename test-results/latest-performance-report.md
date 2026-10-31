# PMS UI and Performance Audit

- Generated: 2026-10-31T19:57:35.125Z
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
| visibleButtonsInventoried | 217 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 308 |
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
| dashboard | loaded | 2961 | 5621 | 0 | 24 | 2 | no |
| projects | loaded | 2916 | 5577 | 0 | 31 | 2 | no |
| project-detail | loaded | 3919 | 6573 | 0 | 2 | 0 | no |
| events | loaded | 2921 | 5580 | 0 | 15 | 1 | no |
| workflows | loaded | 2934 | 5593 | 0 | 3 | 2 | no |
| project-statuses | loaded | 3428 | 6085 | 0 | 1 | 1 | no |
| event-types | loaded | 3426 | 6091 | 0 | 69 | 1 | no |
| information-types | loaded | 2901 | 5556 | 0 | 1 | 1 | no |
| procurement | loaded | 2414 | 33970 | 0 | 9 | 0 | no |
| attachments | loaded | 2905 | 5559 | 0 | 1 | 2 | no |
| reports | loaded | 2931 | 5591 | 0 | 8 | 12 | no |
| users | loaded | 2924 | 5582 | 0 | 21 | 1 | no |
| departments | loaded | 3406 | 6061 | 0 | 8 | 1 | no |
| roles | loaded | 3928 | 6586 | 0 | 19 | 1 | no |
| permissions | loaded | 4460 | 7117 | 0 | 0 | 1 | no |
| audit | loaded | 3402 | 6057 | 0 | 1 | 1 | no |
| settings | loaded | 2898 | 5553 | 0 | 1 | 3 | no |
| admin | loaded | 2401 | 5057 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T19:59:42.747Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4613 ms | 3557 ms | /د/س/ت/ر/س/ی/ /1/1/3/4/ /// /ر/و/ت/ر/ /2/4/2/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/1/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/5/5/m/s/×/2/,/ /g/e/t/A/l/l/:/2/5/5/m/s/×/1/ |
| /procurement/orders | 4318 ms | 2879 ms | /د/س/ت/ر/س/ی/ /8/5/6/ /// /ر/و/ت/ر/ /2/0/2/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/6/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/1/4/m/s/×/1/,/ /g/e/t/A/l/l/:/5/0/1/m/s/×/1/ |
| /procurement/needs | 3803 ms | 2581 ms | /د/س/ت/ر/س/ی/ /8/4/4/ /// /ر/و/ت/ر/ /1/7/3/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/8/4/m/s/×/1/,/ /g/e/t/A/l/l/:/2/3/9/m/s/×/1/,/ /g/e/t/A/l/l/:/1/9/6/m/s/×/1/ |
| /procurement/dashboard | 7380 ms | 5355 ms | /د/س/ت/ر/س/ی/ /2/5/8/4/ /// /ر/و/ت/ر/ /2/7/6/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/4/5/3/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/1/0/4/0/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/3/8/1/m/s/×/1/ |
| /procurement/workspace | 7470 ms | 4139 ms | /د/س/ت/ر/س/ی/ /1/6/9/1/ /// /ر/و/ت/ر/ /2/4/4/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/9/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/8/3/6/m/s/×/1/,/ /g/e/t/A/l/l/:/5/4/6/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

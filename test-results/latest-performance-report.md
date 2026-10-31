# PMS UI and Performance Audit

- Generated: 2026-10-31T14:30:30.203Z
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
| visibleButtonsInventoried | 77 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 272 |
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
| dashboard | loaded | 3929 | 6589 | 0 | 14 | 2 | no |
| projects | loaded | 4927 | 7584 | 0 | 1 | 2 | no |
| project-detail | loaded | 3410 | 6067 | 0 | 2 | 0 | no |
| events | loaded | 3911 | 6566 | 0 | 5 | 1 | no |
| workflows | loaded | 2920 | 5577 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4433 | 7090 | 0 | 1 | 1 | no |
| event-types | loaded | 3926 | 6582 | 0 | 1 | 1 | no |
| information-types | loaded | 3908 | 6565 | 0 | 1 | 1 | no |
| procurement | loaded | 4418 | 35843 | 0 | 9 | 0 | no |
| attachments | loaded | 3410 | 6067 | 0 | 1 | 2 | no |
| reports | loaded | 3927 | 6586 | 0 | 8 | 12 | no |
| users | loaded | 2903 | 5558 | 0 | 1 | 1 | no |
| departments | loaded | 3401 | 6057 | 0 | 8 | 1 | no |
| roles | loaded | 3426 | 6083 | 0 | 19 | 1 | no |
| permissions | loaded | 3465 | 6120 | 0 | 0 | 1 | no |
| audit | loaded | 3418 | 6074 | 0 | 1 | 1 | no |
| settings | loaded | 3908 | 6562 | 0 | 1 | 3 | no |
| admin | loaded | 4422 | 7078 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T14:32:46.059Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6625 ms | 5144 ms | /د/س/ت/ر/س/ی/ /2/3/4/7/ /// /ر/و/ت/ر/ /2/7/9/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/6/8/3/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/1/4/7/5/m/s/×/2/,/ /g/e/t/A/l/l/:/5/0/8/m/s/×/1/ |
| /procurement/orders | 4918 ms | 3714 ms | /د/س/ت/ر/س/ی/ /1/4/7/2/ /// /ر/و/ت/ر/ /2/2/4/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/2/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/1/8/m/s/×/1/,/ /g/e/t/A/l/l/:/2/9/6/m/s/×/1/ |
| /procurement/needs | 5467 ms | 3782 ms | /د/س/ت/ر/س/ی/ /1/1/7/1/ /// /ر/و/ت/ر/ /2/6/1/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/7/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/9/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/3/9/m/s/×/1/ |
| /procurement/dashboard | 5105 ms | 3804 ms | /د/س/ت/ر/س/ی/ /1/2/9/8/ /// /ر/و/ت/ر/ /2/5/0/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/1/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/2/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/2/1/m/s/×/1/ |
| /procurement/workspace | 5311 ms | 3104 ms | /د/س/ت/ر/س/ی/ /1/1/1/0/ /// /ر/و/ت/ر/ /1/9/9/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/2/3/m/s/×/1/,/ /g/e/t/A/l/l/:/2/9/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/4/7/m/s/×/2/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

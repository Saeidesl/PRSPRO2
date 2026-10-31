# PMS UI and Performance Audit

- Generated: 2026-10-31T12:36:20.702Z
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
| visibleButtonsInventoried | 153 |
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
| dashboard | loaded | 3000 | 5659 | 0 | 4 | 2 | no |
| projects | loaded | 2916 | 5573 | 0 | 1 | 2 | no |
| project-detail | loaded | 2917 | 5574 | 0 | 2 | 0 | no |
| events | loaded | 3411 | 6067 | 0 | 9 | 1 | no |
| workflows | loaded | 2929 | 5585 | 0 | 3 | 2 | no |
| project-statuses | loaded | 4432 | 7087 | 0 | 9 | 1 | no |
| event-types | loaded | 3428 | 6089 | 0 | 65 | 1 | no |
| information-types | loaded | 3406 | 6061 | 0 | 1 | 1 | no |
| procurement | loaded | 4432 | 33661 | 0 | 9 | 0 | no |
| attachments | loaded | 3899 | 6555 | 0 | 9 | 2 | no |
| reports | loaded | 3427 | 6088 | 0 | 8 | 12 | no |
| users | loaded | 3405 | 6062 | 0 | 1 | 1 | no |
| departments | loaded | 3441 | 6098 | 0 | 8 | 1 | no |
| roles | loaded | 2945 | 5603 | 0 | 19 | 1 | no |
| permissions | loaded | 3429 | 6085 | 0 | 0 | 1 | no |
| audit | loaded | 2914 | 5602 | 0 | 1 | 1 | no |
| settings | loaded | 2948 | 5604 | 0 | 1 | 3 | no |
| admin | loaded | 4408 | 7065 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T12:38:30.874Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5129 ms | 3622 ms | /د/س/ت/ر/س/ی/ /1/0/7/8/ /// /ر/و/ت/ر/ /2/5/4/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/8/2/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/4/9/2/m/s/×/3/,/ /f/i/n/d/B/y/I/d/:/3/6/7/m/s/×/1/ |
| /procurement/orders | 4694 ms | 3394 ms | /د/س/ت/ر/س/ی/ /1/4/4/7/ /// /ر/و/ت/ر/ /1/9/4/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/4/4/m/s/×/1/,/ /g/e/t/A/l/l/:/2/9/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/7/8/m/s/×/1/ |
| /procurement/needs | 5303 ms | 3781 ms | /د/س/ت/ر/س/ی/ /1/5/5/6/ /// /ر/و/ت/ر/ /2/2/2/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/9/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/3/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/3/7/m/s/×/1/ |
| /procurement/dashboard | 5989 ms | 4557 ms | /د/س/ت/ر/س/ی/ /1/7/8/5/ /// /ر/و/ت/ر/ /2/7/7/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/7/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/9/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/5/4/m/s/×/1/ |
| /procurement/workspace | 5423 ms | 3167 ms | /د/س/ت/ر/س/ی/ /1/1/4/9/ /// /ر/و/ت/ر/ /2/0/1/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/3/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/6/3/m/s/×/1/,/ /g/e/t/A/l/l/:/2/2/0/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

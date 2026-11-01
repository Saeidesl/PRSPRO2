# PMS UI and Performance Audit

- Generated: 2026-11-01T16:31:39.054Z
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
| visibleButtonsInventoried | 114 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 282 |
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
| dashboard | loaded | 3380 | 6038 | 0 | 24 | 2 | no |
| projects | loaded | 3877 | 6535 | 0 | 1 | 2 | no |
| project-detail | loaded | 3358 | 6014 | 0 | 2 | 0 | no |
| events | loaded | 3865 | 6521 | 0 | 5 | 1 | no |
| workflows | loaded | 3374 | 6028 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2884 | 5540 | 0 | 9 | 1 | no |
| event-types | loaded | 4401 | 7057 | 0 | 1 | 1 | no |
| information-types | loaded | 3874 | 6529 | 0 | 1 | 1 | no |
| procurement | loaded | 2878 | 32928 | 0 | 9 | 0 | no |
| attachments | loaded | 3368 | 6024 | 0 | 18 | 2 | no |
| reports | loaded | 3380 | 6039 | 0 | 8 | 12 | no |
| users | loaded | 2892 | 5548 | 0 | 21 | 1 | no |
| departments | loaded | 3368 | 6024 | 0 | 8 | 1 | no |
| roles | loaded | 3387 | 6041 | 0 | 1 | 1 | no |
| permissions | loaded | 3409 | 6064 | 0 | 0 | 1 | no |
| audit | loaded | 2863 | 5517 | 0 | 1 | 1 | no |
| settings | loaded | 2874 | 5528 | 0 | 1 | 3 | no |
| admin | loaded | 3372 | 6027 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T16:33:51.425Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4667 ms | 3154 ms | /د/س/ت/ر/س/ی/ /1/0/4/4/ /// /ر/و/ت/ر/ /2/1/1/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/6/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/1/6/m/s/×/2/,/ /g/e/t/A/l/l/:/2/1/5/m/s/×/1/ |
| /procurement/orders | 4570 ms | 3237 ms | /د/س/ت/ر/س/ی/ /1/2/3/7/ /// /ر/و/ت/ر/ /1/9/9/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/7/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/4/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/0/2/m/s/×/1/ |
| /procurement/needs | 4619 ms | 3008 ms | /د/س/ت/ر/س/ی/ /1/1/6/0/ /// /ر/و/ت/ر/ /1/8/4/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/5/1/m/s/×/1/,/ /g/e/t/A/l/l/:/2/7/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/0/7/m/s/×/1/ |
| /procurement/dashboard | 4717 ms | 3506 ms | /د/س/ت/ر/س/ی/ /1/3/1/6/ /// /ر/و/ت/ر/ /2/1/9/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/6/7/m/s/×/1/,/ /g/e/t/A/l/l/:/2/8/6/m/s/×/1/,/ /g/e/t/A/l/l/:/2/7/7/m/s/×/1/ |
| /procurement/workspace | 8783 ms | 3506 ms | /د/س/ت/ر/س/ی/ /1/1/8/9/ /// /ر/و/ت/ر/ /2/3/1/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/3/1/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/5/4/9/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/4/4/4/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

# PMS UI and Performance Audit

- Generated: 2026-11-02T09:56:10.768Z
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
| visibleButtonsInventoried | 64 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 268 |
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
| dashboard | loaded | 3932 | 6592 | 0 | 4 | 2 | no |
| projects | loaded | 3904 | 6560 | 0 | 1 | 2 | no |
| project-detail | loaded | 3898 | 6556 | 0 | 2 | 0 | no |
| print-design | loaded | 3900 | 6560 | 1 | 14 | 5 | no |
| print-output | loaded | 3891 | 6548 | 0 | 1 | 2 | no |
| events | loaded | 3894 | 6550 | 0 | 5 | 1 | no |
| workflows | loaded | 4399 | 7056 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3913 | 6571 | 0 | 1 | 1 | no |
| event-types | loaded | 5904 | 8559 | 0 | 1 | 1 | no |
| information-types | loaded | 3893 | 6550 | 0 | 1 | 1 | no |
| procurement | loaded | 3401 | 40604 | 0 | 9 | 0 | no |
| attachments | loaded | 3420 | 6077 | 0 | 1 | 2 | no |
| reports | loaded | 3410 | 6072 | 0 | 8 | 12 | no |
| users | loaded | 3389 | 6046 | 0 | 1 | 1 | no |
| departments | loaded | 3880 | 6538 | 0 | 8 | 1 | no |
| roles | loaded | 3904 | 6561 | 0 | 1 | 1 | no |
| permissions | loaded | 4403 | 7057 | 0 | 0 | 1 | no |
| audit | loaded | 3883 | 6539 | 0 | 1 | 1 | no |
| settings | loaded | 3889 | 6547 | 0 | 1 | 3 | no |
| admin | loaded | 4396 | 7052 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-02T09:58:51.443Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7084 ms | 5456 ms | /د/س/ت/ر/س/ی/ /1/3/9/7/ /// /ر/و/ت/ر/ /4/0/5/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/1/7/m/s/×/1/,/ /g/e/t/A/l/l/:/6/9/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/4/2/m/s/×/1/ |
| /procurement/orders | 4727 ms | 3615 ms | /د/س/ت/ر/س/ی/ /1/4/0/8/ /// /ر/و/ت/ر/ /2/2/0/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/2/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/4/m/s/×/1/,/ /g/e/t/A/l/l/:/4/6/4/m/s/×/1/ |
| /procurement/needs | 5684 ms | 4041 ms | /د/س/ت/ر/س/ی/ /1/3/2/6/ /// /ر/و/ت/ر/ /2/7/1/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/3/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/1/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/3/0/m/s/×/1/ |
| /procurement/dashboard | 6938 ms | 5201 ms | /د/س/ت/ر/س/ی/ /2/0/5/9/ /// /ر/و/ت/ر/ /3/1/4/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/0/1/m/s/×/1/,/ /g/e/t/A/l/l/:/6/1/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/8/5/m/s/×/1/ |
| /procurement/workspace | 7294 ms | 4261 ms | /د/س/ت/ر/س/ی/ /1/4/7/3/ /// /ر/و/ت/ر/ /2/7/8/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/3/0/m/s/×/1/,/ /g/e/t/A/l/l/:/5/3/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/4/1/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

# PMS UI and Performance Audit

- Generated: 2026-11-04T19:03:24.018Z
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
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 10 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 98 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 296 |
| procurementApiRequestsMeasured | 7 |
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
| dashboard | loaded | 3926 | 6587 | 0 | 4 | 2 | no |
| projects | loaded | 3406 | 6062 | 0 | 1 | 2 | no |
| project-detail | loaded | 3403 | 6061 | 0 | 2 | 0 | no |
| print-design | loaded | 3405 | 6066 | 1 | 14 | 5 | no |
| print-output | loaded | 3908 | 6565 | 0 | 1 | 2 | no |
| events | loaded | 2920 | 5579 | 0 | 7 | 1 | no |
| workflows | loaded | 3405 | 6070 | 0 | 13 | 2 | no |
| project-statuses | loaded | 3418 | 6076 | 0 | 1 | 1 | no |
| event-types | loaded | 2916 | 5574 | 0 | 1 | 1 | no |
| information-types | loaded | 3929 | 6588 | 0 | 1 | 1 | no |
| procurement | loaded | 3918 | 49338 | 0 | 9 | 0 | no |
| attachments | loaded | 2895 | 5553 | 0 | 1 | 2 | no |
| reports | loaded | 2446 | 5105 | 0 | 8 | 12 | no |
| users | loaded | 3437 | 6094 | 0 | 21 | 1 | no |
| departments | loaded | 3898 | 6557 | 0 | 8 | 1 | no |
| roles | loaded | 4423 | 7082 | 0 | 1 | 1 | no |
| permissions | loaded | 3950 | 6606 | 0 | 0 | 1 | no |
| audit | loaded | 2892 | 5549 | 0 | 1 | 1 | no |
| settings | loaded | 3910 | 6568 | 0 | 1 | 3 | no |
| admin | loaded | 3410 | 6063 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-04T19:06:07.634Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 8589 ms | 6640 ms | /د/س/ت/ر/س/ی/ /2/1/7/6/ /// /ر/و/ت/ر/ /4/4/6/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/0/1/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/1/3/m/s/×/1/,/ /g/e/t/A/l/l/:/6/9/9/m/s/×/1/ |
| /procurement/orders | 4615 ms | 3487 ms | /د/س/ت/ر/س/ی/ /1/3/9/2/ /// /ر/و/ت/ر/ /2/0/9/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/7/5/m/s/×/1/,/ /g/e/t/A/l/l/:/4/9/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/1/6/m/s/×/1/ |
| /procurement/needs | 5235 ms | 3999 ms | /د/س/ت/ر/س/ی/ /1/0/8/1/ /// /ر/و/ت/ر/ /2/9/1/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/5/2/m/s/×/1/,/ /g/e/t/A/l/l/:/4/7/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/1/1/m/s/×/1/ |
| /procurement/dashboard | 6374 ms | 4314 ms | /د/س/ت/ر/س/ی/ /1/9/3/0/ /// /ر/و/ت/ر/ /2/3/8/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/3/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/0/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/9/4/m/s/×/1/ |
| /procurement/workspace | 17119 ms | 4374 ms | /د/س/ت/ر/س/ی/ /2/0/3/4/ /// /ر/و/ت/ر/ /2/3/3/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/6/0/m/s/×/2/,/ /g/e/t/A/l/l/:/7/0/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/3/9/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

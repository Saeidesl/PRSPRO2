# PMS UI and Performance Audit

- Generated: 2026-11-04T17:45:21.552Z
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
| visibleButtonsInventoried | 143 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 292 |
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
| dashboard | loaded | 4423 | 7084 | 0 | 4 | 2 | no |
| projects | loaded | 3910 | 6568 | 0 | 1 | 2 | no |
| project-detail | loaded | 4919 | 7574 | 0 | 2 | 0 | no |
| print-design | loaded | 3408 | 6070 | 1 | 14 | 5 | no |
| print-output | loaded | 6921 | 9578 | 0 | 1 | 2 | no |
| events | loaded | 4413 | 7072 | 0 | 30 | 1 | no |
| workflows | loaded | 3925 | 6583 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2915 | 5573 | 0 | 1 | 1 | no |
| event-types | loaded | 3443 | 6107 | 0 | 55 | 1 | no |
| information-types | loaded | 3406 | 6062 | 0 | 1 | 1 | no |
| procurement | loaded | 3938 | 36443 | 0 | 9 | 0 | no |
| attachments | loaded | 3404 | 6063 | 0 | 1 | 2 | no |
| reports | loaded | 3422 | 6086 | 0 | 8 | 12 | no |
| users | loaded | 4412 | 7069 | 0 | 1 | 1 | no |
| departments | loaded | 5409 | 8066 | 0 | 8 | 1 | no |
| roles | loaded | 3424 | 6083 | 0 | 1 | 1 | no |
| permissions | loaded | 3418 | 6076 | 0 | 0 | 1 | no |
| audit | loaded | 4405 | 7062 | 0 | 1 | 1 | no |
| settings | loaded | 4906 | 7564 | 0 | 1 | 3 | no |
| admin | loaded | 3395 | 6051 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-04T17:47:57.393Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5321 ms | 3475 ms | /د/س/ت/ر/س/ی/ /1/1/8/8/ /// /ر/و/ت/ر/ /2/2/8/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/3/8/m/s/×/1/,/ /g/e/t/A/l/l/:/3/0/2/m/s/×/1/,/ /g/e/t/A/l/l/:/2/8/5/m/s/×/1/ |
| /procurement/orders | 6133 ms | 4667 ms | /د/س/ت/ر/س/ی/ /1/3/6/2/ /// /ر/و/ت/ر/ /3/3/0/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/7/0/m/s/×/1/,/ /g/e/t/A/l/l/:/9/0/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/9/7/m/s/×/1/ |
| /procurement/needs | 4927 ms | 3342 ms | /د/س/ت/ر/س/ی/ /1/1/0/5/ /// /ر/و/ت/ر/ /2/2/3/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/6/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/3/0/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/9/m/s/×/1/ |
| /procurement/dashboard | 3657 ms | 2552 ms | /د/س/ت/ر/س/ی/ /9/1/8/ /// /ر/و/ت/ر/ /1/6/3/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/2/8/m/s/×/1/,/ /g/e/t/A/l/l/:/2/3/4/m/s/×/1/,/ /g/e/t/A/l/l/:/1/8/9/m/s/×/1/ |
| /procurement/workspace | 6456 ms | 5308 ms | /د/س/ت/ر/س/ی/ /2/9/9/7/ /// /ر/و/ت/ر/ /2/3/1/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/2/1/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/0/4/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/9/4/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

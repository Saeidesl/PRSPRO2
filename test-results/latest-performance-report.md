# PMS UI and Performance Audit

- Generated: 2026-11-04T18:08:06.651Z
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
| visibleFormsInventoried | 13 |
| dynamicFormsInventoried | 12 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 203 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 308 |
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
| dashboard | loaded | 4992 | 7654 | 0 | 4 | 2 | no |
| projects | loaded | 3937 | 6595 | 0 | 1 | 2 | no |
| project-detail | loaded | 2929 | 5585 | 0 | 2 | 0 | no |
| print-design | loaded | 3927 | 6587 | 1 | 14 | 5 | no |
| print-output | loaded | 2921 | 5580 | 0 | 1 | 2 | no |
| events | loaded | 3430 | 6089 | 0 | 31 | 1 | no |
| workflows | loaded | 2935 | 5593 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3477 | 6134 | 0 | 9 | 1 | no |
| event-types | loaded | 3969 | 6633 | 0 | 55 | 1 | no |
| information-types | loaded | 2917 | 5580 | 0 | 34 | 1 | no |
| procurement | loaded | 3434 | 42799 | 0 | 9 | 0 | no |
| attachments | loaded | 5455 | 8115 | 0 | 1 | 2 | no |
| reports | loaded | 4949 | 7608 | 0 | 8 | 12 | no |
| users | loaded | 4432 | 7090 | 0 | 1 | 1 | no |
| departments | loaded | 3939 | 6598 | 0 | 8 | 1 | no |
| roles | loaded | 3439 | 6100 | 0 | 19 | 1 | no |
| permissions | loaded | 3946 | 6604 | 0 | 0 | 1 | no |
| audit | loaded | 3437 | 6108 | 0 | 1 | 1 | no |
| settings | loaded | 3491 | 6147 | 0 | 1 | 3 | no |
| admin | loaded | 3910 | 6567 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-04T18:10:40.576Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 9210 ms | 7440 ms | /د/س/ت/ر/س/ی/ /1/4/0/5/ /// /ر/و/ت/ر/ /6/0/3/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/2/0/5/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/9/7/1/m/s/×/1/,/ /g/e/t/A/l/l/:/1/1/9/2/m/s/×/1/ |
| /procurement/orders | 6924 ms | 5268 ms | /د/س/ت/ر/س/ی/ /2/6/1/1/ /// /ر/و/ت/ر/ /2/6/5/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/6/2/8/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/1/3/1/9/m/s/×/2/,/ /g/e/t/A/l/l/:/3/9/5/m/s/×/1/ |
| /procurement/needs | 4804 ms | 3713 ms | /د/س/ت/ر/س/ی/ /1/0/5/7/ /// /ر/و/ت/ر/ /2/6/5/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/0/3/m/s/×/1/,/ /g/e/t/A/l/l/:/4/5/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/6/4/m/s/×/1/ |
| /procurement/dashboard | 5349 ms | 3621 ms | /د/س/ت/ر/س/ی/ /1/2/5/9/ /// /ر/و/ت/ر/ /2/3/6/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/4/2/m/s/×/1/,/ /g/e/t/A/l/l/:/5/2/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/7/6/m/s/×/1/ |
| /procurement/workspace | 9081 ms | 4854 ms | /د/س/ت/ر/س/ی/ /2/2/3/1/ /// /ر/و/ت/ر/ /2/6/2/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/8/5/m/s/×/1/,/ /g/e/t/A/l/l/:/7/0/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/0/1/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

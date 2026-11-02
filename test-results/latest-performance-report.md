# PMS UI and Performance Audit

- Generated: 2026-11-02T09:18:50.741Z
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
| visibleButtonsInventoried | 70 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 281 |
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
| dashboard | loaded | 4970 | 7630 | 0 | 4 | 2 | no |
| projects | loaded | 2927 | 5584 | 0 | 1 | 2 | no |
| project-detail | loaded | 3397 | 6054 | 0 | 2 | 0 | no |
| print-design | loaded | 4410 | 7072 | 1 | 10 | 5 | no |
| print-output | loaded | 3919 | 6577 | 0 | 1 | 2 | no |
| events | loaded | 4416 | 7073 | 0 | 5 | 1 | no |
| workflows | loaded | 3924 | 6579 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2938 | 5596 | 0 | 9 | 1 | no |
| event-types | loaded | 4423 | 7081 | 0 | 1 | 1 | no |
| information-types | loaded | 4914 | 7572 | 0 | 1 | 1 | no |
| procurement | loaded | 3922 | 51296 | 0 | 9 | 0 | no |
| attachments | loaded | 3928 | 6587 | 0 | 1 | 2 | no |
| reports | loaded | 3929 | 6590 | 0 | 8 | 12 | no |
| users | loaded | 3901 | 6558 | 0 | 1 | 1 | no |
| departments | loaded | 4404 | 7062 | 0 | 8 | 1 | no |
| roles | loaded | 3920 | 6577 | 0 | 1 | 1 | no |
| permissions | loaded | 4423 | 7081 | 0 | 0 | 1 | no |
| audit | loaded | 3438 | 6096 | 0 | 1 | 1 | no |
| settings | loaded | 4401 | 7059 | 0 | 1 | 3 | no |
| admin | loaded | 4405 | 7063 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-02T09:21:37.061Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5268 ms | 3823 ms | /د/س/ت/ر/س/ی/ /1/0/1/0/ /// /ر/و/ت/ر/ /2/8/1/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/3/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/1/5/m/s/×/1/,/ /g/e/t/A/l/l/:/2/7/7/m/s/×/1/ |
| /procurement/orders | 9239 ms | 7635 ms | /د/س/ت/ر/س/ی/ /3/8/2/0/ /// /ر/و/ت/ر/ /3/8/1/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/3/2/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/2/4/3/m/s/×/1/,/ /g/e/t/A/l/l/:/8/0/6/m/s/×/1/ |
| /procurement/needs | 5099 ms | 4095 ms | /د/س/ت/ر/س/ی/ /1/4/5/5/ /// /ر/و/ت/ر/ /2/6/3/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/1/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/6/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/7/4/m/s/×/1/ |
| /procurement/dashboard | 5359 ms | 3773 ms | /د/س/ت/ر/س/ی/ /1/5/7/9/ /// /ر/و/ت/ر/ /2/1/9/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/9/1/m/s/×/1/,/ /g/e/t/A/l/l/:/6/9/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/2/4/m/s/×/1/ |
| /procurement/workspace | 17919 ms | 4770 ms | /د/س/ت/ر/س/ی/ /2/1/9/4/ /// /ر/و/ت/ر/ /2/5/7/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/0/9/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/5/5/7/m/s/×/2/,/ /g/e/t/A/l/l/:/5/1/8/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

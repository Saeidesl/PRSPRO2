# PMS UI and Performance Audit

- Generated: 2026-11-02T11:03:08.816Z
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
| visibleButtonsInventoried | 169 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 299 |
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
| dashboard | loaded | 4496 | 7156 | 0 | 4 | 2 | no |
| projects | loaded | 3434 | 6093 | 0 | 1 | 2 | no |
| project-detail | loaded | 3423 | 6082 | 0 | 2 | 0 | no |
| print-design | loaded | 3919 | 6579 | 1 | 14 | 5 | no |
| print-output | loaded | 4418 | 7076 | 0 | 1 | 2 | no |
| events | loaded | 2931 | 5590 | 0 | 5 | 1 | no |
| workflows | loaded | 3448 | 6106 | 0 | 1 | 2 | no |
| project-statuses | loaded | 7470 | 10126 | 0 | 1 | 1 | no |
| event-types | loaded | 3401 | 6068 | 0 | 73 | 1 | no |
| information-types | loaded | 3914 | 6575 | 0 | 34 | 1 | no |
| procurement | loaded | 3948 | 39825 | 0 | 9 | 0 | no |
| attachments | loaded | 3911 | 6570 | 0 | 1 | 2 | no |
| reports | loaded | 3961 | 6625 | 0 | 8 | 12 | no |
| users | loaded | 2913 | 5570 | 0 | 1 | 1 | no |
| departments | loaded | 2414 | 5072 | 0 | 8 | 1 | no |
| roles | loaded | 4433 | 7088 | 0 | 1 | 1 | no |
| permissions | loaded | 6944 | 9601 | 0 | 0 | 1 | no |
| audit | loaded | 3927 | 6586 | 0 | 1 | 1 | no |
| settings | loaded | 3412 | 6069 | 0 | 1 | 3 | no |
| admin | loaded | 2962 | 5621 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-02T11:05:49.456Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5985 ms | 4404 ms | /د/س/ت/ر/س/ی/ /1/3/4/0/ /// /ر/و/ت/ر/ /3/0/6/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/2/7/m/s/×/1/,/ /g/e/t/A/l/l/:/4/6/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/7/2/m/s/×/1/ |
| /procurement/orders | 4255 ms | 2757 ms | /د/س/ت/ر/س/ی/ /1/0/7/0/ /// /ر/و/ت/ر/ /1/6/8/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/6/8/m/s/×/1/,/ /g/e/t/A/l/l/:/4/0/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/4/4/m/s/×/1/ |
| /procurement/needs | 5461 ms | 4086 ms | /د/س/ت/ر/س/ی/ /1/4/7/9/ /// /ر/و/ت/ر/ /2/6/0/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/8/0/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/6/7/m/s/×/1/,/ /g/e/t/A/l/l/:/4/2/2/m/s/×/1/ |
| /procurement/dashboard | 7703 ms | 6063 ms | /د/س/ت/ر/س/ی/ /2/2/5/6/ /// /ر/و/ت/ر/ /3/8/0/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/3/7/0/m/s/×/1/,/ /g/e/t/A/l/l/:/9/6/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/8/3/8/m/s/×/1/ |
| /procurement/workspace | 8991 ms | 4769 ms | /د/س/ت/ر/س/ی/ /2/1/2/1/ /// /ر/و/ت/ر/ /2/6/4/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/0/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/9/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/4/4/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

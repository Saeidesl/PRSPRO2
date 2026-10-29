# PMS UI and Performance Audit

- Generated: 2026-10-29T10:27:06.517Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **needs-attention**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 17 |
| loadedRoutes | 17 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 12 |
| visibleButtonsInventoried | 112 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 327 |
| procurementApiRequestsMeasured | 7 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 20 |
| failedSafeButtonChecks | 5 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 4485 | 7143 | 0 | 8 | 2 | no |
| projects | loaded | 2938 | 5595 | 0 | 1 | 2 | no |
| project-detail | loaded | 4916 | 7575 | 0 | 2 | 0 | no |
| events | loaded | 3912 | 6568 | 0 | 5 | 1 | no |
| workflows | loaded | 3934 | 6589 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4430 | 7087 | 0 | 1 | 1 | no |
| event-types | loaded | 3425 | 6087 | 0 | 43 | 1 | no |
| procurement | loaded | 6917 | 42071 | 0 | 9 | 0 | no |
| attachments | loaded | 3909 | 6567 | 0 | 1 | 2 | no |
| reports | loaded | 2918 | 5577 | 0 | 8 | 12 | no |
| users | loaded | 3912 | 6571 | 0 | 1 | 1 | no |
| departments | loaded | 4429 | 7088 | 0 | 8 | 1 | no |
| roles | loaded | 4428 | 7084 | 0 | 19 | 1 | no |
| permissions | loaded | 3422 | 6078 | 0 | 0 | 1 | no |
| audit | loaded | 5450 | 8107 | 0 | 1 | 1 | no |
| settings | loaded | 3940 | 6596 | 0 | 1 | 3 | no |
| admin | loaded | 3912 | 6570 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T10:29:20.877Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5473 ms | 3986 ms | /د/س/ت/ر/س/ی/ /1/1/3/3/ /// /ر/و/ت/ر/ /2/8/5/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/4/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/0/8/m/s/×/1/,/ /g/e/t/A/l/l/:/3/2/0/m/s/×/1/ |
| /procurement/orders | 8492 ms | 6769 ms | /د/س/ت/ر/س/ی/ /2/6/7/6/ /// /ر/و/ت/ر/ /4/0/9/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/6/6/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/1/4/0/5/m/s/×/1/,/ /g/e/t/A/l/l/:/9/0/3/m/s/×/1/ |
| /procurement/needs | 6394 ms | 4938 ms | /د/س/ت/ر/س/ی/ /2/1/9/2/ /// /ر/و/ت/ر/ /2/7/4/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/9/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/8/9/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/9/6/m/s/×/1/ |
| /procurement/dashboard | 5575 ms | 4709 ms | /د/س/ت/ر/س/ی/ /1/2/6/9/ /// /ر/و/ت/ر/ /3/4/4/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/0/3/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/0/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/7/9/m/s/×/1/ |
| /procurement/workspace | 5227 ms | 3771 ms | /د/س/ت/ر/س/ی/ /1/4/8/3/ /// /ر/و/ت/ر/ /2/2/8/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/8/7/m/s/×/1/,/ /g/e/t/A/l/l/:/4/5/2/m/s/×/1/,/ /g/e/t/A/l/l/:/4/4/1/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

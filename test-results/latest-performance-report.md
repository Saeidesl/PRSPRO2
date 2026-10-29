# PMS UI and Performance Audit

- Generated: 2026-10-29T14:58:05.238Z
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
| visibleFormsInventoried | 10 |
| dynamicFormsInventoried | 10 |
| formOpenersChecked | 12 |
| visibleButtonsInventoried | 66 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 317 |
| procurementApiRequestsMeasured | 6 |
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
| dashboard | loaded | 3466 | 6125 | 0 | 4 | 2 | no |
| projects | loaded | 2914 | 5573 | 0 | 1 | 2 | no |
| project-detail | loaded | 3913 | 6570 | 0 | 2 | 0 | no |
| events | loaded | 4408 | 7064 | 0 | 5 | 1 | no |
| workflows | loaded | 4426 | 7084 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3426 | 6082 | 0 | 1 | 1 | no |
| event-types | loaded | 4922 | 7579 | 0 | 1 | 1 | no |
| procurement | loaded | 3403 | 42735 | 0 | 9 | 0 | no |
| attachments | loaded | 4899 | 7556 | 0 | 1 | 2 | no |
| reports | loaded | 4416 | 7075 | 0 | 8 | 12 | no |
| users | loaded | 3905 | 6563 | 0 | 1 | 1 | no |
| departments | loaded | 4398 | 7055 | 0 | 8 | 1 | no |
| roles | loaded | 4419 | 7078 | 0 | 19 | 1 | no |
| permissions | loaded | 3417 | 6070 | 0 | 0 | 1 | no |
| audit | loaded | 3403 | 6058 | 0 | 1 | 1 | no |
| settings | loaded | 2896 | 5551 | 0 | 1 | 3 | no |
| admin | loaded | 3922 | 6578 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T15:00:17.612Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7032 ms | 5368 ms | /د/س/ت/ر/س/ی/ /1/8/4/4/ /// /ر/و/ت/ر/ /3/5/2/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/2/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/8/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/3/1/m/s/×/1/ |
| /procurement/orders | 5482 ms | 3453 ms | /د/س/ت/ر/س/ی/ /1/2/4/6/ /// /ر/و/ت/ر/ /2/2/0/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/8/0/m/s/×/1/,/ /g/e/t/A/l/l/:/3/3/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/9/4/m/s/×/2/ |
| /procurement/needs | 5593 ms | 3788 ms | /د/س/ت/ر/س/ی/ /1/4/4/1/ /// /ر/و/ت/ر/ /2/3/4/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/4/1/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/4/7/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/5/9/m/s/×/2/ |
| /procurement/dashboard | 8013 ms | 6023 ms | /د/س/ت/ر/س/ی/ /2/7/9/9/ /// /ر/و/ت/ر/ /3/2/2/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/5/3/2/m/s/×/1/,/ /g/e/t/A/l/l/:/6/2/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/7/2/m/s/×/1/ |
| /procurement/workspace | 9736 ms | 5354 ms | /د/س/ت/ر/س/ی/ /2/8/4/3/ /// /ر/و/ت/ر/ /2/5/1/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/4/7/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/7/0/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/2/9/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

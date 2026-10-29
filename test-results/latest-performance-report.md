# PMS UI and Performance Audit

- Generated: 2026-10-29T14:41:19.225Z
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
| visibleButtonsInventoried | 113 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 315 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 20 |
| failedSafeButtonChecks | 6 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3471 | 6130 | 0 | 4 | 2 | no |
| projects | loaded | 3930 | 6589 | 0 | 1 | 2 | no |
| project-detail | loaded | 3917 | 6573 | 0 | 2 | 0 | no |
| events | loaded | 3406 | 6065 | 0 | 8 | 1 | no |
| workflows | loaded | 3439 | 6095 | 0 | 3 | 2 | no |
| project-statuses | loaded | 3931 | 6588 | 0 | 1 | 1 | no |
| event-types | loaded | 3919 | 6581 | 0 | 43 | 1 | no |
| procurement | loaded | 3407 | 35679 | 0 | 9 | 0 | no |
| attachments | loaded | 3913 | 6569 | 0 | 1 | 2 | no |
| reports | loaded | 3424 | 6084 | 0 | 8 | 12 | no |
| users | loaded | 4409 | 7065 | 0 | 1 | 1 | no |
| departments | loaded | 2895 | 5552 | 0 | 8 | 1 | no |
| roles | loaded | 4935 | 7594 | 0 | 19 | 1 | no |
| permissions | loaded | 3954 | 6611 | 0 | 0 | 1 | no |
| audit | loaded | 3417 | 6073 | 0 | 1 | 1 | no |
| settings | loaded | 2934 | 5590 | 0 | 1 | 3 | no |
| admin | loaded | 2895 | 5553 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T14:43:25.241Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6312 ms | 4387 ms | /د/س/ت/ر/س/ی/ /1/0/1/7/ /// /ر/و/ت/ر/ /3/3/7/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/6/7/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/2/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/5/6/m/s/×/1/ |
| /procurement/orders | 6536 ms | 5248 ms | /د/س/ت/ر/س/ی/ /1/5/5/1/ /// /ر/و/ت/ر/ /3/6/9/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/8/5/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/2/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/6/2/m/s/×/1/ |
| /procurement/needs | 5343 ms | 3817 ms | /د/س/ت/ر/س/ی/ /1/6/0/7/ /// /ر/و/ت/ر/ /2/2/0/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/3/6/m/s/×/1/,/ /g/e/t/A/l/l/:/4/5/0/m/s/×/1/,/ /g/e/t/A/l/l/:/3/5/3/m/s/×/1/ |
| /procurement/dashboard | 4587 ms | 3465 ms | /د/س/ت/ر/س/ی/ /1/3/9/4/ /// /ر/و/ت/ر/ /2/0/7/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/6/4/m/s/×/1/,/ /g/e/t/A/l/l/:/3/4/5/m/s/×/1/,/ /g/e/t/A/l/l/:/3/3/1/m/s/×/1/ |
| /procurement/workspace | 6795 ms | 3676 ms | /د/س/ت/ر/س/ی/ /1/5/5/2/ /// /ر/و/ت/ر/ /2/1/2/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/6/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/3/8/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/3/6/4/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

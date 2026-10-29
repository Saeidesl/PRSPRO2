# PMS UI and Performance Audit

- Generated: 2026-10-29T21:25:46.764Z
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
| visibleButtonsInventoried | 321 |
| visibleInputsAndControlsInventoried | 33 |
| networkRequestsMeasured | 413 |
| procurementApiRequestsMeasured | 10 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 21 |
| failedSafeButtonChecks | 5 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3975 | 6634 | 0 | 10 | 2 | no |
| projects | loaded | 2450 | 5109 | 0 | 10 | 2 | no |
| project-detail | loaded | 3414 | 6069 | 0 | 2 | 0 | no |
| events | loaded | 2909 | 5566 | 0 | 21 | 1 | no |
| workflows | loaded | 3432 | 6087 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2421 | 5077 | 0 | 9 | 1 | no |
| event-types | loaded | 2921 | 5582 | 0 | 43 | 1 | no |
| procurement | loaded | 2912 | 27378 | 0 | 9 | 0 | no |
| attachments | loaded | 3917 | 6573 | 0 | 7 | 2 | no |
| reports | loaded | 3421 | 5992 | 0 | 8 | 12 | no |
| users | loaded | 3424 | 6083 | 0 | 21 | 1 | no |
| departments | loaded | 3403 | 6059 | 0 | 8 | 1 | no |
| roles | loaded | 2930 | 5586 | 0 | 19 | 1 | no |
| permissions | loaded | 2411 | 5064 | 0 | 0 | 1 | no |
| audit | loaded | 2407 | 5063 | 0 | 1 | 1 | no |
| settings | loaded | 3913 | 6570 | 0 | 1 | 3 | no |
| admin | loaded | 2898 | 5574 | 0 | 149 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-29T21:27:31.333Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4535 ms | 3443 ms | /د/س/ت/ر/س/ی/ /1/5/2/3/ /// /ر/و/ت/ر/ /1/9/1/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/1/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/8/7/7/m/s/×/1/,/ /g/e/t/A/l/l/:/3/5/9/m/s/×/1/ |
| /procurement/orders | 3240 ms | 1886 ms | /د/س/ت/ر/س/ی/ /7/0/6/ /// /ر/و/ت/ر/ /1/1/7/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/7/6/m/s/×/1/,/ /g/e/t/A/l/l/:/1/8/9/m/s/×/1/,/ /g/e/t/A/l/l/:/1/4/6/m/s/×/1/ |
| /procurement/needs | 4707 ms | 3328 ms | /د/س/ت/ر/س/ی/ /1/1/2/4/ /// /ر/و/ت/ر/ /2/2/0/4/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/8/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/1/1/m/s/×/1/,/ /g/e/t/A/l/l/:/3/6/8/m/s/×/1/ |
| /procurement/dashboard | 3253 ms | 1897 ms | /د/س/ت/ر/س/ی/ /7/1/9/ /// /ر/و/ت/ر/ /1/1/7/7/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/4/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/6/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/5/0/m/s/×/2/ |
| /procurement/workspace | 6034 ms | 2039 ms | /د/س/ت/ر/س/ی/ /7/1/5/ /// /ر/و/ت/ر/ /1/3/2/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/3/5/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/6/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/4/8/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

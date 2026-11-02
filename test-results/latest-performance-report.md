# PMS UI and Performance Audit

- Generated: 2026-11-02T06:54:44.437Z
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
| visibleButtonsInventoried | 83 |
| visibleInputsAndControlsInventoried | 39 |
| networkRequestsMeasured | 283 |
| procurementApiRequestsMeasured | 7 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 92 |
| safeButtonChecks | 12 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 4983 | 7643 | 0 | 24 | 2 | no |
| projects | loaded | 3419 | 6077 | 0 | 1 | 2 | no |
| project-detail | loaded | 3433 | 6090 | 0 | 2 | 0 | no |
| print-design | loaded | 4919 | 5256 | 1 | 3 | 3 | no |
| print-output | loaded | 3918 | 4501 | 0 | 1 | 2 | no |
| events | loaded | 3413 | 6070 | 0 | 15 | 1 | no |
| workflows | loaded | 5936 | 8590 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3429 | 6087 | 0 | 1 | 1 | no |
| event-types | loaded | 2455 | 5113 | 0 | 1 | 1 | no |
| information-types | loaded | 2915 | 5572 | 0 | 1 | 1 | no |
| procurement | loaded | 3928 | 38111 | 0 | 9 | 0 | no |
| attachments | loaded | 3411 | 6067 | 0 | 1 | 2 | no |
| reports | loaded | 3441 | 6103 | 0 | 8 | 12 | no |
| users | loaded | 4427 | 7085 | 0 | 1 | 1 | no |
| departments | loaded | 3904 | 6547 | 0 | 8 | 1 | no |
| roles | loaded | 3424 | 6081 | 0 | 1 | 1 | no |
| permissions | loaded | 4437 | 7093 | 0 | 0 | 1 | no |
| audit | loaded | 3906 | 6564 | 0 | 1 | 1 | no |
| settings | loaded | 5411 | 8069 | 0 | 1 | 3 | no |
| admin | loaded | 4918 | 7576 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-02T06:57:13.323Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6754 ms | 5244 ms | /د/س/ت/ر/س/ی/ /1/5/4/8/ /// /ر/و/ت/ر/ /3/6/9/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/8/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/8/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/8/0/m/s/×/1/ |
| /procurement/orders | 4504 ms | 3150 ms | /د/س/ت/ر/س/ی/ /1/3/0/5/ /// /ر/و/ت/ر/ /1/8/4/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/9/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/1/9/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/2/m/s/×/1/ |
| /procurement/needs | 4861 ms | 3545 ms | /د/س/ت/ر/س/ی/ /1/3/6/2/ /// /ر/و/ت/ر/ /2/1/8/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/8/2/m/s/×/1/,/ /g/e/t/A/l/l/:/2/8/7/m/s/×/1/,/ /g/e/t/A/l/l/:/2/8/6/m/s/×/1/ |
| /procurement/dashboard | 4912 ms | 3077 ms | /د/س/ت/ر/س/ی/ /9/9/4/ /// /ر/و/ت/ر/ /2/0/8/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/6/4/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/1/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/8/m/s/×/1/ |
| /procurement/workspace | 8167 ms | 4681 ms | /د/س/ت/ر/س/ی/ /1/4/7/3/ /// /ر/و/ت/ر/ /3/2/0/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/9/0/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/8/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/5/3/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

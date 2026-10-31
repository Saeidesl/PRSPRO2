# PMS UI and Performance Audit

- Generated: 2026-10-31T17:34:09.135Z
- Base URL: http://127.0.0.1:4173/PRSPRO2/
- Mode: authenticated-read-only
- Overall: **needs-attention**

## Summary

| Metric | Result |
|---|---:|
| requestedRoutes | 18 |
| loadedRoutes | 18 |
| permissionDeniedRoutes | 0 |
| failedRoutes | 0 |
| mobileRoutesWithHorizontalOverflow | 0 |
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 182 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 304 |
| procurementApiRequestsMeasured | 8 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 10 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 2965 | 5628 | 0 | 4 | 2 | no |
| projects | loaded | 2931 | 5588 | 0 | 1 | 2 | no |
| project-detail | loaded | 2947 | 5607 | 0 | 2 | 0 | no |
| events | loaded | 2922 | 5580 | 0 | 5 | 1 | no |
| workflows | loaded | 3945 | 6601 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2449 | 5107 | 0 | 1 | 1 | no |
| event-types | loaded | 3927 | 6594 | 0 | 69 | 1 | no |
| information-types | loaded | 2913 | 5572 | 0 | 28 | 1 | no |
| procurement | loaded | 3937 | 32687 | 0 | 9 | 0 | no |
| attachments | loaded | 3454 | 6110 | 0 | 1 | 2 | no |
| reports | loaded | 2923 | 5585 | 0 | 8 | 12 | no |
| users | loaded | 2946 | 5604 | 0 | 21 | 1 | no |
| departments | loaded | 2932 | 5590 | 0 | 8 | 1 | no |
| roles | loaded | 3928 | 6585 | 0 | 19 | 1 | no |
| permissions | loaded | 3430 | 6085 | 0 | 0 | 1 | no |
| audit | loaded | 3438 | 6095 | 0 | 1 | 1 | no |
| settings | loaded | 2443 | 5100 | 0 | 1 | 3 | no |
| admin | loaded | 2917 | 5574 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T17:36:13.103Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5050 ms | 3554 ms | /د/س/ت/ر/س/ی/ /1/0/3/3/ /// /ر/و/ت/ر/ /2/5/1/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/6/1/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/2/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/1/8/m/s/×/2/ |
| /procurement/orders | 5043 ms | 3303 ms | /د/س/ت/ر/س/ی/ /1/2/3/0/ /// /ر/و/ت/ر/ /2/0/7/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/1/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/0/9/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/3/2/7/m/s/×/2/ |
| /procurement/needs | 5359 ms | 3199 ms | /د/س/ت/ر/س/ی/ /1/0/4/6/ /// /ر/و/ت/ر/ /2/1/5/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/7/1/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/5/9/5/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/3/7/4/m/s/×/1/ |
| /procurement/dashboard | 4936 ms | 3591 ms | /د/س/ت/ر/س/ی/ /1/7/0/8/ /// /ر/و/ت/ر/ /1/8/8/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/4/2/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/7/4/0/m/s/×/2/,/ /g/e/t/A/l/l/:/2/6/3/m/s/×/1/ |
| /procurement/workspace | 5671 ms | 3323 ms | /د/س/ت/ر/س/ی/ /1/3/6/3/ /// /ر/و/ت/ر/ /1/9/5/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/7/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/0/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/8/6/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

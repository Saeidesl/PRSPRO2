# PMS UI and Performance Audit

- Generated: 2026-11-01T05:56:12.209Z
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
| visibleButtonsInventoried | 244 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 342 |
| procurementApiRequestsMeasured | 9 |
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
| dashboard | loaded | 3018 | 5677 | 0 | 24 | 2 | no |
| projects | loaded | 3415 | 6076 | 0 | 31 | 2 | no |
| project-detail | loaded | 2407 | 5061 | 0 | 2 | 0 | no |
| events | loaded | 2907 | 5563 | 0 | 15 | 1 | no |
| workflows | loaded | 4435 | 7089 | 0 | 3 | 2 | no |
| project-statuses | loaded | 2421 | 5078 | 0 | 9 | 1 | no |
| event-types | loaded | 3421 | 6082 | 0 | 69 | 1 | no |
| information-types | loaded | 2903 | 5073 | 0 | 40 | 1 | no |
| procurement | loaded | 2921 | 27982 | 0 | 9 | 0 | no |
| attachments | loaded | 2396 | 5054 | 0 | 1 | 2 | no |
| reports | loaded | 2927 | 5587 | 0 | 8 | 12 | no |
| users | loaded | 3402 | 6058 | 0 | 1 | 1 | no |
| departments | loaded | 3412 | 6069 | 0 | 8 | 1 | no |
| roles | loaded | 2427 | 5082 | 0 | 19 | 1 | no |
| permissions | loaded | 2952 | 5607 | 0 | 0 | 1 | no |
| audit | loaded | 3425 | 6082 | 0 | 1 | 1 | no |
| settings | loaded | 2985 | 5640 | 0 | 1 | 3 | no |
| admin | loaded | 2389 | 5044 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T05:58:08.803Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5730 ms | 4152 ms | /د/س/ت/ر/س/ی/ /1/4/2/6/ /// /ر/و/ت/ر/ /2/7/2/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/0/7/m/s/×/1/,/ /g/e/t/A/l/l/:/3/4/2/m/s/×/1/,/ /g/e/t/A/l/l/:/2/9/6/m/s/×/1/ |
| /procurement/orders | 3153 ms | 1880 ms | /د/س/ت/ر/س/ی/ /7/2/5/ /// /ر/و/ت/ر/ /1/1/5/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/2/7/2/m/s/×/1/,/ /g/e/t/A/l/l/:/1/5/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/4/7/m/s/×/2/ |
| /procurement/needs | 3843 ms | 2462 ms | /د/س/ت/ر/س/ی/ /7/0/8/ /// /ر/و/ت/ر/ /1/7/5/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/9/5/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/1/8/m/s/×/1/,/ /g/e/t/A/l/l/:/2/7/0/m/s/×/1/ |
| /procurement/dashboard | 4519 ms | 3481 ms | /د/س/ت/ر/س/ی/ /1/0/5/3/ /// /ر/و/ت/ر/ /2/4/2/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/9/4/m/s/×/2/,/ /g/e/t/A/l/l/:/5/0/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/0/9/m/s/×/1/ |
| /procurement/workspace | 5118 ms | 2292 ms | /د/س/ت/ر/س/ی/ /7/9/3/ /// /ر/و/ت/ر/ /1/4/9/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/3/9/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/4/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/8/4/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

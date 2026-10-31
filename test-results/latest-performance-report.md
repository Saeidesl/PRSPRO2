# PMS UI and Performance Audit

- Generated: 2026-10-31T09:04:18.937Z
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
| visibleButtonsInventoried | 131 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 306 |
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
| dashboard | loaded | 2999 | 5659 | 0 | 4 | 2 | no |
| projects | loaded | 3432 | 6090 | 0 | 1 | 2 | no |
| project-detail | loaded | 3936 | 6592 | 0 | 2 | 0 | no |
| events | loaded | 2934 | 5594 | 0 | 9 | 1 | no |
| workflows | loaded | 2460 | 5114 | 0 | 1 | 2 | no |
| project-statuses | loaded | 4444 | 7099 | 0 | 9 | 1 | no |
| event-types | loaded | 2936 | 5602 | 0 | 65 | 1 | no |
| information-types | loaded | 3951 | 6608 | 0 | 1 | 1 | no |
| procurement | loaded | 4445 | 33168 | 0 | 9 | 0 | no |
| attachments | loaded | 4419 | 7076 | 0 | 7 | 2 | no |
| reports | loaded | 2943 | 5605 | 0 | 8 | 12 | no |
| users | loaded | 2916 | 5572 | 0 | 1 | 1 | no |
| departments | loaded | 3473 | 6132 | 0 | 8 | 1 | no |
| roles | loaded | 2439 | 5094 | 0 | 1 | 1 | no |
| permissions | loaded | 3445 | 6102 | 0 | 0 | 1 | no |
| audit | loaded | 3461 | 6116 | 0 | 1 | 1 | no |
| settings | loaded | 2913 | 5569 | 0 | 1 | 3 | no |
| admin | loaded | 4420 | 7077 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T09:06:25.447Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5395 ms | 3876 ms | /د/س/ت/ر/س/ی/ /1/3/2/7/ /// /ر/و/ت/ر/ /2/5/4/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/5/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/8/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/2/7/5/m/s/×/1/ |
| /procurement/orders | 3836 ms | 2944 ms | /د/س/ت/ر/س/ی/ /9/2/0/ /// /ر/و/ت/ر/ /2/0/2/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/8/9/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/3/4/4/m/s/×/1/,/ /g/e/t/A/l/l/:/2/4/4/m/s/×/1/ |
| /procurement/needs | 3752 ms | 2711 ms | /د/س/ت/ر/س/ی/ /1/0/5/8/ /// /ر/و/ت/ر/ /1/6/5/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/7/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/4/1/m/s/×/1/,/ /g/e/t/A/l/l/:/2/1/0/m/s/×/1/ |
| /procurement/dashboard | 4888 ms | 3489 ms | /د/س/ت/ر/س/ی/ /1/1/9/9/ /// /ر/و/ت/ر/ /2/2/8/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/1/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/4/4/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/5/5/m/s/×/1/ |
| /procurement/workspace | 8142 ms | 5190 ms | /د/س/ت/ر/س/ی/ /1/6/3/2/ /// /ر/و/ت/ر/ /3/5/5/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/9/4/m/s/×/1/,/ /g/e/t/A/l/l/:/5/5/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/6/3/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

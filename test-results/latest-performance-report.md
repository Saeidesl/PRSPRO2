# PMS UI and Performance Audit

- Generated: 2026-10-30T18:47:29.051Z
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
| visibleButtonsInventoried | 52 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 276 |
| procurementApiRequestsMeasured | 6 |
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
| dashboard | loaded | 6986 | 9647 | 0 | 4 | 2 | no |
| projects | loaded | 2919 | 5577 | 0 | 1 | 2 | no |
| project-detail | loaded | 4408 | 7065 | 0 | 2 | 0 | no |
| events | loaded | 3408 | 6064 | 0 | 8 | 1 | no |
| workflows | loaded | 2937 | 5595 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2919 | 5574 | 0 | 1 | 1 | no |
| event-types | loaded | 3417 | 6072 | 0 | 1 | 1 | no |
| information-types | loaded | 2921 | 5577 | 0 | 1 | 1 | no |
| procurement | loaded | 3922 | 36208 | 0 | 9 | 0 | no |
| attachments | loaded | 2894 | 5552 | 0 | 1 | 2 | no |
| reports | loaded | 3905 | 6565 | 0 | 8 | 12 | no |
| users | loaded | 3908 | 6562 | 0 | 1 | 1 | no |
| departments | loaded | 2402 | 5057 | 0 | 8 | 1 | no |
| roles | loaded | 3930 | 6586 | 0 | 1 | 1 | no |
| permissions | loaded | 5435 | 8090 | 0 | 0 | 1 | no |
| audit | loaded | 3908 | 6563 | 0 | 1 | 1 | no |
| settings | loaded | 4416 | 7073 | 0 | 1 | 3 | no |
| admin | loaded | 2911 | 5569 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-30T18:49:46.493Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 6133 ms | 5044 ms | /د/س/ت/ر/س/ی/ /1/5/2/8/ /// /ر/و/ت/ر/ /3/5/1/6/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/5/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/5/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/1/8/m/s/×/1/ |
| /procurement/orders | 5037 ms | 3781 ms | /د/س/ت/ر/س/ی/ /1/6/0/9/ /// /ر/و/ت/ر/ /2/1/7/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/9/0/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/3/5/8/m/s/×/2/,/ /g/e/t/A/l/l/:/3/1/3/m/s/×/1/ |
| /procurement/needs | 5730 ms | 4569 ms | /د/س/ت/ر/س/ی/ /1/5/0/0/ /// /ر/و/ت/ر/ /3/0/6/8/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/1/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/0/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/5/9/m/s/×/1/ |
| /procurement/dashboard | 5096 ms | 3971 ms | /د/س/ت/ر/س/ی/ /1/2/5/9/ /// /ر/و/ت/ر/ /2/7/1/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/5/7/2/m/s/×/1/,/ /g/e/t/A/l/l/:/5/1/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/7/1/m/s/×/1/ |
| /procurement/workspace | 6300 ms | 3063 ms | /د/س/ت/ر/س/ی/ /9/2/8/ /// /ر/و/ت/ر/ /2/1/3/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/5/7/m/s/×/2/,/ /g/e/t/H/e/a/d/e/r/s/:/4/9/5/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/3/8/3/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

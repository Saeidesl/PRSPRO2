# PMS UI and Performance Audit

- Generated: 2026-10-31T15:37:48.867Z
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
| visibleFormsInventoried | 12 |
| dynamicFormsInventoried | 12 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 429 |
| visibleInputsAndControlsInventoried | 34 |
| networkRequestsMeasured | 297 |
| procurementApiRequestsMeasured | 7 |
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
| dashboard | loaded | 4025 | 6685 | 0 | 4 | 2 | no |
| projects | loaded | 2912 | 5568 | 0 | 16 | 2 | no |
| project-detail | loaded | 4417 | 7072 | 0 | 2 | 0 | no |
| events | loaded | 2913 | 5568 | 0 | 10 | 1 | no |
| workflows | loaded | 2419 | 5077 | 0 | 1 | 2 | no |
| project-statuses | loaded | 3954 | 6610 | 0 | 1 | 1 | no |
| event-types | loaded | 2918 | 5580 | 0 | 69 | 1 | no |
| information-types | loaded | 2932 | 5590 | 0 | 28 | 1 | no |
| procurement | loaded | 2929 | 30249 | 0 | 9 | 0 | no |
| attachments | loaded | 3904 | 6560 | 0 | 1 | 2 | no |
| reports | loaded | 2417 | 5077 | 0 | 8 | 12 | no |
| users | loaded | 2912 | 5569 | 0 | 21 | 1 | no |
| departments | loaded | 2929 | 5586 | 0 | 8 | 1 | no |
| roles | loaded | 2425 | 5033 | 0 | 19 | 1 | no |
| permissions | loaded | 2426 | 5081 | 0 | 0 | 1 | no |
| audit | loaded | 2912 | 5568 | 0 | 1 | 1 | no |
| settings | loaded | 3399 | 6055 | 0 | 1 | 3 | no |
| admin | loaded | 3902 | 6583 | 0 | 230 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-31T15:39:54.140Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 4885 ms | 3717 ms | /د/س/ت/ر/س/ی/ /9/8/8/ /// /ر/و/ت/ر/ /2/7/2/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/6/1/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/2/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/8/7/m/s/×/1/ |
| /procurement/orders | 3955 ms | 2811 ms | /د/س/ت/ر/س/ی/ /1/2/7/0/ /// /ر/و/ت/ر/ /1/5/4/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/8/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/6/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/2/5/m/s/×/1/ |
| /procurement/needs | 6461 ms | 4875 ms | /د/س/ت/ر/س/ی/ /1/6/9/1/ /// /ر/و/ت/ر/ /3/1/8/4/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/0/8/m/s/×/2/,/ /f/i/n/d/B/y/I/d/:/6/5/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/8/6/m/s/×/2/ |
| /procurement/dashboard | 4072 ms | 3014 ms | /د/س/ت/ر/س/ی/ /1/0/8/3/ /// /ر/و/ت/ر/ /1/9/3/0/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/5/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/3/4/m/s/×/2/,/ /g/e/t/A/l/l/:/2/7/7/m/s/×/1/ |
| /procurement/workspace | 4970 ms | 2822 ms | /د/س/ت/ر/س/ی/ /1/0/3/9/ /// /ر/و/ت/ر/ /1/7/8/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/3/7/9/m/s/×/1/,/ /g/e/t/A/l/l/:/2/6/3/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/4/1/m/s/×/2/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

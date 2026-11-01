# PMS UI and Performance Audit

- Generated: 2026-11-01T19:31:14.537Z
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
| visibleFormsInventoried | 11 |
| dynamicFormsInventoried | 11 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 420 |
| visibleInputsAndControlsInventoried | 36 |
| networkRequestsMeasured | 334 |
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
| dashboard | loaded | 3475 | 6136 | 0 | 24 | 2 | no |
| projects | loaded | 2416 | 5073 | 0 | 1 | 2 | no |
| project-detail | loaded | 3411 | 6067 | 0 | 2 | 0 | no |
| print-design | loaded | 2911 | 5567 | 0 | 1 | 1 | no |
| print-output | loaded | 2917 | 5516 | 0 | 2 | 1 | no |
| events | loaded | 2914 | 5570 | 0 | 15 | 1 | no |
| workflows | loaded | 2432 | 5088 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2934 | 5590 | 0 | 9 | 1 | no |
| event-types | loaded | 3928 | 6584 | 0 | 1 | 1 | no |
| information-types | loaded | 3411 | 6068 | 0 | 1 | 1 | no |
| procurement | loaded | 3933 | 31975 | 0 | 9 | 0 | no |
| attachments | loaded | 3439 | 6095 | 0 | 1 | 2 | no |
| reports | loaded | 3944 | 6605 | 0 | 8 | 12 | no |
| users | loaded | 3914 | 6571 | 0 | 21 | 1 | no |
| departments | loaded | 2912 | 5568 | 0 | 8 | 1 | no |
| roles | loaded | 2926 | 5581 | 0 | 1 | 1 | no |
| permissions | loaded | 3431 | 6086 | 0 | 0 | 1 | no |
| audit | loaded | 2445 | 5104 | 0 | 1 | 1 | no |
| settings | loaded | 2976 | 5635 | 0 | 1 | 3 | no |
| admin | loaded | 2961 | 5653 | 0 | 313 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-01T19:33:30.008Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5003 ms | 3843 ms | /د/س/ت/ر/س/ی/ /1/0/8/7/ /// /ر/و/ت/ر/ /2/7/5/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/0/7/m/s/×/1/,/ /g/e/t/A/l/l/:/3/8/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/3/2/4/m/s/×/1/ |
| /procurement/orders | 4569 ms | 3022 ms | /د/س/ت/ر/س/ی/ /1/1/6/6/ /// /ر/و/ت/ر/ /1/8/5/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/3/5/m/s/×/1/,/ /g/e/t/A/l/l/:/3/0/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/2/8/7/m/s/×/1/ |
| /procurement/needs | 4332 ms | 3085 ms | /د/س/ت/ر/س/ی/ /1/1/4/5/ /// /ر/و/ت/ر/ /1/9/3/9/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/8/2/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/0/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/8/5/m/s/×/1/ |
| /procurement/dashboard | 5795 ms | 4135 ms | /د/س/ت/ر/س/ی/ /1/5/0/7/ /// /ر/و/ت/ر/ /2/6/2/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/5/3/5/m/s/×/1/,/ /g/e/t/A/l/l/:/5/1/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/0/2/m/s/×/1/ |
| /procurement/workspace | 5660 ms | 2890 ms | /د/س/ت/ر/س/ی/ /1/3/5/0/ /// /ر/و/ت/ر/ /1/5/3/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/4/8/8/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/0/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/7/5/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

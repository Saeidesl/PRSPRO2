# PMS UI and Performance Audit

- Generated: 2026-11-02T08:52:34.241Z
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
| visibleButtonsInventoried | 152 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 292 |
| procurementApiRequestsMeasured | 6 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 12 |
| failedSafeButtonChecks | 1 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3407 | 6065 | 0 | 4 | 2 | no |
| projects | loaded | 2874 | 5531 | 0 | 1 | 2 | no |
| project-detail | loaded | 3877 | 6534 | 0 | 2 | 0 | no |
| print-design | loaded | 3880 | 6540 | 1 | 10 | 5 | no |
| print-output | loaded | 3370 | 6026 | 0 | 1 | 2 | no |
| events | loaded | 3389 | 6047 | 0 | 5 | 1 | no |
| workflows | loaded | 3901 | 6554 | 0 | 3 | 2 | no |
| project-statuses | loaded | 4392 | 7046 | 0 | 1 | 1 | no |
| event-types | loaded | 4384 | 7046 | 0 | 73 | 1 | no |
| information-types | loaded | 3900 | 6557 | 0 | 1 | 1 | no |
| procurement | loaded | 2889 | 42054 | 0 | 9 | 0 | no |
| attachments | loaded | 3373 | 6030 | 0 | 1 | 2 | no |
| reports | loaded | 3893 | 6555 | 0 | 8 | 12 | no |
| users | loaded | 4404 | 7060 | 0 | 1 | 1 | no |
| departments | loaded | 3378 | 6034 | 0 | 8 | 1 | no |
| roles | loaded | 3387 | 6043 | 0 | 19 | 1 | no |
| permissions | loaded | 4890 | 7547 | 0 | 0 | 1 | no |
| audit | loaded | 4373 | 7030 | 0 | 1 | 1 | no |
| settings | loaded | 3870 | 6526 | 0 | 1 | 3 | no |
| admin | loaded | 4367 | 7022 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-02T08:55:12.830Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 9113 ms | 7204 ms | /د/س/ت/ر/س/ی/ /3/0/1/4/ /// /ر/و/ت/ر/ /4/1/8/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/2/5/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/1/0/1/3/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/9/1/4/m/s/×/1/ |
| /procurement/orders | 5879 ms | 4802 ms | /د/س/ت/ر/س/ی/ /1/6/2/0/ /// /ر/و/ت/ر/ /3/1/8/2/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/8/5/6/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/7/5/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/8/6/m/s/×/1/ |
| /procurement/needs | 6501 ms | 5259 ms | /د/س/ت/ر/س/ی/ /1/3/3/0/ /// /ر/و/ت/ر/ /3/9/2/7/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/9/7/8/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/8/1/m/s/×/1/,/ /g/e/t/A/l/l/:/4/0/8/m/s/×/1/ |
| /procurement/dashboard | 7519 ms | 5844 ms | /د/س/ت/ر/س/ی/ /2/0/8/5/ /// /ر/و/ت/ر/ /3/7/5/8/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/3/5/6/m/s/×/2/,/ /g/e/t/A/l/l/:/6/8/2/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/5/5/m/s/×/1/ |
| /procurement/workspace | 6165 ms | 3610 ms | /د/س/ت/ر/س/ی/ /1/6/3/1/ /// /ر/و/ت/ر/ /1/9/7/9/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/7/2/m/s/×/1/,/ /g/e/t/A/l/l/:/6/3/0/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/5/6/6/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

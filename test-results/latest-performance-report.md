# PMS UI and Performance Audit

- Generated: 2026-10-28T20:45:58.402Z
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
| visibleButtonsInventoried | 111 |
| visibleInputsAndControlsInventoried | 32 |
| networkRequestsMeasured | 352 |
| procurementApiRequestsMeasured | 7 |
| procurementApiFailedRequests | 0 |
| procurementDiagnosticEndpointsMeasured | 5 |
| failedNetworkRequests | 0 |
| consoleErrors | 0 |
| pageErrors | 0 |
| safeButtonChecks | 20 |
| failedSafeButtonChecks | 5 |
| formSubmissionsExecuted | 0 |

## Routes

| Route | Status | Ready ms | Settled ms | Forms | Buttons | Controls | Mobile overflow |
|---|---|---:|---:|---:|---:|---:|---|
| dashboard | loaded | 3471 | 6130 | 0 | 8 | 2 | no |
| projects | loaded | 3394 | 6052 | 0 | 1 | 2 | no |
| project-detail | loaded | 3387 | 6044 | 0 | 2 | 0 | no |
| events | loaded | 3891 | 6546 | 0 | 5 | 1 | no |
| workflows | loaded | 3415 | 6071 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2899 | 5554 | 0 | 1 | 1 | no |
| event-types | loaded | 2906 | 5563 | 0 | 43 | 1 | no |
| procurement | loaded | 2894 | 39311 | 0 | 9 | 0 | no |
| attachments | loaded | 2882 | 5537 | 0 | 1 | 2 | no |
| reports | loaded | 2892 | 5550 | 0 | 8 | 12 | no |
| users | loaded | 3383 | 6039 | 0 | 1 | 1 | no |
| departments | loaded | 3885 | 6542 | 0 | 8 | 1 | no |
| roles | loaded | 3934 | 6590 | 0 | 19 | 1 | no |
| permissions | loaded | 2895 | 5550 | 0 | 0 | 1 | no |
| audit | loaded | 3397 | 6051 | 0 | 1 | 1 | no |
| settings | loaded | 4392 | 7046 | 0 | 0 | 2 | no |
| admin | loaded | 3888 | 6544 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-10-28T20:48:04.648Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 5190 ms | 4101 ms | /د/س/ت/ر/س/ی/ /1/2/0/7/ /// /ر/و/ت/ر/ /2/8/9/3/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/1/7/5/m/s/×/1/,/ /g/e/t/A/l/l/:/3/7/6/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/3/7/5/m/s/×/1/ |
| /procurement/orders | 7685 ms | 5931 ms | /د/س/ت/ر/س/ی/ /2/5/8/9/ /// /ر/و/ت/ر/ /3/3/4/1/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/9/4/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/8/8/9/m/s/×/2/,/ /g/e/t/A/l/l/:/8/0/6/m/s/×/1/ |
| /procurement/needs | 5077 ms | 3593 ms | /د/س/ت/ر/س/ی/ /1/8/4/8/ /// /ر/و/ت/ر/ /1/7/4/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/2/4/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/6/0/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/6/4/3/m/s/×/1/ |
| /procurement/dashboard | 7110 ms | 5596 ms | /د/س/ت/ر/س/ی/ /3/9/5/9/ /// /ر/و/ت/ر/ /1/6/3/6/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/6/9/3/m/s/×/1/,/ /g/e/t/A/l/l/:/9/5/2/m/s/×/1/,/ /g/e/t/A/l/l/:/9/4/4/m/s/×/1/ |
| /procurement/workspace | 8372 ms | 2945 ms | /د/س/ت/ر/س/ی/ /1/3/0/2/ /// /ر/و/ت/ر/ /1/6/4/3/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/7/2/9/m/s/×/1/,/ /g/e/t/A/l/l/:/4/1/6/m/s/×/1/,/ /g/e/t/A/l/l/:/1/8/8/m/s/×/1/ |

## Coverage gaps

- None detected by automated inventory.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

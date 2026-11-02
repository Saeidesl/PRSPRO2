# PMS UI and Performance Audit

- Generated: 2026-11-02T12:53:05.853Z
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
| visibleFormsInventoried | 13 |
| dynamicFormsInventoried | 12 |
| formOpenersChecked | 13 |
| visibleButtonsInventoried | 182 |
| visibleInputsAndControlsInventoried | 41 |
| networkRequestsMeasured | 326 |
| procurementApiRequestsMeasured | 8 |
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
| dashboard | loaded | 4486 | 7144 | 0 | 4 | 2 | no |
| projects | loaded | 2926 | 5585 | 0 | 1 | 2 | no |
| project-detail | loaded | 3922 | 6580 | 0 | 2 | 0 | no |
| print-design | loaded | 2910 | 5569 | 1 | 14 | 5 | no |
| print-output | loaded | 2903 | 5560 | 0 | 1 | 2 | no |
| events | loaded | 3437 | 6095 | 0 | 5 | 1 | no |
| workflows | loaded | 3462 | 6120 | 0 | 1 | 2 | no |
| project-statuses | loaded | 2966 | 5621 | 0 | 9 | 1 | no |
| event-types | loaded | 2931 | 5595 | 0 | 73 | 1 | no |
| information-types | loaded | 2905 | 5563 | 0 | 1 | 1 | no |
| procurement | loaded | 3932 | 34668 | 0 | 9 | 0 | no |
| attachments | loaded | 2926 | 5582 | 0 | 1 | 2 | no |
| reports | loaded | 2924 | 5584 | 0 | 8 | 12 | no |
| users | loaded | 3926 | 6584 | 0 | 21 | 1 | no |
| departments | loaded | 4435 | 7089 | 0 | 8 | 1 | no |
| roles | loaded | 5443 | 8099 | 0 | 19 | 1 | no |
| permissions | loaded | 2447 | 5103 | 0 | 0 | 1 | no |
| audit | loaded | 3419 | 6077 | 0 | 1 | 1 | no |
| settings | loaded | 2908 | 5563 | 0 | 1 | 3 | no |
| admin | loaded | 3410 | 6065 | 0 | 3 | 2 | no |

## Procurement backend diagnostics

- Measured at: 2026-11-02T12:55:27.658Z
- Captured endpoints: 5

| Endpoint | Browser | Backend | Repository / sheet details |
|---|---:|---:|---|
| /procurement/reports | 7078 ms | 5661 ms | /د/س/ت/ر/س/ی/ /1/3/2/4/ /// /ر/و/ت/ر/ /4/3/3/5/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/1/2/7/9/m/s/×/1/,/ /g/e/t/A/l/l/:/5/8/7/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/5/8/1/m/s/×/2/ |
| /procurement/orders | 5077 ms | 3322 ms | /د/س/ت/ر/س/ی/ /1/1/1/0/ /// /ر/و/ت/ر/ /2/2/1/1/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/4/1/9/m/s/×/1/,/ /f/i/n/d/B/y/I/d/:/4/0/8/m/s/×/1/,/ /g/e/t/A/l/l/:/2/9/4/m/s/×/1/ |
| /procurement/needs | 4876 ms | 3929 ms | /د/س/ت/ر/س/ی/ /1/7/3/7/ /// /ر/و/ت/ر/ /2/1/9/2/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/1/0/1/8/m/s/×/1/,/ /g/e/t/S/h/e/e/t/:/8/1/6/m/s/×/2/,/ /g/e/t/A/l/l/:/6/4/6/m/s/×/1/ |
| /procurement/dashboard | 4195 ms | 3174 ms | /د/س/ت/ر/س/ی/ /1/3/5/9/ /// /ر/و/ت/ر/ /1/8/1/5/ /// /S/h/e/e/t/s/:/ /f/i/n/d/B/y/I/d/:/6/3/1/m/s/×/1/,/ /g/e/t/A/l/l/:/4/3/1/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/4/2/6/m/s/×/1/ |
| /procurement/workspace | 5530 ms | 3681 ms | /د/س/ت/ر/س/ی/ /1/3/7/1/ /// /ر/و/ت/ر/ /2/3/1/0/ /// /S/h/e/e/t/s/:/ /g/e/t/A/l/l/:/7/4/9/m/s/×/1/,/ /g/e/t/H/e/a/d/e/r/s/:/6/8/7/m/s/×/1/,/ /g/e/t/A/l/l/:/6/7/1/m/s/×/1/ |

## Coverage gaps

- print-design: 1 submit control(s) inventoried but not submitted by the safe audit.

## Safety

- No form was submitted.
- Potentially destructive or data-changing buttons were not clicked.
- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.

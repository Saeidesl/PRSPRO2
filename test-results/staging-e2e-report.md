# PMS Staging E2E

- Status: **failed**
- Started: 2026-10-24T20:25:49.548Z
- Finished: 2026-10-24T20:26:49.329Z

## Error

page.evaluate: Error: برای این قلم سهم عمومیِ دریافت‌نشده وجود ندارد؛ پروژه تخصیص‌یافته را انتخاب کنید.
    at Object.createApiError (https://saeidesl.github.io/PRSPRO2/js/core/api.js?v=20261022-retry-sync-2:535:21)
    at Object.request (https://saeidesl.github.io/PRSPRO2/js/core/api.js?v=20261022-retry-sync-2:367:22)
    at async eval (eval at evaluate (:370:30), <anonymous>:4:66)
    at async <anonymous>:396:30

## Steps

- create-project: PASS — {"name":"create-project","at":"2026-10-24T20:26:07.814Z","ok":true,"projectId":"PRJ_3bfbf5a4825c4a47a13ff0cd28e5d2e4","projectCode":"QA_E2E_20261024202601","workflowId":"WF_ffff7a68ad9a4af9be56121536a50616","departmentId":"DEP_b4359211"}
- create-material-specification: PASS — {"name":"create-material-specification","at":"2026-10-24T20:26:11.777Z","ok":true,"consumptionPerUnit":1.5}
- configure-cut-event-type: PASS — {"name":"configure-cut-event-type","at":"2026-10-24T20:26:25.162Z","ok":true,"eventTypeId":"ET_838bfd8902bd4675b1a05b99d7484e40","fieldId":"EF_f62640ff20054c9795a9ae867eff595d"}
- register-cut-event: PASS — {"name":"register-cut-event","at":"2026-10-24T20:26:37.344Z","ok":true,"eventId":"EVT_0d68e559a42d48ed96bffa797903245e","procurementIntegration":{"success":true,"data":{"ProjectID":"PRJ_3bfbf5a4825c4a47a13ff0cd28e5d2e4","SourceEventID":"EVT_0d68e559a42d48ed96bffa797903245e","BasisQuantity":10,"items":[{"MaterialNeedID":"NEED_b93f4a166da14ce6","MaterialSpecID":"MSPEC_00cf107c81844d04","ItemName":"QA E2E fabric 20261024202601","Unit":"meter","RequestedQuantity":15,"PreviousQuantity":0,"VarianceQuantity":15,"CalculationID":"MCALC_a64107f9737f4b05","IdempotentReplay":false}]},"error":null,"meta":{}}}
- verify-material-need: PASS — {"name":"verify-material-need","at":"2026-10-24T20:26:41.102Z","ok":true,"needId":"NEED_b93f4a166da14ce6","expectedQuantity":15,"actualQuantity":15}
- create-procurement-order: PASS — {"name":"create-procurement-order","at":"2026-10-24T20:26:45.994Z","ok":true,"orderId":"PO_5476b665f887","orderItemId":"POI_212ec07bf170","orderedQuantity":15}

## Created test data

{
  "projectId": "PRJ_3bfbf5a4825c4a47a13ff0cd28e5d2e4",
  "projectCode": "QA_E2E_20261024202601",
  "eventTypeId": "ET_838bfd8902bd4675b1a05b99d7484e40",
  "eventFieldId": "EF_f62640ff20054c9795a9ae867eff595d",
  "eventId": "EVT_0d68e559a42d48ed96bffa797903245e",
  "materialNeedId": "NEED_b93f4a166da14ce6",
  "orderId": "PO_5476b665f887",
  "orderItemId": "POI_212ec07bf170"
}

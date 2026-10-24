# PMS Staging E2E

- Status: **success**
- Started: 2026-10-24T20:30:13.051Z
- Finished: 2026-10-24T20:31:19.934Z

## Steps

- create-project: PASS — {"name":"create-project","at":"2026-10-24T20:30:31.009Z","ok":true,"projectId":"PRJ_0b771f6a4f144e9e8de909472ccc6680","projectCode":"QA_E2E_20261024203026","workflowId":"WF_ffff7a68ad9a4af9be56121536a50616","departmentId":"DEP_b4359211"}
- create-material-specification: PASS — {"name":"create-material-specification","at":"2026-10-24T20:30:34.355Z","ok":true,"consumptionPerUnit":1.5}
- configure-cut-event-type: PASS — {"name":"configure-cut-event-type","at":"2026-10-24T20:30:45.809Z","ok":true,"eventTypeId":"ET_d4413a8a772f457b91648169ef87d729","fieldId":"EF_829a2eae4917402f8cc7b62599b162b3"}
- register-cut-event: PASS — {"name":"register-cut-event","at":"2026-10-24T20:30:55.490Z","ok":true,"eventId":"EVT_1eaae21fe11a4da28a3cc38b6395bb1d","procurementIntegration":{"success":true,"data":{"ProjectID":"PRJ_0b771f6a4f144e9e8de909472ccc6680","SourceEventID":"EVT_1eaae21fe11a4da28a3cc38b6395bb1d","BasisQuantity":10,"items":[{"MaterialNeedID":"NEED_c9eada523f9e4459","MaterialSpecID":"MSPEC_02968608e19f484d","ItemName":"QA E2E fabric 20261024203026","Unit":"meter","RequestedQuantity":15,"PreviousQuantity":0,"VarianceQuantity":15,"CalculationID":"MCALC_c308be8e931b4523","IdempotentReplay":false}]},"error":null,"meta":{}}}
- verify-material-need: PASS — {"name":"verify-material-need","at":"2026-10-24T20:30:59.210Z","ok":true,"needId":"NEED_c9eada523f9e4459","expectedQuantity":15,"actualQuantity":15}
- create-procurement-order: PASS — {"name":"create-procurement-order","at":"2026-10-24T20:31:06.490Z","ok":true,"orderId":"PO_a7962628dc2b","orderItemId":"POI_ee365cbdcbd2","orderedQuantity":15}
- record-partial-receipt: PASS — {"name":"record-partial-receipt","at":"2026-10-24T20:31:13.158Z","ok":true,"response":"[{\"ID\":\"REC_c98226fcaa80\",\"TenantID\":\"TEN_4262d97d\",\"PurchaseOrderItemID\":\"POI_ee365cbdcbd2\",\"ProjectID\":\"PRJ_0b771f6a4f144e9e8de909472ccc6680\",\"QuantityReceived\":7,\"ReceivedAt\":\"2026-10-24T20:31:11.151Z\",\"WarehouseDepartmentID\":\"\",\"SourceEventID\":\"\",\"Notes\":\"QA E2E partial receipt\",\"ReceivedBy\":\"USR_b3ddfd5701ca4da89bfed3dcd0c9abb5\",\"CreatedAt\":\"2026-10-24T20:31:11.151Z\",\"IdempotencyKey\":\"QA_E2E_"}
- verify-read-after-write: PASS — {"name":"verify-read-after-write","at":"2026-10-24T20:31:19.934Z","ok":true,"needVisible":true,"orderVisible":true,"needStatus":"ACTIVE","orderStatus":"PARTIALLY_RECEIVED","orderedQuantity":15,"receivedQuantity":7,"remainingQuantity":8}

## Created test data

{
  "projectId": "PRJ_0b771f6a4f144e9e8de909472ccc6680",
  "projectCode": "QA_E2E_20261024203026",
  "eventTypeId": "ET_d4413a8a772f457b91648169ef87d729",
  "eventFieldId": "EF_829a2eae4917402f8cc7b62599b162b3",
  "eventId": "EVT_1eaae21fe11a4da28a3cc38b6395bb1d",
  "materialNeedId": "NEED_c9eada523f9e4459",
  "orderId": "PO_a7962628dc2b",
  "orderItemId": "POI_ee365cbdcbd2"
}

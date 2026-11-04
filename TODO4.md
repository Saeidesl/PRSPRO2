## 🎯 Current Objective

انتقال مستقل و امن تصاویر ثبت‌شده در اطلاعات مرکزی از پروژه مرجع به پروژه تکراری؛ به‌طوری‌که تصویرهای پروژه مقصد به فایل‌های مستقل و متعلق به همان پروژه اشاره کنند و هیچ پیوندی به فایل‌های پروژه اصلی باقی نماند.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### مخازن و شاخه فعال
- Frontend: `Saeidesl/PRSPRO2`، شاخه `main`.
- Backend: `Saeidesl/PRSPRO2BACKEND`، شاخه `main`.
- تغییرات این فاز فقط روی `main` انجام می‌شود.

### مسیر فعلی کپی پروژه
- `js/modules/projects.js`:
  - فرم ایجاد پروژه، انتخاب `SourceProjectID` و ثبت پروژه از مسیر موجود `POST /projects`.
  - پس از ایجاد، `ReferenceCopyPlan` را می‌خواند و برای هر نوع اطلاعات با وضعیت `PENDING/FAILED` مسیر موجود `POST /projects/:projectId/reference-copy/:typeId` را فراخوانی می‌کند.
  - `renderReferenceCopyProgress(items)` وضعیت هر بخش را نشان می‌دهد؛ انواع دارای تصویر حتی در صورت وجود ستون فایل غیرتصویری در همان فرم قابل انتقال هستند. Frontend وضعیت قدیمی `SKIPPED_FILE` را نیز دوباره به endpoint می‌فرستد تا پروژه‌های قبلاً ایجادشده قابل بازیابی باشند. تصویر نمایه `__PROJECT_PROFILE_IMAGE__` نیز در همین جریان است.
- در این مرحله تغییری در Frontend لازم نبود؛ همان endpoint و progress/resume موجود استفاده می‌شود.
- `index.html`: نسخه cache-busting ماژول `js/modules/projects.js` پس از تغییر به‌روز شود.
- `tests/project-repeat-reference-sync.test.js` و `tests/project-draft-information-flow.test.js`: آزمون‌های قرارداد کپی مرجع و نسخه دارایی‌ها.

### مسیر فعلی Backend و ذخیره فایل
- `ProjectService.js`:
  - هنگام `create`، `ReferenceCopyStatusJSON` و `ReferenceCopyPlan` را بر اساس سیاست Workflow می‌سازد.
  - `copyReferenceInformationType(projectId, typeId, params)`: کپی idempotent هر نوع اطلاعات مرکزی و ثبت تاریخچه/SyncLog.
  - در وضعیت فعلی، `ProjectInformationService._isFileBased_(type.ID, type)` باعث `SKIPPED_FILE` شدن انواع دارای فیلد `image/file` می‌شود؛ علت مستقیم انتقال‌نیافتن تصویر همین شرط است.
- `Router.js`:
  - مسیر موجود `POST /projects/:projectId/reference-copy/:typeId` با کنترل `PROJECT_EDIT` و fallback مجاز `PROJECT_CREATE` به متد بالا متصل است؛ API موازی ایجاد نشود.
- `ProjectInformationService.js`:
  - `_isFileBased_(typeId, type)` نوع‌های دارای داده فایل/تصویر را تشخیص می‌دهد.
  - `_scalar(value, dataType, ...)` مرجع فایل را به شکل `AttachmentID, FileName, MimeType, FileSize, AttachmentType` اعتبارسنجی می‌کند و تعلق فایل به پروژه/tenant را الزامی می‌داند.
  - مقادیر در `30_ProjectInformation.ValueJSON` نگهداری می‌شوند.
- `AttachmentService.js`:
  - `upload(data, params)` فایل را در Drive ذخیره و metadata را در `15_Attachments` ثبت می‌کند.
  - `AttachmentRepository.findById/insert` و `StorageRepository.getFile` برای خواندن مرجع و ثبت metadata در دسترس‌اند.
- `GoogleDriveStorage.js`:
  - `getFile(storageKey)` فایل Drive را می‌گیرد؛ `uploadBase64` فایل جدید می‌سازد.
  - باید برای کپی سروری فایل از قابلیت native کپی Drive استفاده شود تا فایل از مرورگر عبور نکند.
- `AttachmentRepository.js`: شیت `15_Attachments`، metadata پیوست‌ها.
- شیت‌های اطلاعات مرکزی: `28_InformationTypes`, `29_InformationTypeColumns`, `30_ProjectInformation`, `31_ProjectInformationHistory`.

### قرارداد و محدودیت‌های پیاده‌سازی
- تصاویر مقصد باید فایل Drive مستقل و AttachmentID جدید داشته باشند؛ استفاده مجدد از AttachmentID پروژه مرجع ممنوع است.
- فایل مقصد باید `TenantID` و `EntityID=ProjectID مقصد` و `EntityType=PROJECT` و نوع پیوست صحیح را داشته باشد.
- فقط تصویرهای فیلدهای `image` در اطلاعات مرکزی و تصویر نمایه پروژه در محدوده این فازند؛ اسناد عمومی/فایل‌های غیرتصویری بدون تغییر رفتار فعلی باقی بمانند.
- ساختار SINGLE/MULTIPLE و آرایه‌ها/ستون‌های چندردیفی حفظ شوند؛ فقط AttachmentIDهای تصویر با شناسه‌های جدید جایگزین شوند.
- کپی باید idempotent و قابل retry باشد؛ شکست یک تصویر نباید فایل تکراری یا مقدار نیمه‌کاره بسازد.
- tenant isolation، دسترسی پروژه، مجوزهای پیوست، Audit و سیاست‌های `INITIAL_COPY/LIVE_SYNC/INDEPENDENT` حفظ شوند.
- مسیرهای اصلی ایجاد پروژه و کپی مرجع حفظ شوند؛ هیچ مسیر موازی یا مهاجرت داده‌ای اضافه نشود.

## 📋 Macro-Task Queue & Implementation Log

- [x] **تسک ۱ — کشف مسیر کپی اطلاعات و علت انتقال‌نیافتن تصاویر**
  - *Log:* `TODO4.md` و `ARCHITECTURE.md` هر دو مخزن و شاخه `main` بررسی شدند. مسیر Frontend در `js/modules/projects.js` از `POST /projects` و سپس `POST /projects/:projectId/reference-copy/:typeId` استفاده می‌کند. در Backend مشخص شد `ProjectService.copyReferenceInformationType` عمداً هر نوع دارای `image/file` را با `ProjectInformationService._isFileBased_` در وضعیت `SKIPPED_FILE` قرار می‌دهد؛ UI نیز همین وضعیت را «فایل منتقل نشد» نشان می‌دهد. فایل‌ها در Google Drive و metadata در `15_Attachments` نگهداری می‌شوند و مقدار مرکزی فقط AttachmentID را در `30_ProjectInformation.ValueJSON` ذخیره می‌کند. راه‌حل منتخب: کپی server-side فایل تصویر به فایل Drive مستقل، ایجاد AttachmentID جدید برای پروژه مقصد و جایگزینی reference در مقدار مرکزی با حفظ ساختار داده و idempotency.
- [ ] **تسک ۲ — انتقال امن تصاویر در جریان موجود کپی پروژه (IN PROGRESS)**
  - تکمیل کپی تصویر در همان متد و endpoint موجود؛ نگاشت AttachmentIDهای منبع به پیوست‌های مستقل مقصد؛ حفظ داده‌های تک‌مقداری/چندردیفی، ثبت وضعیت پیشرفت و retry؛ انتقال تصویر نمایه در صورت وجود و حفظ فایل‌های غیرتصویری خارج از محدوده.
- [ ] **تسک ۳ — آزمون، کنترل تکرار و انتشار**
  - افزودن تست‌های رگرسیون برای تصویر تکی/چندردیفی، عدم اشتراک AttachmentID، tenant isolation، retry/idempotency و عدم تغییر رفتار اسناد؛ اجرای تست‌های Frontend و Backend، بررسی CI و تحویل برای تست کاربر.

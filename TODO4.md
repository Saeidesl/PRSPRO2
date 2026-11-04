## 🎯 Current Objective

افزودن بخش مستقل «اطلاعات مرکزی پروژه» به صفحه جزئیات پروژه تا مقادیر جاری ذخیره‌شده در اطلاعات مرکزی (از جمله موارد کپی‌شده از پروژه مرجع) در کنار اما جدا از «فرم‌های ثبت‌شده پروژه» نمایش داده شوند؛ با حفظ ویرایش، تاریخچه، پیوست‌ها و نمایش صحیح داده‌های تک‌مقداری و چندردیفی.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### مخازن و شاخه فعال
- Frontend: `Saeidesl/PRSPRO2`، شاخه `main`.
- Backend: `Saeidesl/PRSPRO2BACKEND`، شاخه `main`.
- تغییرات این فاز فقط روی `main` انجام می‌شود.

### مدل داده و API موجود
- تعاریف اطلاعات مرکزی: شیت‌های `28_InformationTypes` و `29_InformationTypeColumns`.
- مقادیر جاری هر پروژه: شیت `30_ProjectInformation`، فیلد `ValueJSON`.
- تاریخچه تغییرات: شیت `31_ProjectInformationHistory`.
- Backend در `ProjectInformationService.js`:
  - `list(projectId, params)`: همه انواع اطلاعات فعال Tenant را همراه با مقدار جاری، تعریف نوع اطلاعات و ستون‌ها برمی‌گرداند؛ برای نوع بدون مقدار رکورد EMPTY برمی‌گرداند.
  - `get(projectId, typeId, params)`, `save(...)`, `history(...)`, `deactivate(...)`: APIهای موجود برای مشاهده، ذخیره، تاریخچه و حذف منطقی.
- `Router.js`: مسیر موجود `GET /projects/:projectId/information` با مجوز `PROJECT_VIEW` به `ProjectInformationService.list` متصل است؛ مسیرهای جزئیات، تاریخچه و ذخیره نیز موجودند. در این فاز مسیر موازی یا API تکراری ایجاد نشود.

### Frontend — صفحه جزئیات پروژه
- `pages/project-detail.html`:
  - بخش `project-forms-list` فقط پاسخ فرم‌های متصل به رویداد را نمایش می‌دهد.
  - بخش `project-information-list` در HTML وجود ندارد؛ آزمون فعلی نیز صراحتاً نبود آن را assert می‌کند. این حذف علت قطعی نبود پنل اطلاعات مرکزی است.
  - باید کارت مستقل «اطلاعات مرکزی پروژه» با شمارنده، حالت بارگذاری/خطا/خالی و دکمه تازه‌سازی اضافه شود؛ این کارت از کارت «فرم‌های ثبت‌شده پروژه» جدا بماند.
- `js/modules/project-detail.js`:
  - state موجود: `projectInformation`.
  - `loadProjectInformation(forceRefresh)`: از API موجود `GET /projects/:id/information` داده‌ها را دریافت و `renderProjectInformation()` را اجرا می‌کند.
  - `renderProjectInformation()`: رندر مقادیر scalar و جدول‌های SINGLE/MULTIPLE را پشتیبانی می‌کند.
  - `openProjectInformationForm(record)`: ویرایش مقدار از API موجود `POST /projects/:id/information/:typeId`.
  - `openProjectInformationHistory(record)`: تاریخچه از `GET /projects/:id/information/:typeId/history`.
  - `renderInformationValue` و `openInformationAttachment`: نمایش و دریافت پیوست‌های اطلاعات مرکزی.
  - مشکل فعلی: `loadProjectInformation()` در جریان `init/load` فراخوانی نمی‌شود و container مورد انتظار آن در صفحه وجود ندارد؛ بنابراین کد رندر قدیمی عملاً هیچ UI قابل‌نمایشی ندارد.
  - `loadProjectForms()` و `renderProjectForms()` فقط پاسخ فرم‌های رویدادمحور را نمایش می‌دهند و جایگزین اطلاعات مرکزی نیستند.
- `index.html`: پس از تغییر ماژول، cache-busting اسکریپت `project-detail.js` به‌روز شود.
- CSS موجود صفحه/ماژول باید با جست‌وجوی کلاس‌های `project-information` و `project-forms` شناسایی و همان ساختار طراحی توسعه یابد؛ فایل CSS موازی غیرضروری ایجاد نشود.

### آزمون‌ها و قواعد محصول
- `tests/project-information-dossier.test.js` اکنون اشتباهاً نبود `project-information-list` را الزام می‌کند؛ آزمون باید به قرارداد جدید دو بخش مستقل تغییر کند.
- آزمون‌ها باید وجود کارت اطلاعات مرکزی، اتصال آن به `loadProjectInformation`، استفاده از API موجود، نمایش مقادیر کپی‌شده، ردیف‌های چندمقداری، حالت خالی/خطا، و حفظ فرم‌های ثبت‌شده را پوشش دهند.
- اطلاعات مرکزی و پاسخ فرم‌های رویدادمحور دو مجموعه داده متفاوت‌اند؛ هیچ‌کدام نباید از دیگری استخراج یا جایگزین شود.
- پروژه‌های تکراری باید مقادیر کپی‌شده را از `30_ProjectInformation` مقصد نمایش دهند؛ UI نباید برای نمایش آن‌ها به فرم/رویداد جدید وابسته باشد.
- دسترسی‌ها و کنترل Tenant سمت Backend حفظ شوند؛ ویرایش فقط با مجوز `PROJECT_EDIT` و پیوست فقط با مجوزهای موجود.

## 📋 Macro-Task Queue & Implementation Log

- [x] **تسک ۱ — کشف علت و نقشه اتصال اطلاعات مرکزی در صفحه پروژه**
  - *Log:* هر دو `TODO4.md` و `ARCHITECTURE.md` خوانده شدند. در Frontend مشخص شد `pages/project-detail.html` فقط کارت «فرم‌های ثبت‌شده پروژه» را دارد و container با شناسه `project-information-list` کاملاً حذف شده است؛ آزمون `tests/project-information-dossier.test.js` نیز همین حذف را به‌اشتباه الزام می‌کند. در `js/modules/project-detail.js` توابع `loadProjectInformation`, `renderProjectInformation`, `openProjectInformationForm` و `openProjectInformationHistory` هنوز وجود دارند اما container ندارند و `loadProjectInformation` در چرخه بارگذاری صفحه فراخوانی نمی‌شود. Backend از قبل `GET /projects/:projectId/information` را در `Router.js` و `ProjectInformationService.list` پیاده‌سازی کرده و مقدار جاری، تعریف نوع اطلاعات و ستون‌ها را برمی‌گرداند؛ بنابراین علت اصلی در UI و اتصال Frontend است، نه در عملیات کپی یا ذخیره‌سازی. تصمیم: کارت مستقل اطلاعات مرکزی بازگردانده/ساخته شود و کارت فرم‌های رویدادمحور دست‌نخورده باقی بماند؛ API جدید یا مسیر موازی لازم نیست.
- [ ] **تسک ۲ — ساخت و اتصال پنل مستقل اطلاعات مرکزی (IN PROGRESS)**
  - افزودن کارت و container اطلاعات مرکزی در صفحه جزئیات؛ فراخوانی امن و هم‌زمان `loadProjectInformation` با بارگذاری پروژه؛ اتصال تازه‌سازی، حالت‌های بارگذاری/خطا/خالی؛ حفظ نمایش مقادیر scalar، جدول‌های چندردیفی، پیوست‌ها، ویرایش و تاریخچه.
- [ ] **تسک ۳ — اصلاح آزمون‌ها و تثبیت تجربه نمایش**
  - بازنویسی قرارداد قدیمی حذف پنل در `tests/project-information-dossier.test.js`؛ افزودن تست‌های تفکیک دو بخش، بارگذاری اطلاعات مرکزی مستقل از رویداد، داده‌های کپی‌شده و چندردیفی؛ اصلاح cache-busting و بررسی ریسپانسیو/تم‌ها.
- [ ] **تسک ۴ — اعتبارسنجی نهایی و انتشار**
  - اجرای تست‌های فرانت‌اند و QA بین‌مخزنی، بررسی CI و انتشار روی main؛ سپس تحویل برای تست کاربر در صفحه جزئیات پروژه.

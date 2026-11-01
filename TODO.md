## 🎯 Current Objective

استانداردسازی کامل محیط «طراحی قالب» در PMS؛ رفع قرار گرفتن پنل انتخاب فرم‌ها زیر سایدبار اصلی، اصلاح لایه‌بندی و اسکرول، و یکپارچه‌سازی ظاهر دسکتاپ و موبایل بدون تغییر در داده‌ها یا منطق قالب‌های ذخیره‌شده.

## 🗺️ Technical Spec & Architecture Map (DO NOT DELETE)

### مخازن و شاخه‌ها
- Frontend: `Saeidesl/PRSPRO2`؛ شاخه پایه `main`.
- Backend: `Saeidesl/PRSPRO2BACKEND`؛ این کار صرفاً رابط کاربری فرانت‌اند است و تغییری در بک‌اند/API لازم نیست.
- شاخه اجرایی این فاز: `feat/standardize-print-designer-ui` بر پایه `main`.
- جداسازی «طراحی قالب» و «چاپ اسناد» قبلاً در PR #140 با merge commit `a029a9a105d3eeb20d0fe73a617d74296d878f3d` ادغام شده است.

### یافته‌های کشف و علت مشکل
- صفحه ورود به طراحی: `pages/print-designer.html`؛ انتخاب پروژه با `#print-designer-project-select` و شروع محیط با `#print-designer-launch`.
- منطق صفحه در `js/modules/project-detail.js`:
  - `initPrintDesignerPage()`: دریافت فهرست پروژه‌ها و بازکردن محیط.
  - `loadStandalonePrintProject()`: دریافت پروژه و فرم‌های ثبت‌شده از مسیرهای موجود.
  - `openPrintDesigner(standalone)`: ساخت محیط و پنل‌های افزودن محتوا، فرم‌ها، صفحه A4 و تنظیمات.
  - `bindPrintDesigner()` و `renderPrintDesigner()`: تعاملات و نمایش محیط طراحی.
- علت مستقیم مشکل لایه‌بندی: در `css/project-print-designer.css`، کلاس `.ppd-standalone` ویژگی‌های overlay اصلی را با `position:relative`، `z-index:1` و ارتفاع محدود جایگزین می‌کند؛ بنابراین محیط تمام‌صفحه نیست و پنل فرم‌ها می‌تواند زیر سایدبار اصلی برنامه قرار بگیرد.
- چیدمان فعلی `.ppd-workspace` از ستون ثابت و حداقل عرض بزرگ استفاده می‌کند؛ در عرض‌های میانی و موبایل فضای کافی برای پنل‌ها و کاغذ A4 ایجاد نمی‌کند.
- فرم‌های ثبت‌شده در `.ppd-form-library` و `.ppd-form-group` رندر می‌شوند؛ افزودن کل فرم و افزودن تکی فیلدها از طریق data attributeهای موجود انجام می‌شود.
- قالب‌ها در localStorage با کلید `pms-print-template-<projectId>` و ساختار `version: 1` ذخیره می‌شوند؛ `innerLayout` و `tableLayout` باید بدون تغییر حفظ شوند.

### فایل‌ها، توابع و APIهای درگیر

#### Frontend
- `pages/print-designer.html`: انتخاب پروژه، وضعیت بارگذاری و ورود به محیط طراحی.
- `js/modules/project-detail.js`:
  - `initPrintDesignerPage()`, `loadStandalonePrintProject()`, `openPrintDesigner()`.
  - `bindPrintDesigner()`, `renderPrintDesigner()`, `savePrintDesignerTemplate()`, `loadPrintDesignerTemplate()`.
  - ساختار پنل‌های `.ppd-library`, `.ppd-form-library`, `.ppd-stage-wrap`, `.ppd-properties`.
- `css/project-print-designer.css`: overlay، grid workspace، پنل فرم‌ها، کاغذ A4، breakpoints، تم روشن/تاریک و قواعد چاپ.
- `index.html`: نسخه cache-busting فایل CSS و ماژول جزئیات پروژه.
- `tests/project-print-designer.test.js`: تست ساختار و قراردادهای طراحی قالب و آزمون‌های جدید لایه‌بندی/واکنش‌گرایی.

#### API و جریان داده (بدون تغییر)
- `GET /projects`: فهرست پروژه‌ها برای انتخاب.
- `GET /projects/:projectId`: اطلاعات پروژه.
- `GET /projects/:projectId/details`: اطلاعات رویدادها و فرم‌های ثبت‌شده.
- `GET /attachments/:attachmentId/download`: دریافت تصاویر پیوست فرم.
- هیچ endpoint، payload، sheet یا داده ثبت‌شده‌ای در این فاز تغییر نمی‌کند.

### قرارداد رفتاری
1. محیط طراحی باید روی تمام صفحه و بالاتر از سایدبار و هدر برنامه باز شود؛ هیچ پنل یا دکمه‌ای زیر سایدبار پنهان نماند.
2. پنل انتخاب فرم‌ها و فیلدها باید واضح، قابل اسکرول و از صفحه A4 و پنل تنظیمات مستقل باشد.
3. چیدمان دسکتاپ، تبلت و موبایل باید منظم باشد؛ در موبایل پنل‌ها نباید باعث بیرون‌زدگی افقی کل صفحه شوند و کاغذ A4 باید در فضای قابل مشاهده مدیریت شود.
4. عنوان‌ها، فاصله‌ها، دکمه‌ها، کارت فرم‌ها، وضعیت خالی/بارگذاری و رنگ‌ها با سیستم طراحی و تم فعلی برنامه هماهنگ باشند.
5. قابلیت افزودن کل فرم، افزودن فیلد، انتخاب/جابجایی المان، تنظیم تصاویر و جدول‌ها و ذخیره قالب بدون افت عملکرد حفظ شود.
6. قالب‌های نسخه ۱ و تنظیمات `innerLayout` و `tableLayout` بدون مهاجرت یا تغییر باقی بمانند.
7. بخش «چاپ اسناد» و رفتار خروجی PDF/چاپ نباید ناخواسته تغییر کند.

## 📋 Macro-Task Queue & Implementation Log

- [x] تسک ۱ — کشف ساختار محیط طراحی و ریشه‌یابی مشکل نمایش پنل فرم‌ها.
  - *Log:* `TODO.md`، `ARCHITECTURE.md` و فایل‌های `pages/print-designer.html`, `js/modules/project-detail.js`, `css/project-print-designer.css`, `index.html`, `tests/project-print-designer.test.js` بررسی شدند. مشخص شد `.ppd-standalone` با `position:relative` و `z-index:1` overlay تمام‌صفحه را خنثی می‌کند و grid فعلی در اندازه‌های کوچک محدودیت دارد. APIهای موردنیاز از قبل موجودند و نیازی به تغییر بک‌اند نیست. شاخه `feat/standardize-print-designer-ui` از `main` ساخته شد.
- [x] تسک ۲ — بازطراحی و استانداردسازی کامل محیط طراحی قالب: رفع هم‌پوشانی سایدبار، مرتب‌سازی پنل فرم‌ها و ابزارها، اصلاح اسکرول و واکنش‌گرایی دسکتاپ/تبلت/موبایل و هماهنگی با تم برنامه.
  - *Log:* در `js/modules/project-detail.js`، تابع `openPrintDesigner()` و ساختار پنل افزودن محتوا/فرم‌ها بازآرایی شد و data attributeهای افزودن فرم و فیلد حفظ شدند. در `css/project-print-designer.css`، `.ppd-standalone` به overlay تمام‌صفحه با لایه‌بندی بالاتر از سایدبار تبدیل شد؛ اسکرول صفحه هنگام باز بودن محیط کنترل شد؛ workspace برای دسکتاپ، تبلت و موبایل بازچینی شد و اندازه A4 در چاپ حفظ شد. در `index.html` نسخه cache-busting فایل‌های CSS و JS به‌روزرسانی شد. تست‌های مربوط به فرم‌های ثبت‌شده، پنل خالی، overlay و سازگاری چاپ A4 اضافه/به‌روز شدند. تغییرات PR #143 با روش squash در `main` ادغام شد؛ merge commit: `7960ca069f0495d369e95ca5d6715ebb81d37ee4`.
- [ ] تسک ۳ — تکمیل آزمون مرورگر و بررسی دیداری: اطمینان از اینکه پنل فرم‌ها در اندازه‌های مختلف بالای سایدبار دیده می‌شود و افزودن فرم/فیلد، ذخیره قالب و خروجی چاپ بدون رگرسیون کار می‌کنند. (IN PROGRESS)

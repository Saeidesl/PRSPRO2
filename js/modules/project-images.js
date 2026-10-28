(function () {
  'use strict';
  window.PMS = window.PMS || {};

  // افزودن نوع جدید فایل فقط با اضافه‌کردن یک عضو به این فهرست انجام می‌شود.
  const fileTypes = [
    { value: 'PROFILE', label: 'عکس پروفایل پروژه', imagesOnly: true },
    { value: 'SEWING_PASSPORT', label: 'شناسنامه دوخت' },
    { value: 'CUTTING_PASSPORT', label: 'شناسنامه برش' },
    { value: 'PROJECT_DOCUMENT', label: 'مدارک پروژه' },
    { value: 'TECHNICAL_SPEC', label: 'مشخصات فنی' },
    { value: 'QUALITY_DOCUMENT', label: 'مدارک کنترل کیفیت' },
    { value: 'OTHER', label: 'سایر فایل‌ها' }
  ];
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character];
    });
  }
  function permission(name) {
    const router = window.PMS.Router;
    return !!(router && ((typeof router.isAdmin === 'function' && router.isAdmin()) ||
      (Array.isArray(router.permissions) && router.permissions.indexOf(name) !== -1)));
  }
  function itemId(item) {
    return String(item.ID || item.Id || item.id || '');
  }
  function itemType(item) {
    return String(item.AttachmentType || item.attachmentType || '').toUpperCase();
  }
  function itemMime(item) {
    return String(item.MimeType || item.mimeType || '').toLowerCase();
  }
  function itemName(item) {
    return String(item.FileName || item.fileName || 'فایل بدون نام');
  }
  function typeLabel(value) {
    const found = fileTypes.find(function (type) { return type.value === value; });
    return found ? found.label : (value || 'فایل قدیمی');
  }
  function decodeBase64(value) {
    const binary = window.atob(String(value || ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  const ProjectImages = {
    open: function (projectId, type) {
      type = String(type || 'PROFILE').toUpperCase();
      if (!projectId || !fileTypes.some(function (entry) { return entry.value === type; })) return;
      this.openManager(projectId, { initialType: type, profileOnly: type === 'PROFILE' });
    },

    openManager: function (projectId, options) {
      options = options || {};
      if (!projectId) return;
      if (!permission('ATTACHMENT_VIEW')) {
        window.alert('مجوز مشاهده پیوست‌ها را ندارید.');
        return;
      }
      const initialType = String(options.initialType || 'PROJECT_DOCUMENT').toUpperCase();
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:25000;background:#0009;display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl';
      const dialog = document.createElement('section');
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-labelledby', 'pms-project-files-title');
      dialog.style.cssText = 'width:min(820px,100%);max-height:92vh;overflow:auto;background:var(--color-surface,#fff);color:var(--color-text,#111);border:1px solid var(--color-border, #ddd);border-radius:14px;padding:18px;box-shadow:0 20px 60px #0003';
      dialog.innerHTML =
        '<button type="button" data-close style="float:left">بستن ×</button>' +
        '<h2 id="pms-project-files-title" style="margin:0 0 8px">فایل‌های پروژه</h2>' +
        '<p style="margin:0 0 16px;color:var(--color-text-secondary,#666)">تصاویر، شناسنامه‌ها، PDF، فایل‌های Excel و Word را از این بخش مدیریت کنید. تصویر پروفایل همچنان تنها تصویر بندانگشتی کارت پروژه است.</p>' +
        '<p data-status role="status" aria-live="polite">در حال دریافت فایل‌ها…</p>' +
        '<div data-list style="display:grid;gap:10px"></div>';
      const canUpload = permission('ATTACHMENT_UPLOAD');
      if (canUpload) {
        const form = document.createElement('form');
        form.setAttribute('aria-label', 'افزودن فایل پروژه');
        form.style.cssText = 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr) auto;align-items:end;gap:12px;padding:14px;margin:14px 0 18px;border:1px solid var(--color-border,#ddd);border-radius:12px';
        form.innerHTML =
          '<label style="display:grid;gap:6px;font-size:13px">نوع فایل' +
          '<select name="AttachmentType" required style="width:100%;min-height:40px;padding:8px;border:1px solid var(--color-border,#ccc);border-radius:8px;background:var(--color-surface,#fff);color:inherit">' +
          fileTypes.map(function (entry) { return '<option value="' + entry.value + '">' + escapeHtml(entry.label) + '</option>'; }).join('') +
          '</select></label>' +
          '<label style="display:grid;gap:6px;font-size:13px">انتخاب فایل (تصویر، PDF، Word یا Excel؛ حداکثر ۵ مگابایت)' +
          '<input name="file" type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required style="width:100%;min-width:0"></label>' +
          '<button type="submit" style="min-height:40px;padding:8px 16px;border:0;border-radius:8px;background:var(--color-primary,#2563eb);color:white;cursor:pointer">بارگذاری فایل</button>' +
          '<p data-form-hint style="grid-column:1/-1;margin:0;font-size:12px;color:var(--color-text-secondary,#666)">نام فایل هنگام ذخیره در سرور با کد پروژه و نوع فایل ترکیب می‌شود.</p>';
        dialog.appendChild(form);
        const typeSelect = form.querySelector('[name="AttachmentType"]');
        const fileInput = form.querySelector('[name="file"]');
        if (fileTypes.some(function (entry) { return entry.value === initialType; })) typeSelect.value = initialType;
        function updateAccept() {
          const selected = fileTypes.find(function (entry) { return entry.value === typeSelect.value; });
          fileInput.accept = selected && selected.imagesOnly ? 'image/jpeg,image/png,image/webp,image/gif' :
            '.jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          fileInput.value = '';
        }
        typeSelect.addEventListener('change', updateAccept);
        updateAccept();
        form.addEventListener('submit', async function (event) {
          event.preventDefault();
          const file = fileInput.files && fileInput.files[0];
          const selectedType = String(typeSelect.value || '').toUpperCase();
          const definition = fileTypes.find(function (entry) { return entry.value === selectedType; });
          if (!file || !definition) return;
          const extension = (file.name.split('.').pop() || '').toLowerCase();
          const mime = String(file.type || '').toLowerCase();
          const inferredMimeAllowed = allowedMimeTypes.indexOf(mime) !== -1 ||
            (!mime && allowedExtensions.indexOf(extension) !== -1);
          const image = mime.indexOf('image/') === 0 || ['jpg','jpeg','png','webp','gif'].indexOf(extension) !== -1;
          if (!inferredMimeAllowed || allowedExtensions.indexOf(extension) === -1 ||
              (mime && allowedMimeTypes.indexOf(mime) === -1) ||
              (definition.imagesOnly && !image) || file.size < 1 || file.size > MAX_FILE_SIZE) {
            setStatus('فرمت فایل مجاز نیست یا حجم آن از ۵ مگابایت بیشتر است.');
            return;
          }
          const submit = form.querySelector('button[type="submit"]');
          submit.disabled = true;
          submit.textContent = 'در حال بارگذاری…';
          try {
            const dataUrl = await new Promise(function (resolve, reject) {
              const reader = new FileReader();
              reader.onload = function () { resolve(String(reader.result || '')); };
              reader.onerror = function () { reject(new Error('خواندن فایل ناموفق بود.')); };
              reader.readAsDataURL(file);
            });
            await window.PMS.Api.post('/projects/' + encodeURIComponent(projectId) + '/attachments', {
              FileName: file.name,
              MimeType: mime || mimeFromExtension(extension),
              Base64: dataUrl.split(',')[1] || '',
              AttachmentType: selectedType
            }, { trackSync: false });
            invalidateCaches(projectId);
            form.reset();
            typeSelect.value = selectedType;
            updateAccept();
            setStatus('فایل با موفقیت بارگذاری شد.');
            await loadFiles();
          } catch (error) {
            setStatus((error && error.message) || 'بارگذاری فایل ناموفق بود.');
          } finally {
            submit.disabled = false;
            submit.textContent = 'بارگذاری فایل';
          }
        });
      } else {
        const note = document.createElement('p');
        note.textContent = 'برای افزودن فایل، مجوز بارگذاری پیوست لازم است.';
        note.style.cssText = 'color:var(--color-text-secondary,#666);font-size:12px';
        dialog.appendChild(note);
      }
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      const close = function () { overlay.remove(); document.removeEventListener('keydown', onKey); };
      const onKey = function (event) { if (event.key === 'Escape') close(); };
      document.addEventListener('keydown', onKey);
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay || (event.target.closest && event.target.closest('[data-close]'))) {
          close();
          return;
        }
        const previewButton = event.target.closest && event.target.closest('[data-file-action="preview"]');
        const downloadButton = event.target.closest && event.target.closest('[data-file-action="download"]');
        const deleteButton = event.target.closest && event.target.closest('[data-file-action="delete"]');
        if (previewButton) previewFile(previewButton.getAttribute('data-file-id'));
        if (downloadButton) downloadFile(downloadButton.getAttribute('data-file-id'));
        if (deleteButton) deleteFile(deleteButton.getAttribute('data-file-id'));
      });

      function setStatus(message) {
        const status = dialog.querySelector('[data-status]');
        if (status) status.textContent = message;
      }
      function invalidateCaches(id) {
        ['attachments', 'project_card_images_v1', 'project_card_attachments_v2'].forEach(function (key) {
          if (window.PMS.Cache && window.PMS.Cache.remove) window.PMS.Cache.remove(key);
        });
        if (window.PMS.Projects && window.PMS.Projects.invalidateProjectCardAttachmentMetadata) {
          window.PMS.Projects.invalidateProjectCardAttachmentMetadata(id);
          if (window.PMS.Projects.loadProjects) window.PMS.Projects.loadProjects();
        }
      }
      async function loadFiles() {
        const list = dialog.querySelector('[data-list]');
        if (!list) return;
        list.innerHTML = '<p>در حال دریافت فایل‌ها…</p>';
        try {
          const response = await window.PMS.Api.get('/projects/' + encodeURIComponent(projectId) + '/attachments', { trackSync: false });
          let data = window.PMS.Api.extractData ? window.PMS.Api.extractData(response) : response;
          if (data && !Array.isArray(data)) data = data.items || data.attachments || data.data || [];
          const items = (Array.isArray(data) ? data : []).filter(function (item) {
            const status = String(item.Status || item.status || '').toUpperCase();
            return status !== 'DELETED' && status !== 'VOID';
          });
          setStatus(items.length + ' فایل ثبت‌شده');
          if (!items.length) {
            list.innerHTML = '<div class="pms-project-files-empty">هنوز فایلی برای این پروژه ثبت نشده است.</div>';
            return;
          }
          list.innerHTML = items.map(function (item) {
            const id = itemId(item);
            const mime = itemMime(item);
            const type = itemType(item) || 'PROFILE';
            const name = itemName(item);
            const isImage = mime.indexOf('image/') === 0;
            const isPdf = mime === 'application/pdf' || /\.pdf$/i.test(name);
            const badge = isImage ? 'تصویر' : (isPdf ? 'PDF' : (/\.(doc|docx)$/i.test(name) ? 'Word' : (/\.(xls|xlsx)$/i.test(name) ? 'Excel' : 'فایل')));
            const canDelete = permission('ATTACHMENT_DELETE');
            return '<article style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px;border:1px solid var(--color-border,#ddd);border-radius:10px;min-width:0">' +
              '<span aria-hidden="true" style="display:grid;place-items:center;flex:0 0 42px;height:42px;border-radius:9px;background:var(--color-surface-hover,#f2f2f2);font-size:11px;font-weight:700">' + badge + '</span>' +
              '<div style="flex:1;min-width:150px;overflow-wrap:anywhere"><strong style="display:block;font-size:13px">' + escapeHtml(name) + '</strong><span style="display:block;margin-top:4px;color:var(--color-text-secondary,#666);font-size:12px">' + escapeHtml(typeLabel(type)) + (item.FileSize || item.fileSize ? ' · ' + formatSize(item.FileSize || item.fileSize) : '') + '</span></div>' +
              (isImage ? '<button type="button" data-file-action="preview" data-file-id="' + escapeHtml(id) + '">پیش‌نمایش</button>' : '') +
              '<button type="button" data-file-action="download" data-file-id="' + escapeHtml(id) + '">دریافت</button>' +
              (canDelete ? '<button type="button" data-file-action="delete" data-file-id="' + escapeHtml(id) + '" style="color:#b42318">حذف</button>' : '') +
              '</article>';
          }).join('');
        } catch (error) {
          setStatus((error && error.message) || 'دریافت فایل‌های پروژه ناموفق بود.');
          list.innerHTML = '<div class="pms-project-files-empty is-error">دریافت فهرست فایل‌ها انجام نشد. اتصال را بررسی و دوباره تلاش کنید.</div>';
        }
      }
      async function getFileData(id) {
        const response = await window.PMS.Api.get('/attachments/' + encodeURIComponent(id) + '/download', { trackSync: false });
        const data = window.PMS.Api.extractData ? window.PMS.Api.extractData(response) : response;
        if (!data || !(data.Base64 || data.base64)) throw new Error('محتوای فایل در پاسخ سرور موجود نیست.');
        return data;
      }
      async function previewFile(id) {
        try {
          const data = await getFileData(id);
          const mime = String(data.MimeType || data.mimeType || 'image/jpeg');
          if (mime.indexOf('image/') !== 0) throw new Error('پیش‌نمایش فقط برای تصاویر فعال است.');
          const modal = document.createElement('div');
          modal.style.cssText = 'position:fixed;inset:0;z-index:25001;background:#000e;display:flex;align-items:center;justify-content:center;padding:12px;cursor:zoom-out';
          const image = document.createElement('img');
          image.alt = 'پیش‌نمایش تصویر فایل پروژه';
          image.style.cssText = 'max-width:100%;max-height:90vh;object-fit:contain';
          image.src = 'data:' + mime + ';base64,' + String(data.Base64 || data.base64);
          modal.appendChild(image);
          modal.addEventListener('click', function () { modal.remove(); });
          document.body.appendChild(modal);
        } catch (error) { setStatus((error && error.message) || 'پیش‌نمایش فایل ناموفق بود.'); }
      }
      async function downloadFile(id) {
        try {
          const data = await getFileData(id);
          const bytes = decodeBase64(data.Base64 || data.base64);
          const blob = new Blob([bytes], { type: String(data.MimeType || data.mimeType || 'application/octet-stream') });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = String(data.FileName || data.fileName || 'project-file');
          anchor.style.display = 'none';
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          window.setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
          setStatus('دریافت فایل آغاز شد.');
        } catch (error) { setStatus((error && error.message) || 'دریافت فایل ناموفق بود.'); }
      }
      async function deleteFile(id) {
        if (!permission('ATTACHMENT_DELETE')) return;
        if (!window.confirm('این فایل حذف شود؟ این عملیات ممکن است قابل بازگشت نباشد.')) return;
        try {
          await window.PMS.Api.delete('/attachments/' + encodeURIComponent(id) + '?reason=' + encodeURIComponent('حذف از فرم فایل‌های پروژه'), { trackSync: false });
          invalidateCaches(projectId);
          setStatus('فایل حذف شد.');
          await loadFiles();
        } catch (error) { setStatus((error && error.message) || 'حذف فایل ناموفق بود.'); }
      }
      loadFiles();
    }
  };

  function mimeFromExtension(extension) {
    const types = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
      pdf: 'application/pdf', doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return types[extension] || 'application/octet-stream';
  }
  function formatSize(value) {
    const size = Number(value);
    if (!isFinite(size) || size <= 0) return '';
    return size < 1024 * 1024 ? Math.max(1, Math.round(size / 1024)) + ' KB' : (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  window.PMS.ProjectImages = ProjectImages;
  document.addEventListener('pms:project-menu-action', function (event) {
    const detail = event.detail || {};
    if (detail.action === 'project-files' || detail.action === 'files') {
      ProjectImages.openManager(detail.projectId);
      return;
    }
    const types = { 'profile-image': 'PROFILE', 'sewing-passport': 'SEWING_PASSPORT', 'cutting-passport': 'CUTTING_PASSPORT' };
    if (types[detail.action]) ProjectImages.open(detail.projectId, types[detail.action]);
  });
})();
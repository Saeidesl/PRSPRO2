(function () {
  'use strict';
  window.PMS = window.PMS || {};
  const labels = {
    PROFILE: 'عکس پروفایل پروژه',
    SEWING_PASSPORT: 'شناسنامه دوخت',
    CUTTING_PASSPORT: 'شناسنامه برش'
  };
  const ProjectImages = {
    open: function (projectId, type) {
      type = String(type || 'PROFILE').toUpperCase();
      if (!labels[type] || !projectId) return;
      const router = window.PMS.Router;
      const allowed = router && ((router.isAdmin && router.isAdmin()) ||
        (Array.isArray(router.permissions) && router.permissions.indexOf('ATTACHMENT_VIEW') !== -1));
      if (!allowed) { window.alert('مجوز مشاهده پیوست‌ها را ندارید.'); return; }
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:25000;background:#0009;display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl';
      const dialog = document.createElement('section');
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.style.cssText = 'width:min(600px,100%);max-height:90vh;overflow:auto;background:var(--color-surface,#fff);color:var(--color-text,#111);border-radius:14px;padding:18px';
      dialog.innerHTML = '<button type="button" data-close style="float:left">بستن ×</button><h2>' + labels[type] + '</h2><p>' + (type === 'PROFILE' ? 'این تصویر روی کارت پروژه نمایش داده می‌شود.' : 'این تصویر برای شناسنامه پروژه نگهداری می‌شود.') + '</p><p data-status>در حال دریافت تصاویر…</p><div data-list></div>';
      const canUpload = router && ((router.isAdmin && router.isAdmin()) ||
        (Array.isArray(router.permissions) && router.permissions.indexOf('ATTACHMENT_UPLOAD') !== -1));
      if (canUpload) {
        const form = document.createElement('form');
        form.innerHTML = '<label>انتخاب تصویر (حداکثر ۵ مگابایت) <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" required></label><button type="submit">بارگذاری</button>';
        form.style.cssText = 'display:grid;gap:12px;margin-top:18px';
        dialog.appendChild(form);
        form.addEventListener('submit', async function (event) {
          event.preventDefault();
          const file = form.querySelector('input').files[0];
          if (!file) return;
          if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type.toLowerCase()) || file.size < 1 || file.size > 5 * 1024 * 1024) {
            dialog.querySelector('[data-status]').textContent = 'فرمت یا حجم تصویر مجاز نیست.';
            return;
          }
          const button = form.querySelector('button');
          button.disabled = true;
          try {
            const dataUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ''));
              reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود.'));
              reader.readAsDataURL(file);
            });
            await window.PMS.Api.post('/projects/' + encodeURIComponent(projectId) + '/attachments', {
              FileName: file.name, MimeType: file.type, Base64: dataUrl.split(',')[1] || '', AttachmentType: type
            }, {trackSync:false});
            ['attachments','project_card_images_v1','project_card_attachments_v2'].forEach(key => window.PMS.Cache && window.PMS.Cache.remove(key));
            if (window.PMS.Projects && window.PMS.Projects.invalidateProjectCardAttachmentMetadata) {
              window.PMS.Projects.invalidateProjectCardAttachmentMetadata(projectId);
              if (window.PMS.Projects.loadProjects) window.PMS.Projects.loadProjects();
            }
            dialog.querySelector('[data-status]').textContent = 'تصویر بارگذاری شد.';
            form.reset();
            await loadImages();
          } catch (error) {
            dialog.querySelector('[data-status]').textContent = error.message || 'بارگذاری تصویر ناموفق بود.';
          } finally { button.disabled = false; }
        });
      }
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };
      const onKey = event => { if (event.key === 'Escape') close(); };
      document.addEventListener('keydown', onKey);
      overlay.addEventListener('click', event => {
        if (event.target === overlay || event.target.closest('[data-close]')) close();
        const button = event.target.closest('[data-preview-id]');
        if (button) preview(button.getAttribute('data-preview-id'));
      });
      async function loadImages() {
        try {
          const response = await window.PMS.Api.get('/projects/' + encodeURIComponent(projectId) + '/attachments', {trackSync:false});
          let data = window.PMS.Api.extractData ? window.PMS.Api.extractData(response) : response;
          if (data && !Array.isArray(data)) data = data.items || data.attachments || data.data || [];
          const items = (Array.isArray(data) ? data : []).filter(item => {
            const mime = String(item.MimeType || item.mimeType || '').toLowerCase();
            const attachmentType = String(item.AttachmentType || item.attachmentType || '').toUpperCase();
            return mime.indexOf('image/') === 0 && (attachmentType === type || (!attachmentType && type === 'PROFILE'));
          });
          dialog.querySelector('[data-status]').textContent = items.length + ' تصویر';
          dialog.querySelector('[data-list]').innerHTML = items.length ? items.map(item =>
            '<p>' + String(item.FileName || item.fileName || 'تصویر').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])) +
            ' <button type="button" data-preview-id="' + String(item.ID || item.Id || item.id || '') + '">پیش‌نمایش</button></p>'
          ).join('') : '<p>تصویری در این دسته ثبت نشده است.</p>';
        } catch (error) { dialog.querySelector('[data-status]').textContent = error.message || 'دریافت تصاویر ناموفق بود.'; }
      }
      async function preview(id) {
        try {
          const response = await window.PMS.Api.get('/attachments/' + encodeURIComponent(id) + '/download', {trackSync:false});
          const data = window.PMS.Api.extractData ? window.PMS.Api.extractData(response) : response;
          if (!data || !(data.Base64 || data.base64)) throw new Error('داده تصویر در پاسخ موجود نیست.');
          const modal = document.createElement('div');
          modal.style.cssText = 'position:fixed;inset:0;z-index:25001;background:#000e;display:flex;align-items:center;justify-content:center;padding:12px';
          const image = document.createElement('img');
          image.alt = 'پیش‌نمایش تصویر پروژه';
          image.style.cssText = 'max-width:100%;max-height:90vh;object-fit:contain';
          image.src = 'data:' + String(data.MimeType || data.mimeType || 'image/jpeg') + ';base64,' + String(data.Base64 || data.base64);
          modal.appendChild(image);
          modal.addEventListener('click', () => modal.remove());
          document.body.appendChild(modal);
        } catch (error) { dialog.querySelector('[data-status]').textContent = error.message || 'پیش‌نمایش ناموفق بود.'; }
      }
      loadImages();
    }
  };
  window.PMS.ProjectImages = ProjectImages;
  document.addEventListener('pms:project-menu-action', function (event) {
    const detail = event.detail || {};
    const types = {'profile-image':'PROFILE','sewing-passport':'SEWING_PASSPORT','cutting-passport':'CUTTING_PASSPORT'};
    if (types[detail.action]) ProjectImages.open(detail.projectId, types[detail.action]);
  });
})();
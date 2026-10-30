(function () {
  'use strict';
  const PMS = window.PMS;
  const Forms = {
    items: [], informationTypes: [], eventTypes: [], busy: false,
    init: function () {
      const button=document.getElementById('forms-create-button');
      if(button) button.addEventListener('click',()=>this.openForm(null));
      this.load();
    },
    list: function(value,key) {
      const data=PMS.Api.extractData(value);
      if(Array.isArray(data))return data;
      if(data&&Array.isArray(data.items))return data.items;
      if(data&&Array.isArray(data[key]))return data[key];
      return [];
    },
    esc: function(value) {
      return String(value===undefined||value===null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});
    },
    load: async function () {
      const loading=document.getElementById('forms-loading'), error=document.getElementById('forms-error');
      if(loading)loading.hidden=false;if(error){error.hidden=true;error.textContent='';}
      try {
        const [forms,types,events]=await Promise.all([
          PMS.Api.get('/forms'),PMS.Api.get('/information-types'),PMS.Api.get('/event-types')
        ]);
        this.items=this.list(forms,'forms');this.informationTypes=this.list(types,'informationTypes');
        this.eventTypes=this.list(events,'eventTypes');
        this.render();
      } catch(e) {
        if(error){error.hidden=false;error.textContent=e.message||'دریافت فرم‌ها ناموفق بود.';}
      } finally {if(loading)loading.hidden=true;}
    },
    render: function () {
      const table=document.getElementById('forms-table'),empty=document.getElementById('forms-empty');
      if(!table)return;
      if(!this.items.length){table.hidden=true;table.innerHTML='';if(empty)empty.hidden=false;return;}
      if(empty)empty.hidden=true;
      table.innerHTML='<table class="data-table"><thead><tr><th>نام فرم</th><th>کد</th><th>نسخه</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>'+
        this.items.map(item=>'<tr><td>'+this.esc(item.Name)+'</td><td>'+this.esc(item.Code)+'</td><td>'+this.esc(item.Version||1)+'</td><td>'+this.esc(item.Status||'ACTIVE')+'</td><td><button class="btn btn-sm btn-secondary" data-edit="'+this.esc(item.ID)+'">ویرایش</button> <button class="btn btn-sm btn-primary" data-design="'+this.esc(item.ID)+'">طراحی و اتصال</button></td></tr>').join('')+
        '</tbody></table>';
      table.hidden=false;
      table.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>this.openForm(b.dataset.edit)));
      table.querySelectorAll('[data-design]').forEach(b=>b.addEventListener('click',()=>this.openDesigner(b.dataset.design)));
    },
    modal: function(title,id) {
      const old=document.getElementById(id);if(old)old.remove();
      const overlay=document.createElement('div');overlay.className='event-modal-overlay';overlay.id=id;overlay.dir='rtl';
      overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
      overlay.innerHTML='<div class="event-modal-panel"><div class="event-modal-heading"><h3>'+this.esc(title)+'</h3><button type="button" class="event-modal-close" data-close aria-label="بستن">×</button></div><div class="event-modal-content"></div></div>';
      document.body.appendChild(overlay);overlay.querySelector('[data-close]').addEventListener('click',()=>overlay.remove());
      overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});
      return overlay;
    },
    openForm: async function(id) {
      const item=this.items.find(x=>String(x.ID)===String(id))||{};
      const editing=!!id, modal=this.modal(editing?'ویرایش فرم':'ایجاد فرم','form-editor-modal'), body=modal.querySelector('.event-modal-content');
      body.innerHTML='<form id="form-meta-form" class="form-grid">'+
        '<div class="form-group"><label>نام فرم *</label><input name="Name" required maxlength="150" value="'+this.esc(item.Name)+'"></div>'+
        '<div class="form-group"><label>کد انگلیسی *</label><input name="Code" required maxlength="60" pattern="[A-Za-z][A-Za-z0-9_]{1,59}" value="'+this.esc(item.Code)+'"></div>'+
        '<div class="form-group"><label>وضعیت</label><select name="Status"><option value="ACTIVE">فعال</option><option value="INACTIVE">غیرفعال</option></select></div>'+
        '<div class="form-group"><label>توضیحات</label><textarea name="Description" rows="3">'+this.esc(item.Description)+'</textarea></div>'+
        '<div class="event-modal-actions"><button class="event-modal-button event-modal-button-primary" type="submit">ذخیره</button><button class="event-modal-button" type="button" data-cancel>انصراف</button></div></form>';
      const form=body.querySelector('form');form.elements.Status.value=item.Status||'ACTIVE';
      form.querySelector('[data-cancel]').addEventListener('click',()=>modal.remove());
      form.addEventListener('submit',async e=>{
        e.preventDefault();if(this.busy)return;this.busy=true;
        const payload={Name:form.elements.Name.value.trim(),Code:form.elements.Code.value.trim(),Description:form.elements.Description.value,Status:form.elements.Status.value};
        try {
          if(editing)await PMS.Api.put('/forms/'+encodeURIComponent(id),payload);
          else await PMS.Api.post('/forms',payload);
          modal.remove();await this.load();
        } catch(err){this.notice(body,err.message||'ذخیره فرم ناموفق بود.');}
        finally{this.busy=false;}
      });
    },
    openDesigner: async function(id) {
      const modal=this.modal('طراحی فرم و اتصال به رویدادها','form-designer-modal'),body=modal.querySelector('.event-modal-content');
      body.innerHTML='<p class="event-muted">در حال دریافت ساختار فرم…</p>';
      try {
        const [response,mappings]=await Promise.all([
          PMS.Api.get('/forms/'+encodeURIComponent(id)),
          Promise.resolve(null)
        ]);
        const form=PMS.Api.extractData(response)||{};
        const fields=Array.isArray(form.Fields)?form.Fields:[];
        const mappingHtml='<section class="et-section"><h4>اتصال به نوع رویداد</h4><div class="form-group"><label>نوع رویداد</label><select id="form-event-type"><option value="">انتخاب نوع رویداد</option>'+this.eventTypes.filter(x=>String(x.ConnectionType||'PROJECT').toUpperCase()!=='INDEPENDENT'&&String(x.Status||'ACTIVE')==='ACTIVE').map(x=>'<option value="'+this.esc(x.ID)+'">'+this.esc(x.Name||x.Code)+'</option>').join('')+'</select></div><label><input type="checkbox" id="form-event-required" checked> تکمیل این فرم اجباری باشد</label><button type="button" class="btn btn-secondary" id="form-event-attach">اتصال فرم</button><div id="form-event-mappings" class="et-field-list"></div></section>';
        body.innerHTML='<style>.form-designer-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.form-designer-grid .form-group{margin:0}.form-designer-field{border:1px solid var(--color-border);border-radius:8px;padding:10px;margin:8px 0}.form-designer-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}@media(max-width:650px){.form-designer-grid{grid-template-columns:1fr}}</style>'+
          '<p><strong>'+this.esc(form.Name)+'</strong> <span class="event-muted">نسخه '+this.esc(form.Version||1)+'</span></p>'+
          '<section class="et-section"><h4>افزودن اطلاعات مرکزی به فرم</h4><form id="form-field-add"><div class="form-designer-grid"><div class="form-group"><label>نوع اطلاعات</label><select name="InformationTypeID" required><option value="">انتخاب اطلاعات مرکزی</option>'+this.informationTypes.filter(x=>String(x.Status||'ACTIVE')==='ACTIVE').map(x=>'<option value="'+this.esc(x.ID)+'">'+this.esc(x.Name)+' ('+this.esc(x.Code)+')</option>').join('')+'</select></div><div class="form-group"><label>گروه</label><input name="GroupName" maxlength="120" placeholder="مثلاً مشخصات اولیه"></div><div class="form-group"><label>عنوان نمایشی</label><input name="LabelOverride" maxlength="150"></div><div class="form-group"><label>ترتیب نمایش</label><input name="FieldOrder" type="number" min="0" value="'+(fields.length+1)+'"></div><div class="form-group" style="grid-column:1/-1"><label>راهنمای ورود</label><input name="HelpText" maxlength="500"></div></div><div class="form-designer-grid"><div class="form-group"><label>نمایش در صورت تحقق شرط</label><select name="VisibleWhenInformationTypeID"><option value="">بدون شرط</option>'+fields.map(f=>'<option value="'+this.esc(f.InformationTypeID)+'">'+this.esc(f.LabelOverride||f.InformationType.Name)+'</option>').join('')+'</select></div><div class="form-group"><label>شرط</label><select name="VisibilityOperator"><option value="FILLED">فیلد مرجع پر شده باشد</option><option value="EMPTY">فیلد مرجع خالی باشد</option><option value="EQUALS">برابر با مقدار</option><option value="NOT_EQUALS">مخالف مقدار</option></select></div><div class="form-group"><label>مقدار مقایسه</label><input name="VisibilityValue"></div></div><label><input name="IsRequired" type="checkbox"> تکمیل این فیلد اجباری باشد</label><div class="form-designer-actions"><button class="btn btn-primary" type="submit">افزودن فیلد</button></div></form></section>'+
          '<section class="et-section"><h4>فیلدهای فرم</h4><div id="form-field-list"></div></section>'+mappingHtml;
        const fieldList=body.querySelector('#form-field-list');
        const renderFields=()=>{
          fieldList.innerHTML=fields.length?fields.map(f=>'<div class="form-designer-field"><strong>'+this.esc(f.LabelOverride||f.InformationType.Name)+'</strong><div class="event-muted">'+this.esc(f.InformationType.Name)+' · '+this.esc(f.InformationType.Cardinality)+' · '+(f.IsRequired?'اجباری':'اختیاری')+' · '+this.esc(f.GroupName||'بدون گروه')+' · ترتیب '+this.esc(f.FieldOrder)+'</div><button type="button" class="btn btn-sm btn-secondary" data-edit-field="'+this.esc(f.ID)+'">ویرایش</button> <button type="button" class="btn btn-sm btn-secondary" data-remove="'+this.esc(f.ID)+'">حذف از فرم</button></div>').join(''):'<p class="event-muted">هنوز فیلدی به فرم اضافه نشده است.</p>';
          fieldList.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',async()=>{try{await PMS.Api.delete('/form-fields/'+encodeURIComponent(b.dataset.remove));fields.splice(fields.findIndex(f=>String(f.ID)===String(b.dataset.remove)),1);renderFields();}catch(err){this.notice(body,err.message);}}));
          fieldList.querySelectorAll('[data-edit-field]').forEach(b=>b.addEventListener('click',()=>{
            const field=fields.find(x=>String(x.ID)===String(b.dataset.editField));if(!field)return;
            let editor=body.querySelector('#form-field-edit');if(editor)editor.remove();
            editor=document.createElement('form');editor.id='form-field-edit';editor.className='et-section';
            editor.innerHTML='<h4>ویرایش تنظیمات فیلد</h4><div class="form-designer-grid"><div class="form-group"><label>گروه</label><input name="GroupName" maxlength="120"></div><div class="form-group"><label>عنوان نمایشی</label><input name="LabelOverride" maxlength="150"></div><div class="form-group"><label>ترتیب</label><input name="FieldOrder" type="number" min="0"></div><div class="form-group"><label>راهنما</label><input name="HelpText" maxlength="500"></div></div><div class="form-designer-grid"><div class="form-group"><label>نمایش در صورت تحقق شرط</label><select name="VisibleWhenInformationTypeID"><option value="">بدون شرط</option>'+fields.filter(x=>String(x.ID)!==String(field.ID)).map(x=>'<option value="'+this.esc(x.InformationTypeID)+'">'+this.esc(x.LabelOverride||x.InformationType.Name)+'</option>').join('')+'</select></div><div class="form-group"><label>شرط</label><select name="VisibilityOperator"><option value="FILLED">فیلد مرجع پر شده باشد</option><option value="EMPTY">فیلد مرجع خالی باشد</option><option value="EQUALS">برابر با مقدار</option><option value="NOT_EQUALS">مخالف مقدار</option></select></div><div class="form-group"><label>مقدار مقایسه</label><input name="VisibilityValue"></div></div><label><input name="IsRequired" type="checkbox"> اجباری</label><div class="form-designer-actions"><button class="btn btn-primary" type="submit">ذخیره تغییرات</button><button class="btn btn-secondary" type="button" data-cancel>انصراف</button></div>';
            editor.elements.GroupName.value=field.GroupName||'';editor.elements.LabelOverride.value=field.LabelOverride||'';editor.elements.FieldOrder.value=field.FieldOrder||0;editor.elements.HelpText.value=field.HelpText||'';editor.elements.IsRequired.checked=field.IsRequired===true||String(field.IsRequired).toLowerCase()==='true';let savedRule=field.VisibilityRule||{};if(!savedRule.fieldId&&field.VisibilityRuleJSON){try{savedRule=JSON.parse(field.VisibilityRuleJSON);}catch(ignore){savedRule={};}}editor.elements.VisibleWhenInformationTypeID.value=savedRule.fieldId||'';editor.elements.VisibilityOperator.value=savedRule.operator||'FILLED';editor.elements.VisibilityValue.value=savedRule.value||'';
            fieldList.after(editor);editor.querySelector('[data-cancel]').addEventListener('click',()=>editor.remove());
            editor.addEventListener('submit',async e=>{e.preventDefault();const payload={GroupName:editor.elements.GroupName.value,LabelOverride:editor.elements.LabelOverride.value,FieldOrder:Number(editor.elements.FieldOrder.value||0),HelpText:editor.elements.HelpText.value,IsRequired:editor.elements.IsRequired.checked,VisibilityRuleJSON:editor.elements.VisibleWhenInformationTypeID.value?{fieldId:editor.elements.VisibleWhenInformationTypeID.value,operator:editor.elements.VisibilityOperator.value,value:editor.elements.VisibilityValue.value}:{}};try{await PMS.Api.put('/form-fields/'+encodeURIComponent(field.ID),payload);const fresh=PMS.Api.extractData(await PMS.Api.get('/forms/'+encodeURIComponent(id)))||{};fields.splice(0,fields.length,...(fresh.Fields||[]));editor.remove();renderFields();}catch(err){this.notice(body,err.message||'ویرایش فیلد ناموفق بود.');}});
          }));
        };
        renderFields();
        body.querySelector('#form-field-add').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;const payload={InformationTypeID:f.elements.InformationTypeID.value,GroupName:f.elements.GroupName.value,LabelOverride:f.elements.LabelOverride.value,HelpText:f.elements.HelpText.value,FieldOrder:Number(f.elements.FieldOrder.value||fields.length+1),IsRequired:f.elements.IsRequired.checked,VisibilityRuleJSON:f.elements.VisibleWhenInformationTypeID.value?{fieldId:f.elements.VisibleWhenInformationTypeID.value,operator:f.elements.VisibilityOperator.value,value:f.elements.VisibilityValue.value}:{}};try{await PMS.Api.post('/forms/'+encodeURIComponent(id)+'/fields',payload);const fresh=PMS.Api.extractData(await PMS.Api.get('/forms/'+encodeURIComponent(id)))||{};fields.splice(0,fields.length,...(fresh.Fields||[]));renderFields();f.reset();f.elements.FieldOrder.value=fields.length+1;}catch(err){this.notice(body,err.message||'افزودن فیلد ناموفق بود.');}});
        const mappingBox=body.querySelector('#form-event-mappings');
        const renderMappings=async()=>{try{const rows=this.list(await PMS.Api.get('/forms/'+encodeURIComponent(id)+'/event-types'),'eventTypes');mappingBox.innerHTML=rows.length?rows.map(x=>'<div class="et-field-row"><span>'+this.esc(x.EventType&& (x.EventType.Name||x.EventType.Code)||x.EventTypeID)+' · '+(x.IsRequired?'اجباری':'اختیاری')+'</span><button type="button" class="btn btn-sm btn-secondary" data-unlink="'+this.esc(x.ID)+'">قطع اتصال</button></div>').join(''):'<p class="event-muted">این فرم هنوز به رویدادی متصل نشده است.</p>';mappingBox.querySelectorAll('[data-unlink]').forEach(b=>b.addEventListener('click',async()=>{try{await PMS.Api.delete('/event-type-forms/'+encodeURIComponent(b.dataset.unlink));renderMappings();}catch(err){this.notice(body,err.message);}}));}catch(err){this.notice(body,err.message||'دریافت اتصال‌ها ناموفق بود.');}};
        await renderMappings();
        body.querySelector('#form-event-attach').addEventListener('click',async()=>{const typeId=body.querySelector('#form-event-type').value;if(!typeId){this.notice(body,'ابتدا نوع رویداد را انتخاب کنید.');return;}try{await PMS.Api.post('/event-types/'+encodeURIComponent(typeId)+'/forms',{FormID:id,IsRequired:body.querySelector('#form-event-required').checked});await renderMappings();}catch(err){this.notice(body,err.message||'اتصال فرم ناموفق بود.');}});
      } catch(error){this.notice(body,error.message||'دریافت ساختار فرم ناموفق بود.');}
    },
    notice: function(container,message){let box=container.querySelector('.form-editor-notice');if(!box){box=document.createElement('p');box.className='alert alert-danger form-editor-notice';container.prepend(box);}box.textContent=message;},
  };
  PMS.Modules=PMS.Modules||{};PMS.Modules.Forms=Forms;
})();
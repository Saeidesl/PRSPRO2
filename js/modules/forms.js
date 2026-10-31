(function () {
  'use strict';
  const PMS = window.PMS;
  const Forms = {
    items: [], informationTypes: [], eventTypes: [], busy: false, selectedEventTypeId: '', mappingRequest: 0,
    init: function () {
      const button=document.getElementById('forms-create-button');
      if(button) button.addEventListener('click',()=>this.openForm(null));
      document.querySelectorAll('[data-forms-tab]').forEach(tab=>tab.addEventListener('click',()=>this.switchTab(tab.dataset.formsTab)));
      const eventSelect=document.getElementById('forms-connect-event-type');
      if(eventSelect)eventSelect.addEventListener('change',()=>{this.selectedEventTypeId=eventSelect.value;this.loadMappings();});
      const formSelect=document.getElementById('forms-connect-form');
      if(formSelect)formSelect.addEventListener('change',()=>this.updateConnectionControls());
      const connectButton=document.getElementById('forms-connect-submit');
      if(connectButton)connectButton.addEventListener('click',()=>this.connectForm());
      this.load();
    },
    switchTab: function (tab) {
      const design=tab!=='connect';
      const designPanel=document.getElementById('forms-design-panel');
      const connectPanel=document.getElementById('forms-connect-panel');
      const designTab=document.getElementById('forms-design-tab');
      const connectTab=document.getElementById('forms-connect-tab');
      if(designPanel)designPanel.hidden=!design;
      if(connectPanel)connectPanel.hidden=design;
      if(designTab){designTab.classList.toggle('is-active',design);designTab.setAttribute('aria-selected',design?'true':'false');}
      if(connectTab){connectTab.classList.toggle('is-active',!design);connectTab.setAttribute('aria-selected',design?'false':'true');}
      if(!design&&this.selectedEventTypeId&&!this.mappingsLoadedForCurrentEvent)this.loadMappings();
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
        this.eventTypes=this.list(events,'eventTypes').filter(x=>String(x.ConnectionType||'PROJECT').toUpperCase()!=='INDEPENDENT'&&String(x.Status||'ACTIVE').toUpperCase()==='ACTIVE');
        this.render();
        this.renderConnectionOptions();
      } catch(e) {
        if(error){error.hidden=false;error.textContent=e.message||'دریافت اطلاعات فرم‌ها ناموفق بود.';}
      } finally {if(loading)loading.hidden=true;}
    },
    render: function () {
      const table=document.getElementById('forms-table'),empty=document.getElementById('forms-empty');
      if(!table)return;
      if(!this.items.length){table.hidden=true;table.innerHTML='';if(empty)empty.hidden=false;return;}
      if(empty)empty.hidden=true;
      table.innerHTML='<table class="data-table"><thead><tr><th>نام فرم</th><th>کد</th><th>نسخه</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>'+
        this.items.map(item=>'<tr><td><strong>'+this.esc(item.Name)+'</strong></td><td>'+this.esc(item.Code)+'</td><td>'+this.esc(item.Version||1)+'</td><td>'+this.esc(String(item.Status||'ACTIVE').toUpperCase()==='ACTIVE'?'فعال':'غیرفعال')+'</td><td><button class="btn btn-sm btn-secondary" data-edit="'+this.esc(item.ID)+'">مشخصات</button> <button class="btn btn-sm btn-primary" data-design="'+this.esc(item.ID)+'">طراحی فیلدها</button></td></tr>').join('')+
        '</tbody></table>';
      table.hidden=false;
      table.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>this.openForm(b.dataset.edit)));
      table.querySelectorAll('[data-design]').forEach(b=>b.addEventListener('click',()=>this.openDesigner(b.dataset.design)));
    },
    renderConnectionOptions: function () {
      const eventSelect=document.getElementById('forms-connect-event-type');
      const formSelect=document.getElementById('forms-connect-form');
      if(eventSelect){
        const selected=this.selectedEventTypeId;
        eventSelect.innerHTML='<option value="">انتخاب نوع رویداد…</option>'+this.eventTypes.map(item=>'<option value="'+this.esc(item.ID)+'">'+this.esc(item.Name||item.Code)+'</option>').join('');
        eventSelect.value=this.eventTypes.some(x=>String(x.ID)===String(selected))?selected:'';
        this.selectedEventTypeId=eventSelect.value;
      }
      if(formSelect){
        const selected=formSelect.value;
        const active=this.items.filter(x=>String(x.Status||'ACTIVE').toUpperCase()==='ACTIVE');
        formSelect.innerHTML='<option value="">انتخاب فرم…</option>'+active.map(item=>'<option value="'+this.esc(item.ID)+'">'+this.esc(item.Name||item.Code)+'</option>').join('');
        formSelect.value=active.some(x=>String(x.ID)===String(selected))?selected:'';
      }
      this.updateConnectionControls();
      const caption=document.getElementById('forms-mappings-caption');
      if(caption)caption.textContent=this.selectedEventTypeId?'فرم‌هایی که هنگام ثبت این نوع رویداد نمایش داده می‌شوند.':'پس از انتخاب نوع رویداد، اتصال‌های آن در این قسمت نمایش داده می‌شوند.';
      if(this.selectedEventTypeId)this.loadMappings();else this.renderMappings([]);
    },
    updateConnectionControls: function () {
      const eventSelect=document.getElementById('forms-connect-event-type');
      const formSelect=document.getElementById('forms-connect-form');
      const button=document.getElementById('forms-connect-submit');
      const feedback=document.getElementById('forms-connect-feedback');
      const formId=formSelect&&formSelect.value;
      const duplicate=(this.mappings||[]).some(x=>String(x.FormID)===String(formId));
      if(button)button.disabled=!(eventSelect&&eventSelect.value&&formId&&!duplicate);
      if(feedback)feedback.textContent=duplicate?'این فرم قبلاً به رویداد انتخاب‌شده متصل شده است.':'';
    },
    loadMappings: async function () {
      const eventId=this.selectedEventTypeId;
      const list=document.getElementById('forms-mappings-list');
      const loading=document.getElementById('forms-mappings-loading');
      const error=document.getElementById('forms-mappings-error');
      const token=++this.mappingRequest;
      this.mappingsLoadedForCurrentEvent=false;
      if(error){error.hidden=true;error.textContent='';}
      if(!eventId){this.mappings=[];this.renderMappings([]);return;}
      if(loading)loading.hidden=false;
      if(list)list.innerHTML='';
      try{
        const response=await PMS.Api.get('/event-types/'+encodeURIComponent(eventId)+'/forms');
        if(token!==this.mappingRequest||eventId!==this.selectedEventTypeId)return;
        this.mappings=this.list(response,'eventTypes');
        this.mappingsLoadedForCurrentEvent=true;
        this.renderMappings(this.mappings);
      }catch(err){
        if(token!==this.mappingRequest)return;
        if(error){error.hidden=false;error.textContent=err.message||'دریافت فرم‌های متصل ناموفق بود.';}
        if(list)list.innerHTML='<div class="table-empty">اتصال‌ها بارگذاری نشدند. دوباره نوع رویداد را انتخاب کن یا صفحه را تازه‌سازی کن.</div>';
      }finally{if(token===this.mappingRequest&&loading)loading.hidden=true;}
      this.updateConnectionControls();
    },
    renderMappings: function (rows) {
      const list=document.getElementById('forms-mappings-list');
      const count=document.getElementById('forms-mappings-count');
      if(count)count.textContent=String((rows||[]).length)+' فرم';
      if(!list)return;
      if(!this.selectedEventTypeId){list.innerHTML='<div class="table-empty">برای مشاهده فرم‌های متصل، یک نوع رویداد انتخاب کن.</div>';return;}
      if(!rows||!rows.length){list.innerHTML='<div class="forms-mappings-empty"><strong>هنوز فرمی متصل نشده است.</strong><span>از قسمت بالا یک فرم انتخاب و به این رویداد متصل کن.</span></div>';this.updateConnectionControls();return;}
      list.innerHTML=rows.map(mapping=>{
        const form=mapping.Form||{};
        const required=mapping.IsRequired===true||String(mapping.IsRequired).toLowerCase()==='true';
        return '<article class="forms-mapping-row"><div class="forms-mapping-main"><strong>'+this.esc(form.Name||form.Code||mapping.FormName||mapping.FormID||'فرم')+'</strong><small>'+(required?'تکمیل اجباری':'تکمیل اختیاری')+'</small></div><button type="button" class="btn btn-sm btn-secondary" data-unlink="'+this.esc(mapping.ID)+'">قطع اتصال</button></article>';
      }).join('');
      list.querySelectorAll('[data-unlink]').forEach(button=>button.addEventListener('click',async()=>{
        if(button.disabled)return;
        button.disabled=true;
        try{await PMS.Api.delete('/event-type-forms/'+encodeURIComponent(button.dataset.unlink));await this.loadMappings();}
        catch(err){button.disabled=false;const error=document.getElementById('forms-mappings-error');if(error){error.hidden=false;error.textContent=err.message||'قطع اتصال فرم ناموفق بود.';}}
      }));
      this.updateConnectionControls();
    },
    connectForm: async function () {
      const eventSelect=document.getElementById('forms-connect-event-type');
      const formSelect=document.getElementById('forms-connect-form');
      const requiredSelect=document.getElementById('forms-connect-required');
      const button=document.getElementById('forms-connect-submit');
      const feedback=document.getElementById('forms-connect-feedback');
      const eventId=eventSelect&&eventSelect.value,formId=formSelect&&formSelect.value;
      if(!eventId||!formId){if(feedback)feedback.textContent='نوع رویداد و فرم را انتخاب کن.';return;}
      if((this.mappings||[]).some(x=>String(x.FormID)===String(formId))){this.updateConnectionControls();return;}
      if(button)button.disabled=true;
      if(feedback)feedback.textContent='در حال اتصال…';
      try{
        await PMS.Api.post('/event-types/'+encodeURIComponent(eventId)+'/forms',{FormID:formId,IsRequired:requiredSelect?requiredSelect.value==='true':true});
        if(formSelect)formSelect.value='';
        if(feedback)feedback.textContent='فرم با موفقیت به رویداد متصل شد.';
        await this.loadMappings();
      }catch(err){if(feedback)feedback.textContent=err.message||'اتصال فرم ناموفق بود.';}
      finally{this.updateConnectionControls();}
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
      const modal=this.modal('طراحی فرم','form-designer-modal'),body=modal.querySelector('.event-modal-content');
      body.innerHTML='<p class="event-muted">در حال دریافت ساختار فرم…</p>';
      try {
        const response=await PMS.Api.get('/forms/'+encodeURIComponent(id));
        const form=PMS.Api.extractData(response)||{};
        const fields=Array.isArray(form.Fields)?form.Fields:[];
        const nextFieldOrder=fields.reduce((max,field)=>Math.max(max,Number(field.FieldOrder)||0),0)+1;
        body.innerHTML='<p class="forms-designer-intro">در این قسمت فقط فیلدهای فرم را از اطلاعات مرکزی انتخاب و مرتب کن. اتصال فرم به رویداد در بخش جداگانه «اتصال فرم به رویداد» انجام می‌شود.</p>'+
          '<div class="forms-designer-title"><strong>'+this.esc(form.Name)+'</strong><span>نسخه '+this.esc(form.Version||1)+'</span></div>'+
          '<section class="et-section"><h4>افزودن اطلاعات مرکزی به فرم</h4><form id="form-field-add"><div class="form-designer-grid"><div class="form-group"><label>نوع اطلاعات</label><select name="InformationTypeID" required><option value="">انتخاب اطلاعات مرکزی</option>'+this.informationTypes.filter(x=>String(x.Status||'ACTIVE')==='ACTIVE').map(x=>'<option value="'+this.esc(x.ID)+'">'+this.esc(x.Name)+' ('+this.esc(x.Code)+')</option>').join('')+'</select></div><div class="form-group"><label>گروه</label><input name="GroupName" maxlength="120" placeholder="مثلاً مشخصات اولیه"></div><div class="form-group"><label>عنوان نمایشی</label><input name="LabelOverride" maxlength="150"></div><div class="form-group"><label>ترتیب نمایش</label><input name="FieldOrder" type="number" min="0" value="'+nextFieldOrder+'"></div><div class="form-group" style="grid-column:1/-1"><label>راهنمای ورود</label><input name="HelpText" maxlength="500"></div></div><div class="form-designer-grid"><div class="form-group"><label>نمایش در صورت تحقق شرط</label><select name="VisibleWhenInformationTypeID"><option value="">بدون شرط</option>'+fields.filter(f=>Number(f.FieldOrder||0)<nextFieldOrder).map(f=>'<option value="'+this.esc(f.InformationTypeID)+'">'+this.esc(f.LabelOverride||f.InformationType.Name)+'</option>').join('')+'</select></div><div class="form-group"><label>شرط</label><select name="VisibilityOperator"><option value="FILLED">فیلد مرجع پر شده باشد</option><option value="EMPTY">فیلد مرجع خالی باشد</option><option value="EQUALS">برابر با مقدار</option><option value="NOT_EQUALS">مخالف مقدار</option></select></div><div class="form-group"><label>مقدار مقایسه</label><input name="VisibilityValue"></div></div><label><input name="IsRequired" type="checkbox"> تکمیل این فیلد اجباری باشد</label><div class="form-designer-actions"><button class="btn btn-primary" type="submit">افزودن فیلد</button></div></form></section>'+
          '<section class="et-section"><h4>فیلدهای فرم</h4><p class="forms-designer-help">فیلدها از اطلاعات مرکزی انتخاب می‌شوند؛ تغییر این تنظیمات، تعریف اصلی اطلاعات را تغییر نمی‌دهد.</p><div id="form-field-list"></div></section>';
        const fieldList=body.querySelector('#form-field-list');
        const renderFields=()=>{
          fieldList.innerHTML=fields.length?fields.map(f=>'<div class="form-designer-field"><strong>'+this.esc(f.LabelOverride||f.InformationType.Name)+'</strong><div class="event-muted">'+this.esc(f.InformationType.Name)+' · '+this.esc(f.InformationType.Cardinality)+' · '+(f.IsRequired?'اجباری':'اختیاری')+' · '+this.esc(f.GroupName||'بدون گروه')+' · ترتیب '+this.esc(f.FieldOrder)+'</div><button type="button" class="btn btn-sm btn-secondary" data-edit-field="'+this.esc(f.ID)+'">ویرایش</button> <button type="button" class="btn btn-sm btn-secondary" data-remove="'+this.esc(f.ID)+'">حذف از فرم</button></div>').join(''):'<p class="event-muted">هنوز فیلدی به فرم اضافه نشده است.</p>';
          fieldList.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',async()=>{try{await PMS.Api.delete('/form-fields/'+encodeURIComponent(b.dataset.remove));fields.splice(fields.findIndex(f=>String(f.ID)===String(b.dataset.remove)),1);renderFields();}catch(err){this.notice(body,err.message);}}));
          fieldList.querySelectorAll('[data-edit-field]').forEach(b=>b.addEventListener('click',()=>{
            const field=fields.find(x=>String(x.ID)===String(b.dataset.editField));if(!field)return;
            let editor=body.querySelector('#form-field-edit');if(editor)editor.remove();
            editor=document.createElement('form');editor.id='form-field-edit';editor.className='et-section';
            editor.innerHTML='<h4>ویرایش تنظیمات فیلد</h4><div class="form-designer-grid"><div class="form-group"><label>گروه</label><input name="GroupName" maxlength="120"></div><div class="form-group"><label>عنوان نمایشی</label><input name="LabelOverride" maxlength="150"></div><div class="form-group"><label>ترتیب</label><input name="FieldOrder" type="number" min="0"></div><div class="form-group"><label>راهنما</label><input name="HelpText" maxlength="500"></div></div><div class="form-designer-grid"><div class="form-group"><label>نمایش در صورت تحقق شرط</label><select name="VisibleWhenInformationTypeID"><option value="">بدون شرط</option>'+fields.filter(x=>String(x.ID)!==String(field.ID)&&Number(x.FieldOrder||0)<Number(field.FieldOrder||0)).map(x=>'<option value="'+this.esc(x.InformationTypeID)+'">'+this.esc(x.LabelOverride||x.InformationType.Name)+'</option>').join('')+'</select></div><div class="form-group"><label>شرط</label><select name="VisibilityOperator"><option value="FILLED">فیلد مرجع پر شده باشد</option><option value="EMPTY">فیلد مرجع خالی باشد</option><option value="EQUALS">برابر با مقدار</option><option value="NOT_EQUALS">مخالف مقدار</option></select></div><div class="form-group"><label>مقدار مقایسه</label><input name="VisibilityValue"></div></div><label><input name="IsRequired" type="checkbox"> اجباری</label><div class="form-designer-actions"><button class="btn btn-primary" type="submit">ذخیره تغییرات</button><button class="btn btn-secondary" type="button" data-cancel>انصراف</button></div>';
            editor.elements.GroupName.value=field.GroupName||'';editor.elements.LabelOverride.value=field.LabelOverride||'';editor.elements.FieldOrder.value=field.FieldOrder||0;editor.elements.HelpText.value=field.HelpText||'';editor.elements.IsRequired.checked=field.IsRequired===true||String(field.IsRequired).toLowerCase()==='true';let savedRule=field.VisibilityRule||{};if(!savedRule.fieldId&&field.VisibilityRuleJSON){try{savedRule=JSON.parse(field.VisibilityRuleJSON);}catch(ignore){savedRule={};}}editor.elements.VisibleWhenInformationTypeID.value=savedRule.fieldId||'';editor.elements.VisibilityOperator.value=savedRule.operator||'FILLED';editor.elements.VisibilityValue.value=savedRule.value||'';
            fieldList.after(editor);editor.querySelector('[data-cancel]').addEventListener('click',()=>editor.remove());
            editor.addEventListener('submit',async e=>{e.preventDefault();const payload={GroupName:editor.elements.GroupName.value,LabelOverride:editor.elements.LabelOverride.value,FieldOrder:Number(editor.elements.FieldOrder.value||0),HelpText:editor.elements.HelpText.value,IsRequired:editor.elements.IsRequired.checked,VisibilityRuleJSON:editor.elements.VisibleWhenInformationTypeID.value?{fieldId:editor.elements.VisibleWhenInformationTypeID.value,operator:editor.elements.VisibilityOperator.value,value:editor.elements.VisibilityValue.value}:{}};try{await PMS.Api.put('/form-fields/'+encodeURIComponent(field.ID),payload);const fresh=PMS.Api.extractData(await PMS.Api.get('/forms/'+encodeURIComponent(id)))||{};fields.splice(0,fields.length,...(fresh.Fields||[]));editor.remove();renderFields();}catch(err){this.notice(body,err.message||'ویرایش فیلد ناموفق بود.');}});
          }));
        };
        renderFields();
        body.querySelector('#form-field-add').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;const payload={InformationTypeID:f.elements.InformationTypeID.value,GroupName:f.elements.GroupName.value,LabelOverride:f.elements.LabelOverride.value,HelpText:f.elements.HelpText.value,FieldOrder:Number(f.elements.FieldOrder.value||fields.length+1),IsRequired:f.elements.IsRequired.checked,VisibilityRuleJSON:f.elements.VisibleWhenInformationTypeID.value?{fieldId:f.elements.VisibleWhenInformationTypeID.value,operator:f.elements.VisibilityOperator.value,value:f.elements.VisibilityValue.value}:{}};try{await PMS.Api.post('/forms/'+encodeURIComponent(id)+'/fields',payload);const fresh=PMS.Api.extractData(await PMS.Api.get('/forms/'+encodeURIComponent(id)))||{};fields.splice(0,fields.length,...(fresh.Fields||[]));renderFields();f.reset();f.elements.FieldOrder.value=fields.length+1;}catch(err){this.notice(body,err.message||'افزودن فیلد ناموفق بود.');}});

      } catch(error){this.notice(body,error.message||'دریافت ساختار فرم ناموفق بود.');}
    },
    notice: function(container,message){let box=container.querySelector('.form-editor-notice');if(!box){box=document.createElement('p');box.className='alert alert-danger form-editor-notice';container.prepend(box);}box.textContent=message;},
  };
  PMS.Modules=PMS.Modules||{};PMS.Modules.Forms=Forms;
})();
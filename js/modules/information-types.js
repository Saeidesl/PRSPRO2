(function () {
  'use strict';
  const PMS = window.PMS = window.PMS || {};
  PMS.Modules = PMS.Modules || {};
  const state = { items: [], search: '' };

  function unwrap(value) {
    let data=value;
    for(let i=0;i<5&&data&&data.data!==undefined;i++)data=data.data;
    return data;
  }
  function list(value) {
    const data=unwrap(value);
    if(Array.isArray(data))return data;
    if(data&&Array.isArray(data.items))return data.items;
    return [];
  }
  function esc(value) {
    return String(value===undefined||value===null?'':value).replace(/[&<>"']/g,function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]);});
  }
  function canManage() {
    const router=PMS.Router;
    return !!(router&&(router.isAdmin&&router.isAdmin()||(Array.isArray(router.permissions)&&router.permissions.indexOf('SYSTEM_SETTINGS')!==-1)));
  }
  function message(text,isError) {
    const box=document.getElementById('information-types-message');
    if(!box)return;
    box.textContent=text||'';
    box.className=isError?'alert alert-danger':'alert alert-success';
    box.hidden=!text;
  }
  async function load() {
    const loading=document.getElementById('information-types-loading');
    const error=document.getElementById('information-types-error');
    if(loading)loading.hidden=false;
    if(error){error.hidden=true;error.textContent='';}
    try {
      state.items=list(await PMS.Api.get('/information-types'));
      render();
    } catch(err) {
      if(error){error.textContent=err.message||'دریافت انواع اطلاعات ناموفق بود.';error.hidden=false;}
    } finally {if(loading)loading.hidden=true;}
  }
  function render() {
    const container=document.getElementById('information-types-table');
    const empty=document.getElementById('information-types-empty');
    if(!container)return;
    const query=state.search.toLowerCase();
    const rows=state.items.filter(function(item){return !query||[item.Name,item.Code,item.Description].join(' ').toLowerCase().includes(query);});
    if(!rows.length){container.innerHTML='';container.hidden=true;if(empty){empty.hidden=false;empty.textContent=query?'موردی با این جستجو پیدا نشد.':'هنوز نوع اطلاعاتی تعریف نشده است.';}return;}
    if(empty)empty.hidden=true;
    container.innerHTML='<table class="data-table"><thead><tr><th>عنوان</th><th>کد</th><th>تعدادپذیری</th><th>نوع داده پایه</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>'+
      rows.map(function(item){
        const multi=String(item.Cardinality).toUpperCase()==='MULTIPLE';
        return '<tr><td>'+esc(item.Name)+'</td><td><code>'+esc(item.Code)+'</code></td><td>'+(multi?'چندمقداری':'تک‌مقداری')+'</td><td>'+esc(item.DataType||'متن')+'</td><td>'+esc(item.Status||'ACTIVE')+'</td><td class="table-actions">'+
          '<button type="button" class="btn btn-sm btn-light" data-columns="'+esc(item.ID)+'">ستون‌ها</button> '+
          '<button type="button" class="btn btn-sm btn-light" data-edit="'+esc(item.ID)+'">ویرایش</button> '+
          '<button type="button" class="btn btn-sm btn-danger" data-disable="'+esc(item.ID)+'">غیرفعال‌سازی</button></td></tr>';
      }).join('')+'</tbody></table>';
    container.hidden=false;
    container.querySelectorAll('[data-edit]').forEach(function(btn){btn.addEventListener('click',function(){openTypeForm(state.items.find(x=>String(x.ID)===btn.dataset.edit));});});
    container.querySelectorAll('[data-columns]').forEach(function(btn){btn.addEventListener('click',function(){openColumns(state.items.find(x=>String(x.ID)===btn.dataset.columns));});});
    container.querySelectorAll('[data-disable]').forEach(function(btn){btn.addEventListener('click',async function(){const item=state.items.find(x=>String(x.ID)===btn.dataset.disable);if(!item||!confirm('نوع اطلاعات «'+item.Name+'» به‌صورت منطقی حذف شود؟'))return;try{await PMS.Api.delete('/information-types/'+encodeURIComponent(item.ID));message('نوع اطلاعات غیرفعال شد.');await load();}catch(err){message(err.message||'عملیات ناموفق بود.',true);}});});
  }
  function modal(title,id,body) {
    const old=document.getElementById(id);if(old)old.remove();
    const overlay=document.createElement('div');overlay.id=id;overlay.className='modal-overlay';
    overlay.innerHTML='<div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><h3>'+esc(title)+'</h3><button type="button" class="modal-close" aria-label="بستن">×</button></div><div class="modal-body">'+body+'</div></div>';
    document.body.appendChild(overlay);
    function close(){overlay.remove();}
    overlay.querySelector('.modal-close').addEventListener('click',close);
    overlay.addEventListener('click',function(e){if(e.target===overlay)close();});
    overlay.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
    return {overlay:overlay,close:close,body:overlay.querySelector('.modal-body')};
  }
  function openTypeForm(item) {
    const editing=!!item;
    const box=modal(editing?'ویرایش نوع اطلاعات':'تعریف نوع اطلاعات','information-type-form',
      '<form id="information-type-form"><div class="form-grid">'+
      '<div class="form-group"><label>عنوان اطلاعات *</label><input name="Name" required maxlength="150" value="'+esc(item&&item.Name)+'"></div>'+
      '<div class="form-group"><label>کد انگلیسی یکتا *</label><input name="Code" required maxlength="60" pattern="[A-Za-z][A-Za-z0-9_]{1,59}" value="'+esc(item&&item.Code)+'" '+(editing?'readonly':'')+'></div>'+
      '<div class="form-group form-grid-full"><label>توضیحات</label><textarea name="Description" rows="2">'+esc(item&&item.Description)+'</textarea></div>'+
      '<div class="form-group"><label>ساختار اطلاعات</label><select name="Cardinality"><option value="SINGLE">تک‌مقداری</option><option value="MULTIPLE">چندمقداری (جدولی)</option></select></div>'+
      '<div class="form-group"><label>وضعیت</label><select name="Status"><option value="ACTIVE">فعال</option><option value="INACTIVE">غیرفعال</option></select></div>'+
      '<div class="form-group form-grid-full"><label><input type="checkbox" name="ShowOnCard"> نمایش این اطلاعات در کارت پروژه</label><small>مقدار جاری این نوع اطلاعات در کارت پروژه‌ها نمایش داده می‌شود.</small></div>'+
      '<div class="form-group"><label>نوع داده</label><select name="DataType"><option value="text">متن</option><option value="textarea">متن چندخطی</option><option value="number">عدد</option><option value="date">تاریخ</option><option value="datetime">تاریخ و زمان</option><option value="boolean">بله/خیر</option><option value="select">فهرست انتخابی</option><option value="image">تصویر</option><option value="file">فایل</option></select></div>'+
      '<div class="form-group form-grid-full"><label>گزینه‌ها (برای فهرست انتخابی، با ویرگول جدا شوند)</label><input name="Options" placeholder="قرمز، آبی، مشکی"></div>'+
      '<div class="form-group form-grid-full"><label>قواعد اعتبارسنجی (JSON اختیاری)</label><input name="Rules" placeholder="{&quot;min&quot;:1,&quot;max&quot;:100}"></div>'+
      '</div><div class="modal-actions"><button class="btn btn-primary" type="submit">ذخیره</button><button class="btn btn-light" type="button" data-close>انصراف</button></div></form>');
    const form=box.body.querySelector('form');
    form.elements.Cardinality.value=item&&item.Cardinality||'SINGLE';
    form.elements.Status.value=item&&item.Status||'ACTIVE';
    form.elements.DataType.value=item&&item.DataType||'text';
    form.elements.ShowOnCard.checked=!!(item&&(item.ShowOnCard===true||String(item.ShowOnCard).toLowerCase()==='true'));
    form.elements.Options.value='';
    try{const opts=JSON.parse(item&&item.OptionsJSON||'[]');form.elements.Options.value=Array.isArray(opts)?opts.map(x=>typeof x==='object'?x.value:x).join(', '):'';}catch(e){}
    try{form.elements.Rules.value=JSON.stringify(JSON.parse(item&&item.ValidationRuleJSON||'{}'));}catch(e){form.elements.Rules.value='';}
    form.querySelector('[data-close]').addEventListener('click',box.close);
    form.addEventListener('submit',async function(e){
      e.preventDefault();
      let rules={};try{rules=JSON.parse(form.elements.Rules.value||'{}');}catch(err){message('قواعد اعتبارسنجی باید JSON معتبر باشد.',true);return;}
      const options=form.elements.Options.value.split(',').map(x=>x.trim()).filter(Boolean);
      const payload={Name:form.elements.Name.value.trim(),Code:form.elements.Code.value.trim(),Description:form.elements.Description.value.trim(),Cardinality:form.elements.Cardinality.value,DataType:form.elements.DataType.value,Status:form.elements.Status.value,ShowOnCard:form.elements.ShowOnCard.checked,OptionsJSON:JSON.stringify(options),ValidationRuleJSON:JSON.stringify(rules)};
      const save=form.querySelector('[type="submit"]');save.disabled=true;
      try{if(editing)await PMS.Api.put('/information-types/'+encodeURIComponent(item.ID),payload);else await PMS.Api.post('/information-types',payload);box.close();message('تعریف اطلاعات ذخیره شد.');await load();}
      catch(err){message(err.message||'ذخیره اطلاعات ناموفق بود.',true);save.disabled=false;}
    });
  }
  async function openColumns(item) {
    if(!item)return;
    const id=encodeURIComponent(item.ID);
    const box=modal('ستون‌های «'+item.Name+'»','information-type-columns','<div class="loading-state">در حال دریافت ستون‌ها…</div><div id="information-columns-content"></div>');
    const target=box.body.querySelector('#information-columns-content');
    let columns=[];
    try{columns=list(await PMS.Api.get('/information-types/'+id+'/columns'));}catch(err){target.innerHTML='<div class="alert alert-danger">'+esc(err.message)+'</div>';return;}
    function draw(){
      target.innerHTML='<form id="information-column-form" class="form-grid">'+
        '<div class="form-group"><label>نام ستون *</label><input name="Name" required></div>'+
        '<div class="form-group"><label>کد ستون *</label><input name="Code" required pattern="[A-Za-z][A-Za-z0-9_]{1,59}"></div>'+
        '<div class="form-group"><label>نوع داده</label><select name="DataType"><option value="text">متن</option><option value="number">عدد</option><option value="date">تاریخ</option><option value="datetime">تاریخ و زمان</option><option value="boolean">بله/خیر</option><option value="select">فهرست انتخابی</option><option value="textarea">متن چندخطی</option><option value="image">تصویر</option><option value="file">فایل</option></select></div>'+
        '<div class="form-group"><label><input type="checkbox" name="IsRequired"> اجباری</label></div>'+
        '<div class="form-group"><label>وضعیت</label><select name="Status"><option value="ACTIVE">فعال</option><option value="INACTIVE">غیرفعال</option></select></div>'+
        '<div class="form-group form-grid-full"><label>گزینه‌ها (با ویرگول جدا شوند)</label><input name="Options"></div>'+
        '<div class="form-grid-full modal-actions"><button type="submit" class="btn btn-primary">افزودن ستون</button></div></form>'+
        '<div class="table-wrapper"><table class="data-table"><thead><tr><th>ستون</th><th>کد</th><th>نوع</th><th>اجباری</th><th>عملیات</th></tr></thead><tbody>'+
        columns.map(function(col){return '<tr><td>'+esc(col.Name)+'</td><td><code>'+esc(col.Code)+'</code></td><td>'+esc(col.DataType)+'</td><td>'+(col.IsRequired?'بله':'خیر')+'</td><td><button type="button" class="btn btn-sm btn-light" data-edit-col="'+esc(col.ID)+'">ویرایش</button> <button type="button" class="btn btn-sm btn-danger" data-disable-col="'+esc(col.ID)+'">حذف</button></td></tr>';}).join('')+
        '</tbody></table></div>';
      const form=target.querySelector('form');
      form.addEventListener('submit',async function(e){e.preventDefault();const payload={Name:form.elements.Name.value.trim(),Code:form.elements.Code.value.trim(),DataType:form.elements.DataType.value,IsRequired:form.elements.IsRequired.checked,Status:form.elements.Status.value,OptionsJSON:JSON.stringify(form.elements.Options.value.split(',').map(x=>x.trim()).filter(Boolean)),ColumnOrder:columns.length+1};try{await PMS.Api.post('/information-types/'+id+'/columns',payload);columns=list(await PMS.Api.get('/information-types/'+id+'/columns'));draw();}catch(err){message(err.message||'افزودن ستون ناموفق بود.',true);}});
      target.querySelectorAll('[data-disable-col]').forEach(function(btn){btn.addEventListener('click',async function(){const col=columns.find(x=>String(x.ID)===btn.dataset.disableCol);if(!col||!confirm('این ستون حذف منطقی شود؟'))return;try{await PMS.Api.delete('/information-type-columns/'+encodeURIComponent(col.ID));columns=list(await PMS.Api.get('/information-types/'+id+'/columns'));draw();}catch(err){message(err.message||'حذف ستون ناموفق بود.',true);}});});
      target.querySelectorAll('[data-edit-col]').forEach(function(btn){btn.addEventListener('click',function(){openColumnEdit(item,columns.find(x=>String(x.ID)===btn.dataset.editCol),id,box,async function(){columns=list(await PMS.Api.get('/information-types/'+id+'/columns'));draw();});});});
    }
    draw();
  }
  function openColumnEdit(type,col,typeId,owner,refresh) {
    if(!col)return;
    const body='<form id="edit-information-column" class="form-grid"><div class="form-group"><label>نام ستون</label><input name="Name" required value="'+esc(col.Name)+'"></div><div class="form-group"><label>نوع داده</label><select name="DataType"><option value="text">متن</option><option value="number">عدد</option><option value="date">تاریخ</option><option value="datetime">تاریخ و زمان</option><option value="boolean">بله/خیر</option><option value="select">فهرست انتخابی</option><option value="textarea">متن چندخطی</option><option value="image">تصویر</option><option value="file">فایل</option></select></div><div class="form-group"><label><input type="checkbox" name="IsRequired"> اجباری</label></div><div class="form-group"><label>وضعیت</label><select name="Status"><option value="ACTIVE">فعال</option><option value="INACTIVE">غیرفعال</option></select></div><div class="form-group form-grid-full"><label>گزینه‌ها</label><input name="Options"></div><div class="form-grid-full modal-actions"><button type="submit" class="btn btn-primary">ذخیره تغییرات</button></div></form>';
    const edit=modal('ویرایش ستون '+col.Name,'information-column-edit',body),form=edit.body.querySelector('form');
    form.elements.DataType.value=col.DataType;form.elements.Status.value=col.Status||'ACTIVE';form.elements.IsRequired.checked=col.IsRequired===true||String(col.IsRequired)==='true';
    try{form.elements.Options.value=JSON.parse(col.OptionsJSON||'[]').join(', ');}catch(e){}
    form.addEventListener('submit',async function(e){e.preventDefault();const payload={Name:form.elements.Name.value.trim(),DataType:form.elements.DataType.value,IsRequired:form.elements.IsRequired.checked,Status:form.elements.Status.value,OptionsJSON:JSON.stringify(form.elements.Options.value.split(',').map(x=>x.trim()).filter(Boolean))};try{await PMS.Api.put('/information-types/'+typeId+'/columns/'+encodeURIComponent(col.ID),payload);edit.close();await refresh();}catch(err){message(err.message||'ویرایش ستون ناموفق بود.',true);}});
  }
  function init() {
    if(!canManage()){message('این بخش فقط برای کاربران دارای دسترسی تنظیمات سامانه در دسترس است.',true);return;}
    const create=document.getElementById('information-type-create');
    const search=document.getElementById('information-type-search');
    if(create)create.addEventListener('click',function(){openTypeForm(null);});
    if(search)search.addEventListener('input',function(){state.search=search.value.trim();render();});
    load();
  }
  PMS.InformationTypes={init:init,load:load};
  PMS.Modules.InformationTypes=PMS.InformationTypes;
})();

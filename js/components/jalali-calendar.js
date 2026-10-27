(function () {
  'use strict';
  window.PMS = window.PMS || {};
  const JalaliCalendar = {
    months: ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'],
    weekdays: ['ش','ی','د','س','چ','پ','ج'],
    faDigits: '۰۱۲۳۴۵۶۷۸۹',
    toLatin: function (value) { return String(value || '').replace(/[۰-۹]/g, function (d) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); }).replace(/[٠-٩]/g, function (d) { return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)); }); },
    toFa: function (value) { return String(value).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[Number(d)]; }); },
    parts: function (date) {
      const p = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', {year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'}).formatToParts(date);
      const o = {}; p.forEach(function (x) { if (x.type === 'year' || x.type === 'month' || x.type === 'day') o[x.type] = Number(x.value); });
      return o;
    },
    parseISO: function (value) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').slice(0,10));
      if (!m) return null;
      const d = new Date(Date.UTC(+m[1], +m[2]-1, +m[3]));
      return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2]-1 && d.getUTCDate() === +m[3] ? d : null;
    },
    localDateParts: function (date) {
      const local = date || new Date();
      return this.parts(new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate())));
    },
    toJalali: function (date) {
      if (!(date instanceof Date) || !isFinite(date.getTime())) return '';
      const p = this.parts(date);
      return p.year + '/' + String(p.month).padStart(2,'0') + '/' + String(p.day).padStart(2,'0');
    },
    fromJalali: function (value) {
      const clean = this.toLatin(value).trim().replace(/[.\-]/g,'/').replace(/\s+/g,'');
      const m = /^(\d{3,4})\/(\d{1,2})\/(\d{1,2})$/.exec(clean);
      if (!m) return null;
      const jy=+m[1], jm=+m[2], jd=+m[3];
      if (jm<1 || jm>12 || jd<1 || jd>31) return null;
      const start = Date.UTC(jy+621, 2, 18), end = start + 371 * 86400000;
      for (let t=start; t<end; t+=86400000) {
        const d = new Date(t), p = this.parts(d);
        if (p.year===jy && p.month===jm && p.day===jd) {
          return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0');
        }
      }
      return null;
    },
    parseJalali: function (value) {
      const iso=this.fromJalali(value);
      return iso ? {iso:iso, parts:this.parts(this.parseISO(iso))} : null;
    },
    init: function () {
      if (this._started) return;
      this._started = true;
      const self=this;
      function scan(root) {
        if (root.nodeType !== 1 && root !== document) return;
        if (root.matches && root.matches('input[type="date"],input[type="datetime-local"],input[data-jalali-date],input.date-input,input.date-picker')) self.enhance(root);
        if (root.querySelectorAll) root.querySelectorAll('input[type="date"],input[type="datetime-local"],input[data-jalali-date],input.date-input,input.date-picker').forEach(function (input) { self.enhance(input); });
      }
      scan(document);
      new MutationObserver(function (records) {
        records.forEach(function (record) { record.addedNodes.forEach(function (node) { if (node.nodeType===1) scan(node); }); });
      }).observe(document.documentElement,{childList:true,subtree:true});
    },
    enhance: function (original) {
      if (!original || original.dataset.jalaliEnhanced==='1' || original.type==='hidden') return;
      const originalType=original.type;
      original.dataset.jalaliOriginalType=originalType;
      if (originalType!=='date' && originalType!=='datetime-local' && !original.hasAttribute('data-jalali-date') && !original.classList.contains('date-input') && !original.classList.contains('date-picker')) return;
      original.dataset.jalaliEnhanced='1';
      const self=this, id=original.id || ('pms-date-'+Math.random().toString(36).slice(2,9));
      if (!original.id) original.id=id;
      const visible=document.createElement('input');
      visible.type='text'; visible.className='pms-jalali-date-input';
      visible.id=id+'-jalali'; visible.autocomplete='off'; visible.inputMode='numeric';
      visible.placeholder='۱۴۰۵/۰۸/۰۵'; visible.setAttribute('aria-label','تاریخ شمسی');
      visible.setAttribute('aria-haspopup','dialog'); visible.setAttribute('aria-expanded','false');
      visible.dataset.jalaliFor=id;
      visible.required=original.required;
      const minValue=original.getAttribute('min') || '';
      const maxValue=original.getAttribute('max') || '';
      if (minValue) visible.dataset.minIso=minValue.slice(0,10);
      if (maxValue) visible.dataset.maxIso=maxValue.slice(0,10);
      visible.disabled=original.disabled;
      visible.readOnly=original.readOnly;
      visible.title='تاریخ شمسی (سال/ماه/روز)';
      original.required=false;
      original.type='hidden';
      original.removeAttribute('min'); original.removeAttribute('max');
      original.classList.add('pms-date-iso-value');
      original.insertAdjacentElement('beforebegin',visible);
      document.querySelectorAll('label[for="'+CSS.escape(id)+'"]').forEach(function(label){label.htmlFor=visible.id;});
      if (original.value) { const isoDate=self.parseISO(original.value); if(isoDate){ visible.value=self.toFa(self.toJalali(isoDate))+(originalType==='datetime-local'?' '+String(original.value).slice(11,16):''); } else { const converted=self.fromJalali(original.value); if(converted){ original.value=converted; visible.value=self.toFa(self.toJalali(self.parseISO(converted))); } else { visible.value=original.value; } } }
      const wrap=document.createElement('span'); wrap.className='pms-jalali-date-wrap';
      visible.parentNode.insertBefore(wrap,visible); wrap.appendChild(visible); wrap.appendChild(original);
      const trigger=document.createElement('button'); trigger.type='button'; trigger.className='pms-jalali-calendar-trigger'; trigger.textContent='▦'; trigger.title='انتخاب از تقویم شمسی'; trigger.setAttribute('aria-label','باز کردن تقویم شمسی'); wrap.appendChild(trigger);
      const pop=document.createElement('div'); pop.className='pms-jalali-calendar'; pop.hidden=true; pop.setAttribute('role','dialog'); pop.setAttribute('aria-label','تقویم شمسی'); wrap.appendChild(pop);
      let viewYear=1405, viewMonth=1;
      function updateFromISO() { const d=self.parseISO(original.value); visible.value=d?self.toFa(self.toJalali(d)):''; }
      function withinBounds(iso) {
        if (!iso) return true;
        const min=visible.dataset.minIso || '';
        const max=visible.dataset.maxIso || '';
        return (!min || iso >= min) && (!max || iso <= max);
      }
      function setValue(iso, display) {
        if (iso && !withinBounds(iso)) {
          visible.setCustomValidity('تاریخ باید در محدوده مجاز باشد.');
          return;
        }
        visible.setCustomValidity('');
        const timePart=originalType==='datetime-local' ? ((String(visible.value||'').match(/(?:^|\s)(\d{1,2}:\d{2})$/)||[])[1]||'09:00') : '';
        original.value=iso ? (originalType==='datetime-local' ? iso+'T'+timePart : iso) : '';
        visible.value=display || (iso ? self.toFa(self.toJalali(self.parseISO(iso)))+(originalType==='datetime-local'?' '+timePart:'') : '');
        original.dispatchEvent(new Event('input',{bubbles:true}));
        original.dispatchEvent(new Event('change',{bubbles:true}));
        visible.dispatchEvent(new Event('change',{bubbles:true}));
        render(); close();
      }
      function isMobileCalendar(){return !!(window.matchMedia && window.matchMedia('(max-width: 480px)').matches);}
      function close(){
        pop.hidden=true;
        visible.setAttribute('aria-expanded','false');
        if(pop.parentNode===document.body) wrap.appendChild(pop);
        pop.style.removeProperty('top');
        pop.style.removeProperty('left');
        pop.style.removeProperty('max-height');
      }
      function render() {
        const today=self.localDateParts(new Date());
        let html='<div class="pms-jalali-cal-head"><button type="button" data-cal="prev" aria-label="ماه قبل">‹</button><strong>'+self.months[viewMonth-1]+' '+self.toFa(viewYear)+'</strong><button type="button" data-cal="next" aria-label="ماه بعد">›</button></div><div class="pms-jalali-cal-grid pms-jalali-weekdays">'+self.weekdays.map(function(x){return '<span>'+x+'</span>';}).join('')+'</div><div class="pms-jalali-cal-grid">';
        const firstISO=self.fromJalali(viewYear+'/'+viewMonth+'/01');
        if (!firstISO) { pop.innerHTML=''; return; }
        const first=new Date(self.parseISO(firstISO).getTime());
        const offset=(first.getUTCDay()+1)%7;
        for(let i=0;i<offset;i++) html+='<span class="pms-jalali-cal-empty"></span>';
        const days=viewMonth<=6?31:(viewMonth<=11?30:(self.fromJalali(viewYear+'/12/30')?30:29));
        for(let day=1;day<=days;day++){
          const iso=self.fromJalali(viewYear+'/'+viewMonth+'/'+day);
          const selected=iso && iso===original.value;
          const isToday=today.year===viewYear&&today.month===viewMonth&&today.day===day;
          const inRange=withinBounds(iso);
          html+='<button type="button" class="pms-jalali-day'+(selected?' is-selected':'')+(isToday?' is-today':'')+(!inRange?' is-out-of-range':'')+'" data-day="'+day+'"'+(!inRange?' disabled aria-disabled="true"':'')+'>'+self.toFa(day)+'</button>';
        }
        html+='</div><div class="pms-jalali-cal-footer"><button type="button" data-cal="today">امروز</button><button type="button" data-cal="clear">پاک کردن</button></div>';
        pop.innerHTML=html;
      }
      function open() {
        const parsed=self.parseJalali(visible.value);
        const now=self.localDateParts(new Date());
        viewYear=parsed?parsed.parts.year:now.year; viewMonth=parsed?parsed.parts.month:now.month;
        render();
        if(isMobileCalendar()){
          if(pop.parentNode!==document.body) document.body.appendChild(pop);
          pop.style.position='fixed';
          pop.style.left='50%';
          pop.style.top='50%';
          pop.style.transform='translate(-50%, -50%)';
          pop.style.maxHeight='calc(100dvh - 32px)';
          pop.style.overflowY='auto';
        } else {
          if(pop.parentNode!==wrap) wrap.appendChild(pop);
          pop.style.removeProperty('position');
          pop.style.removeProperty('transform');
          pop.style.removeProperty('top');
          pop.style.removeProperty('left');
          pop.style.removeProperty('max-height');
          pop.style.removeProperty('overflow-y');
        }
        pop.hidden=false; visible.setAttribute('aria-expanded','true');
      }
      visible.addEventListener('focus',function(){});
      visible.addEventListener('blur',function(){
        const val=visible.value.trim();
        if(!val){ if(original.value) setValue('',''); return; }
        const dateText=originalType==='datetime-local'?val.replace(/\s+\d{1,2}:\d{2}$/,''):val;
        const timeMatch=originalType==='datetime-local'?val.match(/(\d{1,2}:\d{2})$/):null;
        const iso=self.fromJalali(dateText);
        if(iso && (originalType!=='datetime-local' || (timeMatch && /^([01]?\d|2[0-3]):[0-5]\d$/.test(timeMatch[1])))){ if(withinBounds(iso)){setValue(iso); visible.setCustomValidity('');} else {visible.setCustomValidity('تاریخ باید در محدوده مجاز باشد.');} }
        else visible.setCustomValidity('تاریخ شمسی معتبر وارد کنید؛ نمونه: ۱۴۰۵/۰۸/۰۵');
      });
      visible.addEventListener('input',function(){visible.setCustomValidity('');});
      visible.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='Enter'){e.preventDefault();open();}if(e.key==='Escape')close();});
      trigger.addEventListener('click',function(){if(pop.hidden)open();else close();});
      pop.addEventListener('click',function(e){
        const btn=e.target.closest('button'); if(!btn)return;
        const action=btn.dataset.cal;
        if(action==='prev'||action==='next'){
          viewMonth+=action==='prev'?-1:1;
          if(viewMonth<1){viewMonth=12;viewYear--;} if(viewMonth>12){viewMonth=1;viewYear++;}
          render();return;
        }
        if(action==='today'){const p=self.localDateParts(new Date());setValue(self.fromJalali(p.year+'/'+p.month+'/'+p.day));return;}
        if(action==='clear'){setValue('','');return;}
        if(btn.dataset.day){setValue(self.fromJalali(viewYear+'/'+viewMonth+'/'+btn.dataset.day));}
      });
      document.addEventListener('click',function(e){if(!wrap.contains(e.target)&&!pop.contains(e.target))close();});
      window.addEventListener('resize',function(){if(!pop.hidden){if(isMobileCalendar()&&pop.parentNode!==document.body){open();}else if(!isMobileCalendar()&&pop.parentNode===document.body){close();open();}}});
      original.addEventListener('change',updateFromISO);
      if(original.form) original.form.addEventListener('reset',function(){setTimeout(updateFromISO,0);});
      render();
    }
  };
  window.PMS.JalaliCalendar=JalaliCalendar;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){JalaliCalendar.init();});
  else JalaliCalendar.init();
})();
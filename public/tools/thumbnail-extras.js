/* Farmer Kamol Thumbnail Maker — Phase-1 Extras */
(function(){
  function S(){ return window.__fkGet ? window.__fkGet() : null; }
  function set(p){ if(window.__fkSet) window.__fkSet(p); }

  let showGridGuides = false;
  const TEMPLATE_KEY = 'fk_thumb_templates_v1';

  window.duplicateElement = function(){
    const s = S(); if(!s) return;
    const el = s.getSelected();
    if(!el){ alert('আগে একটি লেয়ার সিলেক্ট করুন'); return; }
    const copy = Object.assign({}, el, { id: s.idCounter + 1, x: (el.x||0)+20, y: (el.y||0)+20 });
    if(el.img) copy.img = el.img;
    set({ idCounter: s.idCounter + 1 });
    const els = s.elements.slice();
    els.push(copy);
    set({ elements: els });
    s.saveState(); s.selectElement(copy.id); s.updateLayers(); s.render();
  };

  window.flipElement = function(axis){
    const s = S(); if(!s) return;
    const el = s.getSelected(); if(!el) return;
    if(axis==='x') el.flipX = !el.flipX; else el.flipY = !el.flipY;
    s.saveState(); s.render(); s.showProps();
  };

  window.toggleGridGuides = function(){
    showGridGuides = !showGridGuides;
    const btn = document.getElementById('gridGuideBtn');
    if(btn) btn.classList.toggle('active', showGridGuides);
    const s = S(); if(s) s.render();
    setTimeout(drawGridIfNeeded, 0);
  };

  function drawGridIfNeeded(){
    if(!showGridGuides) return;
    const s = S(); if(!s) return;
    const canvas = document.getElementById('mainCanvas');
    if(!canvas) return;
    const c = canvas.getContext('2d');
    const CW = s.CW, CH = s.CH;
    c.save();
    c.strokeStyle = 'rgba(0,200,255,0.35)';
    c.lineWidth = 1;
    const step = Math.max(20, Math.round(Math.min(CW,CH)/16));
    for(let x=0;x<=CW;x+=step){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,CH); c.stroke(); }
    for(let y=0;y<=CH;y+=step){ c.beginPath(); c.moveTo(0,y); c.lineTo(CW,y); c.stroke(); }
    c.strokeStyle = 'rgba(255,80,80,0.55)';
    c.setLineDash([8,6]);
    c.beginPath(); c.moveTo(CW/2,0); c.lineTo(CW/2,CH); c.stroke();
    c.beginPath(); c.moveTo(0,CH/2); c.lineTo(CW,CH/2); c.stroke();
    c.restore();
  }

  setInterval(drawGridIfNeeded, 400);

  async function imgToDataURL(img){
    try{
      const c = document.createElement('canvas');
      c.width = img.naturalWidth || img.width;
      c.height = img.naturalHeight || img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/png');
    }catch(e){ return null; }
  }

  async function serializeDesign(){
    const s = S(); if(!s) return null;
    const els = [];
    for(const el of s.elements){
      const copy = Object.assign({}, el);
      delete copy.img;
      if(el.img) copy._imgData = await imgToDataURL(el.img);
      els.push(copy);
    }
    let bgImageData = null;
    if(s.bgData && s.bgData.image) bgImageData = await imgToDataURL(s.bgData.image);
    return {
      version: 1, CW: s.CW, CH: s.CH, currentRatio: s.currentRatio, bgMode: s.bgMode,
      bgData: {
        solid: s.bgData.solid, grad1: s.bgData.grad1, grad2: s.bgData.grad2, grad3: s.bgData.grad3,
        useGrad3: s.bgData.useGrad3, angle: s.bgData.angle, opacity: s.bgData.opacity, blur: s.bgData.blur,
        _imageData: bgImageData
      },
      elements: els
    };
  }

  function loadImageFromData(dataUrl){
    return new Promise(function(resolve){
      if(!dataUrl){ resolve(null); return; }
      const img = new Image();
      img.onload = function(){ resolve(img); };
      img.onerror = function(){ resolve(null); };
      img.src = dataUrl;
    });
  }

  async function applyDesign(data){
    const s = S(); if(!s || !data || !data.elements) return;
    if(data.CW && data.CH){
      set({ CW: data.CW, CH: data.CH, currentRatio: data.currentRatio || s.currentRatio });
      const wrap = document.getElementById('canvasWrap');
      if(wrap){ wrap.style.width = data.CW+'px'; wrap.style.height = data.CH+'px'; }
      const badge = document.getElementById('canvasSizeBadge');
      if(badge) badge.textContent = data.CW+'×'+data.CH;
    }
    set({ bgMode: data.bgMode || 'solid' });
    if(data.bgData){
      Object.assign(s.bgData, {
        solid: data.bgData.solid, grad1: data.bgData.grad1, grad2: data.bgData.grad2, grad3: data.bgData.grad3,
        useGrad3: data.bgData.useGrad3, angle: data.bgData.angle, opacity: data.bgData.opacity, blur: data.bgData.blur
      });
      if(data.bgData._imageData) s.bgData.image = await loadImageFromData(data.bgData._imageData);
    }
    let maxId = s.idCounter;
    const newEls = [];
    for(const el of data.elements){
      const copy = Object.assign({}, el);
      if(copy._imgData){ copy.img = await loadImageFromData(copy._imgData); delete copy._imgData; }
      if(copy.id > maxId) maxId = copy.id;
      newEls.push(copy);
    }
    set({ idCounter: maxId, elements: newEls, selectedId: null });
    if(typeof s.syncBgUI === 'function') s.syncBgUI();
    s.saveState(); s.updateLayers(); s.showProps(); s.fitZoom(); s.render();
  }

  function getSavedTemplates(){
    try{ return JSON.parse(localStorage.getItem(TEMPLATE_KEY)||'[]'); }catch(e){ return []; }
  }
  function setSavedTemplates(list){ localStorage.setItem(TEMPLATE_KEY, JSON.stringify(list)); }

  window.saveTemplateNamed = async function(){
    const name = prompt('টেমপ্লেটের নাম দিন:', 'আমার টেমপ্লেট');
    if(!name) return;
    const design = await serializeDesign();
    const list = getSavedTemplates();
    list.unshift({ id: Date.now(), name: name, savedAt: new Date().toISOString(), design: design });
    setSavedTemplates(list.slice(0,20));
    alert('✅ টেমপ্লেট সেভ হয়েছে: '+name);
    refreshTemplateList();
  };

  window.downloadTemplateFile = async function(){
    const design = await serializeDesign();
    const blob = new Blob([JSON.stringify(design)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'FK_Template_'+Date.now()+'.json';
    a.click();
  };

  window.loadTemplateFile = function(input){
    const f = input.files[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = async function(){
      try{
        const data = JSON.parse(reader.result);
        await applyDesign(data.design || data);
        alert('✅ টেমপ্লেট লোড হয়েছে');
        hideTemplateModal();
      }catch(e){ alert('টেমপ্লেট পড়া যায়নি'); }
    };
    reader.readAsText(f);
    input.value='';
  };

  window.loadTemplateById = async function(id){
    const t = getSavedTemplates().find(function(x){ return x.id===id; });
    if(!t) return;
    await applyDesign(t.design);
    hideTemplateModal();
  };

  window.deleteTemplateById = function(id){
    setSavedTemplates(getSavedTemplates().filter(function(x){ return x.id!==id; }));
    refreshTemplateList();
  };

  function refreshTemplateList(){
    const box = document.getElementById('templateList');
    if(!box) return;
    const list = getSavedTemplates();
    if(!list.length){
      box.innerHTML = '<div style="color:var(--text2);font-size:12px;padding:12px;text-align:center;">কোনো সেভ করা টেমপ্লেট নেই</div>';
      return;
    }
    box.innerHTML = list.map(function(t){
      return '<div style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--border);">' +
        '<div style="flex:1;min-width:0;"><div style="font-weight:600;font-size:13px;">'+t.name+'</div>' +
        '<div style="font-size:10px;opacity:.6;">'+new Date(t.savedAt).toLocaleString('bn-BD')+'</div></div>' +
        '<button class="btn btn-primary" style="padding:4px 10px;font-size:11px;" onclick="loadTemplateById('+t.id+')">Load</button>' +
        '<button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;color:#e74c3c;" onclick="deleteTemplateById('+t.id+')">✕</button></div>';
    }).join('');
  }

  window.showTemplateModal = function(){ refreshTemplateList(); document.getElementById('templateModal').classList.add('show'); };
  window.hideTemplateModal = function(){ document.getElementById('templateModal').classList.remove('show'); };

  const BATCH_SIZES = [
    {label:'YT Thumbnail', w:1280, h:720},
    {label:'YT Shorts', w:1080, h:1920},
    {label:'IG Square', w:1080, h:1080},
    {label:'IG Portrait', w:1080, h:1350},
    {label:'IG Story', w:1080, h:1920},
    {label:'FB Post', w:1080, h:1350},
    {label:'X Post', w:1600, h:900},
  ];

  window.showBatchModal = function(){
    const box = document.getElementById('batchSizeList');
    if(box){
      box.innerHTML = BATCH_SIZES.map(function(s,i){
        return '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;">' +
          '<input type="checkbox" class="batchSizeCb" data-idx="'+i+'" checked style="accent-color:var(--accent);"> ' +
          s.label+' <span style="opacity:.5;font-size:11px;">'+s.w+'×'+s.h+'</span></label>';
      }).join('');
    }
    document.getElementById('batchModal').classList.add('show');
  };
  window.hideBatchModal = function(){ document.getElementById('batchModal').classList.remove('show'); };

  window.runBatchExport = async function(){
    const s = S(); if(!s) return;
    const cbs = [].slice.call(document.querySelectorAll('.batchSizeCb:checked'));
    if(!cbs.length){ alert('কমপক্ষে ১টি সাইজ সিলেক্ট করুন'); return; }
    const format = (document.getElementById('batchFormat')||{}).value || 'png';
    const quality = parseFloat((document.getElementById('batchQuality')||{}).value || '0.92');
    const oldEls = s.elements, oldCW = s.CW, oldCH = s.CH;

    for(let i=0;i<cbs.length;i++){
      const size = BATCH_SIZES[+cbs[i].dataset.idx];
      const sx = size.w / oldCW, sy = size.h / oldCH;
      set({ CW: size.w, CH: size.h });
      const scaled = oldEls.map(function(el){
        const e = Object.assign({}, el);
        e.x = (el.x||0)*sx; e.y = (el.y||0)*sy;
        e.w = (el.w||0)*sx; e.h = (el.h||0)*sy;
        if(el.fontSize) e.fontSize = Math.max(8, Math.round(el.fontSize * Math.min(sx,sy)));
        if(el.img) e.img = el.img;
        return e;
      });
      set({ elements: scaled });
      const temp = document.createElement('canvas');
      temp.width = size.w; temp.height = size.h;
      const tc = temp.getContext('2d');
      tc.clearRect(0,0,size.w,size.h);
      s._renderAll(tc, size.w, size.h);
      const link = document.createElement('a');
      const now = new Date();
      const pad = function(n){ return String(n).padStart(2,'0'); };
      const dateStr = now.getFullYear()+''+pad(now.getMonth()+1)+pad(now.getDate())+'_'+pad(now.getHours())+pad(now.getMinutes());
      link.download = 'FK_'+size.label.replace(/\s+/g,'_')+'_'+dateStr+'.'+(format==='jpeg'?'jpg':'png');
      link.href = temp.toDataURL(format==='jpeg'?'image/jpeg':'image/png', quality);
      link.click();
      await new Promise(function(r){ setTimeout(r, 350); });
    }
    set({ elements: oldEls, CW: oldCW, CH: oldCH });
    s.render();
    hideBatchModal();
    alert('✅ ব্যাচ এক্সপোর্ট শেষ');
  };

  window.applyImagePreset = function(name){
    const s = S(); if(!s) return;
    const el = s.getSelected();
    if(!el || el.type!=='image'){ alert('আগে একটি ইমেজ লেয়ার সিলেক্ট করুন'); return; }
    const presets = {
      normal: {brightness:100, contrast:100, saturation:100},
      vivid: {brightness:105, contrast:120, saturation:140},
      warm: {brightness:108, contrast:105, saturation:120},
      cool: {brightness:100, contrast:110, saturation:90},
      bw: {brightness:100, contrast:115, saturation:0},
      vintage: {brightness:95, contrast:90, saturation:70}
    };
    const p = presets[name]; if(!p) return;
    Object.assign(el, p);
    s.saveState(); s.render(); s.showProps();
  };

  document.addEventListener('keydown', function(e){
    const tag = ((e.target && e.target.tagName)||'').toLowerCase();
    if(tag==='input'||tag==='textarea'||(e.target && e.target.isContentEditable)) return;
    const s = S(); if(!s) return;
    if((e.ctrlKey||e.metaKey) && e.key==='z' && !e.shiftKey){ e.preventDefault(); s.undo(); }
    if((e.ctrlKey||e.metaKey) && (e.key==='y' || (e.key==='z' && e.shiftKey))){ e.preventDefault(); s.redo(); }
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='d'){ e.preventDefault(); duplicateElement(); }
    if(e.key==='Delete' || e.key==='Backspace'){
      const el = s.getSelected();
      if(el){ e.preventDefault(); s.deleteElement(el.id); }
    }
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].indexOf(e.key)>=0){
      const el = s.getSelected(); if(!el) return;
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      if(e.key==='ArrowLeft') el.x -= step;
      if(e.key==='ArrowRight') el.x += step;
      if(e.key==='ArrowUp') el.y -= step;
      if(e.key==='ArrowDown') el.y += step;
      s.render();
    }
  });
})();

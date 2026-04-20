import{h as e,n as t,p as n}from"./createLucideIcon-DSJrfq_f.js";import{n as r}from"./LangContext-BW4JjgGx.js";import{n as i,s as a}from"./AppContext-qw1cussD.js";import{t as o}from"./Layout-D_y4EV7F.js";var s=e(n(),1);function c(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function l(e,t){let n=JSON.stringify(t,null,2),r=new Blob([n],{type:`application/json`}),i=URL.createObjectURL(r),a=document.createElement(`a`);return a.href=i,a.download=e,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i),{filename:e,size:r.size}}function u(e,t,n){let r=n||new Date().toISOString().slice(0,7),i=new Date(r+`-01`).toLocaleDateString(`ar`,{month:`long`,year:`numeric`}),a=new Date(r+`-01`).toLocaleDateString(`en`,{month:`long`,year:`numeric`}),o=t?`مفكرتي الشهرية`:`My Monthly Journal`,s=e.dailyWins||{},l=e.gratitude||{},u=e.eveningLog||{},d=e.stateCheckin||{},f=e.sleepLog||{},p=Object.keys({...s,...l,...u}).filter(e=>e.startsWith(r)).sort(),m=p.map(e=>{let t=s[e]||[];return t.length===0?``:`<div class="entry"><span class="date">${c(e)}</span><ul>${t.map(e=>`<li>${c(e.text||``)}</li>`).join(``)}</ul></div>`}).filter(Boolean).join(``),h=p.map(e=>{let t=(l[e]||[]).filter(Boolean);return t.length===0?``:`<div class="entry"><span class="date">${c(e)}</span><ul>${t.map(e=>`<li>${c(e)}</li>`).join(``)}</ul></div>`}).filter(Boolean).join(``),g=p.map(e=>{let t=u[e];return!t||!t.reflection?``:`<div class="entry"><span class="date">${c(e)}</span><p>${c(t.reflection)}</p></div>`}).filter(Boolean).join(``),_=p.map(e=>f[e]?.hours).filter(Boolean),v=_.length>0?Math.round(_.reduce((e,t)=>e+t,0)/_.length*10)/10:null,y=p.map(e=>d[e]).filter(e=>e&&typeof e.energy==`number`).map(e=>(e.energy+e.mood+e.clarity)/3),b=y.length>0?Math.round(y.reduce((e,t)=>e+t,0)/y.length*10)/10:null,x=`<!doctype html>
  <html ${t?`lang="ar" dir="rtl"`:`lang="en" dir="ltr"`}>
  <head>
    <meta charset="utf-8"/>
    <title>${c(o)} — ${c(t?i:a)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: ${t?`'Cairo', 'Amiri', serif`:`'Inter', sans-serif`};
        background: #fff; color: #111;
        margin: 0; padding: 32px 40px;
        line-height: 1.6;
      }
      h1 {
        font-size: 32px; margin: 0 0 4px;
        color: #a88930;
        border-bottom: 3px solid #c9a84c;
        padding-bottom: 8px;
      }
      h2 {
        font-size: 22px; margin: 36px 0 12px;
        color: #111;
        border-bottom: 1px solid #e5c670;
        padding-bottom: 4px;
      }
      .period { font-size: 16px; color: #666; margin-bottom: 20px; }
      .stats {
        display: flex; gap: 20px; margin: 20px 0;
        background: #faf6e8; border: 1px solid #e5c670; border-radius: 8px; padding: 16px;
      }
      .stat { flex: 1; text-align: center; }
      .stat-value { font-size: 24px; font-weight: 700; color: #a88930; }
      .stat-label { font-size: 11px; color: #666; letter-spacing: 1px; text-transform: uppercase; }
      .entry { margin: 12px 0; padding: 10px 14px; background: #fafafa; border-${t?`right`:`left`}: 3px solid #c9a84c; border-radius: 4px; page-break-inside: avoid; }
      .date { font-size: 12px; font-weight: 700; color: #a88930; }
      ul { margin: 6px 0 0 0; padding-${t?`right`:`left`}: 20px; }
      li { margin-bottom: 4px; }
      p { margin: 6px 0 0 0; white-space: pre-wrap; }
      .empty { color: #999; font-style: italic; padding: 10px 0; }
      .footer {
        margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd;
        font-size: 11px; color: #888; text-align: center;
      }
      @media print {
        body { padding: 20px; }
        h2 { page-break-after: avoid; }
      }
    </style>
  </head>
  <body>
    <h1>${c(o)}</h1>
    <div class="period">${c(t?i:a)}</div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${p.length}</div>
        <div class="stat-label">${c(t?`أيام نشطة`:`Active Days`)}</div>
      </div>
      <div class="stat">
        <div class="stat-value">${v===null?`—`:v}</div>
        <div class="stat-label">${c(t?`متوسط النوم`:`Avg Sleep`)}</div>
      </div>
      <div class="stat">
        <div class="stat-value">${b===null?`—`:b}</div>
        <div class="stat-label">${c(t?`متوسط الحالة`:`Avg State`)}</div>
      </div>
    </div>

    <h2>🏆 ${c(t?`انتصاراتي`:`My Wins`)}</h2>
    ${m||`<div class="empty">${c(t?`لم تسجّل انتصارات هذا الشهر`:`No wins logged this month`)}</div>`}

    <h2>🙏 ${c(t?`امتناني`:`Gratitude`)}</h2>
    ${h||`<div class="empty">${c(t?`لم تسجّل امتناناً هذا الشهر`:`No gratitude logged this month`)}</div>`}

    <h2>📖 ${c(t?`تأملاتي`:`Reflections`)}</h2>
    ${g||`<div class="empty">${c(t?`لم تسجّل تأملات هذا الشهر`:`No reflections logged this month`)}</div>`}

    <div class="footer">
      ${c(t?`قواك — من بياناتك أنت`:`Your Power — from your own data`)}
      · ${c(new Date().toISOString().slice(0,10))}
    </div>
  </body>
  </html>`,S=window.open(``,`_blank`,`width=800,height=600`);return S?(S.document.open(),S.document.write(x),S.document.close(),S.focus(),setTimeout(()=>{try{S.print()}catch{}},600),{monthKey:r}):(alert(t?`المتصفح حجب النافذة — يرجى السماح بالنوافذ المنبثقة`:`Popup blocked — please allow popups`),null)}var d=t(),f=[{key:`identityAnchor`,ar:`مرساة الهوية`,en:`Identity Anchor`,defaultOn:!0,descAr:`شريط أعلى كل صفحة يُظهر هويتك اليومية`,descEn:`Bar on every page showing your daily identity`},{key:`triadReset`,ar:`إعادة ضبط الحالة`,en:`Triad Reset`,defaultOn:!0,descAr:`زر عائم لإعادة ضبط الحالة في 60 ثانية`,descEn:`Floating button for 60-sec state reset`},{key:`focusMode`,ar:`وضع التركيز`,en:`Focus Mode`,defaultOn:!1,descAr:`يبسّط الرئيسية لإظهار مهمة اليوم فقط`,descEn:`Simplify dashboard to today-only`},{key:`journey90`,ar:`رحلة 90 يوم`,en:`90-Day Journey`,defaultOn:!0,descAr:`تفعيل مسار التحوّل 90 يوم`,descEn:`Enable 90-day transformation path`},{key:`voiceJournal`,ar:`يوميات صوتية`,en:`Voice Journal`,defaultOn:!0,descAr:`تسجيل صوتي للتأمل اليومي`,descEn:`Voice-based daily reflection`},{key:`aiCoach`,ar:`المدرب الذكي`,en:`AI Coach`,defaultOn:!1,descAr:`محادثة تدريبية (تجريبية)`,descEn:`Coaching chat (experimental)`}];function p(){let{state:e,updateUIPref:t,toggleFeatureFlag:n,mergeImportedState:c,logDataExport:p}=i(),{lang:_}=r(),{showToast:v}=a(),y=_===`ar`,b=e.uiPreferences||{},x=e.featureFlags||{},S=(0,s.useRef)(null);return(0,d.jsx)(o,{title:y?`⚙️ الإعدادات`:`⚙️ Settings`,subtitle:y?`الميزات، البيانات، والخصوصية`:`Features, data & privacy`,children:(0,d.jsxs)(`div`,{className:`space-y-4 pt-2`,children:[(0,d.jsxs)(m,{title:y?`🎨 العرض`:`🎨 Display`,children:[(0,d.jsx)(h,{label:y?`مرساة الهوية`:`Identity Anchor`,desc:y?`إخفاء شريط الهوية من أعلى كل صفحة`:`Hide the identity bar at the top of each page`,value:!b.identityAnchorHidden,onChange:e=>t(`identityAnchorHidden`,!e)}),(0,d.jsx)(h,{label:y?`وضع التركيز`:`Focus Mode`,desc:y?`بسّط الرئيسية إلى مهمة اليوم الأساسية فقط`:`Simplify home to only today's primary task`,value:!!b.focusMode,onChange:e=>t(`focusMode`,e)}),(0,d.jsx)(h,{label:y?`تقليل الحركة`:`Reduced motion`,desc:y?`تقليل التأثيرات الحركية للوضوح`:`Dim animations for clarity`,value:!!b.reducedMotion,onChange:e=>t(`reducedMotion`,e)})]}),(0,d.jsx)(m,{title:y?`🧪 ميزات متقدمة`:`🧪 Advanced Features`,children:f.map(e=>{let t=x[e.key]==null?e.defaultOn:!!x[e.key];return(0,d.jsx)(h,{label:y?e.ar:e.en,desc:y?e.descAr:e.descEn,value:t,onChange:()=>n(e.key)},e.key)})}),(0,d.jsxs)(m,{title:y?`💾 البيانات`:`💾 Data`,children:[(0,d.jsx)(g,{emoji:`📥`,title:y?`تصدير بياناتي (JSON)`:`Export my data (JSON)`,desc:y?`ملف نسخ احتياطي كامل`:`Full backup file`,onClick:()=>{let t=`upw-backup-${new Date().toISOString().slice(0,10)}.json`;p({filename:t,size:l(t,{exportedAt:new Date().toISOString(),version:1,state:e}).size,type:`json`}),v(y?`تم التصدير ✓`:`Exported ✓`,`success`,2e3)}}),(0,d.jsx)(g,{emoji:`📄`,title:y?`طباعة مفكرة الشهر`:`Print monthly journal`,desc:y?`صفحة قابلة للطباعة/PDF`:`Print-ready / PDF`,onClick:()=>{let t=new Date().toISOString().slice(0,7);u(e,y,t),p({monthKey:t,type:`pdf`})}}),(0,d.jsx)(g,{emoji:`📤`,title:y?`استيراد من ملف JSON`:`Import from JSON`,desc:y?`دمج مع بياناتك الحالية`:`Merge with current data`,onClick:()=>S.current?.click()}),(0,d.jsx)(`input`,{ref:S,type:`file`,accept:`application/json`,onChange:e=>{let t=e.target.files?.[0];if(!t)return;let n=new FileReader;n.onload=e=>{try{let t=JSON.parse(e.target.result),n=t.state||t;if(!confirm(y?`سيتم دمج البيانات المستوردة مع بياناتك الحالية. متابعة؟`:`This will merge imported data with your current data. Continue?`))return;c(n),v(y?`تم الاستيراد ✓`:`Imported ✓`,`success`,2e3)}catch{v(y?`ملف غير صالح`:`Invalid file`,`error`,2e3)}S.current&&(S.current.value=``)},n.readAsText(t)},style:{display:`none`}}),Array.isArray(e.dataExports)&&e.dataExports.length>0&&(0,d.jsx)(`p`,{style:{fontSize:10,color:`#666`,marginTop:6},children:y?`آخر تصدير: ${new Date(e.dataExports[e.dataExports.length-1].ts).toLocaleString(`ar`)}`:`Last export: ${new Date(e.dataExports[e.dataExports.length-1].ts).toLocaleString()}`})]}),(0,d.jsx)(m,{title:y?`🔔 الإشعارات`:`🔔 Notifications`,children:(0,d.jsx)(`a`,{href:`/notifications-prefs`,style:{textDecoration:`none`},children:(0,d.jsx)(g,{emoji:`⚙️`,title:y?`تفضيلات الإشعارات`:`Notification preferences`,desc:y?`المواعيد، القنوات، التواتر`:`Timing, channels, frequency`,onClick:()=>{}})})}),(0,d.jsx)(m,{title:y?`ℹ️ عن التطبيق`:`ℹ️ About`,children:(0,d.jsxs)(`div`,{style:{padding:`12px 14px`,background:`#141414`,borderRadius:10,border:`1px solid #222`},children:[(0,d.jsx)(`p`,{style:{fontSize:11,color:`#bbb`},children:y?`تطبيق قواك — PWA`:`Your Power App — PWA`}),(0,d.jsx)(`p`,{style:{fontSize:10,color:`#666`,marginTop:4},children:y?`جميع البيانات مخزّنة محلياً ومزامنة آمنة`:`All data stored locally with secure sync`})]})})]})})}function m({title:e,children:t}){return(0,d.jsxs)(`section`,{children:[(0,d.jsx)(`p`,{style:{fontSize:10,fontWeight:900,color:`#c9a84c`,letterSpacing:`0.05em`,marginBottom:8},children:e}),(0,d.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:6},children:t})]})}function h({label:e,desc:t,value:n,onChange:r}){return(0,d.jsxs)(`div`,{role:`switch`,"aria-checked":n,tabIndex:0,onClick:()=>r(!n),onKeyDown:e=>{(e.key===` `||e.key===`Enter`)&&(e.preventDefault(),r(!n))},style:{padding:`12px 14px`,background:`#0e0e0e`,border:`1px solid ${n?`rgba(201,168,76,0.25)`:`#1e1e1e`}`,borderRadius:12,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:12},children:[(0,d.jsxs)(`div`,{style:{flex:1,minWidth:0},children:[(0,d.jsx)(`p`,{style:{fontSize:12,fontWeight:800,color:`#fff`},children:e}),(0,d.jsx)(`p`,{style:{fontSize:10,color:`#888`,marginTop:2,lineHeight:1.3},children:t})]}),(0,d.jsx)(`div`,{style:{width:42,height:24,borderRadius:12,background:n?`rgba(201,168,76,0.4)`:`#222`,position:`relative`,transition:`background 0.2s`,flexShrink:0},children:(0,d.jsx)(`div`,{style:{position:`absolute`,top:2,insetInlineStart:n?20:2,width:20,height:20,borderRadius:`50%`,background:n?`#c9a84c`:`#555`,transition:`inset-inline-start 0.2s, background 0.2s`}})})]})}function g({emoji:e,title:t,desc:n,onClick:r}){return(0,d.jsxs)(`button`,{onClick:r,className:`text-start transition-all active:scale-[0.98]`,style:{width:`100%`,padding:`12px 14px`,background:`#0e0e0e`,border:`1px solid #1e1e1e`,borderRadius:12,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:12},children:[(0,d.jsx)(`span`,{style:{fontSize:20},children:e}),(0,d.jsxs)(`div`,{style:{flex:1},children:[(0,d.jsx)(`p`,{style:{fontSize:12,fontWeight:800,color:`#fff`},children:t}),(0,d.jsx)(`p`,{style:{fontSize:10,color:`#888`,marginTop:2},children:n})]}),(0,d.jsx)(`span`,{style:{color:`#666`},children:`→`})]})}export{p as default};
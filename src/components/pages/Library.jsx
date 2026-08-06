import { useState, useMemo, useRef } from "react";
import {
  Search,
  Terminal,
  ChevronRight,
  Copy,
  Check,
  Database,
  ShieldCheck,
  Layers,
  Layout,
  BarChart3,
  Bell,
  Zap,
  ArrowDown,
  Smartphone,
  Filter,
  Calendar,
  Globe,
  Download,
  Share2,
  CheckSquare,
  Palette,
  Cpu,
  Eye,
  Code2,
  Maximize2,
  X,
  Star,
  BookOpen,
} from "lucide-react";

// ─── DATA ──────────────────────────────────────────────────────────────────
const components = [
  {
    id: 1,
    name: "Data Table",
    category: "Data",
    icon: "Database",
    tags: ["search", "sort", "table"],
    desc: "Interactive table with real-time search and column sorting.",
    html: `<input type="text" id="dbSearch" placeholder="Search table..." style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:12px;font-size:14px;box-sizing:border-box">
<table id="myTable" style="width:100%;border-collapse:collapse">
  <thead>
    <tr>
      <th onclick="sortTable(0)" style="cursor:pointer;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;text-align:left">Name ↕</th>
      <th onclick="sortTable(1)" style="cursor:pointer;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;text-align:left">Age ↕</th>
      <th onclick="sortTable(2)" style="cursor:pointer;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;text-align:left">City ↕</th>
    </tr>
  </thead>
  <tbody id="tableBody"></tbody>
</table>`,
    css: `#myTable td{padding:10px;border:1px solid #e2e8f0;font-size:14px}
#myTable tr:hover td{background:#f8fafc}
#myTable tr:nth-child(even) td{background:#fafafa}`,
    js: `const tableData=[{name:'Alice',age:28,city:'New York'},{name:'Bob',age:34,city:'London'},{name:'Carlos',age:22,city:'Madrid'},{name:'Diana',age:31,city:'Paris'}];
let sortDir={};
function renderTable(data){tableBody.innerHTML=data.map(r=>\`<tr><td>\${r.name}</td><td>\${r.age}</td><td>\${r.city}</td></tr>\`).join('');}
function sortTable(col){const keys=['name','age','city'];const k=keys[col];sortDir[k]=!sortDir[k];tableData.sort((a,b)=>sortDir[k]?(a[k]>b[k]?1:-1):(a[k]<b[k]?1:-1));renderTable(tableData);}
dbSearch.oninput=e=>{const q=e.target.value.toLowerCase();renderTable(tableData.filter(r=>Object.values(r).some(v=>String(v).toLowerCase().includes(q))))};
renderTable(tableData);`,
  },
  {
    id: 2,
    name: "Password Strength",
    category: "Security",
    icon: "ShieldCheck",
    tags: ["password", "validation", "form"],
    desc: "Real-time password strength checker with 5 rules and animated meter.",
    html: `<label style="font-size:13px;font-weight:600;color:#475569">Enter password</label>
<div style="position:relative;margin-top:6px">
  <input type="password" id="pwInput" placeholder="Type your password..."
    style="width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;box-sizing:border-box">
</div>
<div id="meter" style="height:6px;border-radius:4px;background:#e2e8f0;margin-top:10px;overflow:hidden">
  <div id="meterBar" style="height:100%;width:0;transition:all 0.4s;border-radius:4px"></div>
</div>
<div id="pwLabel" style="margin-top:6px;font-size:12px;font-weight:700;color:#94a3b8">Type a password</div>
<ul id="rules" style="margin-top:10px;padding-left:16px;font-size:12px;color:#64748b;line-height:1.8"></ul>`,
    css: ``,
    js: `const rules=[{re:/.{8,}/,label:'Min 8 characters'},{re:/[A-Z]/,label:'Uppercase letter'},{re:/[a-z]/,label:'Lowercase letter'},{re:/[0-9]/,label:'Number'},{re:/[^A-Za-z0-9]/,label:'Special char (!@#...)'}];
const colors=['#ef4444','#f97316','#eab308','#22c55e','#10b981'];
const labels=['Very weak','Weak','Medium','Strong','Very strong'];
pwInput.oninput=()=>{const p=pwInput.value;const passed=rules.filter(r=>r.re.test(p));const score=passed.length;meterBar.style.width=(score*20)+'%';meterBar.style.background=colors[score-1]||'#e2e8f0';pwLabel.textContent=score?labels[score-1]:'Type a password';pwLabel.style.color=colors[score-1]||'#94a3b8';document.getElementById('rules').innerHTML=rules.map(r=>\`<li style="color:\${r.re.test(p)?'#22c55e':'#94a3b8'}">\${r.re.test(p)?'✓':'○'} \${r.label}</li>\`).join('');};`,
  },
  {
    id: 3,
    name: "Kanban Board",
    category: "Productivity",
    icon: "Layout",
    tags: ["drag", "drop", "tasks"],
    desc: "Drag & drop task cards between columns using the native HTML5 DnD API.",
    html: `<div id="board" style="display:flex;gap:12px;min-height:200px">
  <div class="col" id="todo" style="flex:1;background:#f8fafc;border-radius:12px;padding:12px;min-height:160px">
    <div style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">📋 To Do</div>
    <div class="card" draggable="true" style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-bottom:6px;cursor:grab;font-size:13px">Design mockup</div>
    <div class="card" draggable="true" style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-bottom:6px;cursor:grab;font-size:13px">Write docs</div>
  </div>
  <div class="col" id="doing" style="flex:1;background:#eff6ff;border-radius:12px;padding:12px;min-height:160px">
    <div style="font-size:11px;font-weight:800;color:#3b82f6;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">⚡ In Progress</div>
    <div class="card" draggable="true" style="background:#fff;border:1px solid #bfdbfe;border-radius:8px;padding:10px;margin-bottom:6px;cursor:grab;font-size:13px">Build API</div>
  </div>
  <div class="col" id="done" style="flex:1;background:#f0fdf4;border-radius:12px;padding:12px;min-height:160px">
    <div style="font-size:11px;font-weight:800;color:#22c55e;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">✅ Done</div>
  </div>
</div>`,
    css: `.card.dragging{opacity:0.4;transform:rotate(2deg)}
.col.over{outline:2px dashed #6366f1;outline-offset:2px}`,
    js: `let dragged=null;
document.querySelectorAll('.card').forEach(card=>{card.addEventListener('dragstart',()=>{dragged=card;card.classList.add('dragging')});card.addEventListener('dragend',()=>card.classList.remove('dragging'))});
document.querySelectorAll('.col').forEach(col=>{col.addEventListener('dragover',e=>{e.preventDefault();col.classList.add('over')});col.addEventListener('dragleave',()=>col.classList.remove('over'));col.addEventListener('drop',()=>{col.classList.remove('over');if(dragged)col.appendChild(dragged)})});`,
  },
  {
    id: 4,
    name: "Canvas Charts",
    category: "Analytics",
    icon: "BarChart3",
    tags: ["chart", "canvas", "graph"],
    desc: "Bar and line charts rendered on HTML Canvas from a data array.",
    html: `<div style="display:flex;gap:8px;margin-bottom:12px">
  <button onclick="drawBar()" style="padding:7px 16px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">Bar</button>
  <button onclick="drawLine()" style="padding:7px 16px;background:#f1f5f9;color:#334155;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">Line</button>
</div>
<canvas id="chart" width="420" height="200" style="border-radius:12px;background:#fafafa;border:1px solid #e2e8f0;max-width:100%"></canvas>`,
    css: ``,
    js: `const ctx=document.getElementById('chart').getContext('2d');
const data=[65,40,80,55,90,35,70];const labels=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const W=420,H=200,pad=30,max=Math.max(...data);
const colors=['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#818cf8','#4f46e5','#4338ca'];
function clear(){ctx.clearRect(0,0,W,H)}
function drawBar(){clear();const bw=(W-pad*2)/data.length-6;data.forEach((v,i)=>{const x=pad+i*((W-pad*2)/data.length)+3;const h=(v/max)*(H-pad*2);ctx.fillStyle=colors[i];ctx.beginPath();ctx.roundRect(x,H-pad-h,bw,h,4);ctx.fill();ctx.fillStyle='#94a3b8';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText(labels[i],x+bw/2,H-10)})}
function drawLine(){clear();const step=(W-pad*2)/(data.length-1);ctx.beginPath();ctx.strokeStyle='#6366f1';ctx.lineWidth=2.5;data.forEach((v,i)=>{const x=pad+i*step;const y=H-pad-(v/max)*(H-pad*2);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)});ctx.stroke();data.forEach((v,i)=>{const x=pad+i*step;const y=H-pad-(v/max)*(H-pad*2);ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle='#6366f1';ctx.fill();ctx.fillStyle='#64748b';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText(labels[i],x,H-10)})}
drawBar();`,
  },
  {
    id: 5,
    name: "Toast Notifications",
    category: "Feedback",
    icon: "Bell",
    tags: ["toast", "notification", "alert"],
    desc: "Dynamic notifications (success/error/warn/info) with auto-dismiss and slide animation.",
    html: `<div style="display:flex;flex-wrap:wrap;gap:8px">
  <button onclick="toast('success','✅ Saved successfully!')" style="padding:8px 16px;background:#22c55e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">Success</button>
  <button onclick="toast('error','❌ Something went wrong!')" style="padding:8px 16px;background:#ef4444;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">Error</button>
  <button onclick="toast('warn','⚠️ Check your input')" style="padding:8px 16px;background:#f59e0b;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">Warning</button>
  <button onclick="toast('info','ℹ️ New update available')" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">Info</button>
</div>
<div id="toastContainer" style="position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px"></div>`,
    css: `@keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes fadeOut{to{opacity:0;transform:translateX(120%)}}`,
    js: `const bgMap={success:'#22c55e',error:'#ef4444',warn:'#f59e0b',info:'#3b82f6'};
function toast(type,message){const el=document.createElement('div');el.textContent=message;el.style.cssText=\`background:\${bgMap[type]};color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.15);animation:slideIn .3s ease;max-width:280px\`;toastContainer.appendChild(el);setTimeout(()=>{el.style.animation='fadeOut .3s forwards';setTimeout(()=>el.remove(),300)},2800);}`,
  },
  {
    id: 6,
    name: "Multi-step Form",
    category: "Forms",
    icon: "Layers",
    tags: ["wizard", "steps", "form"],
    desc: "Step-by-step form wizard with progress bar and data preserved between steps.",
    html: `<div style="font-size:13px;font-weight:600;color:#64748b;margin-bottom:12px">Step <span id="stepNum">1</span> of 3</div>
<div id="progressBar" style="height:6px;background:#e2e8f0;border-radius:4px;margin-bottom:20px"><div id="progressFill" style="height:100%;width:33%;background:#6366f1;border-radius:4px;transition:width .4s"></div></div>
<div id="step1"><label style="font-size:13px;font-weight:600">Name</label><br><input id="nameInput" placeholder="Your name" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;margin-top:6px;box-sizing:border-box;font-size:14px"></div>
<div id="step2" style="display:none"><label style="font-size:13px;font-weight:600">Email</label><br><input id="emailInput" placeholder="email@example.com" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;margin-top:6px;box-sizing:border-box;font-size:14px"></div>
<div id="step3" style="display:none"><label style="font-size:13px;font-weight:600">Role</label><br><select id="roleInput" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;margin-top:6px;font-size:14px"><option>Developer</option><option>Designer</option><option>Manager</option></select></div>
<div style="display:flex;gap:8px;margin-top:16px">
  <button id="prevBtn" onclick="changeStep(-1)" style="padding:10px 20px;background:#f1f5f9;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;display:none">← Back</button>
  <button id="nextBtn" onclick="changeStep(1)" style="padding:10px 20px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">Next →</button>
</div>
<div id="summary" style="display:none;margin-top:12px;padding:14px;background:#f0fdf4;border-radius:10px;font-size:13px;color:#166534"></div>`,
    css: ``,
    js: `let step=1;const steps=[step1,step2,step3];
function changeStep(dir){steps[step-1].style.display='none';step+=dir;if(step>3){summary.style.display='block';summary.innerHTML=\`✅ Done! Name: <b>\${nameInput.value}</b>, Email: <b>\${emailInput.value}</b>, Role: <b>\${roleInput.value}</b>\`;nextBtn.style.display='none';return;}steps[step-1].style.display='block';stepNum.textContent=step;progressFill.style.width=(step/3*100)+'%';prevBtn.style.display=step>1?'block':'none';nextBtn.textContent=step===3?'Finish ✓':'Next →';}`,
  },
  {
    id: 7,
    name: "Countdown Timer",
    category: "Logic",
    icon: "Calendar",
    tags: ["timer", "countdown", "clock"],
    desc: "Countdown timer with start/pause/reset controls and completion event.",
    html: `<div style="text-align:center">
  <div id="display" style="font-size:52px;font-weight:900;color:#1e293b;letter-spacing:2px;font-family:monospace">05:00</div>
  <div id="msg" style="font-size:14px;color:#94a3b8;margin-top:4px">Ready</div>
  <div style="display:flex;gap:10px;justify-content:center;margin-top:18px">
    <button onclick="startTimer()" style="padding:10px 22px;background:#6366f1;color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:13px">▶ Start</button>
    <button onclick="pauseTimer()" style="padding:10px 22px;background:#f1f5f9;color:#334155;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:13px">⏸ Pause</button>
    <button onclick="resetTimer()" style="padding:10px 22px;background:#f1f5f9;color:#334155;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:13px">↺ Reset</button>
  </div>
</div>`,
    css: ``,
    js: `let total=300,left=300,timer=null;
function fmt(s){return\`\${String(Math.floor(s/60)).padStart(2,'0')}:\${String(s%60).padStart(2,'0')}\`}
function tick(){left--;display.textContent=fmt(left);if(left<=0){clearInterval(timer);msg.textContent='🎉 Time is up!';msg.style.color='#ef4444'}}
function startTimer(){if(!timer&&left>0){timer=setInterval(tick,1000);msg.textContent='⏱ Running...';msg.style.color='#6366f1'}}
function pauseTimer(){clearInterval(timer);timer=null;msg.textContent='⏸ Paused';msg.style.color='#f59e0b'}
function resetTimer(){clearInterval(timer);timer=null;left=total;display.textContent=fmt(left);msg.textContent='Ready';msg.style.color='#94a3b8'}`,
  },
  {
    id: 8,
    name: "Infinite Scroll",
    category: "Data",
    icon: "ArrowDown",
    tags: ["scroll", "pagination", "list"],
    desc: "Auto-loads more items when the user scrolls to the bottom of the container.",
    html: `<div id="feed" style="max-height:240px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:12px;padding:12px"></div>
<div id="loader" style="text-align:center;padding:12px;color:#94a3b8;font-size:13px;display:none">⏳ Loading...</div>`,
    css: ``,
    js: `let page=1,loading=false;
function loadItems(){if(loading)return;loading=true;loader.style.display='block';setTimeout(()=>{for(let i=1;i<=5;i++){const el=document.createElement('div');el.textContent=\`Post #\${(page-1)*5+i} — loaded from server\`;el.style.cssText='padding:12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155';feed.appendChild(el)}page++;loading=false;loader.style.display='none'},800)}
feed.addEventListener('scroll',()=>{if(feed.scrollTop+feed.clientHeight>=feed.scrollHeight-20)loadItems()});
loadItems();`,
  },
  {
    id: 9,
    name: "Lazy Images",
    category: "Performance",
    icon: "Smartphone",
    tags: ["lazy", "images", "observer"],
    desc: "Images load only when they enter the viewport using Intersection Observer.",
    html: `<div style="max-height:220px;overflow-y:auto;display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:4px">
  ${[1, 2, 3, 4, 5, 6].map((i) => `<div class="lazy-img" data-src="https://picsum.photos/seed/${i * 10}/200/120" style="height:100px;border-radius:10px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:12px">⏳ Not loaded</div>`).join("")}
</div>`,
    css: `.lazy-img.loaded{display:block!important;padding:0!important}
.lazy-img img{width:100%;height:100px;object-fit:cover;border-radius:10px}`,
    js: `const observer=new IntersectionObserver((entries)=>{entries.forEach(el=>{if(el.isIntersecting){const img=document.createElement('img');img.src=el.target.dataset.src;img.onload=()=>{el.target.classList.add('loaded');el.target.innerHTML='';el.target.appendChild(img)};observer.unobserve(el.target)}})},{threshold:0.1});
document.querySelectorAll('.lazy-img').forEach(el=>observer.observe(el));`,
  },
  {
    id: 10,
    name: "SVG Animation",
    category: "Design",
    icon: "Palette",
    tags: ["svg", "animation", "canvas"],
    desc: "Programmatic SVG orbit animation using requestAnimationFrame.",
    html: `<div style="text-align:center">
  <svg id="svgCanvas" viewBox="0 0 300 200" style="width:100%;max-width:300px;border-radius:14px;background:#0f172a">
    <circle id="orb1" cx="150" cy="100" r="40" fill="none" stroke="#6366f1" stroke-width="2"/>
    <circle id="orb2" cx="150" cy="100" r="60" fill="none" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="8 4"/>
    <circle id="orb3" cx="150" cy="100" r="80" fill="none" stroke="#c4b5fd" stroke-width="0.5" stroke-dasharray="4 8"/>
    <circle id="dot" cx="190" cy="100" r="5" fill="#a5b4fc"/>
    <text x="150" y="106" text-anchor="middle" fill="#e2e8f0" font-size="11" font-family="monospace">SVG</text>
  </svg>
  <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
    <button onclick="startAnim()" style="padding:8px 18px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">▶ Start</button>
    <button onclick="stopAnim()" style="padding:8px 18px;background:#334155;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">⏸ Stop</button>
  </div>
</div>`,
    css: ``,
    js: `let angle=0,raf=null;
function startAnim(){if(raf)return;function frame(){angle+=1;const r=angle*Math.PI/180;dot.setAttribute('cx',150+80*Math.cos(r));dot.setAttribute('cy',100+80*Math.sin(r));orb2.setAttribute('transform',\`rotate(\${angle*0.5} 150 100)\`);orb3.setAttribute('transform',\`rotate(\${-angle*0.3} 150 100)\`);raf=requestAnimationFrame(frame)}raf=requestAnimationFrame(frame)}
function stopAnim(){cancelAnimationFrame(raf);raf=null}`,
  },
  {
    id: 11,
    name: "Currency Converter",
    category: "Logic",
    icon: "Cpu",
    tags: ["currency", "conversion", "api"],
    desc: "Currency conversion with mock API delay and swap button.",
    html: `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:end">
  <div>
    <label style="font-size:12px;font-weight:600;color:#64748b">From</label>
    <select id="fromCur" style="width:100%;padding:9px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;margin-top:4px"><option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option></select>
    <input type="number" id="amount" value="100" style="width:100%;padding:9px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;margin-top:8px;box-sizing:border-box">
  </div>
  <button onclick="swap()" style="padding:10px;background:#f1f5f9;border:none;border-radius:10px;cursor:pointer;font-size:18px;margin-bottom:4px">⇄</button>
  <div>
    <label style="font-size:12px;font-weight:600;color:#64748b">To</label>
    <select id="toCur" style="width:100%;padding:9px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;margin-top:4px"><option>EUR</option><option>USD</option><option>GBP</option><option>JPY</option></select>
    <div id="result" style="padding:10px;background:#f8fafc;border-radius:8px;font-size:14px;font-weight:700;color:#6366f1;margin-top:8px;min-height:37px">—</div>
  </div>
</div>
<button onclick="convert()" style="width:100%;margin-top:12px;padding:10px;background:#6366f1;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700">Convert</button>`,
    css: ``,
    js: `const rates={USD:{EUR:0.92,GBP:0.79,JPY:149.5,USD:1},EUR:{USD:1.09,GBP:0.86,JPY:162.8,EUR:1},GBP:{USD:1.27,EUR:1.16,JPY:189.2,GBP:1},JPY:{USD:0.0067,EUR:0.0061,GBP:0.0053,JPY:1}};
function convert(){result.textContent='⏳';setTimeout(()=>{const from=fromCur.value,to=toCur.value,amt=parseFloat(amount.value)||0;result.textContent=(amt*(rates[from]?.[to]||1)).toFixed(2)+' '+to},400)}
function swap(){const v=fromCur.value;fromCur.value=toCur.value;toCur.value=v;convert()}`,
  },
  {
    id: 12,
    name: "Skeleton Loader",
    category: "UX",
    icon: "Zap",
    tags: ["skeleton", "loading", "placeholder"],
    desc: "Animated shimmer placeholders that transition to real content.",
    html: `<div id="skeletonView">
  ${[1, 2, 3].map(() => `<div style="display:flex;gap:12px;padding:14px;border-radius:12px;background:#f8fafc;margin-bottom:10px"><div style="width:44px;height:44px;border-radius:50%;background:#e2e8f0;flex-shrink:0;position:relative;overflow:hidden"><div class="shimmer"></div></div><div style="flex:1"><div style="height:13px;background:#e2e8f0;border-radius:6px;width:60%;position:relative;overflow:hidden"><div class="shimmer"></div></div><div style="height:11px;background:#e2e8f0;border-radius:6px;width:85%;margin-top:8px;position:relative;overflow:hidden"><div class="shimmer"></div></div></div></div>`).join("")}
</div>
<div id="realView" style="display:none">
  ${[
    { n: "Alice Johnson", r: "Frontend Dev" },
    { n: "Bob Smith", r: "UX Designer" },
    { n: "Carol White", r: "Backend Eng" },
  ]
    .map(
      (u) =>
        `<div style="display:flex;gap:12px;padding:14px;border-radius:12px;background:#f8fafc;margin-bottom:10px;align-items:center"><div style="width:44px;height:44px;border-radius:50%;background:#6366f1;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;flex-shrink:0">${u.n[0]}</div><div><div style="font-size:14px;font-weight:700;color:#1e293b">${u.n}</div><div style="font-size:12px;color:#64748b;margin-top:2px">${u.r}</div></div></div>`,
    )
    .join("")}
</div>
<button onclick="reload()" style="padding:9px 20px;background:#6366f1;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;margin-top:4px">↺ Replay</button>`,
    css: `@keyframes shimmer{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
.shimmer{position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.8),transparent);animation:shimmer 1.4s infinite}`,
    js: `function reload(){skeletonView.style.display='block';realView.style.display='none';setTimeout(()=>{skeletonView.style.display='none';realView.style.display='block'},2000)}
setTimeout(()=>{skeletonView.style.display='none';realView.style.display='block'},2000);`,
  },
];

const ICON_MAP = {
  Database,
  ShieldCheck,
  Layout,
  BarChart3,
  Bell,
  Layers,
  Calendar,
  ArrowDown,
  Smartphone,
  Palette,
  Cpu,
  Zap,
};
const TABS = ["html", "css", "js"];
const TAB_COLORS = { html: "#e2522b", css: "#3b82f6", js: "#f59e0b" };

function buildIframe(comp) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;padding:24px;background:#fff;color:#1e293b}
  ${comp.css}
</style>
</head>
<body>
${comp.html}
<script>${comp.js}</script>
</body>
</html>`;
}

// Simple syntax highlighter
function highlight(code, lang) {
  if (!code)
    return '<span style="color:#64748b;font-style:italic">// empty</span>';
  let h = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (lang === "js") {
    h = h
      .replace(/(\/\/[^\n]*)/g, '<span style="color:#64748b">$1</span>')
      .replace(
        /\b(const|let|var|function|return|if|else|for|while|new|this|typeof|import|export|default|class|extends|async|await|true|false|null|undefined)\b/g,
        '<span style="color:#c084fc">$1</span>',
      )
      .replace(
        /("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)/g,
        '<span style="color:#86efac">$1</span>',
      )
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#fb923c">$1</span>');
  } else if (lang === "html") {
    h = h
      .replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color:#7dd3fc">$2</span>')
      .replace(
        /([\w-]+=)("([^"]*)")/g,
        '<span style="color:#86efac">$1</span><span style="color:#fbbf24">$2</span>',
      );
  } else if (lang === "css") {
    h = h
      .replace(/([\w-]+)\s*:/g, '<span style="color:#7dd3fc">$1</span>:')
      .replace(/("([^"]*)")/g, '<span style="color:#86efac">$1</span>');
  }
  return h;
}

const CATEGORIES = ["All", ...new Set(components.map((c) => c.category))];

export default function Library() {
  const [activeId, setActiveId] = useState(1);
  const [activeTab, setActiveTab] = useState("html");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [catFilter, setCatFilter] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState("preview"); // 'preview' | 'code'

  const filtered = useMemo(() => {
    return components.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some((t) => t.includes(search.toLowerCase()));
      const matchCat = catFilter === "All" || c.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [search, catFilter]);

  const current = components.find((c) => c.id === activeId) || components[0];
  const isFav = favorites.includes(current.id);

  const handleCopy = () => {
    const allCode = `<!-- HTML -->\n${current.html}\n\n/* CSS */\n${current.css}\n\n// JS\n${current.js}`;
    const toCopy =
      activeTab === "all" ? allCode : current[activeTab] || "// empty";
    navigator.clipboard.writeText(toCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFav = () => {
    setFavorites((f) =>
      f.includes(current.id)
        ? f.filter((i) => i !== current.id)
        : [...f, current.id],
    );
  };

  const IconComp = ICON_MAP[current.icon] || Zap;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#0d1117",
        color: "#e6edf3",
        overflow: "hidden",
      }}
    >
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: 260,
          background: "#161b22",
          borderRight: "1px solid #30363d",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 16px 14px",
            borderBottom: "1px solid #21262d",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg,#2563eb,#00A8A8)",
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Terminal size={15} color="#fff" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#e6edf3",
                }}
              >
                BitDocs
              </div>
              <div style={{ fontSize: 10, color: "#7d8590", fontWeight: 500 }}>
                {components.length} components
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search
              size={12}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#7d8590",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components..."
              style={{
                width: "100%",
                paddingLeft: 30,
                paddingRight: 12,
                paddingTop: 8,
                paddingBottom: 8,
                background: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: 8,
                fontSize: 12,
                outline: "none",
                boxSizing: "border-box",
                color: "#e6edf3",
              }}
            />
          </div>

          {/* Category pills */}
          <div
            style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}
          >
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                style={{
                  padding: "3px 8px",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: 600,
                  background: catFilter === cat ? "#2563eb" : "#21262d",
                  color: catFilter === cat ? "#fff" : "#7d8590",
                  transition: "all .15s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Nav list */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {favorites.length > 0 && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#7d8590",
                padding: "6px 8px 4px",
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              ⭐ Favorites
            </div>
          )}
          {filtered.length === 0 && (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#7d8590",
                fontSize: 12,
              }}
            >
              No results for "{search}"
            </div>
          )}
          {filtered.map((c) => {
            const active = c.id === activeId;
            const Ic = ICON_MAP[c.icon] || Zap;
            const fav = favorites.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveId(c.id);
                  setActiveTab("html");
                  setView("preview");
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  marginBottom: 1,
                  textAlign: "left",
                  background: active ? "#1f2937" : "transparent",
                  transition: "all .12s",
                }}
              >
                  <span
                    style={{
                      color: active ? "#60a5fa" : "#7d8590",
                      flexShrink: 0,
                    }}
                  >
                  <Ic size={13} />
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    flex: 1,
                    color: active ? "#e6edf3" : "#8b949e",
                  }}
                >
                  {c.name}
                </span>
                {fav && (
                  <span style={{ fontSize: 9, color: "#f59e0b" }}>★</span>
                )}
                {active && (
                  <ChevronRight
                    size={11}
                    style={{ color: "#7d8590", flexShrink: 0 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #21262d" }}>
          <div
            style={{
              fontSize: 10,
              color: "#7d8590",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <BookOpen size={10} />
            {filtered.length} of {components.length} shown
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#0d1117",
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: "18px 28px 16px",
            borderBottom: "1px solid #21262d",
            background: "#161b22",
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  background: "#21262d",
                  borderRadius: 20,
                  color: "#8b949e",
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                }}
              >
                {current.category}
              </span>
              {current.tags.map((t) => (
                <span key={t} style={{ fontSize: 10, color: "#7d8590" }}>
                  #{t}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: "linear-gradient(135deg,#1e293b,#334155)",
                  border: "1px solid #30363d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconComp size={16} color="#60a5fa" />
              </div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#e6edf3",
                  margin: 0,
                }}
              >
                {current.name}
              </h1>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#7d8590",
                margin: "6px 0 0",
                lineHeight: 1.6,
                maxWidth: 500,
              }}
            >
              {current.desc}
            </p>
          </div>

          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              onClick={toggleFav}
              style={{
                padding: "7px 10px",
                background: isFav ? "#2d1f0e" : "#21262d",
                border: `1px solid ${isFav ? "#f59e0b44" : "#30363d"}`,
                borderRadius: 8,
                cursor: "pointer",
                color: isFav ? "#f59e0b" : "#7d8590",
                fontSize: 14,
                transition: "all .15s",
              }}
            >
              {isFav ? "★" : "☆"}
            </button>
            <button
              onClick={() => setFullscreen(true)}
              style={{
                padding: "7px 10px",
                background: "#21262d",
                border: "1px solid #30363d",
                borderRadius: 8,
                cursor: "pointer",
                color: "#7d8590",
                transition: "all .15s",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Maximize2 size={13} /> Expand
            </button>
          </div>
        </header>

        {/* View toggle */}
        <div
          style={{
            padding: "12px 28px",
            borderBottom: "1px solid #21262d",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#161b22",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#0d1117",
              borderRadius: 8,
              padding: 3,
              gap: 2,
              border: "1px solid #21262d",
            }}
          >
            {[
              { v: "preview", icon: Eye, label: "Preview" },
              { v: "code", icon: Code2, label: "Code" },
            ].map(({ v, icon: Ic, label }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "5px 14px",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                  transition: "all .15s",
                  background: view === v ? "#1f2937" : "transparent",
                  color: view === v ? "#e6edf3" : "#7d8590",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Ic size={12} /> {label}
              </button>
            ))}
          </div>

          {view === "code" && (
            <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    background:
                      activeTab === t ? TAB_COLORS[t] + "22" : "transparent",
                    color: activeTab === t ? TAB_COLORS[t] : "#7d8590",
                    border:
                      activeTab === t
                        ? `1px solid ${TAB_COLORS[t]}44`
                        : "1px solid transparent",
                    transition: "all .15s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <div style={{ flex: 1 }} />

          <button
            onClick={handleCopy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              background: copied ? "#14532d" : "#21262d",
              border: `1px solid ${copied ? "#16a34a44" : "#30363d"}`,
              borderRadius: 8,
              cursor: "pointer",
              color: copied ? "#4ade80" : "#e6edf3",
              fontSize: 12,
              fontWeight: 600,
              transition: "all .2s",
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied
              ? "Copied!"
              : view === "preview"
                ? "Copy all"
                : `Copy ${activeTab.toUpperCase()}`}
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {/* PREVIEW */}
          {view === "preview" && (
            <div
              style={{
                height: "100%",
                background: "#fff",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 14,
                  zIndex: 5,
                  display: "flex",
                  gap: 5,
                }}
              >
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <div
                    key={c}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: c,
                    }}
                  />
                ))}
              </div>
              {/* ✅ FIX: useEffect + contentDocument o'chirildi, srcDoc ishlatildi */}
              <iframe
                key={activeId}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="preview"
                sandbox="allow-scripts"
                srcDoc={buildIframe(current)}
              />
            </div>
          )}

          {/* CODE */}
          {view === "code" && (
            <div
              style={{
                height: "100%",
                overflow: "auto",
                background: "#0d1117",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  padding: "24px 28px",
                  fontFamily: "'JetBrains Mono','Fira Code',monospace",
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: "#e6edf3",
                }}
              >
                <code
                  dangerouslySetInnerHTML={{
                    __html: highlight(current[activeTab] || "", activeTab),
                  }}
                />
              </pre>
            </div>
          )}
        </div>
      </main>

      {/* ── FULLSCREEN MODAL ── */}
      {fullscreen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.85)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 900,
              height: "80vh",
              background: "#161b22",
              borderRadius: 16,
              border: "1px solid #30363d",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,.6)",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #21262d",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3" }}>
                {current.name} — Live Preview
              </span>
              <button
                onClick={() => setFullscreen(false)}
                style={{
                  background: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: 8,
                  padding: "5px 8px",
                  cursor: "pointer",
                  color: "#e6edf3",
                }}
              >
                <X size={14} />
              </button>
            </div>
            <div style={{ flex: 1, background: "#fff" }}>
              <iframe
                style={{ width: "100%", height: "100%", border: "none" }}
                title="fullscreen-preview"
                sandbox="allow-scripts"
                srcDoc={buildIframe(current)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

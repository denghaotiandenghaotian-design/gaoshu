/* =========================================================================
 * 河南人教版高中数学学习辅助系统 · 交互逻辑
 * 纯前端，无需后端/网络，开箱即用
 * ========================================================================= */
(function(){
  'use strict';
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc = s => String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const state = { view:'dashboard', selChapter:null, pendingPoints:[] };

  /* ---------- 工具 ---------- */
  function toast(msg){ const t=$('#toast'); t.textContent=msg; t.hidden=false; clearTimeout(t._t); t._t=setTimeout(()=>t.hidden=true,1800); }
  function modal(html){ $('#modalBody').innerHTML=html; $('#modalMask').hidden=false; }
  $('#modalClose').onclick=()=>$('#modalMask').hidden=true;
  $('#modalMask').onclick=e=>{ if(e.target.id==='modalMask') $('#modalMask').hidden=true; };

  function allChapters(){ const out=[]; TEXTBOOK.forEach(b=>b.chapters.forEach(c=>out.push({...c,book:b.name}))); return out; }
  function getChapter(id){ return allChapters().find(c=>c.id===id); }
  function chapterWeight(name){
    const m={'函数':'函数与导数','导数':'函数与导数','三角':'三角函数与解三角形','数列':'数列','立体':'立体几何','空间向量':'立体几何','直线':'解析几何','圆':'解析几何','圆锥':'解析几何','概率':'概率统计','统计':'概率统计','复数':'复数/集合/逻辑/向量','集合':'复数/集合/逻辑/向量','逻辑':'复数/集合/逻辑/向量','向量':'复数/集合/逻辑/向量','计数':'概率统计','随机':'概率统计','成对':'概率统计'};
    for(const k in m) if(name.includes(k)) return MODULE_WEIGHT[m[k]];
    return 0.5;
  }
  const freqBadge=f=>f==='高频'?'<span class="badge b-high">高频</span>':f==='中频'?'<span class="badge b-mid">中频</span>':'<span class="badge b-low">低频</span>';
  const diffBadge=d=>d==='易'?'<span class="badge b-easy">易</span>':d==='难'?'<span class="badge b-hard">难</span>':'<span class="badge b-mid">中</span>';
  const typeBadge=t=>t==='核心'?'<span class="badge b-core">核心</span>':t==='拓展'?'<span class="badge b-ext">拓展</span>':'<span class="badge b-basic">基础</span>';

  /* ---------- 导航 ---------- */
  function setView(v){
    state.view=v;
    $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
    const names={dashboard:'总控调度',library:'考点库管理',plan:'复习计划生成',mindmap:'知识点思维导图',mock:'模拟训练(50套)',past:'5年真题解析',lecture:'名师讲堂'};
    $('#crumbs').textContent=names[v]||'';
    $('#modalMask').hidden=true;
    window.scrollTo(0,0);
    render();
    $('#sidebar').classList.remove('open');
  }
  $$('.nav-item').forEach(b=>b.onclick=()=>setView(b.dataset.view));
  $('#menuToggle').onclick=()=>$('#sidebar').classList.toggle('open');

  /* ---------- 总渲染 ---------- */
  function render(){
    const c=$('#content');
    ({dashboard:renderDashboard,library:renderLibrary,plan:renderPlan,mindmap:renderMindmap,mock:renderMock,past:renderPast,lecture:renderLecture}[state.view]||renderDashboard)(c);
  }

  /* ================= 总控调度 ================= */
  function renderDashboard(c){
    const chs=allChapters().length;
    const ptCount=(Object.values(LIBRARY).reduce((s,a)=>s+a.length,0))+(Object.values(LIBRARY_INDEX).reduce((s,a)=>s+a.length,0));
    const stats=[
      ['教材分册','5 册','人教A版2019'],
      ['知识章节',''+chs,'含必修2+选必3'],
      ['内置考点',''+ptCount,'可检索·可导出'],
      ['试卷库','50套模拟卷 + 5年真题','官方格式 · 含答题卡'],
      ['真题解析',''+PAST_ANALYSIS.length+' 题','2021-2025'],
      ['讲堂脚本',''+LECTURES.length+' 篇','知识点/技巧/避坑']
    ];
    c.innerHTML=`
      <div class="section-head">总控调度台</div>
      <div class="section-sub">${esc(META.edition)} ｜ ${esc(META.exam)} ｜ 系统自动匹配六大模块，保障输出标准统一、数据前后打通。</div>
      <div class="grid cols-3">
        ${stats.map(s=>`<div class="stat"><div class="num">${s[1]}</div><div class="lbl">${s[0]}</div><div class="muted" style="font-size:12px">${s[2]}</div></div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title"><span class="bar"></span>六大模块入口</div>
        <div class="grid cols-3">
          ${[
            ['library','▤ 考点库管理','结构化建库 · 考频难度 · 关联映射'],
            ['plan','◷ 复习计划生成','一轮系统 · 二轮专题 · 个性补弱'],
            ['mindmap','⌘ 知识点思维导图','单章 · 跨模块 · 易错对比'],
            ['mock','✎ 模拟训练','单元·模块·高考全真(配答案)'],
            ['past','◳ 5年真题解析','逐题解析 · 考情统计 · 命题趋势'],
            ['lecture','♪ 名师讲堂','精讲 · 技巧 · 避坑脚本']
          ].map(m=>`<div class="card" style="margin:0;cursor:pointer" onclick="setView('${m[0]}')"><div style="font-weight:600;color:var(--c-primary)">${m[1]}</div><div class="muted" style="font-size:13px;margin-top:4px">${m[2]}</div></div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-title"><span class="bar"></span>使用说明（总控提示词0）</div>
        <p class="muted" style="font-size:14px;line-height:1.9">
        ① 顶部导航在六大模块间切换；② 各模块数据相互打通——在<b>考点库</b>勾选薄弱考点可一键送入<b>复习计划·补弱</b>；
        ③ 所有生成结果均按统一结构（标题/表格/标签）输出，严格匹配人教A版与河南新课标Ⅰ卷考情；④ 本系统为纯前端应用，无需联网、无需登录，可离线使用与自由分发。</p>
      </div>`;
  }

  /* ================= 模块一：考点库 ================= */
  function renderLibrary(c){
    const chs=allChapters();
    c.innerHTML=`
      <div class="section-head">模块一 · 考点库管理</div>
      <div class="section-sub">提示词1-3：结构化建库 · 考频难度标注 · 关联映射。支持检索、按章浏览、勾选导出至复习计划。</div>
      <div class="row" style="margin-bottom:14px">
        <input class="input" id="libSearch" placeholder="检索考点名称 / 编号（如 基本不等式 / A0202）" style="max-width:340px">
        <button class="btn btn-primary btn-sm" onclick="Lib.search()">检索</button>
        <button class="btn btn-ghost btn-sm" onclick="Lib.clearSel()">清空勾选</button>
        <span class="muted" id="selCount" style="font-size:13px"></span>
      </div>
      <div class="grid cols-3">
        <div class="card" style="margin:0">
          <div class="card-title"><span class="bar"></span>教材章节</div>
          <div style="max-height:62vh;overflow:auto">
          ${TEXTBOOK.map(b=>`<div style="font-weight:600;color:var(--c-primary);margin:8px 0 4px">${esc(b.name)}</div>
            ${b.chapters.map(ch=>`<div class="row" style="gap:6px;margin:3px 0;align-items:flex-start">
              <input type="checkbox" class="chksel" value="${ch.id}" onchange="Lib.toggleChk(this)">
              <span style="font-size:13.5px;cursor:pointer;flex:1" onclick="Lib.open('${ch.id}')">${esc(ch.name)}</span></div>`).join('')}`).join('')}
          </div>
        </div>
        <div class="card" style="margin:0;grid-column:span 2" id="libMain"></div>
      </div>`;
    Lib.open(state.selChapter||'B1C1');
    $('#libSearch').addEventListener('keydown',e=>{ if(e.key==='Enter') Lib.search(); });
  }
  const Lib={
    open(id){ state.selChapter=id; const ch=getChapter(id); const c=$('#libMain');
      const full=LIBRARY[id]; const idx=LIBRARY_INDEX[id];
      let rows='';
      if(full){ rows=full.map(p=>`<tr>
        <td class="mono">${p.code}</td><td>${esc(p.name)}</td><td>${typeBadge(p.type)}</td><td>${esc(p.level)}</td>
        <td>${freqBadge(p.freq)} ${diffBadge(p.diff)}</td>
        <td style="font-size:13px">${esc(p.core)}</td><td class="mono">${esc(p.page)}</td></tr>`).join(''); }
      else if(idx){ rows=idx.map(r=>`<tr><td class="mono">—</td><td>${esc(r[0])}</td><td>${typeBadge(r[1])}</td><td>${esc(r[2])}</td><td><span class="badge b-low">待标注</span></td><td class="muted">—</td><td class="mono">${esc(r[3])}</td></tr>`).join(''); }
      const relRows = full? full.filter(p=>p.pre||p.rel||p.ext||p.err).map(p=>`<tr><td class="mono">${p.code}</td><td>${esc(p.name)}</td><td>${esc(p.pre||'—')}</td><td>${esc(p.rel||'—')}</td><td>${esc(p.ext||'—')}</td><td style="color:var(--c-danger);font-size:13px">${esc(p.err||'—')}</td></tr>`).join('') : '<tr><td colspan="6" class="muted">该章为索引视图，关联映射详见必修第一册对应章节。</td></tr>';
      c.innerHTML=`
        <div class="card-title"><span class="bar"></span>${esc(ch.name)}</div>
        <div class="row" style="margin-bottom:10px">
          <button class="btn btn-ghost btn-sm" onclick="Lib.tab('list')">① 考点清单</button>
          <button class="btn btn-ghost btn-sm" onclick="Lib.tab('rel')">③ 关联映射</button>
          <button class="btn btn-accent btn-sm" onclick="Lib.sendToPlan()">⌖ 勾选考点送复习计划·补弱</button>
        </div>
        <div id="libTab">
          <div class="table-wrap"><table class="data">
            <thead><tr><th>编号</th><th>考点</th><th>类型</th><th>课标层级</th><th>考频/难度</th><th>核心要素</th><th>页码</th></tr></thead>
            <tbody>${rows}</tbody></table></div>
          <p class="muted" style="font-size:12px;margin-top:8px">注：必修第一册为完整四级考点库（含考频/难度/核心要素/关联）；其余分册提供章节-考点索引，可按提示词1格式同法扩充。</p>
        </div>`;
    },
    tab(t){ if(t==='rel'){ const full=LIBRARY[state.selChapter]; const box=$('#libTab');
        box.innerHTML=`<div class="table-wrap"><table class="data">
          <thead><tr><th>编号</th><th>考点</th><th>前置依赖</th><th>平行关联</th><th>延伸拓展</th><th>易错混淆点</th></tr></thead>
          <tbody>${full.filter(p=>p.pre||p.rel||p.ext||p.err).map(p=>`<tr><td class="mono">${p.code}</td><td>${esc(p.name)}</td><td>${esc(p.pre||'—')}</td><td>${esc(p.rel||'—')}</td><td>${esc(p.ext||'—')}</td><td style="color:var(--c-danger);font-size:13px">${esc(p.err||'—')}</td></tr>`).join('')}</tbody></table></div>`;
      } else Lib.open(state.selChapter); },
    toggleChk(cb){ const id=cb.value; if(cb.checked){ if(!state.pendingPoints.includes(id)) state.pendingPoints.push(id);} else state.pendingPoints=state.pendingPoints.filter(x=>x!==id); $('#selCount').textContent=state.pendingPoints.length?('已勾选 '+state.pendingPoints.length+' 章'):''; },
    clearSel(){ $$('.chksel').forEach(c=>c.checked=false); state.pendingPoints=[]; $('#selCount').textContent=''; },
    search(){ const q=$('#libSearch').value.trim().toLowerCase(); if(!q){ Lib.open(state.selChapter); return; }
      let hit='';
      allChapters().forEach(ch=>{ const full=LIBRARY[ch.id], idx=LIBRARY_INDEX[ch.id];
        const arr = full? full.filter(p=>p.name.toLowerCase().includes(q)||p.code.toLowerCase().includes(q)) : (idx? idx.filter(r=>r[0].toLowerCase().includes(q)).map(r=>({code:'—',name:r[0],type:r[1],level:r[2],core:'—',page:r[3],freq:'—',diff:'—'})) : []);
        if(arr.length) hit+=`<div style="font-weight:600;color:var(--c-primary);margin:10px 0 4px">${esc(ch.name)}</div>`+
          `<div class="table-wrap"><table class="data"><thead><tr><th>编号</th><th>考点</th><th>类型</th><th>层级</th><th>页码</th></tr></thead><tbody>`+
          arr.map(p=>`<tr><td class="mono">${p.code}</td><td>${esc(p.name)}</td><td>${typeBadge(p.type)}</td><td>${esc(p.level)}</td><td class="mono">${esc(p.page)}</td></tr>`).join('')+`</tbody></table></div>`;
      });
      $('#libMain').innerHTML = hit || '<div class="empty">未找到匹配考点，请调整关键词。</div>';
    },
    sendToPlan(){ if(!state.pendingPoints.length){ toast('请先在左侧勾选章节'); return; }
      const codes=[]; state.pendingPoints.forEach(cid=>{ if(LIBRARY[cid]) LIBRARY[cid].forEach(p=>codes.push(p.code)); });
      setView('plan'); setTimeout(()=>Plan.prefillWeak(codes.length?codes:state.pendingPoints),60); }
  };
  window.Lib=Lib;

  /* ================= 模块二：复习计划 ================= */
  function renderPlan(c){
    c.innerHTML=`
      <div class="section-head">模块二 · 复习计划生成</div>
      <div class="section-sub">提示词4-6：一轮系统复习 · 二轮专题突破 · 个性化补弱。参数化生成，可执行、可量化。</div>
      <div class="row" style="margin-bottom:14px">
        <button class="btn btn-primary btn-sm" onclick="Plan.ui('round1')">① 一轮系统复习</button>
        <button class="btn btn-primary btn-sm" onclick="Plan.ui('round2')">② 二轮专题突破</button>
        <button class="btn btn-primary btn-sm" onclick="Plan.ui('weak')">③ 个性化补弱</button>
      </div>
      <div id="planBox"></div>`;
    Plan.ui('round1');
  }
  const Plan={
    ui(mode){ const b=$('#planBox');
      if(mode==='round1'){ b.innerHTML=`
        <div class="card"><div class="card-title"><span class="bar"></span>一轮系统复习计划（提示词4）</div>
          <div class="grid cols-2">
            <div class="field"><label>复习总时长（天）</label><input class="input" id="r1_days" value="180"><span class="hint">高三常规约180天</span></div>
            <div class="field"><label>每周可投入数学（小时）</label><input class="input" id="r1_wk" value="8"></div>
            <div class="field"><label>考生基础</label><select class="select" id="r1_base"><option>薄弱</option><option selected>中等</option><option>优秀</option></select></div>
            <div class="field"><label>起始节点</label><input class="input" id="r1_start" value="2026-09-01"></div>
          </div>
          <button class="btn btn-accent" onclick="Plan.genRound1()">生成本轮计划</button>
        </div><div id="r1_out"></div>`;
      }
      else if(mode==='round2'){ b.innerHTML=`
        <div class="card"><div class="card-title"><span class="bar"></span>二轮专题突破计划（提示词5）</div>
          <div class="grid cols-2">
            <div class="field"><label>二轮总时长（天）</label><input class="input" id="r2_days" value="70"></div>
            <div class="field"><label>每周可投入（小时）</label><input class="input" id="r2_wk" value="12"></div>
            <div class="field"><label>薄弱专题（逗号分隔）</label><input class="input" id="r2_weak" value="函数与导数,解析几何"></div>
            <div class="field"><label>目标分数段</label><select class="select" id="r2_goal"><option>90-110</option><option selected>110-130</option><option>130+</option></select></div>
          </div>
          <button class="btn btn-accent" onclick="Plan.genRound2()">生成本轮计划</button>
        </div><div id="r2_out"></div>`;
      }
      else { b.innerHTML=`
        <div class="card"><div class="card-title"><span class="bar"></span>个性化补弱计划（提示词6）</div>
          <div class="grid cols-2">
            <div class="field"><label>补弱总时长（天）</label><input class="input" id="rw_days" value="21"></div>
            <div class="field"><label>当前→目标分数</label><input class="input" id="rw_score" value="95→120"></div>
          </div>
          <div class="field"><label>选择失分考点（从考点库勾选章节将自动载入；也可手动勾选下列高频易错点）</label>
            <div class="row" id="rw_pts">${weakPointOptions()}</div>
          </div>
          <button class="btn btn-accent" onclick="Plan.genWeak()">生成补弱计划</button>
        </div><div id="rw_out"></div>`;
        if(state.pendingPoints.length) Plan.prefillWeak(state.pendingPoints);
      }
    },
    prefillWeak(ids){ const set=new Set(ids); $$('#rw_pts input').forEach(cb=>{ if(set.has(cb.value)) cb.checked=true; }); toast('已载入考点库勾选的章节考点'); },
    genRound1(){ const days=+$('#r1_days').value, wk=+$('#r1_wk').value, base=$('#r1_base').value, start=$('#r1_start').value;
      const chs=allChapters(); const weights=chs.map(c=>chapterWeight(c.name)); const sum=weights.reduce((a,b)=>a+b,0);
      let d=0; const rows=chs.map((ch,i)=>{ const span=Math.max(1,Math.round(days*weights[i]/sum)); const s=d+1,e=d+span; d=e;
        return {name:ch.name, s, e, w:weights[i]}; });
      const totalH=days/7*wk;
      let html=`<div class="card"><div class="card-title"><span class="bar"></span>高三数学一轮复习总计划（${days}天）</div>
        <div class="row spread" style="background:#F3F6FA;padding:12px 14px;border-radius:8px;margin-bottom:12px">
          <span><b>总时长</b> ${days}天</span><span><b>周投入</b> ${wk}小时</span><span><b>适配基础</b> ${base}</span><span><b>起始</b> ${start}</span><span><b>预计总课时</b> ${totalH.toFixed(0)}h</span></div>
        <div class="table-wrap"><table class="data"><thead><tr><th>序号</th><th>覆盖内容</th><th>时间范围(天)</th><th>权重</th><th>核心目标</th><th>检测节点</th></tr></thead><tbody>`;
      rows.forEach((r,i)=>{ html+=`<tr><td>${i+1}</td><td>${esc(r.name)}</td><td>第${r.s}-${r.e}天</td><td>${r.w.toFixed(2)}</td><td>夯基础·过考点</td><td>第${r.e}天单元检测</td></tr>`; });
      html+=`</tbody></table></div>
        <p class="muted" style="font-size:12.5px;margin-top:10px">分配规则：按各章所属模块高考权重（函数/解析几何权重最高）线性分配天数，高频难点模块占比≥60%；每2周设复盘、每月设模块综合检测，预留10%弹性补弱。单日数学投入≤3小时，可执行性强。</p>
        <div class="card-title" style="margin-top:14px"><span class="bar"></span>单日复习示例（以函数概念章为例）</div>
        <div class="table-wrap"><table class="data"><thead><tr><th>时段</th><th>内容</th><th>时长</th><th>要求</th></tr></thead><tbody>
        <tr><td>上午</td><td>考点回顾+例题精讲</td><td>40min</td><td>梳理核心公式与定义</td></tr>
        <tr><td>下午</td><td>习题巩固</td><td>50min</td><td>基础题+中档题各5道</td></tr>
        <tr><td>晚上</td><td>单元自测+订正</td><td>30min</td><td>错题入本，标注薄弱点</td></tr></tbody></table></div></div>`;
      $('#r1_out').innerHTML=html; window.scrollTo(0,$('#r1_out').offsetTop-60);
    },
    genRound2(){ const days=+$('#r2_days').value, wk=+$('#r2_wk').value, weak=$('#r2_weak').value.split(/[,，]/).map(s=>s.trim()).filter(Boolean), goal=$('#r2_goal').value;
      const topics=[['函数与导数','单调性·极值·导数压轴','分类讨论思想'],['三角与解三角形','恒等变换·正余弦定理','化归思想'],['数列','等差等比·求和·放缩','通项与求和技巧'],['立体几何','平行垂直·二面角','空间向量法'],['解析几何','椭圆·抛物线·综合','设而不求'],['概率统计','分布列·期望·回归','模型识别']];
      const weakSet=new Set(weak); let d=0;
      const rows=topics.map((t,i)=>{ const extra=weakSet.has(t[0])?6:0; const span=Math.max(6,Math.round(days/6)+extra); const s=d+1,e=Math.min(days,d+span); d=e;
        return {t,s,e,weak:weakSet.has(t[0])}; });
      let html=`<div class="card"><div class="card-title"><span class="bar"></span>高三数学二轮专题突破计划（${days}天）· 目标 ${goal} 分</div>
        <div class="table-wrap"><table class="data"><thead><tr><th>专题</th><th>计划天数</th><th>核心题型</th><th>突破重点</th><th>训练安排</th></tr></thead><tbody>`;
      rows.forEach((r,i)=>{ html+=`<tr><td>${'专题'+(i+1)}<br>${esc(r.t[0])}${r.weak?' <span class="badge b-high">薄弱</span>':''}</td><td>第${r.s}-${r.e}天</td><td>${esc(r.t[1])}</td><td>${esc(r.t[2])}</td><td>每天2道真题+1道变式</td></tr>`; });
      html+=`</tbody></table></div>
        <div class="card-title" style="margin-top:14px"><span class="bar"></span>每周训练节奏</div>
        <div class="table-wrap"><table class="data"><thead><tr><th>周次</th><th>周一至周五</th><th>周六</th><th>周日</th></tr></thead><tbody>
        ${[1,2,3,4].map(w=>`<tr><td>第${w}周</td><td>专题考点突破</td><td>限时套卷训练</td><td>错题复盘整理</td></tr>`).join('')}</tbody></table></div>
        <p class="muted" style="font-size:12.5px;margin-top:10px">薄弱专题已自动增配时长；单日刷题量≤15道；所有方法均为高考通用解法。</p></div>`;
      $('#r2_out').innerHTML=html; window.scrollTo(0,$('#r2_out').offsetTop-60);
    },
    genWeak(){ const days=+$('#rw_days').value, score=$('#rw_score').value;
      const sel=$$('#rw_pts input:checked').map(c=>c.value);
      if(!sel.length){ toast('请选择至少一个失分考点'); return; }
      const names=resolveWeakNames(sel);
      let html=`<div class="card"><div class="card-title"><span class="bar"></span>个性化补弱复习计划</div>
        <div class="row spread" style="background:#F3F6FA;padding:12px 14px;border-radius:8px;margin-bottom:12px">
          <span><b>薄弱考点</b> ${sel.length} 个</span><span><b>补弱周期</b> ${days}天</span><span><b>分数目标</b> ${esc(score)}</span><span><b>单日时长</b> ≤90min</span></div>
        <div class="table-wrap"><table class="data"><thead><tr><th>日期</th><th>目标考点</th><th>学习内容</th><th>训练题量</th><th>验收标准</th></tr></thead><tbody>`;
      const per=Math.max(1,Math.ceil(sel.length/days));
      for(let day=1;day<=days;day++){ const i0=(day-1)*per; const batch=sel.slice(i0,i0+per); if(!batch.length) break;
        const nm=batch.map(x=>resolveWeakNames([x])[0]).join('、');
        html+=`<tr><td>第${day}天</td><td>${esc(nm)}</td><td>概念回顾+3道例题拆解</td><td>5道基础题</td><td>正确率≥90%</td></tr>`; }
      html+=`</tbody></table></div>
        <p class="muted" style="font-size:12.5px;margin-top:10px">难度循序渐进（基础→中档），验收标准可量化；补弱内容严格对应失分考点，不做无关拓展。</p></div>`;
      $('#rw_out').innerHTML=html; window.scrollTo(0,$('#rw_out').offsetTop-60);
    }
  };
  function weakPointOptions(){ const opts=[];
    Object.values(LIBRARY).forEach(arr=>arr.forEach(p=>{ if(p.freq==='高频'||p.err) opts.push([p.code,p.name]); }));
    return opts.slice(0,40).map(o=>`<label class="row" style="gap:5px;width:auto;margin:3px 10px 3px 0;font-size:13.5px"><input type="checkbox" value="${o[0]}"> ${esc(o[1])}</label>`).join('');
  }
  function resolveWeakNames(ids){ const map={}; Object.values(LIBRARY).forEach(a=>a.forEach(p=>map[p.code]=p.name));
    TEXTBOOK.forEach(b=>b.chapters.forEach(ch=>{ (LIBRARY_INDEX[ch.id]||[]).forEach(r=>{ const code='IDX'+ch.id+r[0]; map[code]=r[0]; }); }));
    return ids.map(id=>map[id]||id);
  }
  window.Plan=Plan;

  /* ================= 模块三：思维导图 ================= */
  function renderMindmap(c){
    const chs=allChapters();
    c.innerHTML=`
      <div class="section-head">模块三 · 知识点思维导图</div>
      <div class="section-sub">提示词7-9：单章节框架 · 跨模块体系 · 易错易混对比。</div>
      <div class="row" style="margin-bottom:14px">
        <button class="btn btn-primary btn-sm" onclick="MM.ui('chapter')">⑦ 单章节导图</button>
        <button class="btn btn-primary btn-sm" onclick="MM.ui('cross')">⑧ 跨模块体系</button>
        <button class="btn btn-primary btn-sm" onclick="MM.ui('compare')">⑨ 易错对比</button>
      </div>
      <div id="mmBox"></div>`;
    MM.ui('chapter');
  }
  const MM={
    ui(mode){ const b=$('#mmBox');
      if(mode==='chapter'){ b.innerHTML=`<div class="card"><div class="card-title"><span class="bar"></span>单章节知识点思维导图（提示词7）</div>
        <div class="field"><label>选择章节</label><select class="select" id="mm_ch" onchange="MM.chapter(this.value)">${allChapters().map(ch=>`<option value="${ch.id}">${esc(ch.book)} · ${esc(ch.name)}</option>`).join('')}</select></div>
        <div id="mm_ch_out"></div></div>`; MM.chapter('B1C1'); }
      else if(mode==='cross'){ b.innerHTML=`<div class="card"><div class="card-title"><span class="bar"></span>跨模块知识体系思维导图（提示词8）</div>
        <div class="row" id="mm_cross_sel">${[['函数-导数-不等式','func'],['函数-解析几何','geo'],['数列-不等式-函数','seq'],['概率-统计-计数','prob']].map(x=>`<button class="btn btn-ghost btn-sm" onclick="MM.cross('${x[1]}')">${x[0]}</button>`).join('')}</div>
        <div id="mm_cross_out" style="margin-top:12px"></div></div>`; MM.cross('func'); }
      else { b.innerHTML=`<div class="card"><div class="card-title"><span class="bar"></span>易错易混知识点对比思维导图（提示词9）</div>
        <div class="row" id="mm_cmp_sel">${[['函数模块','fn'],['三角函数','tri'],['向量与复数','vec'],['概率统计','prb']].map(x=>`<button class="btn btn-ghost btn-sm" onclick="MM.compare('${x[1]}')">${x[0]}</button>`).join('')}</div>
        <div id="mm_cmp_out" style="margin-top:12px"></div></div>`; MM.compare('fn'); }
    },
    chapter(id){ const ch=getChapter(id); const full=LIBRARY[id], idx=LIBRARY_INDEX[id]; let html=`<div class="mm-node mm-l1">中心主题：${esc(ch.name)}</div>`;
      if(full){ html+=full.map(p=>`<div class="mm-node mm-l2 collapsible" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('hidden')">${esc(p.name)} <span class="muted" style="font-size:12px">${freqBadge(p.freq)}</span></div>
        <div><div class="mm-node mm-l3"><span class="key">核心要素：</span>${esc(p.core)}</div>${p.err?`<div class="mm-node mm-l3"><span class="key" style="color:var(--c-danger)">易错：</span>${esc(p.err)}</div>`:''}</div>`).join(''); }
      else if(idx){ html+=idx.map(r=>`<div class="mm-node mm-l2">${esc(r[0])} ${typeBadge(r[1])} <span class="muted" style="font-size:12px">${esc(r[2])} · ${esc(r[3])}</span></div>`).join(''); }
      $('#mm_ch_out').innerHTML=html;
    },
    cross(k){ const data={
      func:[['基础模块支撑',['函数的性质(单调/奇偶/最值)','导数的几何意义与运算','不等式性质与基本不等式']],['交叉核心考点',['导数研究函数单调性','导数求极值与最值','导数证明不等式']],['核心数学思想',['分类讨论思想','数形结合思想','转化与化归']]],
      geo:[['基础模块支撑',['函数与方程','直线与圆','向量运算']],['交叉核心考点',['解析法设而不求','弦长与面积最值','导数与曲线的切线']],['核心数学思想',['数形结合','函数与方程思想']]],
      seq:[['基础模块支撑',['函数通项与递推','不等式性质','函数单调性']],['交叉核心考点',['数列求和(错位相减/裂项)','数列不等式证明','数列与函数综合']],['核心数学思想',['放缩法','归纳-猜想-证明']]],
      prob:[['基础模块支撑',['计数原理','古典概型','样本估计']],['交叉核心考点',['分布列与期望','二项分布/正态分布','线性回归与独立性检验']],['核心数学思想',['模型识别','数据处理思想']]]
    }; const d=data[k]; let html=`<div class="mm-node mm-l1">中心主题：${k==='func'?'函数-导数-不等式':k==='geo'?'函数-解析几何':k==='seq'?'数列-不等式-函数':'概率-统计-计数'} 综合体系</div>`;
      d.forEach((g,i)=>{ html+=`<div class="mm-node mm-l2">一级分支${i+1}：${g[0]}</div>`+g[1].map(x=>`<div class="mm-node mm-l3">${esc(x)}</div>`).join(''); });
      $('#mm_cross_out').innerHTML=html;
    },
    compare(k){ const data={
      fn:[['奇函数 vs 偶函数',['定义：f(-x)=-f(x) / f(-x)=f(x)','图像：关于原点对称 / y轴','错点：忽略定义域关于原点对称','判断：先查定义域对称再算f(-x)']],['单调区间写法',['错误：(-∞,0)∪(0,+∞)递减','正确：分别在两区间递减','原因：取x1=-1,x2=1即可证伪','判断：用定义逐区间验证']],['复合函数单调性',['规则：同增异减','错误：减∘减直接判减','正确：减∘减=增','判断：画增减表逐层']],['函数定义域',['限制：根号内≥0/分母≠0/log真数>0','错误：漏任一限制','避坑：列限制清单','验证：代入边界检验']]],
      tri:[['sin vs cos 图象',['对称：关于原点/关于y轴','最值点：x=π/2 / x=0','错点：相位平移后混淆','判断：代入特殊角']],['诱导公式符号',['规则：奇变偶不变，符号看象限','错误：角所在象限判错','避坑：把α当锐角看原角象限','验证：用特殊角检验']],['y=Asin(ωx+φ)变换',['先平移后伸缩 vs 先伸缩后平移参数不同','错点：两种顺序φ不一致','避坑：明确顺序再算','验证：取点代入']]],
      vec:[['向量数量积 vs 乘积',['定义：a·b=|a||b|cosθ','错点：当普通数乘','避坑：结果是个数','验证：投影理解']],['向量平行 vs 垂直',['平行：a=λb / x1y2-x2y1=0','垂直：a·b=0','错点：条件混淆','判断：坐标法']]],
      prb:[['二项分布 vs 超几何',['放回 vs 不放回','错点：抽样方式混淆','避坑：看是否放回','验证：期望公式']],['期望 vs 方差',['期望：平均位置','方差：离散程度','错点：单位混淆','验证：D(X)=E(X²)-E²(X)']]]
    }; const d=data[k]; let html='';
      d.forEach(g=>{ html+=`<div class="mm-node mm-l2 collapsible" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('hidden')">对比组：${g[0]}</div><div>`+
        g[1].map(x=>`<div class="mm-node mm-l3">${esc(x)}</div>`).join('')+`</div>`; });
      $('#mm_cmp_out').innerHTML=html;
    }
  };
  window.MM=MM;

  /* ================= 模块四：试卷中心（50套模拟 + 5年真题 + 18套单元卷） ================= */
  function renderMock(c){
    c.innerHTML=`
      <div class="section-head">模块四 · 试卷中心（50套模拟卷 + 5年真题 + 18套单元卷）</div>
      <div class="section-sub">提示词10-13：高考全真模拟卷 50 套（逐题不同、严格对标官方格式）· 2021-2025 新高考Ⅰ卷真题 · 必修/选择性必修 18 章单元达标卷。每套均含：试卷 · 答题卡 · 参考答案与解析。</div>
      <div class="row" style="margin-bottom:14px" id="mockTabs">
        <button class="btn btn-primary btn-sm" data-k="mock" onclick="Mock.tab(this)">高考全真模拟（50套）</button>
        <button class="btn btn-ghost btn-sm" data-k="real" onclick="Mock.tab(this)">历年真题（2021-2025）</button>
        <button class="btn btn-ghost btn-sm" data-k="unit" onclick="Mock.tab(this)">单元达标卷（18章）</button>
        <button class="btn btn-ghost btn-sm" data-k="legacy" onclick="Mock.tab(this)">单元/模块样例</button>
      </div>
      <div id="mockList" class="grid cols-3"></div>
      <div id="mockView"></div>`;
    Mock.tab($('#mockTabs .btn'));
  }
  function paperQHtml(q,showAns){
    let h=`<div class="paper-q"><div class="qh">${q.no}. 【${esc(String(q.type).replace('题',''))}】${q.point?` <span class="tag">${esc(q.point)}分</span>`:''}${q.diff?diffBadge(q.diff):''}${q.topic?` <span class="chip">${esc(q.topic)}</span>`:''}${q.restored?' <span class="chip chip-warn">要点还原</span>':''}</div>
      <div class="qbody">${esc(q.body).replace(/\n/g,'<br>')}</div>`;
    if(q.opts&&q.opts.length){ h+=`<div class="opts">${q.opts.map(o=>`<span>${esc(o)}</span>`).join('')}</div>`; }
    if(showAns){ h+=`<div class="answer-box" style="margin-top:8px"><b style="color:var(--c-success)">答案：</b>${esc(q.ans)}<div style="margin-top:6px" class="muted"><b>解析：</b>${esc(q.explain)}</div></div>`; }
    h+='</div>'; return h;
  }
  const PaperView={
    head(p){ let h=`<div class="paper-head"><div class="ph-secret">${esc(p.header.secret)}</div>
        <div class="ph-exam">${esc(p.header.exam)}</div><div class="ph-subject">${esc(p.header.subject)}</div>
        <div class="ph-volume">${esc(p.header.volume)}</div>
        <div class="ph-meta">${esc(p.header.pages)} · 满分 ${esc(p.header.total)} · 考试用时 ${esc(p.header.time)}</div></div>
      <div class="paper-notice"><div class="pn-title">注意事项：</div>${p.notice.map((n,i)=>`<div class="pn-item">${i+1}. ${esc(n)}</div>`).join('')}</div>`;
      if(p.disclaimer) h+=`<div class="paper-note">※ ${esc(p.disclaimer)}</div>`;
      return h; },
    body(p){
      if(!p.sections){ return `<div class="paper-note" style="margin-bottom:12px">样例卷（单元/模块检测，非高考全真结构），共 ${p.qs.length} 题。</div>`+p.qs.map(q=>paperQHtml(q,false)).join(''); }
      let h=this.head(p);
      p.sections.forEach(sec=>{ h+=`<div class="paper-sec"><div class="paper-sec-title">${esc(sec.title)}<span class="paper-sec-pt">（共 ${sec.total} 分）</span></div>
        <div class="paper-sec-sub">${esc(sec.sub)}</div>${sec.qs.map(q=>paperQHtml(q,false)).join('')}</div>`; });
      return h;
    },
    card(p){
      if(!p.sections){ return `<div class="paper-note">样例卷不提供答题卡。</div>`; }
      let h=`<div class="ans-card"><div class="ac-head">答题卡</div>
        <div class="ac-info">
          <div class="ac-row"><span>姓名：<i class="fill"></i></span><span>准考证号：<i class="fill wide"></i></span></div>
          <div class="ac-row"><span>考场号：<i class="fill"></i></span><span>座位号：<i class="fill"></i></span></div>
          <div class="ac-barcode">条形码粘贴区</div>
        </div>
        <div class="ac-fill-demo">正确填涂：<span class="bubble on">●</span>　错误填涂：<span class="bubble">✕</span>　请使用 2B 铅笔填涂，修改时用橡皮擦干净</div>`;
      p.sections.forEach(sec=>{
        const t=sec.qtype;
        h+=`<div class="ac-sec"><div class="ac-sec-title">${esc(sec.title)}</div>`;
        if(t==='单项选择题'||t==='多项选择题'){
          h+=`<div class="ac-grid">${sec.qs.map(q=>`<div class="ac-cell"><div class="ac-no">${q.no}</div><div class="ac-opts">${['A','B','C','D'].map(L=>`<span class="bubble">${L}</span>`).join('')}</div></div>`).join('')}</div>`;
        }else if(t==='填空题'){
          sec.qs.forEach(q=>{ h+=`<div class="ac-fillrow">第 ${q.no} 题：<span class="fillline"></span></div>`; });
        }else{
          sec.qs.forEach(q=>{ h+=`<div class="ac-answerbox"><div class="ac-answerbox-no">第 ${q.no} 题（${q.point}分）</div><div class="ac-answerbox-area"></div></div>`; });
        }
        h+=`</div>`;
      });
      h+=`</div>`; return h;
    },
    key(p){
      if(!p.sections){ return p.qs.map(q=>paperQHtml(q,true)).join(''); }
      let h=`<div class="key-head">参考答案与解析</div>`;
      p.sections.forEach(sec=>{
        const t=sec.qtype;
        if(t==='单项选择题'||t==='多项选择题'||t==='填空题'){
          h+=`<div class="key-table-wrap"><table class="key-ans-table"><caption>${esc(sec.title)} 答案</caption><tr>${sec.qs.map(q=>`<th>${q.no}</th>`).join('')}</tr><tr>${sec.qs.map(q=>`<td>${esc(q.ans)}</td>`).join('')}</tr></table></div>`;
        }
      });
      p.sections.forEach(sec=>{
        h+=`<div class="paper-sec" style="margin-top:6px"><div class="paper-sec-title">${esc(sec.title)} · 逐题解析</div>`;
        sec.qs.forEach(q=>{
          h+=`<div class="paper-q"><div class="qh">${q.no}. 【${esc(String(q.type).replace('题',''))}】${q.point?` <span class="tag">${esc(q.point)}分</span>`:''}${q.diff?diffBadge(q.diff):''}${q.restored?' <span class="chip chip-warn">要点还原</span>':''}</div>
            <div class="qbody">${esc(q.body).replace(/\n/g,'<br>')}</div>`;
          if(q.opts&&q.opts.length){ h+=`<div class="opts">${q.opts.map(o=>`<span>${esc(o)}</span>`).join('')}</div>`; }
          h+=`<div class="answer-box"><b style="color:var(--c-success)">答案：</b>${esc(q.ans)}<div style="margin-top:6px" class="muted"><b>解析：</b>${esc(q.explain)}</div>`;
          if(q.scoring&&q.scoring.length){ h+=`<div class="score-table"><table><tr><th>评分标准</th><th>分值</th></tr>${q.scoring.map(s=>`<tr><td>${esc(s.s)}</td><td>${s.pt}分</td></tr>`).join('')}<tr class="score-total"><td>合计</td><td>${q.point}分</td></tr></table></div>`; }
          h+=`</div></div>`;
        });
        h+=`</div>`;
      });
      return h;
    }
  };
  const Mock={
    pool(){ return {mock:(window.MOCK_50||[]),real:(window.REAL_PAPERS||[]),unit:(typeof UNIT_PAPERS!=='undefined'?UNIT_PAPERS:[]),legacy:(typeof MOCK_PAPERS!=='undefined'?MOCK_PAPERS:[])}; },
    tab(btn){ $$('#mockTabs .btn').forEach(b=>b.className='btn btn-ghost btn-sm'); btn.className='btn btn-primary btn-sm';
      const k=btn.dataset.k,list=this.pool()[k];
      $('#mockView').innerHTML='';
      $('#mockList').innerHTML=list.map(p=>{
        const sub=p.kind==='real'?(p.year+'年 新高考Ⅰ卷真题'):(p.kind==='mock'?'高考全真模拟':(p.kind==='unit'?(p.book||'')+' · '+(p.chapter||'单元卷'):'单元/模块样例'));
        const cnt=p.sections?p.sections.reduce((a,s)=>a+s.qs.length,0):p.qs.length;
        const pts=p.sections?p.sections.reduce((a,s)=>a+s.total,0):'';
        return `<div class="card" style="margin:0;cursor:pointer" onclick="Mock.open('${p.id}')">
          <div style="font-weight:600;color:var(--c-primary)">${esc(p.title)}</div>
          <div class="muted" style="font-size:13px;margin-top:4px">${esc(sub)} · ${p.kind==='unit'?'满分100 · 用时90分钟':'满分150 · 用时120分钟'}</div>
          <div class="muted" style="font-size:12px;margin-top:6px">共 ${cnt} 题 · 含答题卡与标准答案</div></div>`;
      }).join('')||'<div class="empty">该分类暂无试卷</div>';
    },
    find(id){ const p=this.pool(); return p.mock.find(x=>x.id===id)||p.real.find(x=>x.id===id)||p.unit.find(x=>x.id===id)||p.legacy.find(x=>x.id===id); },
    open(id){ const p=this.find(id); if(!p) return;
      const view=$('#mockView'); let tab='paper';
      function render(){
        const content=tab==='paper'?PaperView.body(p):(tab==='card'?PaperView.card(p):PaperView.key(p));
        view.innerHTML=`<div class="card"><div class="card-title"><span class="bar"></span>${esc(p.title)}</div>
          <div class="row spread" style="background:#F3F6FA;padding:10px 14px;border-radius:8px;margin-bottom:12px">
            <div class="row" id="pvTabs">
              <button class="btn ${tab==='paper'?'btn-primary':'btn-ghost'} btn-sm" data-t="paper" onclick="Mock.pv(this)">试卷</button>
              <button class="btn ${tab==='card'?'btn-primary':'btn-ghost'} btn-sm" data-t="card" onclick="Mock.pv(this)">答题卡</button>
              <button class="btn ${tab==='key'?'btn-primary':'btn-ghost'} btn-sm" data-t="key" onclick="Mock.pv(this)">参考答案与解析</button>
            </div>
            ${p.kind==='real'?'<span class="muted" style="font-size:12px">真题整理自公开资料，要点还原题以官方原卷为准</span>':''}
          </div>${content}</div>`;
        window.scrollTo(0,view.offsetTop-60);
      }
      Mock.pv=(b)=>{ tab=b.dataset.t; render(); };
      render();
    }
  };
  window.Mock=Mock;

  /* ================= 模块五：5年真题解析 ================= */
  function renderPast(c){
    c.innerHTML=`
      <div class="section-head">模块五 · 5年真题解析</div>
      <div class="section-sub">提示词14-16：逐题深度解析 · 考情统计 · 命题规律与趋势（2021-2025 河南新课标Ⅰ卷）。</div>
      <div class="row" style="margin-bottom:14px">
        <button class="btn btn-primary btn-sm" onclick="Past.stats()">⑮ 考情统计</button>
        <button class="btn btn-primary btn-sm" onclick="Past.trend()">⑯ 命题趋势</button>
        <button class="btn btn-primary btn-sm" onclick="Past.analysis()">⑭ 逐题解析</button>
      </div>
      <div id="pastBox"></div>`;
    Past.stats();
  }
  const Past={
    stats(){ const s=PAST_STATS; let html=`<div class="card"><div class="card-title"><span class="bar"></span>近5年河南高考数学考情统计（提示词15）</div>
      <div class="table-wrap"><table class="data"><thead><tr><th>模块</th>${s.years.map(y=>`<th>${y}</th>`).join('')}<th>年均</th></tr></thead><tbody>`;
      s.modules.forEach(m=>{ const avg=(m.vals.reduce((a,b)=>a+b,0)/m.vals.length); html+=`<tr><td>${esc(m.name)}</td>${m.vals.map(v=>`<td>${v}</td>`).join('')}<td><b>${avg.toFixed(1)}</b></td></tr>`; });
      html+=`</tbody></table></div>
      <div class="card-title" style="margin-top:14px"><span class="bar"></span>高频考点 TOP10</div>
      <div class="table-wrap"><table class="data"><thead><tr><th>考点</th><th>考查次数</th><th>年均分值</th><th>等级</th></tr></thead><tbody>`;
      s.topPoints.forEach(r=>{ html+=`<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td>${r[2]}</td><td>${freqBadge(r[3].includes('高频')?'高频':r[3].includes('中频')?'中频':'低频')}</td></tr>`; });
      html+=`</tbody></table></div></div>`;
      $('#pastBox').innerHTML=html;
    },
    trend(){ const s=PAST_STATS; $('#pastBox').innerHTML=`<div class="card"><div class="card-title"><span class="bar"></span>近5年命题规律与趋势（提示词16）</div>
      <div class="timeline">${s.trend.map(t=>`<div class="tl-item"><div class="script-block"><div class="t">规律 / 趋势</div>${esc(t)}</div></div>`).join('')}</div>
      <p class="muted" style="font-size:12.5px;margin-top:10px">说明：以上基于2021-2025河南新课标Ⅰ卷真题事实归纳，趋势预测符合新课标改革方向，不使用"必考""必出"等绝对化表述。</p></div>`;
    },
    analysis(){ let html=`<div class="card"><div class="card-title"><span class="bar"></span>真题逐题深度解析（提示词14 · 样例）</div><div class="grid cols-2">`;
      PAST_ANALYSIS.forEach((a,i)=>{ html+=`<div class="card" style="margin:0;cursor:pointer" onclick="Past.detail(${i})">
        <div class="row" style="gap:8px"><span class="badge b-core">${a.year}卷</span><span class="muted" style="font-size:12px">第${a.no}题</span></div>
        <div style="font-size:13.5px;margin-top:6px">${esc(a.q.slice(0,46))}…</div>
        <div class="muted" style="font-size:12px;margin-top:4px">考点：${esc(a.point)}</div></div>`; });
      html+=`</div><p class="muted" style="font-size:12.5px;margin-top:10px">点击查看完整【答案·考点·命题意图·标准解答·常见错解·避坑指南·同类真题链接】。</p></div>`;
      $('#pastBox').innerHTML=html;
    },
    detail(i){ const a=PAST_ANALYSIS[i];
      modal(`<div class="card-title"><span class="bar"></span>${a.year}年河南高考 · 第${a.no}题 深度解析</div>
        <div class="table-wrap"><table class="data"><tbody>
        <tr><th style="width:90px">原题</th><td>${esc(a.q)}</td></tr>
        ${a.opts&&a.opts.length?`<tr><th>选项</th><td>${a.opts.map(o=>esc(o)).join('　')}</td></tr>`:''}
        <tr><th>答案</th><td><b style="color:var(--c-success)">${esc(a.ans)}</b></td></tr>
        <tr><th>考点</th><td>${esc(a.point)}</td></tr>
        <tr><th>命题意图</th><td>${esc(a.intent)}</td></tr>
        <tr><th>标准解答</th><td>${esc(a.solve)}</td></tr>
        <tr><th>常见错解</th><td style="color:var(--c-danger)">${esc(a.wrong)}</td></tr>
        <tr><th>避坑指南</th><td>${esc(a.tip)}</td></tr>
        <tr><th>同类真题</th><td class="muted">${esc(a.link)}</td></tr>
        </tbody></table></div>`);
    }
  };
  window.Past=Past;

  /* ================= 模块六：名师讲堂 ================= */
  function renderLecture(c){
    c.innerHTML=`
      <div class="section-head">模块六 · 名师视频讲坛</div>
      <div class="section-sub">真实讲课视频 · 来源哔哩哔哩公开教学视频（已授权公开嵌入）· 共 ${LECTURES.length} 课，贯穿全套人教A版高中数学。点击课程即可在系统内观看，也可前往原站支持 UP 主。</div>
      <div class="row" style="margin-bottom:14px" id="lecTabs">
        <button class="btn btn-primary btn-sm" data-c="all" onclick="Lec.filter(this)">全部（${LECTURES.length}）</button>
        <button class="btn btn-ghost btn-sm" data-c="精讲" onclick="Lec.filter(this)">精讲（${LECTURES.filter(l=>l.cat==='精讲').length}）</button>
        <button class="btn btn-ghost btn-sm" data-c="技巧" onclick="Lec.filter(this)">技巧（${LECTURES.filter(l=>l.cat==='技巧').length}）</button>
        <button class="btn btn-ghost btn-sm" data-c="避坑" onclick="Lec.filter(this)">避坑（${LECTURES.filter(l=>l.cat==='避坑').length}）</button>
      </div>
      <div id="lecList" class="grid cols-3"></div>
      <div id="lecView"></div>`;
    Lec._filter='all';
    Lec.renderList();
    Lec.open(LECTURES[0].id);
  }
  const Lec={
    _filter:'all',
    filter(btn){ $$('#lecTabs .btn').forEach(b=>b.className='btn btn-ghost btn-sm'); btn.className='btn btn-primary btn-sm'; this._filter=btn.dataset.c; this.renderList();
      const list=LECTURES.filter(l=>this._filter==='all'||l.cat===this._filter); if(list[0]) this.open(list[0].id); },
    renderList(){ const list=LECTURES.filter(l=>this._filter==='all'||l.cat===this._filter);
      $('#lecList').innerHTML=list.map(l=>`<div class="card" style="margin:0;cursor:pointer" onclick="Lec.open('${l.id}')">
        <div class="row" style="gap:8px"><span class="badge b-ext">${esc(l.cat)}</span></div>
        <div style="font-weight:600;color:#1E3A5F;margin-top:6px">${esc(l.title)}</div>
        <div class="muted" style="font-size:12px;margin-top:4px">${esc(l.chapter||'')}</div>
        <div class="row" style="gap:6px;margin-top:8px"><span style="font-size:11px;background:rgba(226,162,82,.16);color:#b8801f;padding:2px 8px;border-radius:20px;white-space:nowrap">📺 ${esc(l.teacher)}</span><span style="font-size:11px;background:rgba(30,58,95,.1);color:#1E3A5F;padding:2px 8px;border-radius:20px">B站</span></div>
      </div>`).join('')||'<div class="empty">该分类暂无课程</div>'; },
    open(id){ const l=LECTURES.find(x=>x.id===id); if(!l) return;
      const url='https://www.bilibili.com/video/'+l.bvid;
      $('#lecView').innerHTML=`<div class="card"><div class="card-title"><span class="bar"></span>${esc(l.title)}</div>
        <div class="muted" style="font-size:13px;margin-bottom:10px">${esc(l.chapter||'')} · 主讲：${esc(l.teacher)} · 来源：哔哩哔哩</div>
        <iframe style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;background:#000;margin:4px 0" src="https://player.bilibili.com/player.html?bvid=${l.bvid}&page=${l.page||1}&high_quality=1&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" referrerpolicy="no-referrer"></iframe>
        <div class="row" style="gap:10px;margin-top:10px;flex-wrap:wrap">
          <a class="btn btn-primary btn-sm" href="${url}" target="_blank" rel="noopener">▶ 去哔哩哔哩看原版 / 投币收藏</a>
          <span class="muted" style="font-size:12px;align-self:center">若本页无法播放，请点上方按钮前往原站观看（部分 UP 主设置了禁止嵌入）。</span>
        </div>
        <div style="margin-top:14px;background:rgba(226,162,82,.08);border-radius:10px;padding:12px 16px">
          <div style="font-weight:600;color:#1E3A5F;margin-bottom:6px">本节核心要点</div>
          <ul style="margin:0;padding-left:18px;color:#333;font-size:14px;line-height:1.8">${l.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
        </div></div>`;
      window.scrollTo(0,$('#lecView').offsetTop-60);
    }
  };
  window.Lec=Lec;

  /* ---------- 启动 ---------- */
  render();
})();

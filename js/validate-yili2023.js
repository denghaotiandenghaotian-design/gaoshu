global.REAL_PAPERS=[];
require('./papers-real-core.js');
require('./real-yili-2023.js');
const p=REAL_PAPERS.find(x=>x.id==='yili2023');
let n=0,total=0,errs=[];
p.sections.forEach(sec=>{
  sec.qs.forEach(q=>{
    n++; total+=q.point;
    if(!q.ans && q.ans!==0) errs.push('Q'+n+' missing ans');
    if(sec.qtype==='单项选择题'){
      if(!q.opts||q.opts.length!==4) errs.push('Q'+n+' opts!=4');
      if(!q.explain) errs.push('Q'+n+' missing explain');
    }
    if(q.parts){ const ps=q.parts.reduce((a,b)=>a+b.pt,0); if(ps!==q.point) errs.push('Q'+n+' parts sum '+ps+' != '+q.point); }
    if(q.scoring){ const ss=q.scoring.reduce((a,b)=>a+b.pt,0); if(ss!==q.point) errs.push('Q'+n+' scoring sum '+ss+' != '+q.point); }
  });
});
console.log('questions=',n,'total_points=',total);
console.log('sections total=',p.sections.reduce((a,s)=>a+s.total,0));
console.log('errors=',errs.length?errs:'NONE');

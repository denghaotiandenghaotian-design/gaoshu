/* ============================================================
   papers-gen1.js · 试卷生成核心（第1部分）v3
   工具函数 + 客观题生成器（单选8/多选3/填空3）
   全部模板参数化：每槽位参数组合 ≥50 组，配合 buildMock 全局去重，
   保证 50 套 950 道题两两不同；答案由代码实时计算。
   ============================================================ */

/* ---------- 种子随机与数学工具 ---------- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function rng(i){return mulberry32((i+1)*0x9E3779B9>>>0);}
function ri(r,a,b){return a+Math.floor(r()*(b-a+1));}
function pick(r,a){return a[Math.floor(r()*a.length)];}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=a%b;a=b;b=t;}return a||1;}
function frac(n,d){var g=gcd(n,d);n=n/g;d=d/g;if(d<0){n=-n;d=-d;}return{n:n,d:d};}
function fs(n,d){var f=frac(n,d);if(f.d===1)return ''+f.n;return f.n+'/'+f.d;}
var SQMAP={1:'1',2:'√2',3:'√3',4:'2',5:'√5',6:'√6',7:'√7',8:'2√2',9:'3',12:'2√3',16:'4',18:'3√2',20:'2√5',24:'2√6',25:'5',27:'3√3',32:'4√2',36:'6',45:'3√5',48:'4√3',50:'5√2',75:'5√3',98:'7√2'};
function sq(k){return SQMAP[k]!==undefined?SQMAP[k]:''+k;}
function comb(n,k){if(k<0||k>n)return 0;k=Math.min(k,n-k);var r=1;for(var i=1;i<=k;i++){r=r*(n-k+i)/i;}return Math.round(r);}
function sqroot(k){var s=Math.round(Math.sqrt(k));return s*s===k?''+s:(SQMAP[k]!==undefined?SQMAP[k]:'√'+k);}
function pn(x){return x<0?'−'+(-x):''+x;}

function choose4(r,correct,ds){
  var pool=[String(correct)].concat(ds.map(String)),uniq=[],k=0;
  pool.forEach(function(x){if(uniq.indexOf(x)<0&&uniq.length<4)uniq.push(x);});
  while(uniq.length<4){k++;uniq.push(''+(parseInt(correct,10)||0)+k);}
  for(var i=uniq.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=uniq[i];uniq[i]=uniq[j];uniq[j]=t;}
  return uniq;
}
function letters(opts,correct){var i=opts.indexOf(String(correct));return{opts:opts.map(function(o,j){return String.fromCharCode(65+j)+'. '+o;}),ans:String.fromCharCode(65+i)};}
function Q(type,point,diff,topic,body,opts,ans,explain,scoring){
  var q={type:type,point:point,diff:diff,topic:topic,body:body,ans:ans,explain:explain};
  if(opts)q.opts=opts;if(scoring)q.scoring=scoring;return q;
}

/* ============================================================
   一、单项选择题（8 题 × 5 分）
   ============================================================ */
function s1(r){
  if(ri(r,0,1)===0){
    var p=ri(r,-9,-3),q=p+ri(r,4,9),m=ri(r,1,5),A=[],Bf=[],Bc=[],diff=[],x;
    for(x=p;x<=q;x++)A.push(x);
    A.forEach(function(v){if(v*v>=m*m)Bf.push(v);if(v*v<=m*m)Bc.push(v);});
    A.forEach(function(v){if(Bf.indexOf(v)<0)diff.push(v);});
    var sA='{'+A.join(',')+'}',sI='{'+Bf.join(',')+'}',sD='{'+diff.join(',')+'}',sC='{'+Bc.join(',')+'}';
    var correct=sI,opts=choose4(r,correct,[sA,sD,sC,'∅']),L=letters(opts,correct);
    return Q('单项选择题',5,'易','集合运算',
      '已知集合 A='+sA+'，B={x | x²'+(m===1?'≥1':'≥'+m*m)+'}，则 A∩B=（　）',
      L.opts,L.ans,'由 x²'+(m===1?'≥1':'≥'+m*m)+' 得 x≤'+(m===1?'−1':'−'+m)+' 或 x≥'+(m===1?'1':''+m)+'，在 A 中满足条件的元素为 '+sI+'，故 A∩B='+sI+'。');
  }
  var s=ri(r,2,9),t=s+ri(r,3,6),u=ri(r,s+1,t-1);
  var correct='('+u+', '+t+')',opts=choose4(r,correct,['('+s+', '+t+')','('+s+', '+u+')','('+u+', +∞)','['+u+', '+t+')']),L=letters(opts,correct);
  return Q('单项选择题',5,'易','集合运算',
    '已知集合 A={x | '+s+'<x<'+t+'}，B={x | x>'+u+'}，则 A∩B=（　）',
    L.opts,L.ans,'A∩B 为同时满足 '+s+'<x<'+t+' 与 x>'+u+' 的部分，即 ('+u+', '+t+')。');
}
function s2(r){
  if(ri(r,0,1)===0){
    var a=ri(r,1,9),b=ri(r,1,9),v=a*a+b*b;
    var correct=''+v,opts=choose4(r,correct,[''+Math.abs(a*a-b*b),''+((a+b)*(a+b)),''+Math.abs(a*a-b*b+1),''+(v+1)]),L=letters(opts,correct);
    return Q('单项选择题',5,'易','复数',
      '已知复数 z='+a+(b>=0?'+':'')+b+'i，则 z·z̄=（　）',
      L.opts,L.ans,'z·z̄=|z|²=a²+b²='+a+'²+'+b+'²='+v+'。');
  }
  var a=ri(r,1,5),b=ri(r,1,5),c=ri(r,1,4),d=ri(r,1,4),den=c*c+d*d,im=b*c-a*d,re=a*c+b*d;
  if(im===0){im=1;d++;den=c*c+d*d;}
  var imS=fs(im,den);
  var correct=imS,opts=choose4(r,correct,[fs(re,den),fs(-im,den),fs(re+im,den),fs(re-im,den)]),L=letters(opts,correct);
  return Q('单项选择题',5,'易','复数',
    '已知复数 z=('+a+'+'+b+'i)/('+c+'+'+d+'i)，则 z 的虚部为（　）',
    L.opts,L.ans,'z=('+a+'+'+b+'i)('+c+'−'+d+'i)/('+den+')=('+re+'+'+im+'i)/'+den+'，故虚部为 '+imS+'。');
}
function s3(r){
  var fam=ri(r,0,2);
  if(fam===0){
    var k=ri(r,1,17);
    var correct='−1',opts=choose4(r,correct,['1','0','2','−2']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','平面向量',
      '已知向量 a=(1,'+k+')，b=('+k+',−1)，若 (a+λb)⊥(a+μb)，则 λμ=（　）',
      L.opts,L.ans,'(a+λb)·(a+μb)=(1+λk)(1+μk)+('+k+'−λ)('+k+'−μ)=(1+'+k+'²)(1+λμ)，由垂直得 1+λμ=0，故 λμ=−1。');
  }
  if(fam===1){
    var C=[[1,2,4],[1,3,6],[2,2,2],[2,3,3],[3,3,2],[4,2,1],[1,4,8],[2,4,4],[4,4,2],[8,4,1],[1,5,10],[2,5,5],[5,5,2],[1,6,12],[2,6,6],[3,6,4],[6,6,2]],P=pick(r,C);
    var m=P[0],n=P[1],ka=P[2],ans=n;
    var correct=''+ans,opts=choose4(r,correct,[''+(-ans),''+(ans+1),''+(ans-1),''+(ans+2)]),L=letters(opts,correct);
    return Q('单项选择题',5,'中','平面向量',
      '已知向量 a=(0,'+m+')，b=('+n+',x)，若 b⊥(b−'+ka+'a)，则 x=（　）',
      L.opts,L.ans,'b·(b−'+ka+'a)='+n+'²+x²−'+ka+'·'+m+'x=x²−'+ka*m+'x+'+n*n+'=(x−'+ans+')²=0，故 x='+ans+'。');
  }
  var p=ri(r,1,9),q=ri(r,1,9),r2=ri(r,1,9),s2=ri(r,1,9),dot=p*r2+q*s2;
  var correct=''+dot,opts=choose4(r,correct,[''+(dot+1),''+Math.max(0,dot-1),''+(p+s2),''+(q+r2)]),L=letters(opts,correct);
  return Q('单项选择题',5,'中','平面向量',
    '已知向量 a=('+p+','+q+')，b=('+r2+','+s2+')，则 a·b=（　）',
    L.opts,L.ans,'a·b='+p+'×'+r2+'+'+q+'×'+s2+'='+dot+'。');
}
function s4(r){
  var fam=ri(r,0,4);
  if(fam===0){
    var tot=100,tries=0,A=-1,n=-1,ans=-1;
    while((ans<1)&&(tries++<15)){A=ri(r,1,5)*10;n=ri(r,1,4)*5;ans=A*n/100;}
    var b=ri(r,10,30),c=100-A-b;if(c<10){c=20;b=100-A-c;}
    var correct=''+ans,opts=choose4(r,correct,[''+Math.round(n*b/100),''+Math.round(n*c/100),''+(ans+1),''+Math.max(1,ans-1)]),L=letters(opts,correct);
    return Q('单项选择题',5,'易','概率统计',
      '某单位共有职工 100 人，其中甲、乙、丙三个部门人数分别为 '+A+'、'+b+'、'+c+'。现采用分层随机抽样的方法从中抽取 '+n+' 人进行体检，则甲部门应抽取的人数为（　）',
      L.opts,L.ans,'按比例抽取：'+n+'×'+A+'/100='+ans+'（人）。');
  }
  if(fam===1){
    var lo=ri(r,1,2),hi=lo+ri(r,5,9),tot2=comb(hi-lo+1,2),cp=0,i,j;
    for(i=lo;i<=hi;i++)for(j=i+1;j<=hi;j++)if(gcd(i,j)===1)cp++;
    var correct=fs(cp,tot2),opts=choose4(r,correct,['1/2','2/3','1/3','3/4']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','概率统计',
      '从 '+lo+' 至 '+hi+' 的 '+(hi-lo+1)+' 个整数中随机取 2 个不同的数，则这 2 个数互质的概率为（　）',
      L.opts,L.ans,'所有取法共 C('+(hi-lo+1)+',2)='+tot2+' 种，其中互质的有 '+cp+' 对，所求概率为 '+fs(cp,tot2)+'。');
  }
  if(fam===2){
    var k=ri(r,3,11),cnt=0,i2,j2;
    for(i2=1;i2<=6;i2++)for(j2=1;j2<=6;j2++)if(i2+j2===k)cnt++;
    var correct=fs(cnt,36),opts=choose4(r,correct,['1/6','1/9','5/36','1/12']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','概率统计',
      '同时掷两枚质地均匀的骰子，则两枚骰子朝上的点数之和为 '+k+' 的概率为（　）',
      L.opts,L.ans,'基本事件总数 6×6=36，和为 '+k+' 的有 '+cnt+' 种，P='+fs(cnt,36)+'。');
  }
  if(fam===3){
    var C=[[1,2,1,3],[2,3,3,5],[1,4,3,4],[1,3,2,5],[3,5,1,2],[2,5,1,4],[1,6,5,6],[2,3,1,2],[3,4,2,5],[1,5,3,7],[2,7,4,5],[5,6,2,3]],P=pick(r,C);
    var correct=fs(P[0]*P[2],P[1]*P[3]),opts=choose4(r,correct,['1/2','1/3','1/6','2/3','3/4','3/8']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','概率统计',
      '甲、乙两人独立地破译同一份密码，甲破译成功的概率为 '+fs(P[0],P[1])+'，乙破译成功的概率为 '+fs(P[2],P[3])+'，则两人都破译成功的概率为（　）',
      L.opts,L.ans,'两人独立，P=P(A)·P(B)='+fs(P[0],P[1])+'×'+fs(P[2],P[3])+'='+correct+'。');
  }
  var red=ri(r,1,4),wh=ri(r,2,6),num=red*wh,den=comb(red+wh,2);
  var correct=fs(num,den),opts=choose4(r,correct,['1/3','1/2','2/5','3/5','2/3']),L=letters(opts,correct);
  return Q('单项选择题',5,'中','概率统计',
    '袋中有 '+red+' 个红球、'+wh+' 个白球，现不放回地随机取出 2 个球，则这 2 个球恰好一红一白的概率为（　）',
    L.opts,L.ans,'P=C('+red+',1)C('+wh+',1)/C('+(red+wh)+',2)='+red+'×'+wh+'/'+den+'='+correct+'。');
}
function s5(r){
  var fam=ri(r,0,4);
  if(fam===0){
    var t=ri(r,-6,6);if(t===0)t=1;
    var num=t*t+t,den=1+t*t;
    var correct=fs(num,den),opts=choose4(r,correct,[fs(-num,den),fs(num+den,den),fs(Math.abs(num-den),den),fs(den,num)]),L=letters(opts,correct);
    return Q('单项选择题',5,'中','三角函数',
      '若 tanθ='+pn(t)+'，则 [sinθ(1+sin2θ)]/(sinθ+cosθ)=（　）',
      L.opts,L.ans,'原式=sinθ(sinθ+cosθ)=sin²θ+sinθcosθ=(tan²θ+tanθ)/(1+tan²θ)='+correct+'。');
  }
  if(fam===1){
    var C=[[1,3,1,3],[1,2,1,4],[-1,2,3,4],[-1,3,2,3],[2,3,1,6],[-2,3,5,6],[3,4,1,8],[-3,4,7,8],[1,5,2,5],[-1,5,3,5]],P=pick(r,C);
    var k=P[0],kd=P[1],num=P[2],den=P[3];
    var correct=fs(num,den),opts=choose4(r,correct,[fs(1-num,den),fs(num+1,den),fs(den,num),fs(num,den+1)]),L=letters(opts,correct);
    return Q('单项选择题',5,'中','三角函数',
      '已知 cos 2θ='+fs(k,kd)+'，则 sin²θ=（　）',
      L.opts,L.ans,'sin²θ=(1−cos2θ)/2=(1−'+fs(k,kd)+')/2='+correct+'。');
  }
  if(fam===2){
    var a=ri(r,2,9),b=ri(r,2,9);
    var correct='2π/'+b,opts=choose4(r,correct,['2π·'+b,'π/'+b,'π·'+b,'2π']),L=letters(opts,correct);
    return Q('单项选择题',5,'易','三角函数',
      '函数 f(x)='+a+'sin('+b+'x) 的最小正周期为（　）',
      L.opts,L.ans,'T=2π/ω=2π/'+b+'。');
  }
  if(fam===3){
    var C2=[[3,4],[4,3],[6,8],[8,6],[5,12],[12,5],[8,15],[15,8],[9,12],[12,9]],P=pick(r,C2);
    var den=Math.round(Math.sqrt(P[0]*P[0]+P[1]*P[1])),correct=fs(P[1],den);
    var opts=choose4(r,correct,[fs(P[0],den),fs(den-P[1],den),fs(P[1]+1,den),fs(P[0]+P[1],den)]),L=letters(opts,correct);
    return Q('单项选择题',5,'中','三角函数',
      '已知角 α 的终边经过点 P('+P[0]+', '+P[1]+')，则 sinα=（　）',
      L.opts,L.ans,'r=√('+P[0]+'²+'+P[1]+'²)='+den+'，sinα=y/r='+correct+'。');
  }
  var C3=[[1,2],[1,3],[2,3],[3,5],[1,4],[3,4],[2,5],[1,5],[4,5],[3,7],[2,7],[5,7]],P=pick(r,C3);
  var correct=fs(P[0],P[1]),opts=choose4(r,correct,['−'+correct,fs(P[1]-P[0],P[1]),fs(P[0]+1,P[1]),fs(P[1],P[0])]),L=letters(opts,correct);
  return Q('单项选择题',5,'易','三角函数',
    '已知 sinα='+correct+'，则 sin(π−α) 的值为（　）',
    L.opts,L.ans,'由诱导公式 sin(π−α)=sinα='+correct+'。');
}
function s6(r){
  var fam=ri(r,0,3);
  if(fam===0){
    var C=[['√2','2√2π'],['√3','3√3π'],['2','8π'],['√5','5√5π'],['2√2','16√2π'],['3','27π'],['√6','6√6π'],['2√3','24√3π'],['2√5','40√5π'],['3√2','54√2π'],['4','64π'],['√10','10√10π']],P=pick(r,C);
    var h=P[0],correct=P[1];
    var opts=choose4(r,correct,['2π','3π','4π','6π','2√3π','3√2π','8√2π','9π']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','立体几何',
      '已知圆柱与圆锥的底面半径相等、侧面积相等，且它们的高均为 '+h+'，则圆锥的体积为（　）',
      L.opts,L.ans,'设底面半径为 r：2πrh=πrl ⇒ l=2h，又 l²=r²+h² ⇒ r²=3h²，V=(1/3)πr²h=πh³='+correct+'。');
  }
  if(fam===1){
    var C2=[[1,'√3π/2'],[2,'4√3π'],[3,'27√3π/2'],[4,'32√3π'],[5,'125√3π/2'],[6,'108√3π'],[7,'343√3π/2'],[8,'256√3π'],[9,'729√3π/2'],[10,'500√3π'],[11,'1331√3π/2'],[12,'864√3π']],P=pick(r,C2);
    var a=P[0],correct=P[1];
    var opts=choose4(r,correct,['√3π','2√3π','3√3π','8π','16π','32π','27π']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','立体几何',
      '棱长为 '+a+' 的正方体的各个顶点都在同一个球面上，则该球的体积为（　）',
      L.opts,L.ans,'球的直径等于正方体体对角线 '+a+'√3，半径 r='+a+'√3/2，V=(4/3)πr³='+correct+'。');
  }
  if(fam===2){
    var r3=ri(r,2,9),h3=ri(r,1,4)*3,V=r3*r3*h3/3;
    var correct=''+V+'π',opts=choose4(r,correct,[''+Math.round(r3*h3)+'π',''+(V+1)+'π',''+Math.round(r3*r3)+'π',''+(V*2)+'π']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','立体几何',
      '已知圆锥的底面半径为 '+r3+'、高为 '+h3+'，则该圆锥的体积为（　）',
      L.opts,L.ans,'V=(1/3)πr²h=(1/3)×'+r3+'²×'+h3+'π='+V+'π。');
  }
  var r4=ri(r,2,9),h4=ri(r,3,9),V2=r4*r4*h4;
  var correct=''+V2+'π',opts=choose4(r,correct,[''+Math.round(r4*h4)+'π',''+(V2+1)+'π',''+Math.round(r4*r4)+'π',''+(V2+2)+'π']),L=letters(opts,correct);
  return Q('单项选择题',5,'易','立体几何',
    '已知圆柱的底面半径为 '+r4+'、高为 '+h4+'，则该圆柱的体积为（　）',
    L.opts,L.ans,'V=πr²h=π×'+r4+'²×'+h4+'='+V2+'π。');
}
function s7(r){
  var fam=ri(r,0,7);
  if(fam===0){
    var b=ri(r,1,6),base2=pick(r,[2,3]);
    var correct='['+2*b+', +∞)',opts=choose4(r,correct,['(−∞, '+2*b+']','['+b+', +∞)','(−∞, '+b+']','['+2*b+', '+3*b+']']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','函数性质',
      '设函数 f(x)='+base2+'^(x²−ax) 在区间 (0, '+b+') 上单调递减，则实数 a 的取值范围是（　）',
      L.opts,L.ans,'y='+base2+'^u 在 R 上递增，需 u=x²−ax 在 (0,'+b+') 上递减，即对称轴 a/2≥'+b+'，得 a≥'+2*b+'。');
  }
  if(fam===1){
    var c=ri(r,1,6),kb=pick(r,[2,3]),ac='−'+c;
    var correct='['+ac+', +∞)',opts=choose4(r,correct,['['+c+', +∞)','(−∞, '+ac+']','[0, +∞)','(−∞, 0]']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','函数性质',
      '已知函数 f(x)= { x−a, x<0；x²+'+kb+'x+'+c+', x≥0 } 在 R 上单调递增，则实数 a 的取值范围是（　）',
      L.opts,L.ans,'两段均递增；在 x=0 处需 −a≤f(0)='+c+'，即 a≥'+ac+'，故 a∈['+ac+', +∞)。');
  }
  if(fam===2){
    var kk=pick(r,[1,3,5]),bb=pick(r,[2,3,4]);
    var correct='1',opts=choose4(r,correct,['−1','0','2']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','函数性质',
      '已知函数 f(x)=x^'+kk+'(a·'+bb+'ˣ−'+bb+'⁻ˣ) 是偶函数，则 a=（　）',
      L.opts,L.ans,'f(−x)=−x^'+kk+'(a·'+bb+'⁻ˣ−'+bb+'ˣ)=x^'+kk+'('+bb+'ˣ−a·'+bb+'⁻ˣ)，与 f(x) 恒等，得 a=1。');
  }
  if(fam===3){
    var m=ri(r,2,8);
    var correct='(1, +∞)',opts=choose4(r,correct,['[1, +∞)','(1, 2)','[2, +∞)','(−∞, 1)']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','函数性质',
      '已知函数 f(x)=lg(x²−2x+'+m+') 的定义域为 R，则实数 m 的取值范围是（　）',
      L.opts,L.ans,'需 x²−2x+'+m+'>0 恒成立，判别式 4−4'+m+'<0，得 m>1。');
  }
  if(fam===4){
    if(ri(r,0,1)===0){
      var m=ri(r,2,8);
      var correct='['+(m-1)+', '+m+']',opts=choose4(r,correct,['['+m+', '+(m+1)+']','['+(m-1)+', +∞)','(−∞, '+(m-1)+']','[0, '+m+']']),L=letters(opts,correct);
      return Q('单项选择题',5,'中','函数性质',
        '函数 f(x)=x²−2x+'+m+' 在区间 [0, 2] 上的值域为（　）',
        L.opts,L.ans,'对称轴 x=1∈[0,2]，最小值 f(1)='+(m-1)+'，最大值 f(0)=f(2)='+m+'，故值域为 ['+(m-1)+', '+m+']。');
    }
    var m=ri(r,2,9);
    var correct='['+(m-1)+', '+(m+3)+']',opts=choose4(r,correct,['['+(m-1)+', '+m+']','['+m+', '+(m+3)+']','['+(m-3)+', '+(m+1)+']','['+(m-1)+', +∞)']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','函数性质',
      '函数 f(x)=x²−2x+'+m+' 在区间 [1, 3] 上的值域为（　）',
      L.opts,L.ans,'对称轴 x=1∈[1,3]，最小值 f(1)='+(m-1)+'，最大值 f(3)=9−6+'+m+'='+(m+3)+'，故值域为 ['+(m-1)+', '+(m+3)+']。');
  }
  if(fam===5){
    var kk=pick(r,[1,3,5,7,9,11]);
    var correct='R 上的增函数',opts=choose4(r,correct,['R 上的减函数','偶函数','周期函数']),L=letters(opts,correct);
    return Q('单项选择题',5,'易','函数性质',
      '函数 f(x)=x^'+kk+'（'+kk+' 为奇数）是（　）',
      L.opts,L.ans,'x 的奇数次幂函数在 R 上单调递增。');
  }
  if(fam===6){
    var a=ri(r,1,9);
    var correct='x='+a,opts=choose4(r,correct,['x='+(a+1),'x='+(a-1),'x=2'+a]),L=letters(opts,correct);
    return Q('单项选择题',5,'易','函数性质',
      '函数 f(x)=x²−'+2*a+'x 的图象的对称轴为（　）',
      L.opts,L.ans,'f(x)=(x−'+a+')²−'+a*a+'，对称轴为 x='+a+'。');
  }
  var k=ri(r,1,9);
  var correct='('+k+', +∞)',opts=choose4(r,correct,['['+k+', +∞)','(−∞, '+k+')','(0, +∞)','['+k+', ∞)']),L=letters(opts,correct);
  return Q('单项选择题',5,'易','函数性质',
    '函数 f(x)=1/√(x−'+k+') 的定义域为（　）',
    L.opts,L.ans,'需 x−'+k+'>0，即 x>'+k+'，故定义域为 ('+k+', +∞)。');
}
function s8(r){
  var fam=ri(r,0,4);
  if(fam===0){
    var C=[[1,'√2'],[2,'√5'],[3,'√10'],[4,'√17'],[5,'√26'],[6,'√37'],[7,'5√2'],[8,'√65'],[9,'√82'],[10,'√101']],P=pick(r,C);
    var correct=P[1],opts=choose4(r,correct,['√2','2','√5','2√2','√3','3','√6','√10']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','圆锥曲线',
      '已知双曲线 C 的虚轴长是实轴长的 '+P[0]+' 倍，则 C 的离心率为（　）',
      L.opts,L.ans,'设实半轴为 a，则 b='+P[0]+'a，e=√(1+b²/a²)=√(1+'+P[0]*P[0]+')='+correct+'。');
  }
  if(fam===1){
    var p2=ri(r,1,10);
    var correct='('+(p2/2)+', 0)',opts=choose4(r,correct,['('+p2+', 0)','(0, '+p2+')','(−'+p2+'/2, 0)','('+p2+', '+p2+')']),L=letters(opts,correct);
    return Q('单项选择题',5,'中','圆锥曲线',
      '抛物线 y²='+2*p2+'x 的焦点坐标为（　）',
      L.opts,L.ans,'y²=2px 的焦点为 (p/2, 0)，此处 p='+p2+'，故焦点为 ('+(p2/2)+', 0)。');
  }
  if(fam===2){
    var p=ri(r,1,4),q=ri(r,1,6),ans=19*p+q;
    var correct=''+ans,opts=choose4(r,correct,[''+(ans-1),''+(ans+1),''+(19*p+2*q),''+(20*p+q)]),L=letters(opts,correct);
    return Q('单项选择题',5,'中','数列',
      '已知数列 {aₙ} 的前 n 项和 Sₙ='+p+'n²+'+q+'n，则 a₁₀=（　）',
      L.opts,L.ans,'aₙ=Sₙ−Sₙ₋₁='+p+'(2n−1)+'+q+'，故 a₁₀='+p+'×19+'+q+'='+ans+'。');
  }
  if(fam===3){
    var a1=ri(r,1,10);
    var correct=''+16*a1,opts=choose4(r,correct,[''+8*a1,''+32*a1,''+16*a1+1,''+4*a1]),L=letters(opts,correct);
    return Q('单项选择题',5,'易','数列',
      '已知等比数列 {aₙ} 中 a₁='+a1+'，公比 q=2，则 a₅=（　）',
      L.opts,L.ans,'a₅=a₁q⁴='+a1+'×16='+16*a1+'。');
  }
  var x1=ri(r,0,4),y1=ri(r,0,5),dx=ri(r,1,5),dy=ri(r,-5,5);
  var correct=fs(dy,dx),opts=choose4(r,correct,[fs(dy+dx,dx),fs(dy-dx,dx),fs(-dy,dx),fs(dy,dx+1)]),L=letters(opts,correct);
  return Q('单项选择题',5,'易','解析几何',
    '过点 ('+x1+', '+y1+') 与 ('+(x1+dx)+', '+(y1+dy)+') 的直线的斜率为（　）',
    L.opts,L.ans,'k=(y₂−y₁)/(x₂−x₁)='+dy+'/'+dx+'='+correct+'。');
}

/* ============================================================
   二、多项选择题（3 题 × 6 分）
   ============================================================ */
function m1(r){
  var fam=ri(r,0,6);
  if(fam===0){
    var k=ri(r,1,7),rk=sq(k),sqk=sq(k),isNum=/^\d+$/.test(sqk);
    var maxv=isNum?''+(2*k*parseInt(sqk)):''+(2*k)+sqk;
    var minv=isNum?''+(-2*k*parseInt(sqk)):'−'+(2*k)+sqk;
    return Q('多项选择题',6,'中','函数与导数',
      '已知函数 f(x)=x³−'+3*k+'x，则下列说法正确的是（　）',
      ['A. f(x) 在 x=−'+rk+' 处取得极大值','B. f(x) 在 (−'+rk+', '+rk+') 上单调递减','C. f(x) 的极小值为 '+minv,'D. 方程 f(x)=0 恰有两个不同的实根'],'ABC',
      'f′(x)=3x²−'+3*k+'=3(x−'+rk+')(x+'+rk+')，故 f 在 x=−'+rk+' 取极大值 '+maxv+'、在 (−'+rk+','+rk+') 递减、极小值为 '+minv+'；f(x)=x(x²−'+3*k+')=0 有 3 个实根，D 错。');
  }
  if(fam===1){
    var c=ri(r,1,9);
    return Q('多项选择题',6,'中','函数与导数',
      '已知函数 f(x)=x³−3x²+'+c+'，则下列说法正确的是（　）',
      ['A. f(x) 的极大值为 '+c,'B. f(x) 在 (0, 2) 上单调递减','C. f(x) 的极小值为 '+(c-4),'D. 方程 f(x)=0 有 3 个不同实根'],'ABCD',
      'f′(x)=3x(x−2)：极大值 f(0)='+c+'，极小值 f(2)='+(c-4)+'；f(−1)='+(c-4)+'<0，f(0)='+c+'>0，f(2)='+(c-4)+'<0，f(3)='+(c+9)+'>0，故图象与 x 轴有 3 个交点。');
  }
  if(fam===2){
    var k=ri(r,1,6),minv=k-k*Math.log(k)-1,minS=minv<0?(k+'−'+k+'ln '+k+'−1'):''+(k-k*Math.log(k)-1);
    return Q('多项选择题',6,'中','函数与导数',
      '已知函数 f(x)=eˣ−'+k+'x，则下列说法正确的是（　）',
      ['A. f(x) 在 (−∞, ln '+k+') 上单调递减','B. f(x) 在 (ln '+k+', +∞) 上单调递增','C. f(x) 的最小值为 '+k+'−'+k+'ln '+k,'D. f(x)≥0 恒成立'],'ABC',
      'f′(x)=eˣ−'+k+'，减区间 (−∞, ln '+k+')、增区间 (ln '+k+', +∞)，最小值 f(ln '+k+')='+k+'−'+k+'ln '+k+'；当 '+k+'>1 时最小值为负，D 错。');
  }
  if(fam===3){
    var k=ri(r,2,7);
    return Q('多项选择题',6,'中','函数与导数',
      '已知函数 f(x)=ln x−x+'+k+'，则下列说法正确的是（　）',
      ['A. x=1 是 f(x) 的极大值点','B. f(x) 在 (0, 1) 上单调递增','C. f(x) 在 (1, +∞) 上单调递减','D. 方程 f(x)=0 有两个不同的实根'],'ABCD',
      'f′(x)=1/x−1，故 f 在 (0,1) 递增、在 (1,+∞) 递减，x=1 取极大值 f(1)='+(k-1)+'>0；又 x→0⁺ 与 x→+∞ 时 f→−∞，故有两个零点。');
  }
  if(fam===4){
    var a=ri(r,2,3),b=ri(r,1,5);
    return Q('多项选择题',6,'中','函数与导数',
      '已知函数 f(x)=x³−'+3*a+'x²+'+b+'，则下列说法正确的是（　）',
      ['A. f(x) 的极大值为 '+b,'B. f(x) 在 (0, '+2*a+') 上单调递减','C. f(x) 的极小值为 '+(b-4*a*a*a),'D. 方程 f(x)=0 有三个不同的实根'],'ABCD',
      'f′(x)=3x(x−'+2*a+')：极大值 f(0)='+b+'>0，极小值 f('+2*a+')='+(b-4*a*a*a)+'<0，且两端 f→±∞，故图象与 x 轴有 3 个交点。');
  }
  if(fam===5){
    var k=ri(r,1,6);
    return Q('多项选择题',6,'中','函数与导数',
      '已知函数 f(x)=x⁴−'+2*k+'x²，则下列说法正确的是（　）',
      ['A. f(x) 是偶函数','B. f(x) 在 (0, '+sqroot(k)+') 上单调递减','C. f(x) 的最小值为 −'+k*k,'D. f(x) 恰有 2 个极值点'],'ABC',
      'f(−x)=f(x)，偶函数；f′(x)=4x(x²−'+k+')，在 (0,'+sqroot(k)+') 递减；极小值 f(±'+sqroot(k)+')=−'+k*k+'；f′ 有 3 个零点（0、±'+sqroot(k)+'），故有 3 个极值点，D 错。');
  }
  var k=ri(r,1,3),c=ri(r,0,1),ans=(c===0)?'ABCD':'ABD';
  return Q('多项选择题',6,'中','函数与导数',
    '已知函数 f(x)=x³−'+3*k+'x+'+c+'，则下列说法正确的是（　）',
    ['A. 当 '+k+'>0 时 f(x) 有两个极值点','B. 当 '+k+'=0 时 f(x) 在 R 上单调递增','C. 当 '+k+'=0 时 f(x) 是奇函数','D. 当 '+k+'=1 时方程 f(x)=0 有三个不同的实根'],ans,
    'f′(x)=3(x²−'+k+')：'+k+'>0 时有两个零点，A 对；'+k+'=0 时 f′=3x²≥0 且不恒为 0，R 上递增，B 对；'+k+'=0 时 f(x)=x³+'+c+'，'+(c===0?'是奇函数，C 对':'不是奇函数（f(1)=2≠0=f(−1)），C 错')+'；'+k+'=1 时 f(−1)='+(2+c)+'>0、f(1)='+(c-2)+'<0，且两端 f→±∞，故有 3 个实根，D 对。');
}
function m2(r){
  var isCos=ri(r,0,1)===1;
  var P=pick(r,[['π/3',2,8,10],['π/4',3,9,9],['π/6',4,10,8]]),omega=ri(r,2,4),A=ri(r,1,3);
  var phi=P[0],a12=P[1],b12=P[2],lo12=P[3];
  if(!isCos){
    var x0=fs(a12,12*omega)+'π',x1=fs(b12,12*omega)+'π',lo='−'+fs(lo12,12*omega)+'π',hi=fs(a12,12*omega)+'π';
    return Q('多项选择题',6,'中','三角函数',
      '已知函数 f(x)='+A+'sin('+omega+'x+'+phi+')，则下列说法正确的是（　）',
      ['A. f(x) 的最小正周期为 2π/'+omega,'B. f(x) 的图象关于直线 x='+x0+' 对称','C. 点 ('+x1+', 0) 是 f(x) 图象的一个对称中心','D. f(x) 在区间 ['+lo+'+k·2π/'+omega+', '+hi+'+k·2π/'+omega+']（k∈Z）上单调递增'],'ABCD',
      'T=2π/'+omega+'；对称轴 '+omega+'x+'+phi+'=π/2+kπ ⇒ x='+x0+'+kπ/'+omega+'；对称中心 '+omega+'x+'+phi+'=kπ ⇒ x='+x1+'；增区间由 −π/2+2kπ≤'+omega+'x+'+phi+'≤π/2+2kπ 得 ['+lo+'+k·2π/'+omega+', '+hi+'+k·2π/'+omega+']。');
  }
  var f12=a12===2?4:(a12===3?3:2);
  var x0=fs(f12,12*omega)+'π',x1=fs(6+f12,12*omega)+'π',lo=fs(12+f12,12*omega)+'π',hi=fs(24+f12,12*omega)+'π';
  return Q('多项选择题',6,'中','三角函数',
    '已知函数 f(x)='+A+'cos('+omega+'x−'+phi+')，则下列说法正确的是（　）',
    ['A. f(x) 的最小正周期为 2π/'+omega,'B. f(x) 的图象关于直线 x='+x0+' 对称','C. 点 ('+x1+', 0) 是 f(x) 图象的一个对称中心','D. f(x) 在区间 ['+lo+'+k·2π/'+omega+', '+hi+'+k·2π/'+omega+']（k∈Z）上单调递增'],'ABCD',
    'T=2π/'+omega+'；对称轴 '+omega+'x−'+phi+'=kπ ⇒ x='+x0+'+kπ/'+omega+'；对称中心 '+omega+'x−'+phi+'=π/2+kπ ⇒ x='+x1+'；增区间由 '+omega+'x−'+phi+'∈[π+2kπ, 2π+2kπ] 得 ['+lo+'+k·2π/'+omega+', '+hi+'+k·2π/'+omega+']。');
}
function m3(r){
  var fam=ri(r,0,2);
  if(fam===0){
    var a=ri(r,1,6);
    return Q('多项选择题',6,'中','立体几何',
      '已知正方体 ABCD−A₁B₁C₁D₁ 的棱长为 '+a+'，则下列说法正确的是（　）',
      ['A. 直线 BD₁ 与直线 AC 垂直','B. 直线 A₁C₁ 与直线 BD 垂直','C. 直线 A₁B 与平面 ABCD 所成角为 45°','D. 直线 A₁C 与平面 ABCD 所成角为 45°'],'ABC',
      '建系可证 BD₁·AC=0、A₁C₁·BD=0；A₁B 与底面所成角正切为 1，故为 45°；A₁C 与底面所成角正弦为 1/√3，不是 45°，D 错。');
  }
  if(fam===1){
    var d=ri(r,1,6),a1=ri(r,-3,3),tries=0;
    while((a1===0||a1+d===0)&&tries++<10)a1=ri(r,-3,3);
    var P=a1*2+4*d,QQ=a1*2+6*d,a5=a1+4*d,S5=5*a1+10*d;
    return Q('多项选择题',6,'中','数列',
      '已知等差数列 {aₙ} 满足 a₂+a₄='+P+'，a₃+a₅='+QQ+'，则下列说法正确的是（　）',
      ['A. 数列 {aₙ} 的公差为 '+d,'B. a₅='+a5,'C. 数列 {aₙ} 为递增数列','D. S₅='+(S5+1)],'ABC',
      '由 2a₁+4d='+P+'、2a₁+6d='+QQ+' 得 d='+d+'、a₁='+a1+'；a₅=a₁+4d='+a5+'，d>0 递增；S₅=5a₁+10d='+S5+'≠'+(S5+1)+'，D 错。');
  }
  var q=ri(r,2,5),a1=ri(r,1,5),P=a1*(q+q*q*q),QQ=a1*(q*q+q*q*q*q),a3=a1*q*q,S4=a1*(1-q*q*q*q)/(1-q);
  return Q('多项选择题',6,'中','数列',
    '已知等比数列 {aₙ} 满足 a₂+a₄='+P+'，a₃+a₅='+QQ+'，则下列说法正确的是（　）',
    ['A. 数列 {aₙ} 的公比为 '+q,'B. a₁='+a1,'C. a₃='+a3,'D. S₄='+S4],'ABCD',
    'a₃+a₅=q(a₂+a₄)，故 q='+q+'；a₂+a₄=a₁(q+q³)='+P+'，得 a₁='+a1+'，a₃=a₁q²='+a3+'，S₄=a₁(1−q⁴)/(1−q)='+S4+'。');
}

/* ============================================================
   三、填空题（3 题 × 5 分）
   ============================================================ */
function f1(r){
  var fam=ri(r,0,5);
  if(fam===0){
    var x0=ri(r,1,4),p=ri(r,1,8);
    return Q('填空题',5,'中','函数与导数',
      '曲线 y=x²+'+p+'x 在 x='+x0+' 处的切线的斜率为 '+(2*x0+p)+'，则该曲线在此点的纵坐标为____',
      null,''+(x0*x0+p*x0),'y('+x0+')='+x0*x0+'+'+p*x0+'='+(x0*x0+p*x0)+'。');
  }
  if(fam===1){
    var a=ri(r,2,8),m1=a-1,numv=a*a*a-3*a+2;
    var ansv=(numv%3===0)?''+(numv/3):fs(numv,3);
    return Q('填空题',5,'中','函数与导数',
      '函数 f(x)=(1/3)x³−'+a+'x²+('+(a*a-1)+')x 的极大值为____',
      null,ansv,'f′(x)=x²−'+2*a+'x+('+(a*a-1)+')=(x−'+m1+')(x−'+(a+1)+')，极大值在 x='+m1+' 处取得，f('+m1+')='+ansv+'。');
  }
  if(fam===2){
    var m=ri(r,2,8);
    return Q('填空题',5,'中','函数性质',
      '已知函数 f(x)=lg(x²−2x+'+m+') 的定义域为 R，则实数 m 的取值范围是____',
      null,'(1, +∞)','需 x²−2x+'+m+'>0 恒成立，即判别式 4−4'+m+'<0，得 m>1。');
  }
  if(fam===3){
    var x0=ri(r,1,8);
    return Q('填空题',5,'中','函数与导数',
      '曲线 y=x³ 在点 ('+x0+', '+x0*x0*x0+') 处的切线方程为____',
      null,'y='+3*x0*x0+'x−'+2*x0*x0*x0,'y′=3x²，斜率 k=3×'+x0+'²='+3*x0*x0+'，切线 y−'+x0*x0*x0+'='+3*x0*x0+'(x−'+x0+')，即 y='+3*x0*x0+'x−'+2*x0*x0*x0+'。');
  }
  if(fam===4){
    var k=ri(r,1,6);
    return Q('填空题',5,'中','函数与导数',
      '函数 f(x)=x³−'+3*k+'x² 的单调递减区间为____',
      null,'(0, '+2*k+')','f′(x)=3x(x−'+2*k+')，f′(x)<0 时 0<x<'+2*k+'，故递减区间为 (0, '+2*k+')。');
  }
  var c=ri(r,0,8);
  return Q('填空题',5,'中','函数与导数',
    '函数 f(x)=x³−3x+'+c+' 的极大值为____',
    null,''+(2+c),'f′(x)=3(x−1)(x+1)，极大值在 x=−1 处取得，f(−1)='+(-1+3+c)+'='+(2+c)+'。');
}
function f2(r){
  if(ri(r,0,1)===0){
    var k=ri(r,2,5),cff=fs(1+k,1-k);
    var out=cff==='1'?'m':(cff==='−1'?'−m':cff+'m');
    var cc=fs(1,1-k);
    return Q('填空题',5,'中','三角函数',
      '已知 cos(α+β)=m，tanα·tanβ='+k+'，则 cos(α−β)=____',
      null,out,'由 tanαtanβ='+k+' 得 sinαsinβ='+k+'cosαcosβ；cos(α+β)=(1−'+k+')cosαcosβ=m，故 cosαcosβ='+(cc==='1'?'m':(cc==='−1'?'−m':cc+'m'))+'，cos(α−β)=(1+'+k+')cosαcosβ='+out+'。');
  }
  var ma=ri(r,1,5),mb=ri(r,1,5),ab=ri(r,-2,3),s2v=ma*ma+mb*mb+2*ab;
  while(s2v<=0){ab=ab-1;s2v=ma*ma+mb*mb+2*ab;}
  return Q('填空题',5,'中','平面向量',
    '已知向量 a、b 满足 |a|='+ma+'，|b|='+mb+'，a·b='+ab+'，则 |a+b|=____',
    null,sqroot(s2v),'|a+b|²=|a|²+|b|²+2a·b='+ma*ma+'+'+mb*mb+'+'+2*ab+'='+s2v+'，故 |a+b|='+sqroot(s2v)+'。');
}
function f3(r){
  if(ri(r,0,1)===0){
    var a1=ri(r,1,4),d=ri(r,1,3),n=ri(r,1,5)*2+6,Sn=n*a1+n*(n-1)*d/2;
    return Q('填空题',5,'中','数列',
      '已知等差数列 {aₙ} 中 a₁='+a1+'，公差 d='+d+'，则其前 '+n+' 项和 Sₙ 的值为____',
      null,''+Sn,'Sₙ=na₁+n(n−1)d/2='+n+'×'+a1+'+'+n+'×'+d+'×'+(n-1)+'/2='+Sn+'。');
  }
  var C=[[25,16,6],[25,9,8],[169,25,24],[100,64,12],[169,144,10],[289,225,16],[225,81,24],[144,81,6]],P=pick(r,C);
  return Q('填空题',5,'中','圆锥曲线',
    '已知椭圆 x²/'+P[0]+'+y²/'+P[1]+'=1，则其焦距为____',
    null,''+P[2],'c²=a²−b²='+P[0]+'−'+P[1]+'='+((P[2]/2)*(P[2]/2))+'，焦距 2c='+P[2]+'。');
}

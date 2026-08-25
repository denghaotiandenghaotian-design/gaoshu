/* ============================================================
   real-papers.js · 2021-2025 新高考Ⅰ卷数学真题（5 套）
   依据公开网络资料整理：多数题面与答案已核对原文；
   个别题目标注 restored:true（要点还原），正式备考请以官方原卷为准。
   卷型结构：2021-2023 = 8单选+4多选+4填空+6解答（40/20/20/70）
             2024-2025 = 8单选+3多选+3填空+5解答（40/18/15/77）
   ============================================================ */

function RP(paper){
  var no=0;
  paper.sections.forEach(function(sec){
    sec.qs.forEach(function(q){no++;q.no=String(no);q.type=sec.qtype;});
  });
  return paper;
}
function mkSection(title,sub,qtype,qs,total){return{title:title,sub:sub,qtype:qtype,qs:qs,total:total};}

var REAL_PAPERS=[];
var DISCLAIMER='本套真题据公开网络资料整理，题面与答案尽量与官方一致；标注「要点还原」的题目为按考情复原，正式备考请以教育部考试院与河南省教育考试院官方发布原卷为准。';

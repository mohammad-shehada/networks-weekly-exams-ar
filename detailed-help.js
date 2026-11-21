(()=>{'use strict';
const D=window.DETAILED_HELP_DATA;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const steps=items=>`<ol class="help-steps">${items.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`;
const boundary=(text,term)=>{let p=text.toLowerCase().indexOf(term.toLowerCase());while(p>=0){if(!/[a-z0-9]/i.test(text[p-1]||'')&&!/[a-z0-9]/i.test(text[p+term.length]||''))return true;p=text.toLowerCase().indexOf(term.toLowerCase(),p+1)}return false};
function words(text,clue,meaning){const items=[[clue,meaning]],used=[clue.toLowerCase()];for(const [term,ar] of Object.entries(D.glossary).sort((a,b)=>b[0].length-a[0].length)){if(items.length>=4)break;const low=term.toLowerCase();if(!boundary(text,term)||used.some(s=>s.includes(low)||low.includes(s)))continue;items.push([term,ar]);used.push(low)}return `<details class="help-extra help-vocabulary"><summary>معاني الكلمات عند الحاجة</summary><dl>${items.map(([en,ar])=>`<div><dt><bdi>${esc(en)}</bdi></dt><dd>${esc(ar)}</dd></div>`).join('')}</dl></details>`}
function guides(q,index){const S=window.STUDY_DATA;return index===undefined?(S.guides[q.factId||q.id]?[S.guides[q.factId||q.id]]:[]):(S.cases[q.id+':'+index]||[]).map(k=>S.guides[k])}
function render(q,index){
 const isCase=q.type==='case',overview=isCase&&index===undefined,p=index===undefined?q:q.parts[index],detail=isCase?D.cases[q.id]:D.facts[q.factId||q.id],cues=window.STUDY_DATA.caseCues[q.id],clue=isCase?(overview?cues.prompt:cues.parts[index].prompt):detail.clue,clueAr=isCase?D.caseTranslations[clue]:detail.clueAr,g=guides(q,index);
 if(overview)return `<section class="help-stage help-case-overview"><h4>رتّب إجابتك حسب أجزاء الحالة</h4>${steps(q.parts.map((part,j)=>`(${String.fromCharCode(97+j)}) ${part.ar}`))}<p class="help-note">افتح شرح الجزء المطلوب لتشوف طريقة التفكير وإجابته.</p></section>`;
 // Numerical solutions start with the formula. Each guide owns its givens,
 // substitutions, units and result; never repeat them in an introductory list.
 if(g.length)return `<div class="help-math-first">${Study.math(q,index)}</div>${words(p.en,clue,clueAr)}`;
 const ans=isCase?p.model:q.type==='tf'?(q.correct?'True — صحيحة':'False — خاطئة'):q.type==='mcq'?`${String.fromCharCode(65+q.correct)}. ${q.options[q.correct]}`:q.answer;
 const answer=q.type==='tf'?`<mark class="study-answer">${esc(ans)}</mark>`:Study.answer(q,ans,index);
 const logic=!isCase&&detail.steps?steps(detail.steps):`<p>${esc(p.why||detail.meaning)}</p>`;
 let html=`<section class="help-stage question-concept"><h4>${q.type==='tf'&&!q.correct?'وين الخطأ؟':'كيف نفكّر بالسؤال؟'}</h4>${logic}</section>`;
 html+=`<section class="help-final help-key-result"><div class="help-key-label">الإشارة بالسؤال</div><bdi class="help-key"><mark class="study-clue">${esc(clue)}</mark></bdi><div class="help-answer-label">${isCase?'الإجابة النموذجية':'الإجابة'}</div><div class="help-answer" dir="ltr">${answer}</div></section>`;
 if(q.type==='tf')html+=`<section class="help-correction"><strong>المعلومة الصحيحة:</strong><p class="help-completed" dir="ltr">${Study.answer(q,q.statement||detail.statement)}</p></section>`;
 html+=words(p.en,clue,clueAr);
 return html;
}
window.DetailedHelp={render};
})();

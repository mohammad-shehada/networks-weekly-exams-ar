(()=>{'use strict';
const D=window.DETAILED_HELP_DATA;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraph=(title,text,cls='')=>`<section class="help-stage ${cls}"><h4>${esc(title)}</h4><p>${esc(text)}</p></section>`;
const steps=items=>`<ol class="help-steps">${items.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`;
const boundary=(text,term)=>{let p=text.toLowerCase().indexOf(term.toLowerCase());while(p>=0){if(!/[a-z0-9]/i.test(text[p-1]||'')&&!/[a-z0-9]/i.test(text[p+term.length]||''))return true;p=text.toLowerCase().indexOf(term.toLowerCase(),p+1)}return false};
function words(text,clue,meaning){const terms=Object.entries(D.glossary).sort((a,b)=>b[0].length-a[0].length),items=[[clue,meaning]],used=[clue.toLowerCase()];for(const [term,ar] of terms){if(items.length>=5)break;const low=term.toLowerCase();if(!boundary(text,term)||used.some(s=>s.includes(low)||low.includes(s)))continue;items.push([term,ar]);used.push(low)}return `<section class="help-stage help-vocabulary"><h4>خلّينا نفكّك الكلمات المهمة</h4><dl>${items.map(([en,ar],i)=>`<div><dt><bdi>${i===0?`<mark class="study-clue">${esc(en)}</mark>`:esc(en)}</bdi></dt><dd>${esc(ar)}${i===0?'؛ هاي الإشارة المعلّمة في نص السؤال.':''}</dd></div>`).join('')}</dl></section>`}
function guides(q,index){const S=window.STUDY_DATA;return index===undefined?(S.guides[q.factId||q.id]?[S.guides[q.factId||q.id]]:[]):(S.cases[q.id+':'+index]||[]).map(k=>S.guides[k])}
function answerBox(q,text,statement,index){return `<section class="help-stage help-final"><h4>${q.type==='case'?'الإجابة النموذجية':'الإجابة وليش هي المناسبة؟'}</h4><p class="help-answer" dir="ltr">${q.type==='tf'?`<mark class="study-answer">${esc(text)}</mark>`:Study.answer(q,text,index)}</p>${statement?`<h5>${q.type==='tf'?'المعلومة الصحيحة من المادة':'الجملة كاملة بعد الحل'}</h5><p class="help-completed" dir="ltr">${Study.answer(q,statement,index)}</p>`:''}</section>`}
function render(q,index){
 const isCase=q.type==='case',overview=isCase&&index===undefined,p=index===undefined?q:q.parts[index],detail=isCase?D.cases[q.id]:D.facts[q.factId||q.id],cues=window.STUDY_DATA.caseCues[q.id],clue=isCase?(overview?cues.prompt:cues.parts[index].prompt):detail.clue,clueAr=isCase?D.caseTranslations[clue]:detail.clueAr,g=guides(q,index),math=g.length>0;
 let html=paragraph('خلّينا نفهم الموقف أولًا',isCase?q.ar:detail.scene,'help-scene');
 html+=words(p.en,clue,clueAr);
 if(overview){html+=paragraph('شو الحالة بدها منك؟','هاي حالة فيها أكثر من جزء. فرّق بين المعطيات المذكورة وبين تفسير السبب، وافتح شرح كل جزء لتعرف كيف تبني إجابته.');html+=`<section class="help-stage"><h4>كيف نمشي بالحالة؟</h4>${steps(q.parts.map((part,j)=>`الجزء (${String.fromCharCode(97+j)}): ${part.ar}`))}<p>المعطيات المعتمدة هي المذكورة في الحالة. ما بنفترض سبب عطل أو أرقام إضافية من عندنا.</p></section>`;return html;}
 const fact=D.facts[q.factId||q.id];
 let ask=isCase?p.ar:q.type==='tf'?`المطلوب تحكم إذا العبارة التالية صحيحة أو خاطئة حسب المحاضرة: ${q.ar}`:fact?(detail.ask||'المطلوب تحدّد المصطلح أو القيمة اللي بتكمل معنى الوصف التالي: '+fact.promptAr.replace('____','…')):q.ar;
 html+=paragraph('شو السؤال بدّه منك؟',ask);
 if(math){html+=`<section class="help-stage"><h4>كيف نفهم الأرقام ونوصل للجواب؟</h4><p>الإشارة <bdi>${esc(clue)}</bdi> معناها ${esc(clueAr)}. نفصل المعطيات عن المطلوب، ونحدد وحدة كل قيمة قبل التعويض.</p>${steps(g.flatMap(x=>[...x.givens,`القانون المناسب لهذا المطلوب: ${x.formula}`,x.meaning]))}</section>${Study.math(q,index)}`;}
 else{
  const logic=!isCase&&detail.steps?detail.steps:isCase?[`ابدأ من «${clue}»: معناها ${clueAr}.`,detail.parts[index].principle,p.why]:[`ركّز على «${clue}»: معناها ${clueAr}.`,...detail.meaning.split(/(?<=[.!؟])\s+(?=[^\d])/u).filter(Boolean),`إذن المعلومة اللي لازم تكملها هي: ${fact.completedAr}`];
  html+=`<section class="help-stage"><h4>كيف نوصل للجواب خطوة بخطوة؟</h4>${steps(logic)}</section>`;
 }
 const ans=isCase?p.model:q.type==='tf'?(q.correct?'True — العبارة صحيحة':'False — العبارة خاطئة'):q.type==='mcq'?`${String.fromCharCode(65+q.correct)}. ${q.options[q.correct]}`:q.answer;
 const statement=isCase?'':q.statement||fact?.statement||q.en.replace('____',q.answer);
 html+=answerBox(q,ans,statement,index);
 html+=`<section class="help-stage question-concept"><h4>${q.type==='tf'&&!q.correct?'ليش العبارة خاطئة؟':'ليش هذا الجواب؟'}</h4>${q.type==='tf'&&!q.correct?'<p>قارن العبارة الأصلية بالمعلومة الصحيحة فوق. وجود كلمة مألوفة لحاله ما بخلي العبارة صحيحة؛ العلاقة أو المصطلح أو الرقم لازم يطابق المادة.</p>':''}<p>${esc(p.why||detail.meaning)}</p>${!isCase?`<p class="help-conclusion">المعنى بعد إكمال المعلومة: ${esc(fact.completedAr)}</p>`:''}</section>`;
 html+=Study.cue(q,index);
 html+=paragraph('انتبه وإنت بتحلّ',math?'احفظ ارتباط الإشارة بالقانون. النتيجة تتغيّر إذا تغيّرت المعطيات؛ اكتب القانون والتعويض والوحدة، وراجع شروط استخدامه.':q.type==='tf'?'العلامة الصفراء بتذكّرك بالمفهوم الصحيح، لكنها ما بتحدد True أو False لحالها. اقرأ العبارة كلها، وخصوصًا النفي والشروط.':isCase?'جواب الحالة لازم يرتبط بالمعطيات والأدلة المذكورة. لا تضف أرقامًا أو أعطالًا أو متطلبات غير موجودة؛ وإذا المطلوب تشخيص سبب، اربطه بالدليل.':'الكلمة المفتاحية بتساعدك تتذكر العلاقة، وبعدها تأكد إن الجواب بكمل معنى الجملة حسب المادة. اقرأ بقية السؤال وشروطه قبل الاختيار.');
 return html;
}
window.DetailedHelp={render};
})();

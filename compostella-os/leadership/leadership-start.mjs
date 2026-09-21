import {AXES,QUESTIONS,summarize,buildExport,dialogueText} from './leadership-start-logic.mjs';
const $=s=>document.querySelector(s),STORE='compostella-leadership-start-v1';
const answerLabels=[['1','거의 없음'],['2','드물게'],['3','때때로'],['4','자주'],['5','꾸준히'],['na','경험 없음']];
const questions=$('#questions');
for(const [i,q] of QUESTIONS.entries()){
 const field=document.createElement('fieldset');field.className='question';field.dataset.question=i+1;
 field.innerHTML=`<legend><small>${String(i+1).padStart(2,'0')} · ${AXES[q.axis].label}</small>${q.text}</legend><div class="scale">${answerLabels.map(([v,l])=>`<label><input type="radio" name="${q.id}" value="${v}"><span>${v==='na'?'—':v}<br>${l}</span></label>`).join('')}</div>`;
 questions.append(field);
}

function answers(){return Object.fromEntries(QUESTIONS.map(q=>{const v=document.querySelector(`[name="${q.id}"]:checked`)?.value;return [q.id,v==='na'?'na':v?Number(v):undefined]}));}
function snapshot(){return {answers:answers(),evidence:$('#evidence').value.trim(),experienceContext:$('#experience-context').value,confidence:Number($('#confidence').value)};}
function restore(data){if(!data)return;for(const [id,value] of Object.entries(data.answers||{})){const el=document.querySelector(`[name="${id}"][value="${value}"]`);if(el)el.checked=true;}$('#evidence').value=data.evidence||'';$('#experience-context').value=data.experienceContext||'';$('#confidence').value=data.confidence||3;$('#confidence-value').textContent=`${$('#confidence').value} / 5`;}
function persist(){if($('#remember').checked)localStorage.setItem(STORE,JSON.stringify(snapshot()));}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}

$('#start').addEventListener('click',()=>{$('.hero').hidden=true;$('#assessment').hidden=false;window.scrollTo({top:0});});
$('#confidence').addEventListener('input',e=>{$('#confidence-value').textContent=`${e.target.value} / 5`;persist();});
$('#assessment').addEventListener('input',e=>{const field=e.target.closest('.question');if(field){const n=Number(field.dataset.question);$('#progress').value=n;$('#progress-label').textContent=`${n} / 15`;}persist();});
$('#remember').addEventListener('change',e=>{if(e.target.checked)persist();else localStorage.removeItem(STORE);});
$('#clear').addEventListener('click',()=>{localStorage.removeItem(STORE);$('#remember').checked=false;$('#action-status').textContent='';$('#form-error').textContent='이 기기에 저장된 임시 답변을 삭제했습니다. 현재 화면의 답변은 그대로입니다.';});

$('#assessment').addEventListener('submit',e=>{
 e.preventDefault();const data=snapshot();
 if(!data.experienceContext||!data.evidence){$('#form-error').textContent='결과를 실제 행동과 연결하려면 최근 업무 장면과 내가 한 행동을 적어 주세요.';$('.evidence').scrollIntoView({behavior:'smooth'});return;}
 $('#form-error').textContent='';const summary=summarize(data.answers);render(summary,data);$('#assessment').hidden=true;$('#results').hidden=false;window.scrollTo({top:0});persist();
});
function render(summary,data){
 $('#axis-results').innerHTML=Object.values(summary).map(x=>{const state=x.average===null?'미관찰':x.kind==='strength'?'강점 후보':x.kind==='support'?'보완 후보':'검증 필요';const explanation=x.average===null?'유효 응답이 2개 미만입니다. 실제 경험 뒤 다시 살펴보세요.':x.kind==='strength'?'최근 행동에서 자주 관찰된 영역입니다. 다른 사례에서도 반복되는지 확인하세요.':x.kind==='support'?'도움을 받을 구조를 먼저 붙이면 좋을 영역입니다.': '높거나 낮다고 단정하기 전, 실제 업무 증거를 하나 더 모아 보세요.';return `<article class="axis"><span class="tag">${state}</span><h2>${x.label}</h2><div class="score">${x.average===null?'—':x.average}</div><p>${explanation}</p><strong>에이전트 역할 · ${x.role}</strong><p>직접 연습 · ${x.practice}</p></article>`;}).join('');
 $('#dialogue').value=dialogueText(summary,`${data.experienceContext} — ${data.evidence}`,data.confidence);window.currentLeadership=buildExport({...data,evidence:`${data.experienceContext} — ${data.evidence}`});
}
$('#copy').addEventListener('click',async()=>{await navigator.clipboard.writeText($('#dialogue').value);$('#action-status').textContent='대화문을 복사했습니다.';});
$('#download-text').addEventListener('click',()=>download('compostella-leadership-dialogue.txt',$('#dialogue').value,'text/plain;charset=utf-8'));
$('#download-json').addEventListener('click',()=>download('compostella-leadership.json',JSON.stringify(window.currentLeadership,null,2),'application/json'));
$('#edit').addEventListener('click',()=>{$('#results').hidden=true;$('#assessment').hidden=false;window.scrollTo({top:0});});

try{const saved=localStorage.getItem(STORE);if(saved){restore(JSON.parse(saved));$('#remember').checked=true;}}catch{localStorage.removeItem(STORE);}

export const AXES={
 direction:{label:'방향·우선순위',role:'우선순위 대조',practice:'이번 주 하지 않을 일 하나와 그 이유를 직접 적어 본다.'},
 relationships:{label:'경청·관계',role:'고객 맥락 점검',practice:'상대의 말을 내 해석 없이 한 문장으로 되짚어 확인한다.'},
 execution:{label:'실행·성과',role:'납기·후속 확인',practice:'업무 시작 전에 완료 증거와 마감 시각을 먼저 정한다.'},
 delegation:{label:'위임·성장',role:'위임 계약 정리',practice:'맡길 일의 결과물·합격 기준·질문 시점을 한 장에 적는다.'},
 learning:{label:'학습·계승',role:'판단 회고',practice:'예상과 실제가 달랐던 한 지점을 다음 실험으로 바꾼다.'}
};

export const QUESTIONS=[
 ['direction','급한 요청이 겹쳤을 때, 가장 중요한 결과를 먼저 정했다.'],['direction','새 일을 시작하기 전에 하지 않을 일을 분명히 했다.'],['direction','결정의 이유를 함께 일하는 사람이 이해할 말로 설명했다.'],
 ['relationships','상대의 말을 내 해석과 구분해 다시 확인했다.'],['relationships','불편한 의견도 끝까지 듣고 판단에 반영했다.'],['relationships','약속 뒤에 상대가 실제로 겪은 변화를 확인했다.'],
 ['execution','완료라고 부를 기준과 마감을 시작 전에 정했다.'],['execution','진행 중 막힌 일을 드러내고 다음 행동을 정했다.'],['execution','한 번 정한 약속을 끝까지 추적해 결과를 확인했다.'],
 ['delegation','일을 맡길 때 결과물과 판단 기준을 함께 전했다.'],['delegation','중간에 확인할 시점과 도움을 요청할 조건을 합의했다.'],['delegation','수정 결과뿐 아니라 고친 이유를 함께 나눴다.'],
 ['learning','결과가 예상과 달랐을 때 원인을 기록했다.'],['learning','잘된 방식을 다른 실제 사례에 다시 적용해 봤다.'],['learning','실패나 반대 증거를 다음 결정의 기준으로 바꿨다.']
].map(([axis,text],i)=>({id:`q${i+1}`,axis,text}));

export function summarize(answers){
 const out={};
 for(const [axis,meta] of Object.entries(AXES)){
  const values=QUESTIONS.filter(q=>q.axis===axis).map(q=>answers[q.id]).filter(v=>Number.isInteger(v)&&v>=1&&v<=5);
  const average=values.length>=2?Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10:null;
  const kind=average===null?'unobserved':average>=4?'strength':average<=2.5?'support':'verify';
  out[axis]={...meta,average,count:values.length,kind};
 }
 return out;
}

export function buildLeadership({answers,evidence,confidence,completedAt=new Date().toISOString()}){
 const summary=summarize(answers);
 const findings=Object.entries(summary).map(([axis,item])=>{
  const kind=item.kind==='verify'?'unobserved':item.kind;
  const reading=item.average===null?'응답이 2개 미만이라 아직 관찰하지 않은 영역':item.kind==='strength'?`최근 행동 평균 ${item.average}점, 강점 후보`:item.kind==='support'?`최근 행동 평균 ${item.average}점, 보완 후보`:`최근 행동 평균 ${item.average}점, 실제 업무에서 추가 검증 필요`;
  return {axis,kind,observation:`${reading}. 대표자 자기응답이며 자신감 ${confidence}/5.`,evidence_ref:`대표가 선택한 최근 사례: ${evidence}`,source_kind:'founder-reflection'};
 });
 return {instrument:'founder-reflection',completed_at:completedAt,source_ref:'Compostella leadership-start · 대표자 자기응답 원천',findings};
}

export function buildExport(input){
 const leadership=buildLeadership(input);
 return {schema:'compostella-leadership-start/v1',import_expectation:'이 파일의 leadership 값을 founder API의 leadership 필드로 가져오고 expected_revision은 최신 대표 기록의 revision으로 별도 지정합니다.',leadership,raw_response:{answers:input.answers,confidence:input.confidence,evidence:input.evidence,experience_context:input.experienceContext||''}};
}

export function dialogueText(summary,evidence,confidence){
 const lines=Object.values(summary).map(x=>`- ${x.label}: ${x.average===null?'미관찰(유효 응답 2개 미만)':`${x.average}점 · ${x.kind==='strength'?'강점 후보':x.kind==='support'?'보완 후보':'검증 필요'}`}`);
 return `고슴도치, 콤포스텔라 첫 리더십 점검을 마쳤어요.\n이 점수는 능력의 서열이 아니라 최근 행동의 자기관찰입니다.\n\n${lines.join('\n')}\n\n최근 실제 업무 사례: ${evidence}\n이 응답에 대한 자신감: ${confidence}/5\n\n이 사례를 기준으로 강점을 넓힐 에이전트 역할, 부담을 덜 역할, 제가 직접 연습할 행동을 하나씩 제안해 주세요. 점수보다 제가 적은 행동 증거를 우선해서 질문해 주세요.`;
}

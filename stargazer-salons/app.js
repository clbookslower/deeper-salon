const examples={
  "writing": {
    "name": "경험을 콘텐츠로 잇는 에이전트",
    "purpose": "“내가 오래 해온 일을 글로 나누고 싶어요.\n직접 겪지 않은 이야기는 만들지 말아 주세요.”",
    "action": "메모에서 주제를 찾고,\n발행할 글의 초안을 만듭니다",
    "description": "내가 허용한 기록에서 독자에게 도움이 될 경험을 찾습니다. 글의 흐름을 구성하고 원문과 대조해 다듬습니다. 내가 남긴 수정 이유를 다음 콘텐츠에도 반영합니다.",
    "result": "내 경험에서 시작한 콘텐츠 초안",
    "memory": "내 말투·수정 이유·작업 결과를 다음 글의 재료로"
  },
  "work": {
    "name": "전문성을 상품으로 잇는 에이전트",
    "purpose": "“제가 해온 일로 작은 상품을 만들고 싶어요.\n고객에게 실제로 도움이 되는 것부터요.”",
    "action": "경험을 작은 상품으로 묶고,\n고객에게 확인할 질문을 정합니다",
    "description": "내 경험과 자료에서 도울 수 있는 고객과 문제를 정리합니다. 콘텐츠·워크숍·서비스 구성을 비교하고 첫 제안의 초안을 만듭니다. 고객 반응을 기록하면 다음 구성에 반영합니다.",
    "result": "첫 상품 구성과 확인할 가정",
    "memory": "고객 반응·선택 이유를 다음 제안의 기준으로"
  },
  "reading": {
    "name": "고객의 질문을 제안으로 잇는 에이전트",
    "purpose": "“고객이 어려워하는 일을 도울 제안을 만들고 싶어요.\n제가 해줄 수 있는 범위를 분명히 해주세요.”",
    "action": "고객의 질문을 정리하고,\n도울 방법을 제안서로 옮깁니다",
    "description": "내가 사용을 허용한 대화 기록에서 필요한 도움을 찾습니다. 내 경험으로 해결할 수 있는 범위를 나누고 작업 과정과 결과물을 제안합니다. 확인되지 않은 조건은 질문으로 남깁니다.",
    "result": "고객에게 건넬 제안서 초안",
    "memory": "합의한 범위·피드백을 다음 협업의 출발점으로"
  }
};
document.querySelectorAll('[data-example]').forEach(button=>{button.addEventListener('click',()=>{const example=examples[button.dataset.example];document.querySelectorAll('[data-example]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));for(const [key,value] of Object.entries(example)){const target=document.getElementById('example-'+key);if(target){target.replaceChildren(...value.split('\n').flatMap((line,i)=>i?[document.createElement('br'),document.createTextNode(line)]:[document.createTextNode(line)]));}}});});
if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}},{threshold:.06});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}

const SCALES = {
  phq9: {
    id: 'phq9',
    title: 'PHQ-9 抑郁筛查量表',
    desc: '过去两周内下列问题在多大程度上困扰你。',
    options: ['一点也没有(0)', '几天(1)', '一半以上的天数(2)', '几乎每天(3)'],
    questions: [
      { id: 1, text: '做事时提不起劲或没有兴趣' },
      { id: 2, text: '感到心情低落、沮丧或绝望' },
      { id: 3, text: '入睡困难、易醒或睡眠过多' },
      { id: 4, text: '感到疲倦或没有活力' },
      { id: 5, text: '食欲不振或吃得过多' },
      { id: 6, text: '觉得自己很糟糕，或觉得自己失败了，或让自己或家人失望' },
      { id: 7, text: '对事情专注有困难，例如读报或看电视时' },
      { id: 8, text: '动作或说话比平时缓慢，或相反，坐立不安、动来动去' },
      { id: 9, text: '有不如死了或以某种方式伤害自己的念头' }
    ]
  },
  gad7: {
    id: 'gad7',
    title: 'GAD-7 广泛性焦虑量表',
    desc: '过去两周内下列问题在多大程度上困扰你。',
    options: ['一点也没有(0)', '几天(1)', '一半以上的天数(2)', '几乎每天(3)'],
    questions: [
      { id: 1, text: '感到紧张、焦虑或烦躁' },
      { id: 2, text: '无法停止或控制担忧' },
      { id: 3, text: '对各种不同的事情过度担忧' },
      { id: 4, text: '很难放松下来' },
      { id: 5, text: '因焦虑而坐立不安、难以静坐' },
      { id: 6, text: '容易烦恼或易怒' },
      { id: 7, text: '感到害怕，好像会发生不好的事情' }
    ]
  },
  pss10: {
    id: 'pss10',
    title: 'PSS-10 主观压力量表',
    desc: '在过去一个月里，你对以下情况的感觉与想法。',
    options: ['从不(0)', '很少(1)', '有时(2)', '经常(3)', '总是(4)'],
    questions: [
      { id: 1, text: '因为意外发生的事情而感到心烦意乱' },
      { id: 2, text: '觉得自己无法控制生活中的重要事情' },
      { id: 3, text: '感到紧张和压力' },
      { id: 4, text: '对自己个人的事情感到自信', reverse: true },
      { id: 5, text: '觉得事情进展顺利', reverse: true },
      { id: 6, text: '觉得无法应付你必须要做的一切' },
      { id: 7, text: '能够控制烦恼', reverse: true },
      { id: 8, text: '觉得事情都在按照你的意愿进行', reverse: true },
      { id: 9, text: '因为事情超出你的控制而感到生气' },
      { id: 10, text: '觉得困难堆积如山，无法克服' }
    ]
  }
};

const CITATIONS = {
  phq9: [
    { text: 'Kroenke K, Spitzer RL, Williams JBW. The PHQ-9: Validity of a brief depression severity measure. J Gen Intern Med. 2001.', url: 'https://pubmed.ncbi.nlm.nih.gov/11556941/' }
  ],
  gad7: [
    { text: 'Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: The GAD-7. Arch Intern Med. 2006.', url: 'https://pubmed.ncbi.nlm.nih.gov/16717171/' }
  ],
  pss10: [
    { text: 'Cohen S, Kamarck T, Mermelstein R. A global measure of perceived stress. J Health Soc Behav. 1983.', url: 'https://www.jstor.org/stable/2136404' },
    { text: 'Perceived Stress Scale (PSS) - Mind Garden', url: 'https://www.mindgarden.com/132-perceived-stress-scale' }
  ]
};

const state = {
  view: 'home',
  current: null,
  answers: []
};

const el = (id) => document.getElementById(id);

function switchView(v) {
  state.view = v;
  el('view-home').classList.toggle('hidden', v !== 'home');
  el('view-test').classList.toggle('hidden', v !== 'test');
  el('view-result').classList.toggle('hidden', v !== 'result');
}

function renderHome() {
  const container = el('cards-container');
  container.innerHTML = '';
  Object.values(SCALES).forEach((s) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl border border-gray-200 p-5 flex flex-col';
    const btn = `<button data-scale="${s.id}" class="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 w-full">开始</button>`;
    card.innerHTML = `<div class="flex-1">
      <h3 class="font-semibold text-lg">${s.title}</h3>
      <p class="text-gray-600 mt-1">${s.desc}</p>
      <p class="text-xs text-gray-500 mt-2">题量：${s.questions.length}，作答约 ${Math.ceil(s.questions.length*0.7)} 分钟</p>
    </div>${btn}`;
    container.appendChild(card);
  });
  container.querySelectorAll('button[data-scale]').forEach((b) => {
    b.addEventListener('click', () => startTest(b.dataset.scale));
  });
  renderHistory();
  switchView('home');
}

function startTest(scaleId) {
  state.current = SCALES[scaleId];
  state.answers = Array(state.current.questions.length).fill(null);
  renderTest();
  switchView('test');
}

function renderTest() {
  el('test-title').textContent = state.current.title;
  el('test-desc').textContent = state.current.desc;
  const form = el('questions-form');
  form.innerHTML = '';
  state.current.questions.forEach((q, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'bg-white rounded-xl border border-gray-200 p-4';
    const opts = state.current.options
      .map((opt, v) => {
        const name = `q-${idx}`;
        const checked = state.answers[idx] === v ? 'checked' : '';
        return `<label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="${name}" value="${v}" ${checked} class="h-4 w-4 text-emerald-600 border-gray-300" />
          <span class="text-sm">${opt}</span>
        </label>`;
      })
      .join('');
    wrap.innerHTML = `<div class="font-medium mb-3">${idx + 1}. ${q.text}</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">${opts}</div>`;
    form.appendChild(wrap);
  });
  form.querySelectorAll('input[type="radio"]').forEach((r) => {
    r.addEventListener('change', (e) => {
      const [_, idx] = e.target.name.split('-');
      state.answers[Number(idx)] = Number(e.target.value);
      updateProgress();
    });
  });
  el('submit-btn').disabled = true;
  updateProgress();
}

function updateProgress() {
  const total = state.answers.length;
  const answered = state.answers.filter((v) => v !== null).length;
  const pct = Math.round((answered / total) * 100);
  el('progress-bar').style.width = `${pct}%`;
  el('progress-text').textContent = `已回答 ${answered}/${total}`;
  el('submit-btn').disabled = answered !== total;
}

function reversePSS(v) {
  return 4 - v;
}

function gradePHQ9(sum) {
  if (sum <= 4) return { level: '最轻度/无', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (sum <= 9) return { level: '轻度', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
  if (sum <= 14) return { level: '中度', color: 'bg-orange-50 text-orange-800 border-orange-200' };
  if (sum <= 19) return { level: '中重度', color: 'bg-red-50 text-red-700 border-red-200' };
  return { level: '重度', color: 'bg-red-50 text-red-700 border-red-200' };
}

function gradeGAD7(sum) {
  if (sum <= 4) return { level: '最轻度/无', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (sum <= 9) return { level: '轻度', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
  if (sum <= 14) return { level: '中度', color: 'bg-orange-50 text-orange-800 border-orange-200' };
  return { level: '重度', color: 'bg-red-50 text-red-700 border-red-200' };
}

function gradePSS10(sum) {
  if (sum <= 13) return { level: '低压力', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (sum <= 26) return { level: '中等压力', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
  return { level: '高压力', color: 'bg-orange-50 text-orange-800 border-orange-200' };
}

function advisePHQ9(sum) {
  if (sum <= 4) return ['当前抑郁症状较轻，建议继续保持规律作息、适量运动与良好社交。']
  if (sum <= 9) return ['存在轻度抑郁症状，可尝试行为激活、运动与睡眠卫生等自助策略，如持续两周以上或影响功能建议咨询专业人士。']
  if (sum <= 14) return ['存在中度抑郁症状，建议尽快预约专业评估，可考虑认知行为疗法等循证治疗。']
  if (sum <= 19) return ['存在较明显抑郁症状，建议尽快寻求专业帮助，遵循医嘱进行系统治疗与随访。']
  return ['存在重度抑郁症状，请尽快就医进行评估与治疗。如出现自伤想法，请立即联系应急援助。']
}

function adviseGAD7(sum) {
  if (sum <= 4) return ['当前焦虑症状较轻，建议保持健康生活方式与放松训练。']
  if (sum <= 9) return ['存在轻度焦虑症状，可尝试呼吸放松、正念练习与时间管理等方法。']
  if (sum <= 14) return ['存在中度焦虑症状，建议尽快咨询专业人士，系统化开展治疗。']
  return ['存在重度焦虑症状，请尽快就医进行评估与治疗。']
}

function advisePSS10(sum) {
  if (sum <= 13) return ['整体压力水平较低，建议继续保持有效的压力管理方式。']
  if (sum <= 26) return ['处于中等压力水平，建议优化睡眠、运动与社交支持，并合理安排任务优先级。']
  return ['压力水平较高，建议及时调整工作生活节奏，必要时寻求家人、同事与专业人士支持。']
}

function score(scaleId, answers) {
  if (scaleId === 'phq9') {
    const sum = answers.reduce((a, b) => a + b, 0);
    const grade = gradePHQ9(sum);
    const advice = advisePHQ9(sum);
    let safety = null;
    if (answers[8] >= 1) {
      safety = '提示：第9题涉及安全风险。如存在自伤或伤人想法，请立即联系当地应急援助或前往医院急诊。';
    }
    return { sum, max: 27, grade, advice, safety };
  }
  if (scaleId === 'gad7') {
    const sum = answers.reduce((a, b) => a + b, 0);
    const grade = gradeGAD7(sum);
    const advice = adviseGAD7(sum);
    return { sum, max: 21, grade, advice };
  }
  if (scaleId === 'pss10') {
    const scored = answers.map((v, i) => (SCALES.pss10.questions[i].reverse ? reversePSS(v) : v));
    const sum = scored.reduce((a, b) => a + b, 0);
    const grade = gradePSS10(sum);
    const advice = advisePSS10(sum);
    return { sum, max: 40, grade, advice };
  }
  return null;
}

function renderResult(res) {
  el('result-title').textContent = state.current.title;
  el('result-score').textContent = `总分 ${res.sum} / ${res.max}`;
  const sev = el('result-severity');
  sev.className = `mt-1 inline-block px-2 py-1 rounded text-sm border ${res.grade.color}`;
  sev.textContent = res.grade.level;
  const advice = el('result-advice');
  advice.innerHTML = res.advice.map((p) => `<p>${p}</p>`).join('');
  const citations = el('result-citations');
  citations.innerHTML = '';
  (CITATIONS[state.current.id] || []).forEach((c) => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="text-emerald-700 hover:underline" href="${c.url}" target="_blank" rel="noopener">${c.text}</a>`;
    citations.appendChild(li);
  });
  const detail = el('result-detail');
  detail.innerHTML = '';
  state.current.questions.forEach((q, i) => {
    const v = state.answers[i];
    const label = state.current.options[v];
    const item = document.createElement('div');
    item.className = 'rounded-lg border border-gray-200 p-3';
    item.innerHTML = `<div class="text-sm text-gray-600">${i + 1}. ${q.text}</div><div class="mt-1 font-medium">${label}</div>`;
    detail.appendChild(item);
  });
  const safety = el('safety-note');
  if (res.safety) {
    safety.textContent = res.safety;
    safety.classList.remove('hidden');
  } else {
    safety.classList.add('hidden');
  }
  const record = {
    id: state.current.id,
    title: state.current.title,
    sum: res.sum,
    max: res.max,
    level: res.grade.level,
    at: Date.now()
  };
  saveHistory(record);
}

function saveHistory(rec) {
  const key = 'mindself_studio_history';
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : {};
  if (!data[rec.id]) data[rec.id] = [];
  data[rec.id].unshift(rec);
  data[rec.id] = data[rec.id].slice(0, 10);
  localStorage.setItem(key, JSON.stringify(data));
}

function renderHistory() {
  const key = 'mindself_studio_history';
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : {};
  const container = el('history-container');
  container.innerHTML = '';
  let hasAny = false;
  Object.values(SCALES).forEach((s) => {
    const list = data[s.id] || [];
    if (list.length === 0) return;
    hasAny = true;
    const last = list[0];
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl border border-gray-200 p-4';
    const d = new Date(last.at);
    const time = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    card.innerHTML = `<div class="font-medium">${s.title}</div>
      <div class="text-sm text-gray-600 mt-1">上次：${last.sum}/${last.max}（${last.level}） · ${time}</div>
      <div class="mt-3 flex items-center gap-2">
        <button data-scale="${s.id}" class="inline-flex items-center px-3 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50">再次作答</button>
      </div>`;
    container.appendChild(card);
  });
  el('history-block').classList.toggle('hidden', !hasAny);
  container.querySelectorAll('button[data-scale]').forEach((b) => {
    b.addEventListener('click', () => startTest(b.dataset.scale));
  });
}

function handleSubmit(e) {
  e.preventDefault();
  if (state.answers.some((v) => v === null)) return;
  const res = score(state.current.id, state.answers);
  renderResult(res);
  switchView('result');
}

function handleReset() {
  state.answers = Array(state.current.questions.length).fill(null);
  renderTest();
}

function initPrivacy() {
  const modal = el('privacyModal');
  el('privacyBtn').addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });
  el('privacyClose').addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });
}

function init() {
  renderHome();
  initPrivacy();
  el('submit-btn').addEventListener('click', handleSubmit);
  el('reset-btn').addEventListener('click', handleReset);
  el('backHomeFromTest').addEventListener('click', () => switchView('home'));
  el('backHomeFromResult').addEventListener('click', () => switchView('home'));
  el('retakeBtn').addEventListener('click', () => startTest(state.current.id));
  el('printBtn').addEventListener('click', () => window.print());
}

document.addEventListener('DOMContentLoaded', init);

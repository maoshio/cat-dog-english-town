import { DAYS, getDay } from './curriculum.js?v=16';
import { renderPet, petAsset } from './pet.js?v=16';
import { tri, DAY_EN, WORD_ZH } from './i18n.js?v=16';
import { FAMILY_SCENES, getFamilyScene } from './family.js?v=16';

const LABELS = { sister: '姐姐', brother: '弟弟' };
const ROLE_EN = { sister: 'Sister', brother: 'Brother' };
const nameOf = (profile, id) => profile.childName || ROLE_EN[id];
const growth = profile => profile.completed.length < 2 ? 'baby' : profile.completed.length < 5 ? 'young' : 'grown';
const AVATARS = { explorer: ['✦', '探险家'], artist: ['✎', '小画家'], builder: ['▣', '建造师'] };
const TOWN_UPGRADES = {
  home: ['⌂', '温暖小屋'], 'color-house': ['◉', '彩色屋顶'], bridge: ['⌁', '星光小桥'],
  park: ['◍', '游戏广场'], 'toy-shop': ['✧', '玩具宝箱'], 'help-house': ['✦', '友爱小屋'],
};
const EFFECTS = {
  'pet-peek': ['✦', '树叶动了一下！'],
  'pet-run': ['🐾', '宠物朝你跑来了！'],
  'friend-peek': ['✧', '又有一位朋友出现了！'],
  'home-glow': ['✦', '小屋亮起来了！'],
  'house-red': ['🔴', '红色魔法落在屋顶。'],
  'paint-burst': ['🎨', '屋顶变了颜色！'],
  'house-blue': ['🔵', '蓝色魔法飞向窗户。'],
  'window-glow': ['✦', '窗户也亮起来了！'],
  'door-shimmer': ['🚪', '门后传来了声音。'],
  'pet-cross': ['🐾', '宠物跟你过桥了！'],
  'home-reveal': ['🏠', '找到新小屋！'],
  'bridge-open': ['🌉', '通往小镇的新路打开了！'],
  'ball-bounce': ['🏀', '球弹向宠物。'],
  'pet-play': ['🐾', '宠物开始追球！'],
  'pet-jump': ['✨', '宠物跳起来了！'],
  'platform-rise': ['▣', '小台阶搭好了！'],
  'box-wiggle': ['📦', '箱子轻轻晃了一下。'],
  'clue-spark': ['✦', '有新的线索！'],
  'toy-reveal': ['🧸', '找到玩具了！'],
  'friend-happy': ['💛', '小伙伴露出了笑脸。'],
  'friend-wave': ['👋', '小伙伴在向你挥手。'],
  'ladder-build': ['🪜', '一架小梯子搭起来了！'],
  'friend-smile': ['✧', '小伙伴说谢谢！'],
  'square-glow': ['✦', '广场被点亮了！'],
  'lantern-one': ['🏮', '找到第一盏灯。'],
  'lantern-one-glow': ['✦', '第一盏灯亮了！'],
  'pet-parade': ['🐾', '宠物准备参加游行。'],
  'festival-glow': ['🎉', '庆典开始啦！'],
  'review-added': ['💛', '这句我们稍后再试。'],
  'quest-progress': ['✦', '故事又往前走了一步！'],
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function shell(ui, mood, content) {
  const isNight = mood === 'night';
  return `<div class="app app--${ui.view || 'profiles'} ${isNight ? 'app--night' : 'app--day'}">
    <div class="world-bg" aria-hidden="true"></div>
    <div class="world-wash" aria-hidden="true"></div>
    <div class="world-flecks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    ${content}
    ${ui.notice ? `<div class="toast" role="status">${escapeHtml(ui.notice)}</div>` : ''}
  </div>`;
}

function topbar(ui, subtitle = '') {
  return `<header class="topbar">
    <button class="topbar__brand" type="button" data-action="town" aria-label="Back to town"><span class="brand-mark">✦</span><span>PAW TOWN<small>猫狗小镇 · māo gǒu xiǎo zhèn</small></span></button>
    <div class="topbar__chapter">${escapeHtml(subtitle)}</div>
    <nav class="topbar__nav" aria-label="页面导航">
      ${ui.activeProfile ? `<button type="button" class="round-control profile-switch" data-action="profiles" aria-label="Switch player">${escapeHtml(ui.activeName || ROLE_EN[ui.activeProfile])}</button>` : ''}
      <button type="button" class="round-control" data-action="parent" aria-label="Parent settings">⚙</button>
    </nav>
  </header>`;
}

function renderProfiles(state, ui) {
  const cards = ['sister', 'brother'].map((id, index) => {
    const profile = state.profiles[id];
    const src = profile.pet ? petAsset(profile.pet) : petAsset(index ? 'dog' : 'cat');
    const count = profile.completed.length;
    return `<button class="profile-card profile-card--${id} profile-card--${growth(profile)}" type="button" data-action="select-profile" data-profile="${id}">
      <span class="profile-card__glow"></span>
      <img src="${src}" alt="" draggable="false">
      <span class="profile-card__text"><small>ADVENTURE 0${index + 1} · ${growth(profile).toUpperCase()}</small><strong>${tri(ROLE_EN[id], profile.childName || LABELS[id])}</strong><span>${tri(count ? `Continue · ${count} chapters` : 'Enter the town', count ? `继续冒险 · 已完成 ${count} 集` : '进入小镇')}</span></span>
      <span class="profile-card__arrow">↗</span>
    </button>`;
  }).join('');
  return shell(ui, 'day', `${topbar(ui, 'English stories for two explorers')}
    <main class="profile-layout">
      <div class="hero-copy"><p class="eyebrow">A LITTLE WORLD, A BIG ADVENTURE</p><h1 data-say="en" data-text="Speak English. Make magic.">Speak English.<br><em>Make magic.</em></h1>${tri('Raise your own pet and explore one town together.', '养自己的宠物，一起探索小镇。')}<div class="hero-tags"><span>${tri('Story', '故事')}</span><span>${tri('Play', '游戏')}</span><span>${tri('Speak', '开口说')}</span></div></div>
      <div class="profile-stack"><span class="profile-stack__label">${tri('Who is playing today?', '今天谁先出发？')}</span>${cards}</div>
    </main>`);
}

function renderPetChoice(state, ui) {
  const label = LABELS[ui.activeProfile];
  const profile = state.profiles[ui.activeProfile];
  return shell(ui, 'day', `${topbar(ui, `${nameOf(profile,ui.activeProfile)}'s Adventure`)}<main class="choice-layout">
    <div class="choice-heading"><p class="eyebrow">YOUR ADVENTURE COMPANION</p><h1>${tri('Choose your pet', '选择你的宠物')}</h1><p>${tri('Your pet starts tiny and grows with every story.', '宠物从小小的幼崽开始，跟着学习慢慢长大。')}</p></div>
    <div class="avatar-choices" aria-label="Choose a role">${Object.entries(AVATARS).map(([id, [icon, name]]) => `<button type="button" class="avatar-chip ${profile.avatar === id ? 'is-selected' : ''}" data-action="choose-avatar" data-avatar="${id}" aria-pressed="${profile.avatar === id}"><span>${icon}</span>${tri(({explorer:'Explorer',artist:'Artist',builder:'Builder'})[id], name)}</button>`).join('')}</div>
    <div class="pet-choice-grid">
      <button class="pet-choice pet-choice--cat" type="button" data-action="choose-pet" data-species="cat"><span class="pet-choice__halo"></span><img src="${petAsset('cat')}" alt="Cat"><span class="pet-choice__name">${tri('Kitten', '小猫')}<small>${tri('Curious explorer', '好奇的小探险家')}</small></span><span class="pet-choice__cta">${tri('Choose me →', '选它同行')}</span></button>
      <button class="pet-choice pet-choice--dog" type="button" data-action="choose-pet" data-species="dog"><span class="pet-choice__halo"></span><img src="${petAsset('dog')}" alt="Dog"><span class="pet-choice__name">${tri('Puppy', '小狗')}<small>${tri('Happy friend', '热情的小伙伴')}</small></span><span class="pet-choice__cta">${tri('Choose me →', '选它同行')}</span></button>
    </div>
    <button class="text-link" type="button" data-action="profiles">${tri('← Change player', '返回选择孩子')}</button>
  </main>`);
}

function chapterRail(profile) {
  return DAYS.map(day => `<button class="chapter-tile ${profile.completed.includes(day.day) ? 'is-done' : ''} ${day.day === profile.day ? 'is-next' : ''}" type="button" data-action="start-day" data-day="${day.day}" ${day.day > profile.day && !profile.completed.includes(day.day) ? 'disabled' : ''} aria-label="第 ${day.day} 集 ${escapeHtml(day.title)}">
    <span class="chapter-tile__number">${String(day.day).padStart(2, '0')}</span><span class="chapter-tile__dot">${profile.completed.includes(day.day) ? '✓' : day.day === profile.day ? '✦' : '·'}</span>
  </button>`).join('');
}

function renderTown(state, ui) {
  const profile = state.profiles[ui.activeProfile];
  const next = getDay(profile.day) || DAYS[6];
  const otherId = ui.activeProfile === 'sister' ? 'brother' : 'sister';
  const other = state.profiles[otherId];
  const mood = profile.day > 4 ? 'night' : 'day';
  const festival = state.shared.completedBuildings.includes('festival');
  const upgrades = state.shared.completedBuildings.filter(id => TOWN_UPGRADES[id]).map(id => {
    const [icon, label] = TOWN_UPGRADES[id];
    return `<div class="town-upgrade town-upgrade--${id}" aria-label="两人共建：${label}"><span>${icon}</span><small>${label}</small></div>`;
  }).join('');
  return shell(ui, mood, `${topbar(ui, `${escapeHtml(nameOf(profile, ui.activeProfile))}'s Town · ${profile.completed.length}/7 chapters`)}
    <main class="town-layout">
      <section class="town-story glass-card">
        <div class="story-top"><span class="tiny-star">✦</span><span>${tri('Your next story', '你的下一段故事')}</span></div>
        <p class="eyebrow">CHAPTER ${next.day}</p><h1>${tri(DAY_EN[next.day-1][0],next.title)}</h1><p>${tri(DAY_EN[next.day-1][2],next.intro)}</p>
        <div class="story-words">${next.words.map(word => `<span>${wordLabel(word)}</span>`).join('')}</div>
        <button class="primary-button" type="button" data-action="start-day" data-day="${next.day}">${tri(profile.completed.includes(next.day) ? 'Play again →' : profile.checkpoint?.day === next.day ? 'Keep playing →' : 'Start today’s story →', profile.completed.includes(next.day) ? '再玩这一集' : profile.checkpoint?.day === next.day ? '接着玩这一集' : '开始今天的冒险')}</button>
        <div class="chapter-rail" aria-label="七天章节">${chapterRail(profile)}</div>
      </section>
      <div class="town-world" aria-label="可以探索的猫狗小镇">
        ${upgrades}
        <button class="world-hotspot world-hotspot--home" type="button" data-action="explore" data-place="树屋"><span>✦</span><small>${tri('Tree house', '树屋')}</small></button>
        <button class="world-hotspot world-hotspot--bridge" type="button" data-action="explore" data-place="小桥"><span>✧</span><small>${tri('Bridge', '小桥')}</small></button>
        <button class="world-hotspot world-hotspot--cave" type="button" data-action="explore" data-place="星光洞"><span>✦</span><small>${tri('Star cave', '星光洞')}</small></button>
        <div class="town-pets">${other.pet ? `<div class="town-pets__other town-pets__other--${growth(other)}"><img src="${petAsset(other.pet)}" alt="${LABELS[otherId]}的宠物"><small>${escapeHtml(other.nickname) || `${LABELS[otherId]}的伙伴`}</small></div>` : ''}<div class="town-pets__own">${renderPet({ species: profile.pet || 'cat', action: ui.petAction || 'idle', accessory: profile.selectedAccessory || profile.accessories[profile.accessories.length - 1], growth:growth(profile) })}<span class="pet-caption">${tri('Tap me! I will answer.', '点一点我，我会回应你')}</span></div></div>
        ${festival ? '<div class="festival-lights" aria-label="两人一起点亮的小镇庆典">✦ ✧ ✦ ✧ ✦</div>' : ''}
      </div>
      <div class="town-tools"><button type="button" data-action="family"><span>♡</span>${tri('My family', '我的家人')}</button><button type="button" data-action="play"><span>✦</span>${tri('Playground', '自由探索')}</button><button type="button" data-action="closet"><span>✧</span>${tri('My pet', '我的宠物')}</button><button type="button" data-action="parent"><span>▦</span>${tri('Progress', '学习记录')}</button></div>
    </main>`);
}

function renderObject(option) {
  if (option.label === 'cat' || option.label === 'dog') return `<img src="${petAsset(option.label)}" alt="" class="option-pet">`;
  if (['red', 'blue', 'yellow'].includes(option.label)) return `<span class="color-orb color-orb--${option.label}"></span>`;
  return `<span class="option-icon" aria-hidden="true">${option.icon}</span>`;
}

function wordLabel(word) { return tri(word, WORD_ZH[word] || word, 'word-label'); }

function renderStoryProp(day, session, effect) {
  const progress = session.stepIndex;
  const active = name => effect === name ? ' is-acting' : '';
  if (day.day <= 2) {
    const color = day.day === 2 && progress >= 2 ? ' is-painted' : '';
    return `<div class="story-prop story-prop--house${color}${active('home-glow')}${active('paint-burst')}${active('window-glow')}" aria-hidden="true"><img src="./assets/scenes/cottage.png" alt=""><img class="story-prop__tint" src="./assets/scenes/cottage.png" alt=""><span class="story-prop__glow">✦ ✦ ✦</span></div>`;
  }
  if (day.day === 3) return `<div class="story-prop story-prop--bridge${progress >= 2 ? ' is-crossed' : ''}${active('bridge-open')}" aria-hidden="true"><span class="story-prop__arch"></span><span class="story-prop__gate"></span><span class="story-prop__path">✦ ✦ ✦</span></div>`;
  if (day.day === 4) return `<div class="story-prop story-prop--court${active('ball-bounce')}${active('pet-play')}${active('pet-jump')}${active('platform-rise')}" aria-hidden="true"><span class="story-prop__ball"></span><span class="story-prop__blocks"><i></i><i></i><i></i></span></div>`;
  if (day.day === 5) return `<div class="story-prop story-prop--treasure${active('box-wiggle')}${active('toy-reveal')}" aria-hidden="true"><img src="./assets/scenes/treasure-chest.png" alt=""><span class="story-prop__toy">★</span></div>`;
  if (day.day === 6) return `<div class="story-prop story-prop--help${active('ladder-build')}${active('square-glow')}" aria-hidden="true"><span class="story-prop__tower"></span><span class="story-prop__ladder"></span><span class="story-prop__star">✦</span></div>`;
  return `<div class="story-prop story-prop--festival${active('lantern-one-glow')}${active('festival-glow')}" aria-hidden="true"><span class="story-prop__lantern">✦</span><span class="story-prop__lantern">✦</span><span class="story-prop__lantern">✦</span></div>`;
}

function renderStoryActor(effect, ownPet) {
  if (!['pet-peek', 'pet-run', 'friend-peek', 'pet-cross', 'friend-happy', 'friend-wave', 'friend-smile', 'pet-parade'].includes(effect)) return '';
  const species = effect.startsWith('friend') ? ownPet === 'cat' ? 'dog' : 'cat' : ownPet;
  return `<img class="story-actor story-actor--${effect}" src="${petAsset(species)}" alt="">`;
}

function questEnglish(step, quest) {
  if (step.kind === 'hunt') return `Find ${step.sequence[quest.found.length] || step.sequence[0]}.`;
  return step.cueEn;
}

function renderQuest(step, session) {
  const quest = session.quest || { found: [], open: null, matched: [], count: 0, chosen: [] };
  if (step.kind === 'hunt') {
    const found = new Set(quest.found);
    return `<div class="quest-board quest-board--hunt"><div class="quest-board__title"><span>${tri('Find the clues', '寻找线索')}</span><strong>${quest.found.length} / ${step.sequence.length}</strong></div><div class="quest-grid quest-grid--five">${step.options.map(item => `<button class="quest-card ${found.has(item.label) ? 'is-matched' : ''}" type="button" data-action="quest-pick" data-choice="${escapeHtml(item.label)}" ${found.has(item.label) ? 'disabled' : ''}>${renderObject(item)}${wordLabel(item.label)}</button>`).join('')}</div><div class="quest-story">${tri(questEnglish(step, quest), step.story)}</div></div>`;
  }
  if (step.kind === 'pairs') {
    const cards = [...step.options.map(item => ({ side: 'picture', item })), ...[step.options[1], step.options[2], step.options[0]].map(item => ({ side: 'word', item }))];
    return `<div class="quest-board quest-board--pairs"><div class="quest-board__title"><span>${tri('Match pictures and words', '图词配对')}</span><strong>${quest.matched.length} / ${step.options.length}</strong></div><div class="quest-grid quest-grid--pairs">${cards.map(({ side, item }) => {
      const matched = quest.matched.includes(item.label);
      const selected = quest.open?.side === side && quest.open.label === item.label;
      return `<button class="quest-card quest-card--${side} ${matched ? 'is-matched' : ''} ${selected ? 'is-open' : ''}" type="button" data-action="quest-card" data-card="${side}:${escapeHtml(item.label)}" aria-label="${escapeHtml(item.label)}" ${matched ? 'disabled' : ''}>${side === 'picture' ? renderObject(item) : ''}${wordLabel(item.label)}</button>`;
    }).join('')}</div><div class="quest-story">${tri('Help your pet find each matching pair.', step.story)}</div></div>`;
  }
  return `<div class="quest-board quest-board--craft"><div class="quest-board__title"><span>${tri('Make the story happen', '动手完成这一幕')}</span><strong>${quest.count} / ${step.count}</strong></div><div class="craft-world craft-world--${session.day}" data-craft-zone><div class="craft-world__scene">${Array.from({ length: step.count }, (_, index) => `<span class="craft-world__slot ${index < quest.count ? 'is-filled' : ''}" style="--slot:${index}">${index < quest.count ? (step.options.find(item => item.label === quest.chosen[index])?.icon || '✦') : '✧'}</span>`).join('')}</div><div class="craft-world__actor" style="--moves:${quest.count}">${renderPet({species:session.state.profiles[session.profileId].pet || 'cat',action:quest.count ? 'walk' : 'idle',growth:growth(session.state.profiles[session.profileId])})}</div><span class="craft-world__goal">${tri('Drag here!', '拖到这里！')}</span></div><div class="craft-palette">${step.options.map(item => `<button class="craft-token" type="button" data-action="quest-craft" data-drag-craft="true" data-choice="${escapeHtml(item.label)}">${renderObject(item)}${wordLabel(item.label)}</button>`).join('')}</div><div class="quest-story">${tri('Drag a piece into the scene. Your pet will help!', step.story)}</div></div>`;
}

function renderLesson(state, ui) {
  const session = ui.session;
  const day = getDay(session.day);
  const profile = state.profiles[ui.activeProfile];
  if (session.finished) return renderComplete(state, ui, day);
  const step = session.steps[session.stepIndex];
  const isSpeak = step.mode === 'speak';
  const isQuest = step.mode === 'quest';
  const isTeach = step.mode === 'teach';
  const modelEnglish = isQuest ? questEnglish(step, session.quest || { found: [] }) : step.cueEn;
  const effect = EFFECTS[ui.effect];
  const choices = step.mode === 'listen' ? `<div class="object-choices ${step.interaction === 'drag' ? 'object-choices--drag' : ''}">${step.options.map((item, index) => `<button class="object-choice" type="button" data-action="listen-choice" data-choice="${escapeHtml(item.label)}" data-draggable="${step.interaction === 'drag'}" style="--choice-index:${index}" aria-label="${escapeHtml(item.label)}">${renderObject(item)}${wordLabel(item.label)}</button>`).join('')}</div>` : '';
  const teachCard = isTeach ? `<button class="teach-card" type="button" data-action="teach-tap"><span class="teach-card__picture">${['cat','dog'].includes(step.word) ? `<img src="${petAsset(step.word)}" alt="">` : escapeHtml(step.icon)}</span>${wordLabel(step.word)}<small>${tri(session.teachCount ? 'Tap again to continue' : 'Tap to listen', session.teachCount ? '再点一下继续' : '点一下听发音')}</small></button>` : '';
  const wordChips = session.attempts >= 2 ? `<div class="speech-word-chips">${step.cueEn.replace(/[!.?]/g, '').split(/\s+/).map(word => `<span data-say="en" data-text="${escapeHtml(word)}">${escapeHtml(word)}</span>`).join('')}</div>` : '';
  const speechControl = isSpeak ? `<div class="speech-control glass-card"><span class="speech-control__label">${tri('Speak to move the story', '开口让故事继续')}</span><strong data-say="en" data-text="${escapeHtml(step.cueEn)}">${escapeHtml(step.cueEn)}</strong>${wordChips}<button class="mic-button ${ui.listening ? 'is-listening' : ''}" type="button" data-action="speak" aria-label="Speak English">${ui.listening ? '◉' : '🎙'}<small>${tri(ui.listening ? 'Listening...' : 'Tap and speak', ui.listening ? '正在听你说' : '点我说英语')}</small></button><p>${tri(session.attempts ? 'Listen and try again.' : 'Take your time. Your pet is listening!', session.attempts ? '听一遍，再试试看。' : '不用着急，宠物在听你说。')}</p></div>` : `<div class="listen-instruction glass-card"><span class="listen-instruction__icon">♫</span><span>${tri(isTeach ? 'First, learn this word' : isQuest ? step.kind === 'pairs' ? 'Look and match' : step.kind === 'craft' ? 'Drag and make' : 'Listen and find' : 'Listen and find', step.cueZh)}</span><button type="button" data-action="play-en" aria-label="Replay English">${tri('↻ Replay', '重听')}</button></div>`;
  return shell(ui, day.mood, `${topbar(ui, `Chapter ${day.day} · ${DAY_EN[day.day - 1][1]}`)}<main class="lesson-layout" data-effect="${escapeHtml(ui.effect || '')}">
    <div class="lesson-progress"><button type="button" class="back-button" data-action="town">${tri('← Town', '小镇')}</button><span>CHAPTER ${day.day} / ${escapeHtml(DAY_EN[day.day - 1][1])}</span><div class="progress-pips">${session.steps.map((_, i) => `<i class="${i < session.stepIndex ? 'is-done' : i === session.stepIndex ? 'is-current' : ''}"></i>`).join('')}</div><span>${session.stepIndex + 1} / ${session.steps.length}</span></div>
    <div class="lesson-story glass-card"><span class="eyebrow">CHAPTER ${day.day}</span><h1>${tri(DAY_EN[day.day - 1][0], day.title)}</h1><p>${tri(modelEnglish, step.cueZh)}</p><div class="model-line"><span>EN</span><strong data-say="en" data-text="${escapeHtml(modelEnglish)}">${escapeHtml(modelEnglish)}</strong><button type="button" data-action="play-en" aria-label="Play English">▶</button></div><div class="accent-toggle" aria-label="English accent"><button type="button" data-action="accent" data-accent="en-US" class="${profile.accent !== 'en-GB' ? 'is-active' : ''}" aria-pressed="${profile.accent !== 'en-GB'}">${tri('US voice', '美式')}</button><button type="button" data-action="accent" data-accent="en-GB" class="${profile.accent === 'en-GB' ? 'is-active' : ''}" aria-pressed="${profile.accent === 'en-GB'}">${tri('UK voice', '英式')}</button></div></div>
    <div class="lesson-stage"><div class="stage-light"></div>${renderStoryProp(day, session, ui.effect)}${renderStoryActor(ui.effect, profile.pet || 'cat')}${isQuest ? renderQuest(step, session) : isTeach ? teachCard : choices}${isSpeak ? `<div class="magic-target magic-target--${day.day}"><span>✦</span><strong>${tri('Magic moment', step.object)}</strong></div>` : isQuest || isTeach ? '' : `<div class="drop-zone" aria-hidden="true">${tri(step.interaction === 'drag' ? 'Drag here!' : 'Find it!', step.interaction === 'drag' ? '拖到这里' : '找到它')}</div>`}${effect ? `<div class="effect-pop" role="status"><span>${effect[0]}</span><strong>${tri('Wonderful!', effect[1])}</strong></div>` : ''}<div class="lesson-pet">${renderPet({ species: profile.pet || 'cat', action: ui.petAction || (isSpeak ? 'listen' : 'idle'), accessory: profile.selectedAccessory || profile.accessories[profile.accessories.length - 1], growth:growth(profile) })}</div></div>
    ${speechControl}
    <div class="lesson-footer"><button type="button" data-action="play-zh">${tri('♫ Hear the story', '听中文故事')}</button><span>${tri('Tap your pet for help', '点宠物获得帮助')}</span></div>
  </main>`);
}

function renderComplete(state, ui, day) {
  const festival = day.day === 7 && !state.shared.completedBuildings.includes('festival');
  const message = festival ? '你已经点亮一盏灯，等另一位探险家来完成自己的冒险。' : '你和宠物又让小镇亮了一点。明天还有新的故事等你！';
  return shell(ui, 'night', `${topbar(ui, 'Story Complete')}<main class="complete-layout"><div class="complete-halo"></div>${ui.effect ? `<div class="complete-story-effect">${renderStoryProp(day, ui.session, ui.effect)}<div class="effect-pop" role="status"><span>${EFFECTS[ui.effect]?.[0] || '✦'}</span><strong>${tri('Wonderful!', EFFECTS[ui.effect]?.[1] || '小镇又变亮了！')}</strong></div></div>` : ''}<div class="complete-pet">${renderPet({ species: state.profiles[ui.activeProfile].pet || 'cat', action: 'happy', accessory: day.reward, growth:growth(state.profiles[ui.activeProfile]) })}</div><div class="complete-card glass-card"><p class="eyebrow">CHAPTER COMPLETE</p><h1>${tri(festival ? 'One light is shining!' : 'You did it!', festival ? '第一盏灯亮啦！' : '今天的冒险完成啦！')}</h1><p>${tri('Your pet grew with you today. Come back for another story!', message)}</p><div class="reward-chip"><span>${tri('New reward', '新收集')}</span><strong>${escapeHtml(day.reward)}</strong></div><button class="primary-button" type="button" data-action="play">${tri('Explore and play →', '去自由探索')}</button><button class="text-link" type="button" data-action="town">${tri('Back to town', '回到小镇')}</button></div></main>`);
}

function renderPlay(state, ui) {
  const profile = state.profiles[ui.activeProfile];
  const play = ui.play || { mode: 'paint', color: 'gold', blocks: 0, throws: 0 };
  const modes = [
    ['paint', '🎨', 'Paint', '画小屋'], ['build', '▣', 'Build', '搭小路'], ['ball', '🏀', 'Ball', '玩球'], ['treasure', '✦', 'Treasure', '找宝藏'],
  ].map(([id, icon, en, zh]) => `<button type="button" class="play-tab ${play.mode === id ? 'is-active' : ''}" data-action="play-mode" data-mode="${id}"><span>${icon}</span>${tri(en, zh)}</button>`).join('');
  const colors = [['gold', '#ffcd75', '金色'], ['red', '#ef6671', '红色'], ['blue', '#5caadf', '蓝色'], ['mint', '#75d0bb', '薄荷色']];
  const controls = play.mode === 'paint'
    ? `<p>${tri('Drag a color onto the house!', '把颜色拖到小屋上！')}<br><strong>red · blue · yellow</strong></p><div class="play-colors">${colors.map(([id, color, label]) => `<button type="button" data-action="play-paint" data-play-drag="true" data-color="${id}" class="${play.color === id ? 'is-active' : ''}" style="--swatch:${color}" aria-label="${label}"><span></span>${tri(id === 'gold' ? 'yellow' : id, label)}</button>`).join('')}</div>`
    : play.mode === 'build'
      ? `<p>${tri('Drag a plank to the river. Watch your pet cross!', '把木板拖到河上，看宠物过桥！')}<br><strong>Build! · Jump!</strong></p><button class="primary-button play-main-button" type="button" data-action="play-build" data-play-drag="true">${tri('Drag a plank ▤', '拖动木板')}</button><button class="text-link" type="button" data-action="play-reset">${tri('Build again', '重新搭')}</button>`
      : play.mode === 'ball'
        ? `<p>${tri('Drag the ball to your pet!', '把球拖给宠物！')}<br><strong>Ball! · Let's play!</strong></p><button class="primary-button play-main-button" type="button" data-action="play-throw" data-play-drag="true">${tri('Drag the ball 🏀', '拖动篮球')}</button>`
        : `<p>${tri('Drag the star key into the chest!', '把星星钥匙拖进宝箱！')}<br><strong>Look! · Here it is!</strong></p><button class="primary-button play-main-button" type="button" data-action="play-search" data-play-drag="true">${tri('Drag the key ✦', '拖动钥匙')}</button>`;
  const blocks = Array.from({ length: play.blocks }, (_, i) => `<i style="--block-index:${i}"></i>`).join('');
  return shell(ui, 'day', `${topbar(ui, 'Pet Playground')}<main class="play-layout"><button type="button" class="back-button" data-action="town">${tri('← Back to town', '回到小镇')}</button>
    <div class="play-stage play-stage--${play.mode}" data-play-zone><div class="play-stage__halo"></div><div class="play-house play-house--${play.color}"><img src="./assets/scenes/cottage.png" alt="Painting cottage"><img class="play-house__tint" src="./assets/scenes/cottage.png" alt=""></div><div class="play-blocks">${blocks}</div>${play.mode === 'ball' ? `<div class="play-ball ${ui.effect === 'throw' ? 'is-thrown' : ''}"></div>` : ''}${play.mode === 'treasure' ? `<div class="play-treasure ${ui.effect === 'search' ? 'is-open' : ''}"><img class="play-treasure__base" src="./assets/scenes/treasure-chest.png" alt="Treasure chest"><img class="play-treasure__lid" src="./assets/scenes/treasure-chest.png" alt=""><span>✦</span></div>` : ''}<div class="play-pet ${ui.petTarget ? 'is-following' : ''}" style="--blocks:${play.blocks};${ui.petTarget && play.mode !== 'build' ? `left:${ui.petTarget.x}%;bottom:${ui.petTarget.y}%;` : ''}">${renderPet({ species: profile.pet || 'cat', action: ui.petAction || 'idle', accessory: profile.selectedAccessory || profile.accessories[profile.accessories.length - 1], growth:growth(profile) })}</div><span class="play-drop-label">${tri('Drop here!', '拖到这里！')}</span></div>
    <section class="play-panel glass-card"><p class="eyebrow">YOUR LITTLE WORLD</p><h1>${tri('How shall we play?', '想怎么玩？')}</h1><div class="play-tabs">${modes}</div><div class="play-controls">${controls}</div><div class="play-tip">${tri('Tap your pet and it will answer you.', '点宠物，它会回应你。')}</div></section>
  </main>`);
}

function renderCloset(state, ui) {
  const profile = state.profiles[ui.activeProfile];
  const equipped = profile.selectedAccessory || profile.accessories[profile.accessories.length - 1];
  const items = profile.accessories.map(item => `<button class="accessory-card ${equipped === item ? 'is-selected' : ''}" type="button" data-action="equip" data-accessory="${escapeHtml(item)}"><span>${escapeHtml(item)}</span><small>${equipped === item ? '正在佩戴 ✓' : '点击佩戴'}</small></button>`).join('');
  return shell(ui, 'day', `${topbar(ui, 'My Pet')}<main class="closet-layout"><button type="button" class="back-button" data-action="town">${tri('← Back to town', '返回小镇')}</button><div class="closet-pet">${renderPet({ species: profile.pet || 'cat', action: ui.petAction || 'idle', accessory: equipped, growth:growth(profile) })}</div><div class="closet-panel glass-card"><p class="eyebrow">YOUR COMPANION</p><h1>${tri(profile.nickname || 'My little friend', profile.nickname || '我的小伙伴')}</h1><p>${tri('Name your pet. It grows as you learn.', '给宠物起名，它会随着学习长大。')}</p><label class="nickname-field">${tri('Pet name', '宠物名字')}<input id="pet-nickname" type="text" maxlength="8" value="${escapeHtml(profile.nickname)}" placeholder="Pet name"></label><div class="avatar-choices" aria-label="Choose a role">${Object.entries(AVATARS).map(([id, [icon, name]]) => `<button type="button" class="avatar-chip ${profile.avatar === id ? 'is-selected' : ''}" data-action="choose-avatar" data-avatar="${id}" aria-pressed="${profile.avatar === id}"><span>${icon}</span>${tri(({explorer:'Explorer',artist:'Artist',builder:'Builder'})[id],name)}</button>`).join('')}</div><p>${tri('Every chapter brings a little keepsake.', '每完成一集，就得到一件纪念品。')}</p><div class="accessory-grid">${items || `<span class="empty-note">${tri('A gift is waiting in the next story.', '礼物在下一集等你。')}</span>`}</div></div></main>`);
}

function renderFamilyHub(state, ui) {
  const profile = state.profiles[ui.activeProfile];
  const cards = FAMILY_SCENES.map(scene => {
    const name = state.family.names[scene.id] || scene.zh;
    const seen = profile.familySeen?.[scene.id]?.length || 0;
    return `<button class="family-card family-card--${scene.scene}" type="button" data-action="family-open" data-role="${scene.id}"><span class="family-card__icon">${scene.icon}</span><span class="family-card__body"><strong>${tri(scene.en, name)}</strong><small>${tri(scene.place, scene.placeZh)}</small></span><span class="family-card__progress">${seen}/4 ✦</span></button>`;
  }).join('');
  return shell(ui, 'day', `${topbar(ui, 'My Family')}<main class="family-hub"><button class="back-button" type="button" data-action="town">${tri('← Back to town', '回到小镇')}</button><div class="family-hub__intro"><p class="eyebrow">PEOPLE I LOVE</p><h1>${tri('Meet my family', '认识我的家人')}</h1><p>${tri('Tap a person. Look, listen and play in their little world.', '点一位家人，在他们的小世界里看、听、玩。')}</p></div><div class="family-grid">${cards}</div></main>`);
}

function renderFamilyBoard(state, ui) {
  const scene = getFamilyScene(ui.familyRole);
  if (!scene) return renderFamilyHub(state, ui);
  const profile = state.profiles[ui.activeProfile];
  const seen = profile.familySeen?.[scene.id] || [];
  const done = profile.familyDone?.includes(scene.id);
  const name = state.family.names[scene.id] || scene.zh;
  const note = state.family.notes[scene.id] || scene.storyZh;
  const props = scene.objects.map(item => `<button class="family-prop family-prop--${item.en} ${seen.includes(item.en) ? 'is-seen' : ''} ${ui.familyActive === item.en ? 'is-active' : ''}" style="--x:${item.x}%;--y:${item.y}%" type="button" data-action="family-object" data-object="${item.en}"><span class="family-prop__icon">${['cat','dog'].includes(item.en) ? `<img src="${petAsset(item.en)}" alt="">` : item.icon}</span>${tri(item.en,item.zh)}</button>`).join('');
  return shell(ui, 'day', `${topbar(ui, scene.place)}<main class="family-board"><button class="back-button" type="button" data-action="family">${tri('← My family', '返回家人')}</button><div class="family-board__header glass-card"><p class="eyebrow">${escapeHtml(scene.place.toUpperCase())}</p><h1>${tri(scene.en, name)}</h1><p>${tri(scene.story, note)}</p><div class="family-board__meter">${tri('Words found', '认识的单词')} <strong>${seen.length} / ${scene.objects.length}</strong></div></div><div class="family-world family-world--${scene.scene}" data-family-zone><div class="family-world__sky"><i></i><i></i></div><div class="family-world__hill family-world__hill--back"></div><div class="family-world__hill family-world__hill--front"></div><div class="family-world__place">${scene.icon}</div>${props}<div class="family-world__pet" style="left:${ui.familyPetX ?? 6}%">${renderPet({species:profile.pet || 'cat',action:ui.petAction || 'idle',growth:growth(profile)})}</div>${done ? `<div class="family-world__celebrate">✦ ✧ ✦</div>` : ''}</div><div class="family-board__action glass-card">${seen.length < scene.objects.length ? tri('Tap each object and hear its English name.', '点每样东西，先认识它的英文名字。') : done ? tri('You did it! Visit again anytime.', '完成啦，随时回来玩。') : `<span>${tri('Now make something happen!', '现在动手完成一个小任务！')}</span><button class="family-token" type="button" data-action="family-action" data-family-drag="true">${scene.action.icon}${tri(scene.action.en,scene.action.zh)}</button><small>${tri('Drag into the scene or tap the button.', '拖到场景里，或者点一下。')}</small>`}</div></main>`);
}

function renderParent(state, ui) {
  const cards = ['sister', 'brother'].map(id => {
    const profile = state.profiles[id];
    return `<div class="parent-profile"><span>${tri(ROLE_EN[id], LABELS[id])}</span><label class="child-name-label">${tri('Child name', '孩子姓名')}<input class="child-name-input" data-profile="${id}" type="text" maxlength="12" value="${escapeHtml(profile.childName || '')}" placeholder="${id === 'sister' ? '姐姐的名字' : '弟弟的名字'}"></label><strong>${profile.completed.length} / 7 chapters</strong><div class="parent-progress"><i style="width:${profile.completed.length / 7 * 100}%"></i></div><small>${tri('Review later', '稍后复习')}：${profile.review.length ? profile.review.map(escapeHtml).join(' · ') : '—'}</small></div>`;
  }).join('');
  const voices = ui.mandarinVoices || [];
  const chosen = state.settings?.chineseVoiceURI || '';
  const voiceOptions = voices.map(voice => `<option value="${escapeHtml(voice.voiceURI)}" ${chosen === voice.voiceURI ? 'selected' : ''}>${escapeHtml(voice.name)}</option>`).join('');
  const familyFields = FAMILY_SCENES.map(scene => `<label class="family-field"><strong>${tri(scene.en,scene.zh)}</strong><input class="family-name-input" data-role="${scene.id}" value="${escapeHtml(state.family.names[scene.id] || '')}" maxlength="16" placeholder="姓名"><textarea class="family-note-input" data-role="${scene.id}" maxlength="160" placeholder="这里写给孩子听的故事">${escapeHtml(state.family.notes[scene.id] || '')}</textarea></label>`).join('');
  const recordingOptions = [
    ...DAYS.map(day => ({key:`day-${day.day}`,label:`Chapter ${day.day} · ${DAY_EN[day.day-1][0]}`,script:day.intro})),
    ...FAMILY_SCENES.map(scene => ({key:`family-${scene.id}`,label:`${scene.en} · ${state.family.names[scene.id] || scene.zh}`,script:state.family.notes[scene.id] || scene.storyZh})),
  ];
  const selectedRecording = recordingOptions.find(option => option.key === ui.recordingKey) || recordingOptions[0];
  const recordingPanel = `<div class="voice-settings recording-settings"><strong>${tri('Record a family voice', '录制家人的声音')}</strong><p>${tri('Record a Chinese story once. Children can replay it on this iPad.', '中文故事录一次，孩子就能在这部 iPad 上反复听。')}</p><select id="recording-key" aria-label="Story to record">${recordingOptions.map(option => `<option value="${option.key}" ${option.key === selectedRecording.key ? 'selected' : ''}>${escapeHtml(option.label)} ${ui.recordedKeys?.includes(option.key) ? '✓' : ''}</option>`).join('')}</select><blockquote>${escapeHtml(selectedRecording.script)}</blockquote><div><button type="button" data-action="record-toggle" ${!ui.recordingSupported ? 'disabled' : ''}>${tri(ui.recordingActive ? '■ Stop and save' : '● Record', ui.recordingActive ? '停止并保存' : '开始录音')}</button><button type="button" data-action="record-preview" ${!ui.recordedKeys?.includes(selectedRecording.key) ? 'disabled' : ''}>${tri('▶ Play recording', '播放录音')}</button></div><small>${tri('Recordings stay in this browser. They are not included in the backup file.', '录音只保存在这部浏览器里，不包含在备份文件中。')}</small></div>`;
  return shell(ui, 'day', `${topbar(ui, 'For Family')}<main class="parent-layout"><button class="back-button" type="button" data-action="town">${tri('← Back', '返回')}</button><div class="parent-panel glass-card"><p class="eyebrow">FOR FAMILY</p><h1>${tri('Learning records', '两人的学习记录')}</h1><p>${tri('Names and progress stay in this iPad browser. Please export a backup sometimes.', '姓名和进度保存在这部 iPad 中，请偶尔导出备份。')}</p><div class="parent-profiles">${cards}</div><details class="family-settings"><summary>${tri('Family people and stories', '家人姓名和故事')}</summary><div>${familyFields}</div></details><div class="parent-actions"><label class="secondary-button file-picker">${tri('Import family stories', '导入家庭故事')} <input id="family-pack-input" type="file" accept="application/json,.json"></label></div><details class="family-paste"><summary>${tri('Paste family pack', '粘贴家庭资料')}</summary><p>${tri('If file import does not open, paste the private JSON here. It stays on this device.', '如果选文件没有打开，可把私人 JSON 粘贴在这里；资料只保存在本机。')}</p><textarea id="family-pack-paste" spellcheck="false" placeholder="{...}">${escapeHtml(ui.familyPaste || '')}</textarea><button type="button" data-action="family-paste-import">${tri('Save family stories', '保存家庭故事')}</button></details><div class="voice-settings"><strong>${tri('Chinese story voice', '中文故事声音')}</strong><p>${tri('Choose a Mandarin voice and listen before children play.', '先选普通话音色试听，再给孩子听。')}</p><div><select id="mandarin-voice" aria-label="Mandarin voice">${voiceOptions || '<option value="">No Mandarin voice found</option>'}</select><button type="button" data-action="voice-preview">${tri('▶ Preview', '试听')}</button><button type="button" data-action="refresh-voices">${tri('Refresh', '重新检测')}</button></div></div>${recordingPanel}<div class="parent-actions"><button class="primary-button" type="button" data-action="export">${tri('Export backup ↓', '导出备份')}</button><label class="secondary-button file-picker">${tri('Import backup', '导入备份')} <input id="backup-input" type="file" accept="application/json,.json"></label></div><div class="parent-device"><span>${tri('🎙 Speaking', '口语功能')}</span><strong>${ui.speechSupported ? tri('Speech is available here. Test it on the iPad before the children play.', '已检测到语音接口，请在孩子的 iPad 上试说。') : tri('Speech recognition is unavailable here. Try Safari on the iPad.', '当前无法语音识别，请用 iPad Safari 测试。')}</strong></div></div></main>`);
}

export function renderApp(state, ui = {}) {
  ui = { ...ui, activeName: ui.activeProfile && state.profiles[ui.activeProfile] ? nameOf(state.profiles[ui.activeProfile], ui.activeProfile) : '' };
  const view = ui.view || 'profiles';
  if (view === 'profiles') return renderProfiles(state, { ...ui, view });
  if (view === 'pet-choice') return renderPetChoice(state, { ...ui, view });
  if (view === 'parent') return renderParent(state, { ...ui, view });
  if (!ui.activeProfile || !state.profiles[ui.activeProfile]) return renderProfiles(state, { ...ui, view: 'profiles' });
  if (view === 'town') return renderTown(state, { ...ui, view });
  if (view === 'family') return renderFamilyHub(state, { ...ui, view });
  if (view === 'family-board') return renderFamilyBoard(state, { ...ui, view });
  if (view === 'lesson' && ui.session) return renderLesson(state, { ...ui, view });
  if (view === 'play') return renderPlay(state, { ...ui, view });
  if (view === 'closet') return renderCloset(state, { ...ui, view });
  return renderProfiles(state, { ...ui, view: 'profiles' });
}

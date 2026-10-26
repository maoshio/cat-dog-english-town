import { loadState, saveState, updateProfile, updateSettings, updateFamily, exportBackup, importBackup, importFamilyPack } from './state.js?v=16';
import { beginLesson, applyLessonEvent } from './lesson.js?v=16';
import { getDay } from './curriculum.js?v=16';
import { createSpeechClient, matchesTarget } from './speech.js?v=16';
import { createAudioClient } from './audio.js?v=16';
import { renderApp } from './scene.js?v=16';
import { createPlayState, applyPlayEvent } from './play.js?v=16';
import { getFamilyScene } from './family.js?v=16';
import { FAMILY_SCENES } from './family.js?v=16';
import { createRecordingStore } from './recordings.js?v=16';

const root = document.getElementById('app');
const speech = createSpeechClient(window);
const audio = createAudioClient(window);
const recordings = createRecordingStore(window.indexedDB);
const recordingUrls = new Map();
let recorder = null;
let recordingStream = null;
const storage = (() => {
  try { return window.localStorage; }
  catch { return { getItem() { return null; }, setItem() { throw new Error('存储不可用'); } }; }
})();
let state = loadState(storage);
audio.setChineseVoice(state.settings?.chineseVoiceURI);
let ui = {
  view: 'profiles', activeProfile: null, session: null, notice: '',
  speechSupported: speech.supported, listening: false, petAction: 'idle', effect: '',
  play: createPlayState(),
  petTarget: null,
  familyRole: null, familyActive: '', familyPetX: 6,
  recordingKey: 'day-1', recordingSupported: Boolean(recordings.supported && window.MediaRecorder && navigator.mediaDevices?.getUserMedia),
  recordingActive: false, recordedKeys: [],
  mandarinVoices: audio.listMandarinVoices(),
};
let noticeTimer;
let petTimer;
let drag = null;
let suppressClickUntil = 0;

function render() {
  root.innerHTML = renderApp(state, ui);
}

function persist() {
  try { saveState(storage, state); }
  catch { notify('Safari 没能保存进度，请到家长页导出备份。'); }
}

function notify(message, duration = 2800) {
  clearTimeout(noticeTimer);
  ui.notice = message;
  render();
  noticeTimer = setTimeout(() => { ui.notice = ''; render(); }, duration);
}

function petReaction(action = 'happy', message = '它看到你啦！') {
  clearTimeout(petTimer);
  ui.petAction = action;
  ui.notice = message;
  render();
  petTimer = setTimeout(() => { ui.petAction = 'idle'; ui.effect = ''; ui.notice = ''; render(); }, 1800);
}

function enterTown() {
  audio.stop();
  ui.view = ui.activeProfile ? 'town' : 'profiles';
  ui.session = null;
  ui.listening = false;
  ui.effect = '';
  ui.petAction = 'idle';
  render();
}

function startDay(day) {
  try {
    ui.session = beginLesson(state, ui.activeProfile, day);
    ui.view = 'lesson';
    ui.effect = '';
    ui.petAction = 'idle';
    render();
    playStoryIntro(`day-${day}`, getDay(day).intro, ui.session.steps[0].cueEn);
  } catch (error) { notify(error.message); }
}

function playStoryIntro(key, chinese, english) {
  const url = recordingUrls.get(key);
  if (!url) { audio.speakSequence([{text:chinese,language:'zh'},{text:english,language:'en'}]); return; }
  audio.stop();
  const clip = new Audio(url);
  clip.onended = () => audio.speak(english, 'en');
  clip.play().catch(() => audio.speakSequence([{text:chinese,language:'zh'},{text:english,language:'en'}]));
}

async function loadRecordings() {
  const keys = [...Array.from({length:7},(_,i)=>`day-${i+1}`), ...FAMILY_SCENES.map(scene=>`family-${scene.id}`)];
  for (const key of keys) {
    try {
      const blob = await recordings.get(key);
      if (blob) recordingUrls.set(key, URL.createObjectURL(blob));
    } catch { break; }
  }
  ui.recordedKeys = [...recordingUrls.keys()];
  if (ui.view === 'parent') render();
}

async function toggleRecording() {
  if (!ui.recordingSupported) { notify('这台浏览器没有录音功能。请在 iPad Safari 试用。'); return; }
  if (recorder && ui.recordingActive) { recorder.stop(); return; }
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({audio:true});
    const preferred = ['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(type=>window.MediaRecorder.isTypeSupported?.(type));
    recorder = new MediaRecorder(recordingStream, preferred ? {mimeType:preferred} : undefined);
    const chunks = [];
    const key = ui.recordingKey;
    recorder.ondataavailable = event => { if (event.data?.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      recordingStream?.getTracks().forEach(track=>track.stop());
      ui.recordingActive = false;
      const blob = new Blob(chunks, {type:recorder.mimeType || chunks[0]?.type || 'audio/mp4'});
      if (blob.size) {
        try {
          await recordings.put(key,blob);
          const old = recordingUrls.get(key);
          if (old) URL.revokeObjectURL(old);
          recordingUrls.set(key,URL.createObjectURL(blob));
          ui.recordedKeys = [...recordingUrls.keys()];
          notify('旁白已保存在这部设备。');
        } catch (error) { notify(error.message); }
      } else notify('没有录到声音，请再试一次。');
      recorder = null;
    };
    recorder.start();
    ui.recordingActive = true;
    render();
  } catch { notify('麦克风没有打开。请允许 Safari 使用麦克风。',5000); }
}

function currentStep() {
  const session = ui.session;
  return session && !session.finished ? session.steps[session.stepIndex] : null;
}

function modelEnglish(step = currentStep()) {
  if (!step) return '';
  if (step.mode === 'quest' && step.kind === 'hunt') return `Find ${step.sequence[ui.session.quest.found.length] || step.sequence[0]}.`;
  return step.cueEn;
}

function narrateNext(response) {
  const step = currentStep();
  const chinese = [response, step?.story, step?.cueZh].filter(Boolean).join(' ');
  const parts = [{ text: chinese, language: 'zh' }];
  if (step) parts.push({ text: modelEnglish(step), language: 'en' });
  audio.speakSequence(parts);
}

function advance(event) {
  const previous = ui.session;
  ui.session = applyLessonEvent(previous, event);
  state = ui.session.state;
  if (state !== previous.state) persist();
  ui.effect = ui.session.lastEffect === 'guide' ? '' : ui.session.lastEffect;
  ui.petAction = ui.session.lastEffect === 'guide' ? 'guide'
    : /pet-run|pet-cross|pet-parade/.test(ui.session.lastEffect || '') ? 'walk' : 'happy';
  render();
  clearTimeout(petTimer);
  petTimer = setTimeout(() => {
    ui.effect = '';
    ui.petAction = ui.session?.finished ? 'happy' : 'idle';
    render();
  }, 2300);
}

function chooseObject(value) {
  const step = currentStep();
  if (!step || step.mode !== 'listen') return;
  if (value === step.target) {
    advance({ type: 'listen-correct' });
    narrateNext('找到了！');
  } else {
    ui.session = applyLessonEvent(ui.session, { type: 'listen-miss' });
    notify('再听听，看看它藏在哪里。');
    audio.speak(step.cueEn, 'en', true);
  }
}

function chooseQuest(event, feedback) {
  const step = currentStep();
  if (!step || step.mode !== 'quest') return;
  const before = ui.session;
  const beforeIndex = before.stepIndex;
  advance(event);
  if (ui.session === before) return;
  if (ui.session.stepIndex !== beforeIndex) {
    narrateNext('这一幕完成啦。');
  } else if (ui.session.lastEffect === 'guide') {
    notify('再看一看，试试另一张卡。');
    if (step.kind === 'hunt') audio.speak(modelEnglish(), 'en', true);
  } else if (step.kind === 'hunt') {
    audio.speakSequence([{ text: '找到了！接着听下一件。', language: 'zh' }, { text: modelEnglish(), language: 'en' }]);
  } else if (feedback) audio.speak(feedback, 'en');
}

function dropPlayToken(option) {
  const action = option.dataset.action;
  if (action === 'play-paint') {
    ui.play = applyPlayEvent(ui.play, { type: 'paint', color: option.dataset.color });
    petReaction('happy', 'The house changed color! · 小屋变颜色啦！');
    audio.speak(({ gold: 'Yellow!', red: 'Red!', blue: 'Blue!', mint: 'Green!' })[ui.play.color], 'en');
  } else if (action === 'play-build') {
    ui.play = applyPlayEvent(ui.play, { type: 'build' });
    petReaction('walk', 'The bridge is growing! · 小桥正在长大！');
    audio.speak('Build the bridge!', 'en');
  } else if (action === 'play-throw') {
    ui.play = applyPlayEvent(ui.play, { type: 'throw' });
    ui.effect = 'throw';
    petReaction('walk', 'Your pet is chasing the ball! · 宠物去追球啦！');
    audio.speak("Let's play ball!", 'en');
  } else if (action === 'play-search') {
    ui.play = applyPlayEvent(ui.play, { type: 'search' });
    ui.effect = 'search';
    petReaction('happy', 'You found a star! · 找到星星啦！');
    audio.speak('Here it is!', 'en');
  }
}

function completeFamilyAction() {
  const scene = getFamilyScene(ui.familyRole);
  if (!scene || !ui.activeProfile) return;
  const profile = state.profiles[ui.activeProfile];
  if ((profile.familySeen?.[scene.id] || []).length < scene.objects.length) return;
  state = updateProfile(state, ui.activeProfile, {
    familyDone: [...new Set([...(profile.familyDone || []), scene.id])],
  });
  persist();
  ui.familyActive = 'celebrate'; ui.petAction = 'happy'; render();
  audio.speakSequence([{ text: scene.action.zh, language: 'zh' }, { text: scene.action.en, language: 'en' }]);
}

async function listenToChild() {
  const step = currentStep();
  if (!step || step.mode !== 'speak' || ui.listening) return;
  if (!speech.supported) {
    notify('这台浏览器没有语音识别。请在目标 iPad 的 Safari 打开。', 5000);
    return;
  }
  audio.stop();
  const sessionAtStart = ui.session;
  ui.listening = true;
  ui.petAction = 'listen';
  render();
  try {
    const result = await speech.listen();
    if (ui.session !== sessionAtStart) return;
    ui.listening = false;
    if (matchesTarget(result.transcript, step.target)) {
      advance({ type: 'speech-match' });
      narrateNext('做到了！');
    } else {
      advance({ type: 'speech-miss' });
      if (ui.session.lastEffect === 'review-added') narrateNext('没关系，我们稍后再试。');
      else audio.speak(ui.session.attempts >= 2 ? step.cueEn.replace(/\s+/g, ' ... ') : step.cueEn, 'en', true);
    }
  } catch (error) {
    if (ui.session !== sessionAtStart) return;
    ui.listening = false;
    if (['no-speech', 'timeout'].includes(error.code)) {
      advance({ type: 'speech-miss' });
      if (ui.session.lastEffect === 'review-added') narrateNext('没关系，这句稍后再试。');
      else {
        notify('没听清楚，跟着宠物再说一次。', 4200);
        audio.speak(step.cueEn.replace(/\s+/g, ' ... '), 'en', true);
      }
    } else {
      ui.petAction = 'guide';
      notify(error.message, 4200);
    }
  }
}

function downloadBackup() {
  const blob = new Blob([exportBackup(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `cat-dog-town-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify('备份已经导出，请保存好这个文件。');
}

root.addEventListener('click', event => {
  const spoken = event.target.closest('[data-say]');
  if (spoken) {
    try { audio.speak(spoken.dataset.text || spoken.textContent, spoken.dataset.say); }
    catch { /* Keep navigation and game actions usable when device speech fails. */ }
  }
  const button = event.target.closest('[data-action]');
  if (!button && ui.view === 'play') {
    const stage = event.target.closest('[data-play-zone]');
    if (stage) {
      const box = stage.getBoundingClientRect();
      ui.petTarget = {
        x: Math.max(4, Math.min(68, (event.clientX - box.left) / box.width * 100 - 12)),
        y: Math.max(1, Math.min(48, (box.bottom - event.clientY) / box.height * 100 - 8)),
      };
      ui.petAction = 'walk';
      render();
      audio.speak('Come here!', 'en');
      clearTimeout(petTimer);
      petTimer = setTimeout(() => { ui.petAction = 'idle'; render(); }, 1400);
    }
    return;
  }
  if (!button || Date.now() < suppressClickUntil) return;
  const action = button.dataset.action;
  if (action === 'profiles') { audio.stop(); ui.view = 'profiles'; ui.activeProfile = null; ui.session = null; ui.listening = false; render(); }
  else if (action === 'select-profile') {
    ui.activeProfile = button.dataset.profile;
    audio.setAccent(state.profiles[ui.activeProfile].accent);
    speech.setAccent(state.profiles[ui.activeProfile].accent);
    ui.play = createPlayState();
    ui.view = state.profiles[ui.activeProfile].pet ? 'town' : 'pet-choice';
    render();
  } else if (action === 'choose-pet') {
    state = updateProfile(state, ui.activeProfile, { pet: button.dataset.species });
    persist();
    ui.view = 'town';
    render();
    audio.speak('欢迎来到猫狗小镇！', 'zh');
  } else if (action === 'choose-avatar') {
    state = updateProfile(state, ui.activeProfile, { avatar: button.dataset.avatar });
    persist(); render();
  } else if (action === 'accent') {
    const accent = button.dataset.accent === 'en-GB' ? 'en-GB' : 'en-US';
    state = updateProfile(state, ui.activeProfile, { accent });
    audio.setAccent(accent); speech.setAccent(accent); persist(); render();
    audio.speak(modelEnglish(), 'en');
  } else if (action === 'town') enterTown();
  else if (action === 'family') { ui.view = 'family'; ui.familyActive = ''; render(); }
  else if (action === 'family-open') {
    ui.familyRole = button.dataset.role;
    ui.familyActive = ''; ui.familyPetX = 6; ui.view = 'family-board'; render();
    const scene = getFamilyScene(ui.familyRole);
    playStoryIntro(`family-${scene.id}`, state.family.notes[scene.id] || scene.storyZh, scene.en);
  } else if (action === 'family-object') {
    const scene = getFamilyScene(ui.familyRole);
    const object = scene?.objects.find(item => item.en === button.dataset.object);
    if (!object) return;
    const profile = state.profiles[ui.activeProfile];
    const prior = profile.familySeen?.[scene.id] || [];
    state = updateProfile(state, ui.activeProfile, {
      familySeen: { ...(profile.familySeen || {}), [scene.id]: [...new Set([...prior, object.en])] },
    });
    persist();
    ui.familyActive = object.en; ui.familyPetX = Math.min(67, Math.max(1, object.x - 12)); ui.petAction = 'walk';
    render();
    audio.speakSequence([{ text: `这是${object.zh}。`, language: 'zh' }, { text: object.en, language: 'en', slow: true }]);
    clearTimeout(petTimer);
    petTimer = setTimeout(() => { ui.petAction = 'idle'; render(); }, 1700);
  } else if (action === 'family-action') completeFamilyAction();
  else if (action === 'play') { ui.view = 'play'; ui.effect = ''; ui.petAction = 'idle'; render(); }
  else if (action === 'play-mode') { ui.play = applyPlayEvent(ui.play, { type: 'mode', mode: button.dataset.mode }); render(); }
  else if (action === 'play-paint') {
    ui.play = applyPlayEvent(ui.play, { type: 'paint', color: button.dataset.color });
    const phrases = { gold: 'Yellow!', red: "It's red!", blue: "It's blue!", mint: 'Green!' };
    petReaction('happy', '小屋换上新颜色啦！');
    audio.speak(phrases[ui.play.color], 'en');
  } else if (action === 'play-build') {
    ui.play = applyPlayEvent(ui.play, { type: 'build' });
    petReaction('happy', ui.play.blocks === 8 ? '小路搭好啦！' : '又搭高了一点！');
    audio.speak('Build!', 'en');
  } else if (action === 'play-reset') { ui.play = applyPlayEvent(ui.play, { type: 'reset-build' }); render(); }
  else if (action === 'play-throw') {
    ui.play = applyPlayEvent(ui.play, { type: 'throw' });
    ui.effect = 'throw';
    petReaction('walk', '宠物追着篮球跑啦！');
    audio.speak("Let's play!", 'en');
  } else if (action === 'play-search') {
    ui.play = applyPlayEvent(ui.play, { type: 'search' });
    ui.effect = 'search';
    petReaction('happy', '找到一颗小星星！');
    audio.speak('Here it is!', 'en');
  }
  else if (action === 'start-day') startDay(Number(button.dataset.day));
  else if (action === 'parent') { audio.stop(); ui.view = 'parent'; render(); }
  else if (action === 'family-paste-import') {
    const pack = root.querySelector('#family-pack-paste')?.value || ui.familyPaste || '';
    try { state = importFamilyPack(state, pack); ui.familyPaste = ''; persist(); notify('家庭资料已加入，学习进度保留。'); }
    catch (error) { ui.familyPaste = pack; notify(error.message, 5000); }
  }
  else if (action === 'voice-preview') audio.speak('小猫和小狗沿着亮晶晶的小路，来到一座温暖的小屋。今天的故事，就从这里开始。', 'zh');
  else if (action === 'record-toggle') toggleRecording();
  else if (action === 'record-preview') {
    const key = ui.recordingKey;
    if (recordingUrls.has(key)) new Audio(recordingUrls.get(key)).play().catch(()=>notify('录音无法播放。'));
    else notify('还没有录这一段旁白。');
  }
  else if (action === 'refresh-voices') { ui.mandarinVoices = audio.listMandarinVoices(); render(); }
  else if (action === 'closet') { ui.view = 'closet'; render(); }
  else if (action === 'equip') {
    state = updateProfile(state, ui.activeProfile, { selectedAccessory: button.dataset.accessory });
    persist(); petReaction('happy', '新装扮穿上啦！');
  } else if (action === 'pet') {
    const step = currentStep();
    if (ui.view === 'lesson' && step) {
      petReaction('guide', '跟着我慢慢说。');
      audio.speakSequence([
        { text: [step.story,step.cueZh].filter(Boolean).join(' '), language: 'zh' },
        { text: modelEnglish(step).replace(/\s+/g, ' ... '), language: 'en', slow: true },
      ]);
    } else petReaction('happy', '它开心地回应你！');
  }
  else if (action === 'explore') {
    const mode = { 树屋: 'paint', 小桥: 'build', 星光洞: 'treasure' }[button.dataset.place];
    ui.play = applyPlayEvent(ui.play, { type: 'mode', mode });
    ui.view = 'play'; ui.effect = ''; ui.petAction = 'walk';
    render();
    audio.speak('Let us explore!', 'en');
  }
  else if (action === 'listen-choice') chooseObject(button.dataset.choice);
  else if (action === 'teach-tap') {
    const step = currentStep();
    if (step?.mode === 'teach') {
      const priorIndex = ui.session.stepIndex;
      advance({ type: 'teach-tap' });
      if (ui.session.stepIndex === priorIndex) audio.speakSequence([
        { text: `这是${step.translation}。`, language: 'zh' },
        { text: step.word, language: 'en', slow: true },
      ]);
      else narrateNext('学会一个新词啦。');
    }
  }
  else if (action === 'quest-pick') chooseQuest({ type: 'quest-pick', label: button.dataset.choice });
  else if (action === 'quest-card') chooseQuest({ type: 'quest-card', card: button.dataset.card }, button.dataset.card?.split(':')[1]);
  else if (action === 'quest-craft') chooseQuest({ type: 'quest-craft', label: button.dataset.choice }, `${button.dataset.choice}!`);
  else if (action === 'speak') listenToChild();
  else if (action === 'play-en') { const step = currentStep(); if (step) audio.speak(modelEnglish(step), 'en', ui.session.attempts > 0); }
  else if (action === 'play-zh') { const step = currentStep(); if (step) audio.speakSequence([...(step.story ? [{ text: step.story, language: 'zh' }] : []), { text: step.cueZh, language: 'zh' }]); }
  else if (action === 'export') downloadBackup();
});

root.addEventListener('input', event => {
  if (event.target.id === 'family-pack-paste') ui.familyPaste = event.target.value;
});

root.addEventListener('change', async event => {
  if (event.target.id === 'recording-key') { ui.recordingKey = event.target.value; render(); return; }
  if (event.target.classList.contains('family-name-input')) {
    state = updateFamily(state, event.target.dataset.role, { name: event.target.value.trim().slice(0, 16) });
    persist(); render(); return;
  }
  if (event.target.classList.contains('family-note-input')) {
    state = updateFamily(state, event.target.dataset.role, { note: event.target.value.trim().slice(0, 160) });
    persist(); render(); return;
  }
  if (event.target.classList.contains('child-name-input')) {
    const name = event.target.value.trim().slice(0, 12);
    state = updateProfile(state, event.target.dataset.profile, { childName: name });
    persist(); render();
    return;
  }
  if (event.target.id === 'mandarin-voice') {
    state = updateSettings(state, { chineseVoiceURI: event.target.value });
    audio.setChineseVoice(event.target.value);
    persist();
    audio.speak('小镇的故事开始了。', 'zh');
    return;
  }
  if (event.target.id === 'pet-nickname') {
    const nickname = event.target.value.trim().slice(0, 8);
    state = updateProfile(state, ui.activeProfile, { nickname });
    persist(); notify(nickname ? `以后就叫它「${nickname}」啦！` : '宠物名字已清空。');
    return;
  }
  if (event.target.id === 'family-pack-input') {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      state = importFamilyPack(state, await file.text());
      persist(); notify('家庭资料已加入，原来的学习进度保留。');
    } catch (error) { notify(error.message, 5000); }
    return;
  }
  if (event.target.id !== 'backup-input') return;
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const imported = importBackup(await file.text());
    state = imported;
    audio.setChineseVoice(state.settings.chineseVoiceURI);
    if (ui.activeProfile) {
      audio.setAccent(state.profiles[ui.activeProfile].accent);
      speech.setAccent(state.profiles[ui.activeProfile].accent);
    }
    persist();
    notify('备份已恢复，两个人的进度都回来了。');
  } catch (error) { notify(error.message, 5000); }
});

window.speechSynthesis?.addEventListener?.('voiceschanged', () => {
  ui.mandarinVoices = audio.listMandarinVoices();
  if (ui.view === 'parent') render();
});

root.addEventListener('pointerdown', event => {
  const option = event.target.closest('.object-choice[data-draggable="true"], .craft-token[data-drag-craft="true"], [data-play-drag="true"], [data-family-drag="true"]');
  if (!option) return;
  event.preventDefault();
  drag = { option, startX: event.clientX, startY: event.clientY, moved: false };
  option.setPointerCapture(event.pointerId);
  option.classList.add('is-dragging');
});

root.addEventListener('pointermove', event => {
  if (!drag) return;
  const dx = event.clientX - drag.startX;
  const dy = event.clientY - drag.startY;
  drag.moved = drag.moved || Math.hypot(dx, dy) > 20;
  drag.option.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
});

root.addEventListener('pointerup', event => {
  if (!drag) return;
  const { option, moved } = drag;
  option.classList.remove('is-dragging');
  option.style.transform = '';
  drag = null;
  if (!moved) return;
  suppressClickUntil = Date.now() + 300;
  const zone = root.querySelector('.drop-zone');
  const craftZone = root.querySelector('[data-craft-zone]');
  const playZone = root.querySelector('[data-play-zone]');
  const familyZone = root.querySelector('[data-family-zone]');
  const target = option.matches('[data-family-drag]') ? familyZone : option.matches('[data-play-drag]') ? playZone : option.matches('.craft-token') ? craftZone : zone;
  const bounds = target?.getBoundingClientRect();
  if (bounds && event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom) {
    if (option.matches('[data-family-drag]')) completeFamilyAction();
    else if (option.matches('[data-play-drag]')) dropPlayToken(option);
    else if (option.matches('.craft-token')) chooseQuest({ type: 'quest-craft', label: option.dataset.choice }, `${option.dataset.choice}!`);
    else chooseObject(option.dataset.choice);
  } else notify('Drag into the glowing scene! · 拖到发光的场景里。');
});

render();
loadRecordings();

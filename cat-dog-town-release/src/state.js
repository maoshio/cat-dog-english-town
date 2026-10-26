const STORAGE_KEY = 'cat-dog-english-town-v1';
const PROFILE_IDS = ['sister', 'brother'];
const BUILDINGS = ['home', 'color-house', 'bridge', 'park', 'toy-shop', 'help-house', 'festival'];
const FAMILY_IDS = ['sister','brother','mother','father','uncle','maternalGrandma','maternalGrandpa','paternalGrandpa','paternalGrandma'];

function freshProfile() {
  return {
    pet: null,
    palette: 'cream',
    avatar: 'explorer',
    nickname: '',
    childName: '',
    accent: 'en-US',
    day: 1,
    completed: [],
    review: [],
    accessories: [],
    selectedAccessory: '',
    familySeen: {},
    familyDone: [],
    checkpoint: null,
  };
}

export function createState() {
  return {
    version: 1,
    profiles: { sister: freshProfile(), brother: freshProfile() },
    shared: { completedBuildings: [] },
    family: { names: {}, notes: {} },
    settings: { chineseVoiceURI: '' },
  };
}

function assertProfile(id) {
  if (!PROFILE_IDS.includes(id)) throw new Error('未知档案');
}

export function updateProfile(state, id, patch) {
  assertProfile(id);
  return {
    ...state,
    profiles: {
      ...state.profiles,
      [id]: { ...state.profiles[id], ...patch },
    },
  };
}

export function updateSettings(state, patch) {
  return { ...state, settings: { ...state.settings, ...patch } };
}

export function updateFamily(state, id, patch) {
  return { ...state, family: {
    names: { ...state.family.names, ...(patch.name === undefined ? {} : { [id]: patch.name }) },
    notes: { ...state.family.notes, ...(patch.note === undefined ? {} : { [id]: patch.note }) },
  } };
}

export function completeDay(state, id, day) {
  assertProfile(id);
  if (!Number.isInteger(day) || day < 1 || day > 7) throw new Error('无效章节');
  const profile = state.profiles[id];
  const completed = [...new Set([...profile.completed, day])].sort((a, b) => a - b);
  const updated = updateProfile(state, id, {
    completed,
    day: Math.min(7, Math.max(profile.day, day + 1)),
  });
  const building = BUILDINGS[day - 1];
  const canUnlock = day !== 7 || PROFILE_IDS.every(key => updated.profiles[key].completed.includes(7));
  const buildings = canUnlock
    ? [...new Set([...updated.shared.completedBuildings, building])]
    : updated.shared.completedBuildings;
  return { ...updated, shared: { ...updated.shared, completedBuildings: buildings } };
}

function validProfile(profile) {
  return profile && typeof profile === 'object'
    && (profile.pet === null || ['cat', 'dog'].includes(profile.pet))
    && typeof profile.palette === 'string'
    && typeof profile.avatar === 'string'
    && typeof profile.nickname === 'string'
    && (profile.childName === undefined || typeof profile.childName === 'string')
    && (profile.accent === undefined || ['en-US', 'en-GB'].includes(profile.accent))
    && Number.isInteger(profile.day) && profile.day >= 1 && profile.day <= 7
    && Array.isArray(profile.completed) && profile.completed.every(d => Number.isInteger(d) && d >= 1 && d <= 7)
    && Array.isArray(profile.review) && profile.review.every(item => typeof item === 'string')
    && Array.isArray(profile.accessories) && profile.accessories.every(item => typeof item === 'string')
    && (profile.selectedAccessory === undefined || typeof profile.selectedAccessory === 'string')
    && (profile.familySeen === undefined || (profile.familySeen && typeof profile.familySeen === 'object'))
    && (profile.familyDone === undefined || (Array.isArray(profile.familyDone) && profile.familyDone.every(item => typeof item === 'string')))
    && (profile.checkpoint == null || (
      Number.isInteger(profile.checkpoint.day) && profile.checkpoint.day >= 1 && profile.checkpoint.day <= 7
      && typeof profile.checkpoint.stepId === 'string'
    ));
}

function validateState(value) {
  return value && value.version === 1 && value.profiles
    && PROFILE_IDS.every(id => validProfile(value.profiles[id]))
    && value.shared && Array.isArray(value.shared.completedBuildings)
    && value.shared.completedBuildings.every(item => typeof item === 'string')
    && (value.settings === undefined || (typeof value.settings.chineseVoiceURI === 'string'))
    && (value.family === undefined || (value.family && typeof value.family === 'object'
      && value.family.names && typeof value.family.names === 'object'
      && value.family.notes && typeof value.family.notes === 'object'));
}

export function exportBackup(state) {
  if (!validateState(state)) throw new Error('备份数据无效');
  return JSON.stringify(state, null, 2);
}

export function importBackup(json) {
  let value;
  try { value = JSON.parse(json); } catch { throw new Error('备份文件无法读取'); }
  if (!validateState(value)) throw new Error('备份文件格式不正确');
  return {
    ...value,
    profiles: Object.fromEntries(PROFILE_IDS.map(id => [id, { ...value.profiles[id], childName: value.profiles[id].childName || '', accent: value.profiles[id].accent || 'en-US', familySeen:value.profiles[id].familySeen || {}, familyDone:value.profiles[id].familyDone || [] }])),
    family: { names:value.family?.names || {}, notes:value.family?.notes || {} },
    settings: { chineseVoiceURI: value.settings?.chineseVoiceURI || '' },
  };
}

export function importFamilyPack(state, json) {
  let pack;
  try { pack = JSON.parse(json); } catch { throw new Error('家庭资料文件无法读取'); }
  if (!pack || pack.kind !== 'catdog-family-pack-v1' || !pack.names || !pack.notes || !pack.children) throw new Error('家庭资料格式不正确');
  let next = state;
  for (const id of FAMILY_IDS) {
    const name = pack.names[id];
    const note = pack.notes[id];
    if (typeof name !== 'string' || name.length > 16 || typeof note !== 'string' || note.length > 160) throw new Error('家庭资料内容不正确');
    next = updateFamily(next, id, { name, note });
  }
  for (const id of PROFILE_IDS) {
    const childName = pack.children[id];
    if (typeof childName !== 'string' || childName.length > 12) throw new Error('孩子姓名不正确');
    next = updateProfile(next, id, { childName });
  }
  return next;
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const data = storage.getItem(STORAGE_KEY);
    return data ? importBackup(data) : createState();
  } catch {
    return createState();
  }
}

export function saveState(storage = globalThis.localStorage, state) {
  storage.setItem(STORAGE_KEY, exportBackup(state));
}

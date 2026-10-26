const PETS = {
  cat: { src: './assets/pets/cat.png', name: '小猫' },
  dog: { src: './assets/pets/dog.png', name: '小狗' },
};

const REWARD_ICONS = {
  '小星星围巾': '⭐',
  '彩色画笔': '🖌️',
  '探险小旗': '🚩',
  '星星篮球': '🏀',
  '寻宝徽章': '🏅',
  '友谊铃铛': '🔔',
  '庆典小皇冠': '👑',
};

export function petAsset(species) {
  if (!PETS[species]) throw new Error('未知宠物');
  return PETS[species].src;
}

export function renderPet({ species = 'cat', action = 'idle', accessory = '', growth = 'baby' } = {}) {
  const src = petAsset(species);
  const safeAction = ['idle', 'walk', 'listen', 'happy', 'guide'].includes(action) ? action : 'idle';
  const icon = REWARD_ICONS[accessory] || '';
  const safeGrowth = ['baby', 'young', 'grown'].includes(growth) ? growth : 'baby';
  return `<button class="pet pet--${safeAction} pet--${species} pet--${safeGrowth}" type="button" data-action="pet" data-species="${species}" aria-label="摸摸${PETS[species].name}">
    <span class="pet__shadow"></span>
    <img class="pet__art" src="${src}" alt="${PETS[species].name}" draggable="false">
    <span class="pet__blink pet__blink--one" aria-hidden="true"></span>
    <span class="pet__blink pet__blink--two" aria-hidden="true"></span>
    <span class="pet__sparkles" aria-hidden="true">✦ ✧ ✦</span>
    <span class="pet__growth" aria-hidden="true">${safeGrowth === 'baby' ? '✦' : safeGrowth === 'young' ? '✦ ✦' : '✦ ✦ ✦'}</span>
    ${icon ? `<span class="pet__reward" title="${accessory}" aria-label="${accessory}">${icon}</span>` : ''}
  </button>`;
}

export function setPetAction(element, action) {
  if (!element) return;
  for (const name of ['idle', 'walk', 'listen', 'happy', 'guide']) element.classList.remove(`pet--${name}`);
  element.classList.add(`pet--${action}`);
}

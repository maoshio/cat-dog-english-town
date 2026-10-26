import { PINYIN } from './pinyin-map.js?v=16';

const EXTRA_PINYIN = {
  亦:'yì', 冉:'rǎn', 婷:'tíng', 宸:'chén', 恩:'ēn', 晓:'xiǎo', 曹:'cáo', 杨:'yáng', 松:'sōng', 玲:'líng', 男:'nán', 童:'tóng', 茂:'mào', 荣:'róng', 静:'jìng',
  候:'hòu', 儿:'ér', 尾:'wěi', 巴:'ba', 思:'sī', 意:'yì', 抹:'mǒ', 拿:'ná', 摇:'yáo', 朵:'duǒ', 桌:'zhuō', 耳:'ěr', 象:'xiàng', 问:'wèn', 阳:'yáng',
  丁:'dīng', 买:'mǎi', 哈:'hā', 国:'guó', 外:'wài', 她:'tā', 客:'kè', 弗:'fú', 拉:'lā', 演:'yǎn', 考:'kǎo', 耐:'nài', 表:'biǎo', 达:'dá', 闻:'wén', 种:'zhòng', 员:'yuán', 咚:'dōng', 响:'xiǎng', 很:'hěn', 愿:'yuàn',
};

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

export function toPinyin(chinese) {
  return String(chinese || '').replace(/[\u4e00-\u9fff]+/g, run =>
    [...run].map(char => EXTRA_PINYIN[char] || PINYIN[char] || char).join(' '));
}

export function tri(en, zh, className = '') {
  return `<span class="tri ${className}"><span class="tri__en" data-say="en" data-text="${escapeHtml(en)}">${escapeHtml(en)}</span><span class="tri__zh" data-say="zh" data-text="${escapeHtml(zh)}">${escapeHtml(zh)}</span><span class="tri__py" data-say="zh" data-text="${escapeHtml(zh)}">${escapeHtml(toPinyin(zh))}</span></span>`;
}

export const DAY_EN = [
  ['A New Friend Arrives', 'Forest Cottage', 'A little friend is hiding in town. Listen, find them, and say hello!'],
  ['The Color Changing House', 'Painting Cottage', 'Our house needs colors. Paint it with your new English words!'],
  ['Across the Bridge', 'Town Bridge', 'Who is across the bridge? Find the way and call your pet.'],
  ['Playtime in the Park', 'Town Park', 'Your pet wants to play. Find the ball and jump together!'],
  ['The Missing Toy', 'Secret Tree', 'A friend has lost a toy. Follow the clues and help find it.'],
  ['Helping a Friend', 'Star Square', 'A friend needs help. Listen and find the kind words.'],
  ['Town Festival', 'Town Square', 'The festival is nearly here. Light the town together!'],
];

export const WORD_ZH = {
  cat:'小猫', dog:'小狗', ball:'球', box:'箱子', home:'小屋', red:'红色', blue:'蓝色',
  yellow:'黄色', door:'门', tree:'树', jump:'跳', play:'玩', sleep:'睡觉', sit:'坐下',
  under:'下面', up:'上面', here:'这里', help:'帮助', please:'请', thanks:'谢谢',
  wave:'挥手', star:'星星', heart:'爱心', wood:'木板', stone:'石头', left:'左边',
  middle:'中间', right:'右边', key:'钥匙', clue:'线索', step:'台阶', lantern:'灯笼',
  flag:'旗子', hello:'你好', gold:'金色', mint:'薄荷色',
};

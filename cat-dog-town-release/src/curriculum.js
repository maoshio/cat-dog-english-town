const option = (label, icon) => ({ label, icon });
const listen = (id, cueZh, cueEn, target, options, effect, interaction = 'find') => ({
  id, mode: 'listen', cueZh, cueEn, target, options, effect, interaction,
});
const speak = (id, cueZh, cueEn, target, object, effect) => ({
  id, mode: 'speak', cueZh, cueEn, target, object, effect, interaction: 'voice',
});

export const DAYS = [
  {
    day: 1, title: '宠物来到小镇', eyebrow: '第一集 · 相遇', place: '森林小屋', mood: 'day',
    words: ['cat', 'dog', 'hello'], phrase: 'Hello!', reward: '小星星围巾', building: 'home',
    intro: '今天有一位新朋友躲在小镇里。听听声音，找到它吧！',
    steps: [
      listen('find-cat', '树叶后面有个小身影。听听它的名字，找到那位朋友。', 'Find the cat.', 'cat', [option('cat', '🐈'), option('dog', '🐕'), option('ball', '⚽')], 'pet-peek'),
      speak('greet-pet', '它正看着你呢。轻轻和它打个招呼吧。', 'Hello!', 'hello', '新朋友', 'pet-run'),
      listen('find-dog', '旁边又传来脚步声。还有一位朋友藏在哪里？', 'Find the dog.', 'dog', [option('dog', '🐕'), option('cat', '🐈'), option('box', '📦')], 'friend-peek'),
      speak('wake-home', '两位朋友都来了。再打个招呼，让小屋亮起来。', 'Hello!', 'hello', '小屋', 'home-glow'),
    ],
  },
  {
    day: 2, title: '会变色的小屋', eyebrow: '第二集 · 颜色魔法', place: '画画小屋', mood: 'day',
    words: ['red', 'blue', 'yellow'], phrase: "It's red.", reward: '彩色画笔', building: 'color-house',
    intro: '小屋还没有颜色。你来选颜色，让它发光！',
    steps: [
      listen('pick-red', '小屋的屋顶还是灰灰的。听听宠物想要哪种颜色。', 'Find red.', 'red', [option('red', '🔴'), option('blue', '🔵'), option('yellow', '🟡')], 'house-red', 'drag'),
      speak('say-red', '屋顶变颜色啦。告诉小伙伴，你看到了什么颜色。', "It's red.", "it's red", '红色屋顶', 'paint-burst'),
      listen('pick-blue', '窗户也想要新颜色。听一听，再把颜色送过去。', 'Find blue.', 'blue', [option('yellow', '🟡'), option('blue', '🔵'), option('red', '🔴')], 'house-blue', 'drag'),
      speak('say-blue', '窗户亮晶晶的。把它的颜色说给宠物听。', "It's blue.", "it's blue", '蓝色窗户', 'window-glow'),
    ],
  },
  {
    day: 3, title: '桥那边有什么', eyebrow: '第三集 · 探索', place: '小镇桥边', mood: 'day',
    words: ['door', 'home', 'here'], phrase: 'Come here.', reward: '探险小旗', building: 'bridge',
    intro: '桥对面传来声音。先找到路，再叫宠物一起走。',
    steps: [
      listen('find-door', '桥的那边传来轻轻的敲门声。先找到那扇门。', 'Find the door.', 'door', [option('door', '🚪'), option('ball', '⚽'), option('box', '📦')], 'door-shimmer'),
      speak('call-pet', '桥有点长。叫宠物来到身边，和你一起走。', 'Come here.', 'come here', '小桥', 'pet-cross'),
      listen('find-home', '树丛后面露出屋顶。哪一个才是新小屋？', 'Find the home.', 'home', [option('tree', '🌳'), option('home', '🏠'), option('ball', '⚽')], 'home-reveal'),
      speak('enter-home', '你们找到新路了。再叫宠物过来，一起推开门。', 'Come here.', 'come here', '新路', 'bridge-open'),
    ],
  },
  {
    day: 4, title: '公园里的挑战', eyebrow: '第四集 · 游戏日', place: '小镇公园', mood: 'day',
    words: ['ball', 'jump', 'play'], phrase: "Let's play.", reward: '星星篮球', building: 'park',
    intro: '宠物想玩球。找到球，再搭一条能跳过去的小路。',
    steps: [
      listen('find-ball', '公园里有好多东西。听听宠物最想玩哪一个。', 'Find the ball.', 'ball', [option('ball', '🏀'), option('box', '📦'), option('cat', '🐈')], 'ball-bounce', 'drag'),
      speak('start-play', '宠物已经摆好姿势了。邀请它一起玩吧。', "Let's play.", "let's play", '球场', 'pet-play'),
      listen('find-jump', '小路上有个台阶。听一听，宠物该怎么过去。', 'Find jump.', 'jump', [option('sit', '🧘'), option('jump', '🦘'), option('sleep', '💤')], 'pet-jump'),
      speak('jump-together', '它在等你的口令。说出来，看看它能跳多高。', 'Jump!', 'jump', '台阶', 'platform-rise'),
    ],
  },
  {
    day: 5, title: '不见了的玩具', eyebrow: '第五集 · 寻找线索', place: '神秘树洞', mood: 'night',
    words: ['box', 'under', 'ball'], phrase: 'Here it is.', reward: '寻宝徽章', building: 'toy-shop',
    intro: '小伙伴的玩具不见了。听线索，一起找到它。',
    steps: [
      listen('find-box', '树洞里传来沙沙声。先找到会晃动的箱子。', 'Find the box.', 'box', [option('box', '📦'), option('ball', '⚽'), option('door', '🚪')], 'box-wiggle'),
      speak('show-box', '你发现第一条线索啦。把发现告诉小伙伴。', 'Here it is.', 'here it is', '箱子', 'clue-spark'),
      listen('find-under', '箱子里面没有玩具。听听线索，换个地方找。', 'Look under.', 'under', [option('up', '⬆️'), option('under', '⬇️'), option('here', '📍')], 'toy-reveal'),
      speak('return-toy', '玩具找到了。把它交到小伙伴手里吧。', 'Here it is.', 'here it is', '玩具', 'friend-happy'),
    ],
  },
  {
    day: 6, title: '帮助小镇伙伴', eyebrow: '第六集 · 一起帮忙', place: '星光广场', mood: 'night',
    words: ['help', 'please', 'thanks'], phrase: 'Help, please.', reward: '友谊铃铛', building: 'help-house',
    intro: '小伙伴遇到一点麻烦。听听它需要什么。',
    steps: [
      listen('find-help', '广场上传来求助的声音。看看是谁需要我们。', 'Find help.', 'help', [option('help', '🙋'), option('play', '⚽'), option('sleep', '💤')], 'friend-wave'),
      speak('ask-help', '朋友还差一点就能爬上去。礼貌地请大家一起帮忙。', 'Help, please.', 'help please', '小伙伴', 'ladder-build'),
      listen('find-thanks', '梯子搭好了。听听朋友现在想说什么。', 'Find thanks.', 'thanks', [option('thanks', '🙏'), option('sad', '😢'), option('sleep', '💤')], 'friend-smile'),
      speak('say-thanks', '帮助别人真开心。也对小伙伴说声谢谢吧。', 'Thank you.', 'thank you', '广场', 'square-glow'),
    ],
  },
  {
    day: 7, title: '小镇庆典', eyebrow: '第七集 · 合作终章', place: '小镇中央', mood: 'night',
    words: ['hello', 'red', 'ball', 'help'], phrase: "Let's go!", reward: '庆典小皇冠', building: 'festival',
    intro: '庆典还差两盏灯。两位小小探险家各点亮一盏！',
    steps: [
      listen('review-red', '庆典的灯笼还没挂好。先听听要找哪一种颜色。', 'Find red.', 'red', [option('blue', '🔵'), option('red', '🔴'), option('yellow', '🟡')], 'lantern-one'),
      speak('light-one', '第一盏灯笼已经准备好。喊上宠物一起出发。', "Let's go!", "let's go", '灯笼', 'lantern-one-glow'),
      listen('review-ball', '广场的朋友们在等玩具。听听要带哪一个。', 'Find the ball.', 'ball', [option('box', '📦'), option('ball', '🏀'), option('door', '🚪')], 'pet-parade'),
      speak('light-two', '现在轮到你点亮第二盏灯。邀请所有朋友一起来。', "Let's go!", "let's go", '庆典舞台', 'festival-glow'),
    ],
  },
];

const EXTRAS = {
  1: {
    hunt: ['小猫先躲进叶子里，又从小狗身边跑过。远处的小屋亮着一盏暖灯。跟着声音，一件一件找到它们。', ['cat', 'dog', 'home'], [option('cat', '🐈'), option('dog', '🐕'), option('home', '🏠'), option('ball', '🏀'), option('box', '📦')]],
    pairs: ['两位朋友想知道你记住了什么。把图画和英文名字连起来，它们就会向你眨眼。', [option('cat', '🐈'), option('dog', '🐕'), option('ball', '🏀')]],
    craft: ['小屋门前还是空空的。轻轻布置欢迎角落，让新朋友知道这里也是它的家。', [option('wave', '👋'), option('star', '✦'), option('heart', '💛')], '欢迎角落', 'home-glow'],
    review: ['天色慢慢暗下来。再找找今天见过的朋友和小屋，让它们一起回家。', ['dog', 'cat', 'home']],
  },
  2: {
    hunt: ['画笔碰到屋顶，颜色却调皮地躲起来。听一听宠物的提示，把三种颜色找回来。', ['red', 'blue', 'yellow'], [option('red', '🔴'), option('blue', '🔵'), option('yellow', '🟡'), option('cat', '🐈'), option('door', '🚪')]],
    pairs: ['窗户上出现三张颜色小卡。给每张颜色图找到它的英文名字。', [option('red', '🔴'), option('blue', '🔵'), option('yellow', '🟡')]],
    craft: ['屋顶、窗边和门口都等着你来画。每一次落笔，宠物都会看看新的变化。', [option('red', '🔴'), option('blue', '🔵'), option('yellow', '🟡')], '彩色小屋', 'paint-burst'],
    review: ['小屋画好了。最后听一遍颜色，让它们在你的画里排好队。', ['yellow', 'red', 'blue']],
  },
  3: {
    hunt: ['桥头有一条弯弯的小路。跟着声音找到树、门和小屋，我们就不会走错。', ['tree', 'door', 'home'], [option('tree', '🌳'), option('door', '🚪'), option('home', '🏠'), option('ball', '🏀'), option('box', '📦')]],
    pairs: ['桥边挂着三块路牌。看看图画，把每块路牌的英文名字找出来。', [option('tree', '🌳'), option('door', '🚪'), option('home', '🏠')]],
    craft: ['桥上还有几块木板没有放好。挑木板，一块一块铺到对岸。', [option('wood', '▤'), option('stone', '◈'), option('star', '✦')], '星光小桥', 'bridge-open'],
    review: ['过桥前再看一次路牌。听一听，看看你能不能带宠物找到新小屋。', ['door', 'tree', 'home']],
  },
  4: {
    hunt: ['篮球滚进了草丛。跟着声音找到球、想玩的朋友和跳跃的动作。', ['ball', 'dog', 'jump'], [option('ball', '🏀'), option('dog', '🐕'), option('jump', '🦘'), option('box', '📦'), option('sleep', '💤')]],
    pairs: ['宠物给你摆出三个动作卡。把图片和英文词卡配在一起。', [option('ball', '🏀'), option('jump', '🦘'), option('play', '🎮')]],
    craft: ['球场上的小比赛开始啦。选一个方向把球送出去，看宠物怎么接。', [option('left', '↖'), option('middle', '↑'), option('right', '↗')], '公园球场', 'ball-bounce'],
    review: ['休息一下，再听听球场上的三个声音。你还能一一找到它们吗？', ['jump', 'ball', 'dog']],
  },
  5: {
    hunt: ['小伙伴留了三条线索：一个箱子、一个球，还有藏在下面的东西。跟着声音继续找。', ['box', 'under', 'ball'], [option('box', '📦'), option('under', '⬇️'), option('ball', '🏀'), option('door', '🚪'), option('home', '🏠')]],
    pairs: ['线索卡散落一地。帮宠物把图画和英文词卡重新配好。', [option('box', '📦'), option('under', '⬇️'), option('ball', '🏀')]],
    craft: ['宝箱有五层小机关。每打开一层，就有一颗星星飞出来。', [option('key', '🗝'), option('star', '✦'), option('clue', '◈')], '神秘宝箱', 'toy-reveal'],
    review: ['玩具马上要还给主人了。再顺着线索找一遍，确认没有漏掉什么。', ['box', 'under', 'ball']],
  },
  6: {
    hunt: ['广场上有人招手。仔细听听，是谁在求助，怎样有礼貌地请求，最后该说什么。', ['help', 'please', 'thanks'], [option('help', '🙋'), option('please', '🤲'), option('thanks', '🙏'), option('play', '🏀'), option('sleep', '💤')]],
    pairs: ['朋友做出三个小动作。把动作和对应的英文词卡配在一起。', [option('help', '🙋'), option('please', '🤲'), option('thanks', '🙏')]],
    craft: ['梯子还不够高。挑选材料，一层一层搭起来，让朋友安全下来。', [option('wood', '▤'), option('step', '▣'), option('star', '✦')], '友爱梯子', 'ladder-build'],
    review: ['朋友已经安全了。回头看看今天听到的三句有礼貌的话。', ['help', 'please', 'thanks']],
  },
  7: {
    hunt: ['庆典要用到前几天找到的小东西。跟着声音找出红色、球和需要帮忙的朋友。', ['red', 'ball', 'help'], [option('red', '🔴'), option('ball', '🏀'), option('help', '🙋'), option('box', '📦'), option('blue', '🔵')]],
    pairs: ['灯笼上画着我们一路认识的东西。把图画和英文名字配在一起。', [option('red', '🔴'), option('ball', '🏀'), option('help', '🙋')]],
    craft: ['一盏灯、又一盏灯。挑选装饰，把广场布置成你喜欢的样子。', [option('lantern', '🏮'), option('flag', '⚑'), option('star', '✦')], '小镇庆典', 'festival-glow'],
    review: ['朋友们都到齐了。庆典开始前，听一听熟悉的词，再做一次小小回顾。', ['ball', 'help', 'red']],
  },
};

const LEARNED_WORDS = {
  cat:['小猫','🐈'], dog:['小狗','🐕'], hello:['你好','👋'], find:['寻找','🔎'],
  red:['红色','🔴'], blue:['蓝色','🔵'], yellow:['黄色','🟡'],
  door:['门','🚪'], home:['小屋','🏠'], here:['这里','📍'],
  ball:['球','🏀'], jump:['跳','🦘'], play:['玩','🎮'],
  box:['箱子','📦'], under:['下面','⬇️'], help:['帮助','🙋'],
  please:['请','🤲'], thanks:['谢谢','🙏'],
};

const TEACH_STORIES = {
  cat:'树叶后探出两只小耳朵。原来是小猫！轻轻点图卡，听听它的英文名字。',
  dog:'小狗摇着尾巴跑来了。点一下图卡，听它的英文名字。',
  hello:'新朋友看着你笑。我们先学会说你好，再向它挥挥手。',
  find:'朋友躲起来了。这个词的意思是寻找，等会儿我们一起找它。',
  red:'画笔先点出一抹红色。看一看，听一听，再给它取英文名字。',
  blue:'天空是蓝色的。轻轻点图卡，听听蓝色怎么说。',
  yellow:'阳光把小屋照成黄色。听听这个颜色的英文。',
  door:'桥那边有一扇门。先认识门，再去找它。',
  home:'走过桥就能看到小屋。听听小屋的英文名字。',
  here:'小宠物就在这里。听听“这里”怎么说。',
  ball:'篮球弹了一下，跑到宠物脚边。先认识球。',
  jump:'小宠物轻轻跳起来。先听听“跳”的英文。',
  play:'朋友们准备玩游戏。听听“玩”怎么说。',
  box:'玩具可能在箱子旁边。先认识箱子。',
  under:'小球滚到桌子下面了。听听“下面”怎么说。',
  help:'朋友需要帮忙。先学会这个温暖的词。',
  please:'有礼貌地请朋友帮忙，先听听“请”怎么说。',
  thanks:'朋友帮助了我们。学会说谢谢，让他知道你的心意。',
};

function teach(word) {
  const [translation, icon] = LEARNED_WORDS[word] || [word, '✦'];
  return { id:`learn-${word}`, mode:'teach', word, translation, icon,
    cueEn:word, cueZh:TEACH_STORIES[word] || `先看看${translation}，再听它的英文名字。`,
    target:word, effect:'clue-spark' };
}

function quest(id, kind, story, options, sequence = [], effect = 'clue-spark', count = 0) {
  const cueEn = kind === 'pairs' ? 'Match the pictures and words.'
    : kind === 'craft' ? 'Let us make it!'
      : `Find ${sequence[0]}.`;
  return {
    id, mode: 'quest', kind, story,
    cueZh: kind === 'pairs' ? '先点图画，再点它的英文名字。' : kind === 'craft' ? '选择你喜欢的东西，把这一幕完成。' : '听一个，找一个，跟着宠物继续往前走。',
    cueEn, target: sequence[0] || options[0].label, options, sequence, count, effect,
  };
}

for (const day of DAYS) {
  const extra = EXTRAS[day.day];
  const [firstListen, firstSpeak, secondListen, secondSpeak] = day.steps;
  day.steps = [
    ...[...day.words, ...(day.day === 1 ? ['find'] : [])].map(teach),
    firstListen,
    quest('story-hunt', 'hunt', extra.hunt[0], extra.hunt[2], extra.hunt[1], 'clue-spark'),
    firstSpeak,
    quest('picture-pairs', 'pairs', extra.pairs[0], extra.pairs[1], [], 'clue-spark'),
    secondListen,
    quest('story-craft', 'craft', extra.craft[0], extra.craft[1], [], extra.craft[3], 5),
    secondSpeak,
    quest('story-review', 'hunt', extra.review[0], extra.hunt[2], extra.review[1], 'clue-spark'),
    speak('final-line', '故事就要完成了。再说出今天的短句，让宠物记住这一刻。', day.phrase, day.phrase.replace(/[!.]/g, '').toLowerCase(), extra.craft[2], day.steps[3].effect),
  ];
}

export function getDay(day) {
  return DAYS.find(item => item.day === day);
}

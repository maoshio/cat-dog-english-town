const obj = (en, zh, icon, x, y) => ({ en, zh, icon, x, y });

export const FAMILY_SCENES = [
  { id:'sister', en:'Sister', zh:'姐姐', icon:'🎨', place:'Art Garden', placeZh:'画画花园', scene:'art',
    story:'A little painting can make our town brighter.', storyZh:'拿起画笔，一起让小镇更明亮。', objects:[obj('cat','小猫','🐈',14,58),obj('paint','颜料','🎨',42,28),obj('star','星星','⭐',72,25),obj('flower','花','🌼',80,65)],
    action:{en:'Paint a star!',zh:'画一颗星星！',icon:'🖌️'} },
  { id:'brother', en:'Brother', zh:'弟弟', icon:'🏀', place:'Play Court', placeZh:'游戏球场', scene:'court',
    story:'Play with your pet. Let the ball bounce!', storyZh:'和宠物一起玩球，让球弹起来！', objects:[obj('dog','小狗','🐕',12,61),obj('ball','球','🏀',35,30),obj('jump','跳','✨',69,27),obj('friend','朋友','🧒',80,60)],
    action:{en:"Let's play ball!",zh:'一起玩球吧！',icon:'🏀'} },
  { id:'mother', en:'Mom', zh:'妈妈', icon:'🍎', place:'School Kitchen', placeZh:'学校食堂', scene:'school',
    story:'Let us make lunch and read a book together.', storyZh:'准备午饭，再一起看看书。', objects:[obj('school','学校','🏫',12,50),obj('rice','米饭','🍚',37,30),obj('apple','苹果','🍎',67,29),obj('book','书','📚',81,62)],
    action:{en:'Here is lunch!',zh:'午饭做好啦！',icon:'🍽️'} },
  { id:'father', en:'Dad', zh:'爸爸', icon:'🚗', place:'Car Lane', placeZh:'小镇车道', scene:'road',
    story:'The little car takes us safely home.', storyZh:'沿着小路看看车、家和工具。', objects:[obj('car','小汽车','🚙',12,58),obj('road','道路','🛣️',37,29),obj('home','家','🏠',68,29),obj('tool','工具','🧰',82,63)],
    action:{en:'Drive home!',zh:'开车回家！',icon:'🚗'} },
  { id:'uncle', en:'Uncle', zh:'舅舅', icon:'📖', place:'Faraway Library', placeZh:'远方书房', scene:'study',
    story:'Open a book and travel in a story.', storyZh:'打开书，看着地图，一起想象远方。', objects:[obj('book','书','📖',13,60),obj('map','地图','🗺️',38,25),obj('hello','你好','👋',69,29),obj('moon','月亮','🌙',82,61)],
    action:{en:'Hello, Uncle!',zh:'舅舅，你好！',icon:'💌'} },
  { id:'maternalGrandma', en:'Grandma', zh:'姥姥', icon:'🌾', place:'Rice Field', placeZh:'稻田', scene:'farm',
    story:'Rice grows here. The animals are hungry!', storyZh:'看看稻田里的稻谷、小猪和大鹅。', objects:[obj('rice','稻谷','🌾',13,59),obj('pig','小猪','🐷',37,28),obj('goose','大鹅','🪿',68,28),obj('water','水','💧',82,63)],
    action:{en:'Feed the animals!',zh:'给小动物喂食！',icon:'🌽'} },
  { id:'maternalGrandpa', en:'Grandpa', zh:'姥爷', icon:'🌾', place:'Rice Mill', placeZh:'打米房', scene:'mill',
    story:'Watch the mill turn rice into food.', storyZh:'看一看稻谷怎样变成米。', objects:[obj('rice','稻谷','🌾',12,59),obj('mill','打米机','⚙️',39,26),obj('bag','米袋','🛍️',68,29),obj('pig','小猪','🐖',82,64)],
    action:{en:'Make rice!',zh:'打出香香的米！',icon:'🌾'} },
  { id:'paternalGrandpa', en:'Grandpa', zh:'爷爷', icon:'🏪', place:'Little Shop', placeZh:'小超市', scene:'shop',
    story:'The little shop has things to see and say.', storyZh:'小店里有苹果、牛奶和友好的问候。', objects:[obj('shop','小店','🏪',13,58),obj('apple','苹果','🍎',39,28),obj('milk','牛奶','🥛',68,27),obj('hello','你好','👋',82,62)],
    action:{en:'Open the shop!',zh:'小店开门啦！',icon:'🔔'} },
  { id:'paternalGrandma', en:'Grandma', zh:'奶奶', icon:'🏪', place:'Little Shop', placeZh:'小超市', scene:'shop',
    story:'Find bread and flowers in the shop.', storyZh:'在小店里找找面包和花，再说声谢谢。', objects:[obj('shop','小店','🏪',13,58),obj('bread','面包','🍞',39,28),obj('flower','花','🌼',68,27),obj('thanks','谢谢','💛',82,62)],
    action:{en:'Thank you!',zh:'谢谢你来小店！',icon:'🎁'} },
];

export function getFamilyScene(id) { return FAMILY_SCENES.find(scene => scene.id === id); }

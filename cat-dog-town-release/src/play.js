const MODES = ['paint', 'build', 'ball', 'treasure'];
const COLORS = ['gold', 'red', 'blue', 'mint'];

export function createPlayState() {
  return { mode: 'paint', color: 'gold', blocks: 0, throws: 0, finds: 0 };
}

export function applyPlayEvent(play, event) {
  if (event.type === 'mode' && MODES.includes(event.mode)) return { ...play, mode: event.mode };
  if (event.type === 'paint' && COLORS.includes(event.color)) {
    return { ...play, mode: 'paint', color: event.color };
  }
  if (event.type === 'build') return { ...play, mode: 'build', blocks: Math.min(8, play.blocks + 1) };
  if (event.type === 'reset-build') return { ...play, mode: 'build', blocks: 0 };
  if (event.type === 'throw') return { ...play, mode: 'ball', throws: play.throws + 1 };
  if (event.type === 'search') return { ...play, mode: 'treasure', finds: play.finds + 1 };
  return play;
}

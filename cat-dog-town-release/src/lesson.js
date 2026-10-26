import { getDay } from './curriculum.js?v=16';
import { completeDay, updateProfile } from './state.js?v=16';

export function beginLesson(state, profileId, day) {
  const chapter = getDay(day);
  if (!chapter) throw new Error('没有这一集');
  const profile = state.profiles[profileId];
  if (!profile) throw new Error('未知档案');
  if (day > profile.day && !profile.completed.includes(day)) throw new Error('这一集还没解锁');
  const reviewSteps = profile.review.slice(0, 2).map((target, index) => ({
    id: `review-${index}`, mode: 'speak',
    cueZh: '先和宠物找回上次的小魔法。', cueEn: target,
    target, object: '记忆星', effect: 'clue-spark', interaction: 'voice',
  }));
  const steps = [...reviewSteps, ...chapter.steps];
  const resumeIndex = profile.checkpoint?.day === day && !profile.completed.includes(day)
    ? steps.findIndex(step => step.id === profile.checkpoint.stepId) : 0;
  return {
    state, profileId, day, steps, stepIndex: Math.max(0, resumeIndex), attempts: 0,
    review: [], lastEffect: null, finished: false, hint: 0, teachCount: 0,
    quest: { found: [], open: null, matched: [], count: 0, chosen: [] },
  };
}

export function applyLessonEvent(session, event) {
  if (session.finished) return session;
  const step = session.steps[session.stepIndex];
  if (!step) return session;
  if (step.mode === 'teach' && event.type === 'teach-tap') {
    if (session.teachCount < 1) return { ...session, teachCount: 1, lastEffect: 'quest-progress' };
    return advance(session, 'clue-spark');
  }
  if (step.mode === 'quest') {
    const quest = session.quest || { found: [], open: null, matched: [], count: 0, chosen: [] };
    if (step.kind === 'hunt' && event.type === 'quest-pick') {
      if (event.label !== step.sequence[quest.found.length]) return { ...session, hint: session.hint + 1, lastEffect: 'guide' };
      const found = [...quest.found, event.label];
      if (found.length === step.sequence.length) return advance(session, step.effect);
      return { ...session, quest: { ...quest, found }, hint: 0, lastEffect: 'quest-progress' };
    }
    if (step.kind === 'pairs' && event.type === 'quest-card') {
      const [side, label] = String(event.card || '').split(':');
      if (!['picture', 'word'].includes(side) || !step.options.some(item => item.label === label) || quest.matched.includes(label)) return session;
      if (!quest.open || quest.open.side === side) return { ...session, quest: { ...quest, open: { side, label } }, lastEffect: null };
      if (quest.open.label !== label) return { ...session, quest: { ...quest, open: null }, hint: session.hint + 1, lastEffect: 'guide' };
      const matched = [...quest.matched, label];
      if (matched.length === step.options.length) return advance(session, step.effect);
      return { ...session, quest: { ...quest, open: null, matched }, hint: 0, lastEffect: 'quest-progress' };
    }
    if (step.kind === 'craft' && event.type === 'quest-craft' && step.options.some(item => item.label === event.label)) {
      const count = quest.count + 1;
      if (count >= step.count) return advance(session, step.effect);
      return { ...session, quest: { ...quest, count, chosen: [...quest.chosen, event.label] }, lastEffect: 'quest-progress' };
    }
    return session;
  }
  if (event.type === 'listen-miss' && step.mode === 'listen') {
    return { ...session, hint: session.hint + 1, lastEffect: 'guide' };
  }
  if (event.type === 'speech-miss' && step.mode === 'speak') {
    const attempts = session.attempts + 1;
    if (attempts < 3) return { ...session, attempts, hint: attempts, lastEffect: 'guide' };
    const current = session.state.profiles[session.profileId];
    const state = updateProfile(session.state, session.profileId, {
      review: [...new Set([...current.review, step.target])],
    });
    return advance({ ...session, state, review: [...new Set([...session.review, step.target])] }, 'review-added');
  }
  if (event.type === 'listen-correct' && step.mode === 'listen') return advance(session, step.effect);
  if (event.type === 'speech-match' && step.mode === 'speak') {
    const current = session.state.profiles[session.profileId];
    const state = updateProfile(session.state, session.profileId, {
      review: current.review.filter(word => word !== step.target),
    });
    return advance({ ...session, state, review: session.review.filter(word => word !== step.target) }, step.effect);
  }
  return session;
}

function advance(session, effect) {
  const chapter = getDay(session.day);
  const stepIndex = session.stepIndex + 1;
  if (stepIndex < session.steps.length) {
    const state = updateProfile(session.state, session.profileId, {
      checkpoint: { day: session.day, stepId: session.steps[stepIndex].id },
    });
    return { ...session, state, stepIndex, attempts: 0, hint: 0, teachCount: 0, lastEffect: effect,
      quest: { found: [], open: null, matched: [], count: 0, chosen: [] } };
  }
  const current = session.state.profiles[session.profileId];
  const stateWithReview = updateProfile(session.state, session.profileId, {
    review: [...new Set([...current.review, ...session.review])],
    accessories: [...new Set([...current.accessories, chapter.reward])],
    checkpoint: null,
  });
  return {
    ...session,
    state: completeDay(stateWithReview, session.profileId, session.day),
    stepIndex, attempts: 0, hint: 0, lastEffect: effect, finished: true,
  };
}

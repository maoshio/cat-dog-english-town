export function createAudioClient(win = globalThis) {
  const synthesis = win.speechSynthesis;
  const Utterance = win.SpeechSynthesisUtterance;
  const supported = Boolean(synthesis && Utterance);
  let sequenceId = 0;
  let accent = 'en-US';
  let chineseVoiceURI = '';

  const voices = () => supported ? (synthesis.getVoices?.() || []) : [];
  const locale = voice => String(voice.lang || '').replace('_', '-').toLowerCase();

  function chooseVoice(language) {
    const requested = language === 'en' ? accent.toLowerCase() : 'zh-cn';
    const choices = voices().filter(voice => locale(voice) === requested);
    if (language === 'zh' && chineseVoiceURI) {
      const selected = choices.find(voice => voice.voiceURI === chineseVoiceURI);
      if (selected) return selected;
    }
    return choices.find(voice => voice.default) || choices[0] || null;
  }

  function speakSequence(parts) {
    if (!supported) return false;
    sequenceId += 1;
    const ownId = sequenceId;
    synthesis.cancel();
    const playAt = index => {
      if (ownId !== sequenceId || index >= parts.length) return;
      const { text, language = 'zh', slow = false } = parts[index];
      if (!text) { playAt(index + 1); return; }
      const utterance = new Utterance(text);
      utterance.lang = language === 'en' ? accent : 'zh-CN';
      utterance.rate = slow ? 0.72 : language === 'en' ? 0.9 : 1;
      utterance.pitch = language === 'en' ? 1.02 : 1;
      const voice = chooseVoice(language);
      if (voice) utterance.voice = voice;
      utterance.onend = () => playAt(index + 1);
      utterance.onerror = () => playAt(index + 1);
      synthesis.speak(utterance);
    };
    playAt(0);
    return true;
  }

  return {
    supported,
    setAccent(value) { accent = value === 'en-GB' ? 'en-GB' : 'en-US'; },
    getAccent() { return accent; },
    setChineseVoice(value) { chineseVoiceURI = String(value || ''); },
    listMandarinVoices() {
      return voices().filter(voice => locale(voice) === 'zh-cn')
        .map(voice => ({ name: voice.name, voiceURI: voice.voiceURI }));
    },
    speak(text, language = 'zh', slow = false) { return speakSequence([{ text, language, slow }]); },
    speakSequence,
    stop() { sequenceId += 1; if (supported) synthesis.cancel(); },
  };
}

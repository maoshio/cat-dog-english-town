export function normalizeSpeech(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\bit's\b/g, 'it is')
    .replace(/\bits\b/g, 'it is')
    .replace(/\blet's\b/g, 'let us')
    .replace(/\blets\b/g, 'let us')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesTarget(transcript, target) {
  const heard = normalizeSpeech(transcript);
  const wanted = normalizeSpeech(target);
  if (!heard || !wanted) return false;
  return (` ${heard} `).includes(` ${wanted} `);
}

export function createSpeechClient(win = globalThis) {
  const Recognition = win.SpeechRecognition || win.webkitSpeechRecognition;
  const failure = (code, message) => Object.assign(new Error(message), { code });
  let accent = 'en-US';
  return {
    supported: Boolean(Recognition),
    setAccent(value) { accent = value === 'en-GB' ? 'en-GB' : 'en-US'; },
    listen() {
      if (!Recognition) return Promise.reject(new Error('这个浏览器不支持语音识别'));
      return new Promise((resolve, reject) => {
        const recognition = new Recognition();
        recognition.lang = accent;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        let settled = false;
        const finish = (result, error) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (error) reject(error);
          else resolve(result);
        };
        const timer = setTimeout(() => {
          recognition.abort();
          finish(null, failure('timeout', '没有听到声音，请再试一次'));
        }, 12000);
        recognition.onresult = event => {
          const transcript = event.results?.[0]?.[0]?.transcript || '';
          finish({ transcript });
        };
        recognition.onerror = event => {
          const reasons = {
            'not-allowed': '请在 Safari 允许使用麦克风',
            'service-not-allowed': 'iPad 语音服务目前不可用',
            network: '语音服务需要网络，请检查连接',
            'no-speech': '没有听到声音，请再试一次',
            'audio-capture': '没有找到麦克风',
          };
          finish(null, failure(event.error, reasons[event.error] || '语音识别暂时不可用'));
        };
        recognition.onend = () => {
          if (!settled) finish(null, failure('no-speech', '没有听到声音，请再试一次'));
        };
        try { recognition.start(); } catch {
          finish(null, new Error('麦克风暂时无法启动'));
        }
      });
    },
  };
}

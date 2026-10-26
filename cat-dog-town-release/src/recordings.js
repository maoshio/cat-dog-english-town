const DB_NAME = 'paw-town-family-voices-v1';

export function createRecordingStore(indexedDB = globalThis.indexedDB) {
  if (!indexedDB) return { supported:false, async get(){return null;}, async put(){throw new Error('这台设备无法保存录音');} };
  let database;
  const open = () => database || new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('clips');
    request.onsuccess = () => { database = request.result; resolve(database); };
    request.onerror = () => reject(new Error('录音存储无法打开'));
  });
  return {
    supported:true,
    async get(key) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const request = db.transaction('clips','readonly').objectStore('clips').get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(new Error('录音无法读取'));
      });
    },
    async put(key, blob) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const request = db.transaction('clips','readwrite').objectStore('clips').put(blob,key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('录音无法保存'));
      });
    },
  };
}

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FilesDB', 2);  // <-- Use FilesDB, version 2
  
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs', { keyPath: 'timestamp' });  // Ensure logs store is created
        }
      };
  
      request.onsuccess = (e) => {
        resolve(e.target.result);
      };
  
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  };
  
  const getAllLogsFromDB = async () => {
    const db = await openDB();
    const transaction = db.transaction(['logs'], 'readonly');
    const store = transaction.objectStore('logs');
  
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = (e) => {
        const logs = e.target.result;
        console.log('Fetched Logs:', logs);  // Make sure logs are correctly fetched
        resolve(logs);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  };
  
  
  export { getAllLogsFromDB };
  
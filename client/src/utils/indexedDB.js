const DB_NAME = 'QRKI_DESIGNS';
const DB_VERSION = 1;
const STORE_NAME = 'designs';
const MAX_DESIGNS = 5;

// Initialize the database
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Get database connection
const getDB = async () => {
  return await initDB();
};

// Find the next available slot (QRKI_1 through QRKI_5)
const findNextSlot = async () => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.getAllKeys();
    
    request.onsuccess = () => {
      const existingKeys = request.result;
      const usedSlots = new Set(existingKeys);
      
      // Find first available slot
      for (let i = 1; i <= MAX_DESIGNS; i++) {
        const slotId = `QRKI_${i}`;
        if (!usedSlots.has(slotId)) {
          resolve(slotId);
          return;
        }
      }
      
      // All slots are full
      resolve(null);
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Get count of saved designs
const getDesignCount = async () => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.count();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Save design to a specific slot
const saveDesign = async (slotId, designData) => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  const design = {
    id: slotId,
    ...designData,
    timestamp: Date.now(),
    lastModified: Date.now()
  };
  
  return new Promise((resolve, reject) => {
    const request = store.put(design);
    
    request.onsuccess = () => resolve(slotId);
    request.onerror = () => reject(request.error);
  });
};

// Load design from a specific slot
const loadDesign = async (slotId) => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.get(slotId);
    
    request.onsuccess = () => {
      const design = request.result;
      if (design) {
        resolve(design);
      } else {
        reject(new Error(`Design not found: ${slotId}`));
      }
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Get all saved designs (for the StartDesignPage)
const getAllDesigns = async () => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    
    request.onsuccess = () => {
      const designs = request.result;
      // Sort by last modified (newest first)
      designs.sort((a, b) => b.lastModified - a.lastModified);
      resolve(designs);
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Delete a design
const deleteDesign = async (slotId) => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(slotId);
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Update an existing design (for auto-save)
const updateDesign = async (slotId, designData) => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    // First get the existing design
    const getRequest = store.get(slotId);
    
    getRequest.onsuccess = () => {
      const existingDesign = getRequest.result;
      if (!existingDesign) {
        reject(new Error(`Design not found: ${slotId}`));
        return;
      }
      
      // Update with new data, preserving original timestamp
      const updatedDesign = {
        ...existingDesign,
        ...designData,
        lastModified: Date.now()
      };
      
      const putRequest = store.put(updatedDesign);
      
      putRequest.onsuccess = () => resolve(slotId);
      putRequest.onerror = () => reject(putRequest.error);
    };
    
    getRequest.onerror = () => reject(getRequest.error);
  });
};

export {
  findNextSlot,
  getDesignCount,
  saveDesign,
  loadDesign,
  getAllDesigns,
  deleteDesign,
  updateDesign,
  MAX_DESIGNS
};

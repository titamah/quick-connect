const STORAGE_KEY = 'QRKI_GEN_BG';
const DAILY_LIMIT = 5;
const HOURS_IN_DAY = 24;
export const getGenerationData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { count: 0, timestamps: [] };
    const data = JSON.parse(stored);
    const now = Date.now();
    const dayInMs = HOURS_IN_DAY * 60 * 60 * 1000;
    const validTimestamps = data.timestamps.filter(timestamp => 
      (now - timestamp) < dayInMs
    );
    if (validTimestamps.length !== data.timestamps.length) {
      const updatedData = { count: validTimestamps.length, timestamps: validTimestamps };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      return updatedData;
    }
    return data;
  } catch (error) {
    console.error('Error reading generation data:', error);
    return { count: 0, timestamps: [] };
  }
};
export const canGenerate = () => {
  const data = getGenerationData();
  return data.count < DAILY_LIMIT;
};
export const recordGeneration = () => {
  try {
    const data = getGenerationData();
    const now = Date.now();
    const newData = {
      count: data.count + 1,
      timestamps: [...data.timestamps, now]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    return newData;
  } catch (error) {
    console.error('Error recording generation:', error);
    return { count: 0, timestamps: [] };
  }
};
export const getRemainingGenerations = () => {
  const data = getGenerationData();
  return Math.max(0, DAILY_LIMIT - data.count);
};
export const getGenerationCount = () => {
  const data = getGenerationData();
  return data.count;
};
export const clearGenerationData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing generation data:', error);
  }
};

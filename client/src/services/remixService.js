const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
}

const API_BASE = `${SUPABASE_URL}/rest/v1`;
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1`;

// Common headers for Supabase requests
const getHeaders = (method = 'GET') => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': method === 'POST' ? 'return=representation' : undefined
});

// Storage headers for file uploads
const getStorageHeaders = () => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
});

// Simple client-side rate limiting
let lastRequestTime = 0;
const RATE_LIMIT_MS = 5000; // 5 seconds between requests

const checkRateLimit = () => {
  const now = Date.now();
  if (now - lastRequestTime < RATE_LIMIT_MS) {
    const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastRequestTime)) / 1000);
    throw new Error(`Please wait ${waitTime} seconds before creating another remix.`);
  }
  lastRequestTime = now;
};

// Generate unique filename
const generateFileName = () => {
  return `remix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;
};

// Resize and compress image
const processImage = async (file, maxWidth = 1290, maxHeight = 2796, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions (maintain aspect ratio)
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const ratio = Math.min(widthRatio, heightRatio);
          
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`📏 Image processed: ${img.width}x${img.height} → ${width}x${height}, ${Math.round(blob.size/1024)}KB`);
              resolve(blob);
            } else {
              reject(new Error('Failed to process image'));
            }
          },
          'image/webp',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    
    // Create object URL from file
    img.src = URL.createObjectURL(file);
  });
};

// Validate device state
const validateDeviceState = (deviceState) => {
  if (!deviceState || typeof deviceState !== 'object') {
    throw new Error('Invalid device state');
  }

  // Check required fields
  if (!deviceState.qr || !deviceState.bg) {
    throw new Error('Missing required fields in device state');
  }

  // Size check (50KB limit)
  const jsonString = JSON.stringify(deviceState);
  if (jsonString.length > 51200) {
    throw new Error('Device state too large (max 50KB)');
  }

  return true;
};

export const remixService = {
  /**
   * Upload image to Supabase Storage
   * @param {File|Blob} imageFile - The image file to upload
   * @returns {Promise<string>} - The public URL of uploaded image
   */
  async uploadImage(imageFile) {
    try {
      console.log('📤 Starting image upload...', imageFile.name, `${Math.round(imageFile.size/1024)}KB`);

      // Process image (resize + compress)
      const processedBlob = await processImage(imageFile);
      
      // Generate unique filename
      const fileName = generateFileName();
      
      // Upload to Supabase Storage
      const response = await fetch(
        `${STORAGE_BASE}/object/remix-images/${fileName}`,
        {
          method: 'POST',
          headers: getStorageHeaders(),
          body: processedBlob
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Image upload failed:', response.status, errorText);
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      // Construct public URL
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/remix-images/${fileName}`;
      
      console.log('✅ Image uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  /**
   * Create a new remix
   * @param {Object} deviceState - The device state to save
   * @param {File|null} backgroundImageFile - Optional background image file
   * @returns {Promise<string>} - The remix ID
   */
  async createRemix(deviceState, backgroundImageFile = null) {
    try {
      checkRateLimit();
      
      // Clone device state to avoid mutation
      const processedDeviceState = JSON.parse(JSON.stringify(deviceState));
      
      // If there's a background image, upload it FIRST before validation
      if (backgroundImageFile && processedDeviceState.bg.type === 'image') {
        console.log('🖼️ Uploading background image for remix...');
        const imageUrl = await this.uploadImage(backgroundImageFile);
        processedDeviceState.bg.activeTypeValue = imageUrl;
        console.log('✅ Background image uploaded, URL stored in device state');
      }
      
      // Remove any remaining base64 data if image upload failed or wasn't provided
      if (processedDeviceState.bg.type === 'image' && 
          processedDeviceState.bg.activeTypeValue && 
          processedDeviceState.bg.activeTypeValue.startsWith('data:')) {
        console.log('⚠️ Removing base64 data from device state (image should be uploaded separately)');
        processedDeviceState.bg.activeTypeValue = '';
      }

      // NOW validate after image is uploaded and base64 is removed
      validateDeviceState(processedDeviceState);

      console.log('🚀 Creating remix with processed device state (image URLs only):', processedDeviceState);

      const response = await fetch(`${API_BASE}/remixes`, {
        method: 'POST',
        headers: getHeaders('POST'),
        body: JSON.stringify({
          device_state: processedDeviceState
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create remix failed:', response.status, errorText);
        
        if (response.status === 413) {
          throw new Error('Design too large to share');
        }
        throw new Error(`Failed to create remix: ${response.status}`);
      }

      const data = await response.json();
      const remixId = data[0].id;
      console.log('✅ Remix created successfully:', remixId);
      return remixId;
    } catch (error) {
      console.error('Error creating remix:', error);
      throw error;
    }
  },

  /**
   * Get a remix by ID
   * @param {string} remixId - The remix ID
   * @returns {Promise<Object>} - The remix data
   */
  async getRemix(remixId) {
    try {
      if (!remixId || typeof remixId !== 'string') {
        throw new Error('Invalid remix ID');
      }

      console.log('🔍 Fetching remix:', remixId);

      const response = await fetch(
        `${API_BASE}/remixes?id=eq.${remixId}&select=*`, 
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Get remix failed:', response.status, errorText);
        throw new Error(`Failed to fetch remix: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error('Remix not found or has expired');
      }

      console.log('✅ Remix loaded successfully:', remixId);

      // Increment view count (fire and forget)
      this.incrementViews(remixId).catch(() => {});

      return data[0];
    } catch (error) {
      console.error('Error fetching remix:', error);
      throw error;
    }
  },

  /**
   * Increment view count
   * @param {string} remixId - The remix ID
   */
  async incrementViews(remixId) {
    try {
      // First get current view count
      const response = await fetch(
        `${API_BASE}/remixes?id=eq.${remixId}&select=view_count`, 
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const currentCount = data[0].view_count || 0;
          
          // Update with incremented count
          await fetch(`${API_BASE}/remixes?id=eq.${remixId}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({
              view_count: currentCount + 1
            })
          });
          
          console.log('📈 View count incremented for:', remixId);
        }
      }
    } catch (error) {
      console.warn('Failed to increment views:', error);
    }
  },

  /**
   * Test the service connection
   */
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE}/remixes?limit=1`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (response.ok) {
        console.log('✅ Remix service connection works!');
        return true;
      } else {
        console.error('❌ Remix service connection failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Remix service connection error:', error);
      return false;
    }
  }
};

export default remixService;
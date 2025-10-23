// Use edge function endpoints instead of direct Supabase access
const SUPABASE_PROXY_URL = '/api/supabase-proxy';

let lastRequestTime = 0;
const RATE_LIMIT_MS = 5000;

const checkRateLimit = () => {
  const now = Date.now();
  if (now - lastRequestTime < RATE_LIMIT_MS) {
    const waitTime = Math.ceil(
      (RATE_LIMIT_MS - (now - lastRequestTime)) / 1000
    );
    throw new Error(
      `Please wait ${waitTime} seconds before creating another remix.`
    );
  }
  lastRequestTime = now;
};

const processImage = async (
  file,
  maxWidth = 1290,
  maxHeight = 2796,
  quality = 0.8
) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const ratio = Math.min(widthRatio, heightRatio);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(
                `📏 Image processed: ${img.width}x${
                  img.height
                } → ${width}x${height}, ${Math.round(blob.size / 1024)}KB`
              );
              resolve(blob);
            } else {
              reject(new Error("Failed to process image"));
            }
          },
          "image/webp",
          quality
        );
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

const validateDeviceState = (deviceState) => {
  if (!deviceState || typeof deviceState !== "object") {
    throw new Error("Invalid device state");
  }
  if (!deviceState.qr || !deviceState.bg) {
    throw new Error("Missing required fields in device state");
  }
  const jsonString = JSON.stringify(deviceState);
  if (jsonString.length > 51200) {
    throw new Error("Device state too large (max 50KB)");
  }
  return true;
};

const generateCuteId = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const checkIdExists = async (id) => {
  try {
    const response = await fetch(
      `${SUPABASE_PROXY_URL}?action=get-remix&id=${id}`,
      {
        method: 'GET',
      }
    );
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.warn("Error checking ID existence:", error);
    return false;
  }
};

const generateUniqueId = async () => {
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const id = generateCuteId();
    const exists = await checkIdExists(id);
    if (!exists) {
      console.log("✅ Generated unique cute ID:", id);
      return id;
    }
    attempts++;
    console.warn(
      `⚠️ ID collision detected (${id}), retrying... (${attempts}/${maxAttempts})`
    );
  }
  throw new Error("Failed to generate unique ID after multiple attempts");
};

export const remixService = {
  async uploadImage(imageFile) {
    try {
      console.log(
        "📤 Starting image upload...",
        imageFile.name,
        `${Math.round(imageFile.size / 1024)}KB`
      );
      
      const processedBlob = await processImage(imageFile);
      
      const formData = new FormData();
      formData.append('file', processedBlob, 'image.webp');
      formData.append('fileType', 'image');

      const response = await fetch(`${SUPABASE_PROXY_URL}?action=upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Image upload failed:", response.status, errorData);
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Image uploaded successfully:", data.url);
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  async uploadThumbnail(thumbnailBlob) {
    try {
      console.log('🖼️ Starting thumbnail upload...', `${Math.round(thumbnailBlob.size/1024)}KB`);
      
      const formData = new FormData();
      formData.append('file', thumbnailBlob, 'thumbnail.webp');
      formData.append('fileType', 'thumbnail');

      const response = await fetch(`${SUPABASE_PROXY_URL}?action=upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Thumbnail upload failed:', response.status, errorData);
        throw new Error(`Failed to upload thumbnail: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Thumbnail uploaded successfully:', data.url);
      return data.url;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw error;
    }
  },

  async createRemix(deviceStateSchema, backgroundImageFile = null, thumbnailUrl = null, remixId = null) {
    try {
      checkRateLimit();
      
      // Use provided ID or generate new one
      const cuteId = remixId || await generateUniqueId();
      
      // Check if this ID already exists
      const idExists = remixId ? await checkIdExists(remixId) : false;
      
      // Use the schema directly (it's already processed)
      const processedDeviceState = JSON.parse(JSON.stringify(deviceStateSchema));

      if (backgroundImageFile && processedDeviceState.bg.type === "image") {
        console.log("🖼️ Uploading background image for remix...");
        const imageUrl = await this.uploadImage(backgroundImageFile);
        processedDeviceState.bg.activeTypeValue = imageUrl;
        console.log("✅ Background image uploaded, URL stored in device state");
      }

      if (
        processedDeviceState.bg.type === "image" &&
        processedDeviceState.bg.activeTypeValue &&
        processedDeviceState.bg.activeTypeValue.startsWith("data:")
      ) {
        console.log(
          "⚠️ Removing base64 data from device state (image should be uploaded separately)"
        );
        processedDeviceState.bg.activeTypeValue = "";
      }

      validateDeviceState(processedDeviceState);
      
      const action = idExists ? 'update-remix' : 'create-remix';
      const method = idExists ? 'PATCH' : 'POST';
      
      console.log(`🚀 ${idExists ? 'Updating' : 'Creating'} remix with cute ID:`, cuteId);
      
      const response = await fetch(`${SUPABASE_PROXY_URL}?action=${action}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: cuteId,
          device_state: processedDeviceState,
          thumbnail_url: thumbnailUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ ${method} remix failed:`, response.status, errorData);
        if (response.status === 413) {
          throw new Error("Design too large to share");
        }
        throw new Error(errorData.error || `Failed to ${idExists ? 'update' : 'create'} remix`);
      }

      const data = await response.json();
      const finalRemixId = data.id || cuteId;
      
      console.log(`✅ Remix ${idExists ? 'updated' : 'created'} successfully with cute ID:`, finalRemixId);
      
      return finalRemixId;
    } catch (error) {
      console.error("Error creating remix:", error);
      throw error;
    }
  },

  async getRemix(remixId) {
    try {
      if (!remixId || typeof remixId !== "string") {
        throw new Error("Invalid remix ID");
      }

      console.log("🔍 Fetching remix:", remixId);

      const response = await fetch(
        `${SUPABASE_PROXY_URL}?action=get-remix&id=${remixId}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Get remix failed:", response.status, errorData);
        throw new Error(errorData.error || "Failed to fetch remix");
      }

      const data = await response.json();
      console.log("✅ Remix loaded successfully:", remixId);

      // Increment views (fire and forget)
      this.incrementViews(remixId).catch(() => {});

      return data;
    } catch (error) {
      console.error("Error fetching remix:", error);
      throw error;
    }
  },

  async incrementViews(remixId) {
    try {
      await fetch(`${SUPABASE_PROXY_URL}?action=increment-views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: remixId })
      });
      console.log("📈 View count incremented for:", remixId);
    } catch (error) {
      console.warn("Failed to increment views:", error);
    }
  },

  async testConnection() {
    try {
      // Try to get a remix that doesn't exist - if we get a proper 404, connection works
      const response = await fetch(`${SUPABASE_PROXY_URL}?action=get-remix&id=test123`, {
        method: 'GET',
      });
      
      // Any valid response (even 404) means the connection works
      if (response.status === 404 || response.ok) {
        console.log("✅ Remix service connection works!");
        return true;
      } else {
        console.error("❌ Remix service connection failed:", response.status);
        return false;
      }
    } catch (error) {
      console.error("❌ Remix service connection error:", error);
      return false;
    }
  },
};

export default remixService;
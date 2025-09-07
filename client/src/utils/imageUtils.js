export const createObjectURL = (file) => {
    const url = URL.createObjectURL(file);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5 * 60 * 1000);
    return url;
  };
  export const urlToFile = async (url, filename) => {
    try {
      const extension = url.split('.').pop().split('?')[0];
      const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      return new File([blob], `${filename}.${extension}`, { type: mimeType });
    } catch (error) {
      console.error("Error converting URL to file:", error);
      throw error;
    }
  };
  export const getCroppedImage = (imageSrc, crop) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const x = (image.naturalWidth * crop.x) / 100;
        const y = (image.naturalHeight * crop.y) / 100;
        const width = (image.naturalWidth * crop.width) / 100;
        const height = (image.naturalHeight * crop.height) / 100;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, "image/jpeg");
      };
      image.onerror = reject;
      image.src = imageSrc;
    });
  };
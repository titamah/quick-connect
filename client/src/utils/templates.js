// Template designs for the StartDesignPage
// These match the device state structure and provide different starting points

export const templates = [
  {
    id: "template_1",
    name: "Minimalist QR",
    description: "Clean and simple design",
    deviceInfo: {
      name: "Minimalist QR Design",
      type: "iPhone 15 Pro Max",
      size: { x: 1290, y: 2796 },
    },
    background: {
      style: "solid",
      color: "#FFFFFF",
      bg: null,
      gradient: {
        type: "linear",
        stops: [0, "rgb(255, 255, 255)", 1, "rgb(255, 255, 255)"],
        angle: 0,
        pos: { x: 0.5, y: 0.5 },
      },
      grain: false,
    },
    qrConfig: {
      url: "https://example.com",
      custom: {
        primaryColor: "#000000",
        secondaryColor: "#FFFFFF",
        borderSizeRatio: 0,
        borderColor: "#000000",
        cornerRadiusRatio: 0,
      },
      positionPercentages: {
        x: 0.5,
        y: 0.5,
      },
      rotation: 0,
    },
    imagePalette: [],
    uploadInfo: {
      filename: null,
      originalImageData: null,
      croppedImageData: null,
      crop: null,
    },
    libraryInfo: {
      selectedImageId: null,
      originalImageData: null,
      croppedImageData: null,
      crop: null,
    },
  },
  {
    id: "template_2", 
    name: "Gradient QR",
    description: "Colorful gradient background",
    deviceInfo: {
      name: "Gradient QR Design",
      type: "iPhone 15 Pro Max",
      size: { x: 1290, y: 2796 },
    },
    background: {
      style: "gradient",
      color: "#7ED03B",
      bg: null,
      gradient: {
        type: "linear",
        stops: [
          0,
          "rgb(255, 100, 100)",
          0.3,
          "rgb(100, 200, 255)", 
          0.7,
          "rgb(255, 200, 100)",
          1,
          "rgb(200, 100, 255)",
        ],
        angle: 45,
        pos: { x: 0.5, y: 0.5 },
      },
      grain: false,
    },
    qrConfig: {
      url: "https://mywebsite.com",
      custom: {
        primaryColor: "#FFFFFF",
        secondaryColor: "#000000",
        borderSizeRatio: 0.1,
        borderColor: "#FFFFFF",
        cornerRadiusRatio: 0.2,
      },
      positionPercentages: {
        x: 0.5,
        y: 0.7,
      },
      rotation: 15,
    },
    imagePalette: [],
    uploadInfo: {
      filename: null,
      originalImageData: null,
      croppedImageData: null,
      crop: null,
    },
    libraryInfo: {
      selectedImageId: null,
      originalImageData: null,
      croppedImageData: null,
      crop: null,
    },
  },
  {
    id: "template_3",
    name: "Dark Mode QR", 
    description: "Dark theme with accent colors",
    deviceInfo: {
      name: "Dark Mode QR Design",
      type: "iPhone 15 Pro Max",
      size: { x: 1290, y: 2796 },
    },
    background: {
      style: "solid",
      color: "#1A1A1A",
      bg: null,
      gradient: {
        type: "linear",
        stops: [0, "rgb(26, 26, 26)", 1, "rgb(26, 26, 26)"],
        angle: 0,
        pos: { x: 0.5, y: 0.5 },
      },
      grain: true,
    },
    qrConfig: {
      url: "https://darkmode.com",
      custom: {
        primaryColor: "#00FF88",
        secondaryColor: "#1A1A1A",
        borderSizeRatio: 0.05,
        borderColor: "#00FF88",
        cornerRadiusRatio: 0.15,
      },
      positionPercentages: {
        x: 0.5,
        y: 0.6,
      },
      rotation: -10,
    },
    imagePalette: [],
    uploadInfo: {
      filename: null,
      originalImageData: null,
      croppedImageData: null,
      crop: null,
    },
    libraryInfo: {
      selectedImageId: null,
      originalImageData: null,
      croppedImageData: null,
      crop: null,
    },
  },
  {
    id: "template_4",
    name: "Dark Mode QR", 
    description: "Dark theme with accent colors",
    deviceInfo: {
      name: "Dark Mode QR Design",
      type: "iPhone 15 Pro Max",
      size: { x: 1290, y: 2796 },
    },
    background: {
      style: "solid",
      color: "#1A1A1A",
      bg: null,
      gradient: {
        type: "linear",
        stops: [0, "rgb(26, 26, 26)", 1, "rgb(26, 26, 26)"],
        angle: 0,
        pos: { x: 0.5, y: 0.5 },
      },
      grain: true,
    },
    qrConfig: {
      url: "https://darkmode.com",
      custom: {
        primaryColor: "#00FF88",
        secondaryColor: "#1A1A1A",
        borderSizeRatio: 0.05,
        borderColor: "#00FF88",
        cornerRadiusRatio: 0.15,
      },
      positionPercentages: {
        x: 0.5,
        y: 0.6,
      },
      rotation: -10,
    },
    imagePalette: [],
    uploadInfo: {
      filename: null,
      originalImageData: null,
      croppedImageData: null,
      crop: null,
    },
    libraryInfo: {
      selectedImageId: null,
      originalImageData: null,
      croppedImageData: null,
      crop: null,
    },
  },
  {
    id: "template_5",
    name: "Dark Mode QR", 
    description: "Dark theme with accent colors",
    deviceInfo: {
      name: "Dark Mode QR Design",
      type: "iPhone 15 Pro Max",
      size: { x: 1290, y: 2796 },
    },
    background: {
      style: "solid",
      color: "#1A1A1A",
      bg: null,
      gradient: {
        type: "linear",
        stops: [0, "rgb(26, 26, 26)", 1, "rgb(26, 26, 26)"],
        angle: 0,
        pos: { x: 0.5, y: 0.5 },
      },
      grain: true,
    },
    qrConfig: {
      url: "https://darkmode.com",
      custom: {
        primaryColor: "#00FF88",
        secondaryColor: "#1A1A1A",
        borderSizeRatio: 0.05,
        borderColor: "#00FF88",
        cornerRadiusRatio: 0.15,
      },
      positionPercentages: {
        x: 0.5,
        y: 0.6,
      },
      rotation: -10,
    },
    imagePalette: [],
    uploadInfo: {
      filename: null,
      originalImageData: null,
      croppedImageData: null,
      crop: null,
    },
    libraryInfo: {
      selectedImageId: null,
      originalImageData: null,
      croppedImageData: null,
      crop: null,
    },
  },
];

// Helper function to get a template by ID
export const getTemplateById = (id) => {
  return templates.find(template => template.id === id);
};

// Helper function to get all templates
export const getAllTemplates = () => {
  return templates;
};

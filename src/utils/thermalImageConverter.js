// utils/thermalImageConverter.js
export const convertImageToThermalFormat = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions (thermal printer width - typically 384px)
      const thermalWidth = 384;
      const scaleFactor = thermalWidth / img.width;
      const thermalHeight = img.height * scaleFactor;
      
      canvas.width = thermalWidth;
      canvas.height = thermalHeight;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, thermalWidth, thermalHeight);
      
      // Convert to grayscale and then to 1-bit monochrome
      const imageData = ctx.getImageData(0, 0, thermalWidth, thermalHeight);
      const binaryData = convertTo1Bit(imageData);
      
      // Convert to thermal printer image commands (ESC * command)
      const thermalCommands = generateThermalImageCommands(binaryData, thermalWidth, thermalHeight);
      resolve(thermalCommands);
    };
    
    img.onerror = reject;
    img.src = imageUrl;
  });
};

const convertTo1Bit = (imageData) => {
  const data = imageData.data;
  const binaryData = [];
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Convert to grayscale using luminance formula
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Apply dithering threshold (adjust this value for better results)
    const threshold = 128;
    binaryData.push(luminance > threshold ? 0 : 1);
  }
  
  return binaryData;
};

const generateThermalImageCommands = (binaryData, width, height) => {
  const esc = "\x1B";
  const commands = [];
  
  // ESC * command for bitmap printing
  // m = 0 (single density), 1 (double density), 32 (24-dot double density), 33 (24-dot single density)
  const m = 33; // 24-dot single density
  
  // Calculate bytes per line
  const bytesPerLine = Math.ceil(width / 8);
  
  for (let y = 0; y < height; y++) {
    const lineData = [];
    
    for (let x = 0; x < bytesPerLine; x++) {
      let byte = 0;
      
      for (let bit = 0; bit < 8; bit++) {
        const pixelX = x * 8 + bit;
        if (pixelX < width) {
          const index = y * width + pixelX;
          if (binaryData[index]) {
            byte |= (1 << (7 - bit));
          }
        }
      }
      
      lineData.push(byte);
    }
    
    // ESC * m nL nH data
    const nL = bytesPerLine & 0xFF;
    const nH = (bytesPerLine >> 8) & 0xFF;
    
    commands.push(esc + "*" + String.fromCharCode(m) + String.fromCharCode(nL) + String.fromCharCode(nH));
    commands.push(String.fromCharCode(...lineData));
  }
  
  return commands.join('');
};
/**
 * QRForge Logo & Readability Engine
 * Single Source of Truth for logo preprocessing, protective container synthesis,
 * aspect-ratio preservation, contrast calculations, and safety validation.
 */

export type ContainerShape = 'rounded-square' | 'circle' | 'square' | 'transparent';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface LogoOptions {
  logoDataUrl: string | null;
  trimmedDataUrl: string | null;
  naturalWidth: number;
  naturalHeight: number;
  aspectRatio: number;
  logoScale: number; // 0.1 to 0.35
  containerShape: ContainerShape;
  containerBg: string; // e.g. '#080705', '#3A3A3A', '#EEEEED', '#ffffff', 'transparent'
  containerPadding: number; // 0 to 16
  borderRadius: number; // 0 to 50%
}

export interface SafetyReport {
  isLogoSizeSafe: boolean;
  isContrastSafe: boolean;
  isECSafe: boolean;
  contrastRatio: number;
  logoCoveragePercent: number;
  maxSafeCoveragePercent: number;
  warnings: string[];
}

/**
 * Trims transparent pixels from image canvas to get actual visible bounding box
 */
export const trimTransparentEdges = (imageDataUrl: string): Promise<{
  trimmedDataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  aspectRatio: number;
}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({
          trimmedDataUrl: imageDataUrl,
          naturalWidth: img.naturalWidth || 200,
          naturalHeight: img.naturalHeight || 200,
          aspectRatio: (img.naturalWidth || 200) / (img.naturalHeight || 200),
        });
        return;
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imgData;

        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;
        let hasVisiblePixel = false;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const alphaIndex = (y * width + x) * 4 + 3;
            if (data[alphaIndex] > 10) { // Visible pixel threshold
              hasVisiblePixel = true;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (!hasVisiblePixel || maxX <= minX || maxY <= minY) {
          resolve({
            trimmedDataUrl: imageDataUrl,
            naturalWidth: width,
            naturalHeight: height,
            aspectRatio: width / height,
          });
          return;
        }

        const trimmedWidth = maxX - minX + 1;
        const trimmedHeight = maxY - minY + 1;

        const trimCanvas = document.createElement('canvas');
        trimCanvas.width = trimmedWidth;
        trimCanvas.height = trimmedHeight;
        const trimCtx = trimCanvas.getContext('2d');
        if (!trimCtx) {
          resolve({
            trimmedDataUrl: imageDataUrl,
            naturalWidth: width,
            naturalHeight: height,
            aspectRatio: width / height,
          });
          return;
        }

        trimCtx.drawImage(
          canvas,
          minX, minY, trimmedWidth, trimmedHeight,
          0, 0, trimmedWidth, trimmedHeight
        );

        resolve({
          trimmedDataUrl: trimCanvas.toDataURL('image/png'),
          naturalWidth: trimmedWidth,
          naturalHeight: trimmedHeight,
          aspectRatio: trimmedWidth / trimmedHeight,
        });
      } catch (err) {
        // Fallback for cross-origin or canvas read restriction
        resolve({
          trimmedDataUrl: imageDataUrl,
          naturalWidth: img.naturalWidth || 200,
          naturalHeight: img.naturalHeight || 200,
          aspectRatio: (img.naturalWidth || 200) / (img.naturalHeight || 200),
        });
      }
    };

    img.onerror = () => {
      resolve({
        trimmedDataUrl: imageDataUrl,
        naturalWidth: 200,
        naturalHeight: 200,
        aspectRatio: 1,
      });
    };

    img.src = imageDataUrl;
  });
};

/**
 * Creates a pixel-perfect composite logo image inside a protective container shape
 */
export const createCompositeLogo = (options: LogoOptions): Promise<string | null> => {
  return new Promise((resolve) => {
    const sourceUrl = options.trimmedDataUrl || options.logoDataUrl;
    if (!sourceUrl) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const CANVAS_SIZE = 512;
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(sourceUrl);
        return;
      }

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw Protective Container Box if not transparent
      if (options.containerShape !== 'transparent') {
        ctx.fillStyle = options.containerBg || '#080705';

        const paddingPercent = (options.containerPadding / 100) * CANVAS_SIZE;
        const boxX = paddingPercent;
        const boxY = paddingPercent;
        const boxSize = CANVAS_SIZE - paddingPercent * 2;

        ctx.beginPath();
        if (options.containerShape === 'circle') {
          const radius = boxSize / 2;
          ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, radius, 0, Math.PI * 2);
        } else if (options.containerShape === 'rounded-square') {
          const cornerRadius = (options.borderRadius / 100) * boxSize || boxSize * 0.22;
          ctx.roundRect(boxX, boxY, boxSize, boxSize, cornerRadius);
        } else {
          ctx.rect(boxX, boxY, boxSize, boxSize);
        }
        ctx.fill();
      }

      // Calculate Aspect Ratio Preserved Inner Logo Bounding Box
      const innerAreaSize = CANVAS_SIZE * (1 - (options.containerPadding * 2) / 100);
      const aspect = options.aspectRatio || 1;

      let drawW = innerAreaSize;
      let drawH = innerAreaSize;

      if (aspect > 1) {
        drawH = innerAreaSize / aspect;
      } else {
        drawW = innerAreaSize * aspect;
      }

      const drawX = (CANVAS_SIZE - drawW) / 2;
      const drawY = (CANVAS_SIZE - drawH) / 2;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => resolve(null);
    img.src = sourceUrl;
  });
};

/**
 * Calculates WCAG relative luminance contrast ratio between two hex colors
 */
export const calculateContrastRatio = (hex1: string, hex2: string): number => {
  const getLuminance = (hex: string) => {
    let color = hex.replace('#', '');
    if (color.length === 3) {
      color = color.split('').map((c) => c + c).join('');
    }
    if (color.length !== 6) return 0.5;

    const r = parseInt(color.substring(0, 2), 16) / 255;
    const g = parseInt(color.substring(2, 4), 16) / 255;
    const b = parseInt(color.substring(4, 6), 16) / 255;

    const transform = (val: number) =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);

    return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
  };

  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (brighter + 0.05) / (darker + 0.05);
};

/**
 * Validates QR & Logo Safety parameters in real time
 */
export const validateQRLogoSafety = (
  logoScale: number,
  errorCorrection: ErrorCorrectionLevel,
  dotsColor: string,
  bgColor: string,
  hasLogo: boolean
): SafetyReport => {
  const warnings: string[] = [];

  // Calculate Coverage Percentage
  const logoCoveragePercent = Math.round(logoScale * logoScale * 100);

  // Maximum Safe Coverage per EC Level
  const maxSafeCoverageMap: Record<ErrorCorrectionLevel, number> = {
    L: 10,
    M: 15,
    Q: 22,
    H: 28,
  };

  const maxSafeCoveragePercent = maxSafeCoverageMap[errorCorrection] || 28;
  const isLogoSizeSafe = !hasLogo || logoCoveragePercent <= maxSafeCoveragePercent;

  if (hasLogo && logoCoveragePercent > maxSafeCoveragePercent) {
    warnings.push(`Logo occupies ${logoCoveragePercent}% of QR area (Max recommended for Level ${errorCorrection} is ${maxSafeCoveragePercent}%).`);
  }

  // EC Level Safety Check
  const isECSafe = !hasLogo || errorCorrection === 'H' || errorCorrection === 'Q';
  if (hasLogo && (errorCorrection === 'L' || errorCorrection === 'M')) {
    warnings.push(`Error correction level ${errorCorrection} is low for logo integration. Upgrade to Q or H for optimal scanning.`);
  }

  // Contrast Ratio Check
  const contrastRatio = Number(calculateContrastRatio(dotsColor, bgColor).toFixed(2));
  const isContrastSafe = contrastRatio >= 3.5;
  if (!isContrastSafe) {
    warnings.push(`Low contrast ratio (${contrastRatio}:1). Scanners require at least 3.5:1 contrast between dots and background.`);
  }

  return {
    isLogoSizeSafe,
    isContrastSafe,
    isECSafe,
    contrastRatio,
    logoCoveragePercent,
    maxSafeCoveragePercent,
    warnings,
  };
};

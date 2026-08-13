import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface PrintQRCardProps {
  contentType: string;
  data: string;
  dotsColor: string;
  bgColor: string;
  isTransparentBg: boolean;
  dotsType: any;
  cornersSquareType: any;
  cornersSquareColor: string;
  cornersDotType: any;
  cornersDotColor: string;
  errorCorrection: any;
  qrMargin: number;
  logoScale: number;
  compositeLogoUrl: string | null;
  wifiSSID?: string;
  wifiEncryption?: string;
}

export const PrintQRCard: React.FC<PrintQRCardProps> = ({
  contentType,
  data,
  dotsColor,
  bgColor,
  isTransparentBg,
  dotsType,
  cornersSquareType,
  cornersSquareColor,
  cornersDotType,
  cornersDotColor,
  errorCorrection,
  qrMargin,
  logoScale,
  compositeLogoUrl,
  wifiSSID,
}) => {
  const printQrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!printQrRef.current || !data) return;

    const printOptions = {
      width: 400,
      height: 400,
      type: 'svg' as const,
      data,
      margin: qrMargin,
      qrOptions: { errorCorrectionLevel: errorCorrection },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: logoScale,
        margin: 0,
        crossOrigin: 'anonymous',
      },
      dotsOptions: { type: dotsType, color: dotsColor },
      backgroundOptions: { color: isTransparentBg ? 'transparent' : bgColor },
      cornersSquareOptions: { type: cornersSquareType, color: cornersSquareColor || dotsColor },
      cornersDotOptions: { type: cornersDotType, color: cornersDotColor || dotsColor },
      image: compositeLogoUrl || undefined,
    };

    printQrRef.current.innerHTML = '';
    const qrInstance = new QRCodeStyling(printOptions);
    qrInstance.append(printQrRef.current);
  }, [
    data, dotsColor, bgColor, isTransparentBg, dotsType, cornersSquareType,
    cornersSquareColor, cornersDotType, cornersDotColor, errorCorrection,
    qrMargin, logoScale, compositeLogoUrl
  ]);

  // Contextual Heading & Label based on Content Type
  const getContextualLabel = () => {
    switch (contentType) {
      case 'url':
        return { action: 'Scan to visit website', detail: data };
      case 'wifi':
        return { action: 'Wi-Fi Network Access', detail: `Network (SSID): ${wifiSSID || 'Wireless Network'}` };
      case 'whatsapp':
        return { action: 'Chat with us on WhatsApp', detail: data };
      case 'email':
        return { action: 'Send us an Email', detail: data.replace(/^mailto:/, '') };
      case 'vcard':
        return { action: 'Scan to add Contact to Phonebook', detail: 'Digital Contact Card' };
      case 'event':
        return { action: 'Scan to view Event Details', detail: 'Calendar Event' };
      case 'phone':
        return { action: 'Scan to Call', detail: data.replace(/^tel:/, '') };
      default:
        return { action: 'Scan to view content', detail: data };
    }
  };

  const { action, detail } = getContextualLabel();

  return (
    <div className="print-only-card hidden print:flex flex-col items-center justify-center min-h-screen bg-white text-black p-8 text-center font-sans">
      <div className="w-[420px] max-w-full p-8 rounded-3xl border-2 border-neutral-200 bg-white shadow-xl flex flex-col items-center justify-center space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 w-full justify-center">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center p-1">
            <svg viewBox="0 0 512 512" className="w-full h-full">
              <rect x="100" y="100" width="110" height="110" rx="28" fill="none" stroke="#FFFFFF" strokeWidth="24"/>
              <rect x="133" y="133" width="44" height="44" rx="12" fill="#FFFFFF"/>
              <rect x="302" y="100" width="110" height="110" rx="28" fill="none" stroke="#FFFFFF" strokeWidth="24"/>
              <rect x="335" y="133" width="44" height="44" rx="12" fill="#FFFFFF"/>
              <rect x="100" y="302" width="110" height="110" rx="28" fill="none" stroke="#FFFFFF" strokeWidth="24"/>
              <rect x="133" y="335" width="44" height="44" rx="12" fill="#FFFFFF"/>
              <rect x="250" y="140" width="28" height="70" rx="10" fill="#FFFFFF"/>
              <rect x="342" y="246" width="70" height="28" rx="10" fill="#FFFFFF"/>
              <rect x="250" y="302" width="28" height="70" rx="10" fill="#FFFFFF"/>
              <rect x="364" y="302" width="48" height="48" rx="12" fill="#FFFFFF"/>
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-black">QRForge</span>
        </div>

        {/* High Resolution Rendered QR Code */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center">
          <div ref={printQrRef} className="w-[300px] h-[300px] flex items-center justify-center" />
        </div>

        {/* Contextual Label & Payload Detail */}
        <div className="space-y-1 w-full pt-2">
          <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
            {action}
          </p>
          <p className="text-xs font-mono font-medium text-black truncate max-w-full px-2">
            {detail}
          </p>
        </div>

      </div>
    </div>
  );
};

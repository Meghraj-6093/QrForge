import React, { useEffect, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Printer, X } from 'lucide-react';

interface PrintCardModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export const PrintCardModal: React.FC<PrintCardModalProps> = ({
  isOpen,
  onClose,
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
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Pre-generate High-Resolution Data URL (1600px) for razor-sharp print quality
  useEffect(() => {
    if (!isOpen || !data) return;

    const exportOptions = {
      width: 1600,
      height: 1600,
      type: 'canvas' as const,
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

    const qrInstance = new QRCodeStyling(exportOptions);
    qrInstance.getRawData('png').then((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setQrDataUrl(url);
      }
    });
  }, [
    isOpen, data, dotsColor, bgColor, isTransparentBg, dotsType, cornersSquareType,
    cornersSquareColor, cornersDotType, cornersDotColor, errorCorrection,
    qrMargin, logoScale, compositeLogoUrl
  ]);

  if (!isOpen) return null;

  // Contextual Heading & Label based on Content Type
  const getContextualLabel = () => {
    switch (contentType) {
      case 'url':
        return { action: 'Scan to visit', detail: data };
      case 'wifi':
        return { action: 'Wi-Fi Access', detail: `Network: ${wifiSSID || 'Wireless Access'}` };
      case 'whatsapp':
        return { action: 'Chat with us', detail: data };
      case 'email':
        return { action: 'Email', detail: data.replace(/^mailto:/, '') };
      case 'vcard':
        return { action: 'Save Contact', detail: 'Digital Contact Card' };
      case 'event':
        return { action: 'Event Details', detail: 'Calendar Event' };
      case 'phone':
        return { action: 'Call', detail: data.replace(/^tel:/, '') };
      default:
        return { action: 'Scan to view', detail: data };
    }
  };

  const { action, detail } = getContextualLabel();

  const handleTriggerBrowserPrint = () => {
    window.print();
  };

  return (
    <>
      {/* Interactive Modal Backdrop & Card Preview (Screen View Only) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080705]/90 backdrop-blur-xl no-print animate-fadeIn">
        <div className="graphite-card rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#3A3A3A] relative">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-3.5">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#EEEEED]" />
              <h3 className="text-base font-bold text-[#EEEEED]">Printable Physical Card</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#3A3A3A]/40 text-[#a3a3a3] hover:text-white hover:bg-[#3A3A3A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Centered Printable Physical Card Display */}
          <div className="flex justify-center py-1">
            <div className="w-[360px] max-w-full bg-white text-black p-7 rounded-3xl border border-neutral-200 shadow-md flex flex-col items-center justify-center text-center space-y-5">
              
              {/* Card Header Brand Logo */}
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 w-full justify-center">
                <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center p-1">
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
                <span className="text-sm font-black tracking-tight text-black">QRForge</span>
              </div>

              {/* Dedicated Outer QR Container Shell (Rounded Outer Border, Intact Square QR) */}
              <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Printable QR Code" 
                    className="w-[250px] h-[250px] object-contain"
                  />
                ) : (
                  <div className="w-[250px] h-[250px] flex items-center justify-center text-xs text-neutral-400">
                    Generating High-Res Print Card...
                  </div>
                )}
              </div>

              {/* Contextual Action Label & Destination Text */}
              <div className="space-y-1 w-full pt-1">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                  {action}
                </p>
                <p className="text-xs font-mono font-semibold text-neutral-900 break-all max-w-full px-2">
                  {detail}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-[#3A3A3A] pt-4">
            <button
              onClick={onClose}
              className="btn-graphite px-4 py-2.5 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              onClick={handleTriggerBrowserPrint}
              disabled={!qrDataUrl}
              className="btn-platinum px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#080705]" />
              <span>Print Physical Card</span>
            </button>
          </div>

        </div>
      </div>

      {/* Print-Only Representation (Visible ONLY during window.print()) */}
      <div className="print-only-card hidden print:flex flex-col items-center justify-center min-h-screen bg-white text-black p-8 text-center font-sans">
        <div className="w-[420px] max-w-full p-9 rounded-3xl border border-neutral-200 bg-white shadow-none flex flex-col items-center justify-center space-y-6">
          
          {/* Card Header Brand Logo */}
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 w-full justify-center">
            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center p-1">
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
            <span className="text-base font-black tracking-tight text-black">QRForge</span>
          </div>

          {/* Dedicated Outer QR Container Shell (Rounded Outer Border, Intact Square QR) */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center">
            {qrDataUrl && (
              <img 
                src={qrDataUrl} 
                alt="Printable QR Code" 
                className="w-[300px] h-[300px] object-contain"
              />
            )}
          </div>

          {/* Contextual Action Label & Destination Text */}
          <div className="space-y-1 w-full pt-1">
            <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
              {action}
            </p>
            <p className="text-xs font-mono font-semibold text-neutral-900 break-all max-w-full px-2">
              {detail}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

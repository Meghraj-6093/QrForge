import React, { useEffect, useState, useRef } from 'react';
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
  const cardPreviewRef = useRef<HTMLDivElement>(null);

  // Pre-generate High-Resolution Data URL for 100% reliable print rendering
  useEffect(() => {
    if (!isOpen || !data) return;

    const exportOptions = {
      width: 1200,
      height: 1200,
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
        return { action: 'Scan to visit website', detail: data };
      case 'wifi':
        return { action: 'Wi-Fi Access Card', detail: `Network: ${wifiSSID || 'Wireless Access'}` };
      case 'whatsapp':
        return { action: 'Chat with us on WhatsApp', detail: data };
      case 'email':
        return { action: 'Send us an Email', detail: data.replace(/^mailto:/, '') };
      case 'vcard':
        return { action: 'Save Digital Contact', detail: 'Contact Card' };
      case 'event':
        return { action: 'Event Details', detail: 'Calendar Event' };
      case 'phone':
        return { action: 'Scan to Call', detail: data.replace(/^tel:/, '') };
      default:
        return { action: 'Scan to view content', detail: data };
    }
  };

  const { action, detail } = getContextualLabel();

  const handleTriggerBrowserPrint = () => {
    window.print();
  };

  return (
    <>
      {/* Interactive Modal Backdrop & Card Preview (Screen Only) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080705]/90 backdrop-blur-xl no-print animate-fadeIn">
        <div className="graphite-card rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-[#3A3A3A] relative">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-4">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#EEEEED]" />
              <h3 className="text-base font-bold text-[#EEEEED]">Printable QR Card Preview</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#3A3A3A]/40 text-[#a3a3a3] hover:text-white hover:bg-[#3A3A3A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Centered Printable Physical Card Display */}
          <div className="flex justify-center py-2">
            <div 
              ref={cardPreviewRef}
              className="w-[340px] max-w-full bg-white text-black p-7 rounded-3xl border border-neutral-300 shadow-2xl flex flex-col items-center justify-center text-center space-y-5"
            >
              {/* Card Header Logo */}
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3.5 w-full justify-center">
                <div className="w-7 h-7 rounded-xl bg-black flex items-center justify-center p-1">
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

              {/* Rendered High Resolution QR Image */}
              <div className="p-3 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Printable QR Code" 
                    className="w-[240px] h-[240px] object-contain"
                  />
                ) : (
                  <div className="w-[240px] h-[240px] flex items-center justify-center text-xs text-neutral-400">
                    Generating High-Res Print Card...
                  </div>
                )}
              </div>

              {/* Contextual Action Label & Detail */}
              <div className="space-y-1 w-full">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                  {action}
                </p>
                <p className="text-xs font-mono font-semibold text-black truncate max-w-full px-2">
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
              className="btn-platinum px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-[#080705]" />
              <span>Print Physical Card</span>
            </button>
          </div>

        </div>
      </div>

      {/* Print-Only Representation (Visible ONLY during window.print()) */}
      <div className="print-only-card hidden print:flex flex-col items-center justify-center min-h-screen bg-white text-black p-8 text-center font-sans">
        <div className="w-[420px] max-w-full p-8 rounded-3xl border-2 border-neutral-200 bg-white shadow-none flex flex-col items-center justify-center space-y-6">
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

          <div className="p-4 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center">
            {qrDataUrl && (
              <img 
                src={qrDataUrl} 
                alt="Printable QR Code" 
                className="w-[300px] h-[300px] object-contain"
              />
            )}
          </div>

          <div className="space-y-1 w-full pt-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
              {action}
            </p>
            <p className="text-xs font-mono font-semibold text-black truncate max-w-full px-2">
              {detail}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

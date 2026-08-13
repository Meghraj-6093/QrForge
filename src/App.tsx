import React, { useState, useCallback, useRef, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { 
  Download, 
  Upload, 
  Settings, 
  Zap, 
  Mail, 
  Phone, 
  MessageCircle, 
  Wifi, 
  User, 
  Check, 
  Copy, 
  Sparkles, 
  Sliders, 
  Palette, 
  Layers, 
  Image as ImageIcon, 
  ShieldCheck, 
  Share2,
  Calendar,
  Scan,
  History,
  Printer, 
  X, 
  ExternalLink,
  Trash2,
  DownloadCloud,
  CheckCircle2,
  Lock,
  WifiOff
} from 'lucide-react';

type MainView = 'create' | 'scan' | 'history';
type ContentType = 'url' | 'text' | 'wifi' | 'vcard' | 'event' | 'email' | 'phone' | 'whatsapp';
type CustomizerTab = 'presets' | 'colors' | 'shapes' | 'logo' | 'specs';
type ExportFormat = 'png' | 'svg' | 'webp' | 'jpeg';

interface HistoryItem {
  id: string;
  timestamp: number;
  type: ContentType;
  title: string;
  data: string;
}

interface Preset {
  id: string;
  name: string;
  dotsColor: string;
  bgColor: string;
  dotsType: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square';
  cornersSquareType: 'extra-rounded' | 'square' | 'dot';
  cornersDotType: 'dot' | 'square';
}

const OBSIDIAN_PRESETS: Preset[] = [
  {
    id: 'sapphire-pure',
    name: 'Sapphire',
    dotsColor: '#3b82f6',
    bgColor: '#07080c',
    dotsType: 'rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  },
  {
    id: 'cyan-cyber',
    name: 'Cyan',
    dotsColor: '#06b6d4',
    bgColor: '#07080c',
    dotsType: 'dots',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  },
  {
    id: 'emerald-slate',
    name: 'Emerald',
    dotsColor: '#10b981',
    bgColor: '#07080c',
    dotsType: 'classy-rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  },
  {
    id: 'violet-night',
    name: 'Violet',
    dotsColor: '#8b5cf6',
    bgColor: '#07080c',
    dotsType: 'rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  },
  {
    id: 'amber-gold',
    name: 'Amber',
    dotsColor: '#f59e0b',
    bgColor: '#07080c',
    dotsType: 'classy',
    cornersSquareType: 'square',
    cornersDotType: 'square',
  },
  {
    id: 'monochrome-crisp',
    name: 'Monochrome',
    dotsColor: '#f8fafc',
    bgColor: '#07080c',
    dotsType: 'square',
    cornersSquareType: 'square',
    cornersDotType: 'square',
  }
];

const App = () => {
  // Navigation State
  const [activeView, setActiveView] = useState<MainView>('create');

  // PWA Install Prompt State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);

  // Privacy Modal State
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  // Content Selection & Inputs
  const [contentType, setContentType] = useState<ContentType>('url');
  const [rawText, setRawText] = useState('https://github.com');
  
  // Wi-Fi State
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard State
  const [vcardFirstName, setVcardFirstName] = useState('');
  const [vcardLastName, setVcardLastName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardCompany, setVcardCompany] = useState('');
  const [vcardTitle, setVcardTitle] = useState('');

  // Event State
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  // Email State
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // WhatsApp State
  const [waNumber, setWaNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');

  // QR Styling Options (60-30-10 Rule)
  const [qrSize, setQrSize] = useState<number>(320);
  const [exportSize, setExportSize] = useState<number>(1024);
  const [qrMargin, setQrMargin] = useState<number>(10);
  const [dotsColor, setDotsColor] = useState<string>('#3b82f6');
  const [bgColor, setBgColor] = useState<string>('#07080c');
  const [isTransparentBg, setIsTransparentBg] = useState<boolean>(false);
  const [dotsType, setDotsType] = useState<'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square'>('rounded');
  const [cornersSquareType, setCornersSquareType] = useState<'extra-rounded' | 'square' | 'dot'>('extra-rounded');
  const [cornersDotType, setCornersDotType] = useState<'dot' | 'square'>('dot');
  const [cornersSquareColor, setCornersSquareColor] = useState<string>('#3b82f6');
  const [cornersDotColor, setCornersDotColor] = useState<string>('#3b82f6');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  // Logo State
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(0.24);
  const [logoMargin, setLogoMargin] = useState<number>(4);

  // QR Scanner State
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qrforge_history');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { return []; }
      }
    }
    return [];
  });

  // UI Toast States
  const [customizerTab, setCustomizerTab] = useState<CustomizerTab>('presets');
  const [copiedState, setCopiedState] = useState<boolean>(false);
  const [copiedImageState, setCopiedImageState] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');

  const previewRef = useRef<HTMLDivElement | null>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  // Catch PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredInstallPrompt(null);
    }
  };

  // Compute Encoded Data String
  const getEncodedData = useCallback((): string => {
    switch (contentType) {
      case 'url':
        if (!rawText.trim()) return 'https://github.com';
        return rawText.startsWith('http://') || rawText.startsWith('https://') 
          ? rawText 
          : `https://${rawText}`;
      case 'text':
        return rawText || 'QRForge — Privacy-First QR Code';
      case 'wifi':
        if (!wifiSSID.trim()) return 'WIFI:S:MyNetwork;T:WPA;P:secret123;;';
        return `WIFI:S:${wifiSSID};T:${wifiEncryption};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardLastName};${vcardFirstName};;;\nFN:${vcardFirstName} ${vcardLastName}\nORG:${vcardCompany}\nTITLE:${vcardTitle}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case 'event':
        const startFormatted = eventStartDate ? eventStartDate.replace(/[-:]/g, '') : '20260901T100000Z';
        const endFormatted = eventEndDate ? eventEndDate.replace(/[-:]/g, '') : '20260901T120000Z';
        return `BEGIN:VEVENT\nSUMMARY:${eventTitle || 'Meeting'}\nLOCATION:${eventLocation || 'Online'}\nDTSTART:${startFormatted}\nDTEND:${endFormatted}\nDESCRIPTION:${eventDescription || 'Created with QRForge'}\nEND:VEVENT`;
      case 'email':
        if (!emailTo.trim()) return 'mailto:info@example.com';
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'phone':
        return `tel:${rawText || '+1234567890'}`;
      case 'whatsapp':
        const cleanNum = waNumber.replace(/[^0-9]/g, '');
        return `https://wa.me/${cleanNum || '1234567890'}?text=${encodeURIComponent(waMessage)}`;
      default:
        return rawText || 'https://github.com';
    }
  }, [
    contentType, rawText, wifiSSID, wifiPassword, wifiEncryption, wifiHidden,
    vcardFirstName, vcardLastName, vcardPhone, vcardEmail, vcardCompany, vcardTitle,
    eventTitle, eventLocation, eventStartDate, eventEndDate, eventDescription,
    emailTo, emailSubject, emailBody, waNumber, waMessage
  ]);

  // Save to History Log
  const saveToHistory = useCallback((dataStr: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: contentType,
      title: dataStr.length > 30 ? dataStr.substring(0, 30) + '...' : dataStr,
      data: dataStr,
    };
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.data !== dataStr);
      const updated = [newItem, ...filtered].slice(0, 25);
      localStorage.setItem('qrforge_history', JSON.stringify(updated));
      return updated;
    });
  }, [contentType]);

  // Update QR Code Canvas
  const updateQRCode = useCallback(() => {
    if (!previewRef.current) return;

    const data = getEncodedData();
    const finalBgColor = isTransparentBg ? 'transparent' : bgColor;

    const options = {
      width: qrSize,
      height: qrSize,
      type: 'svg' as const,
      data,
      margin: qrMargin,
      qrOptions: {
        errorCorrectionLevel: errorCorrection,
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: logoSize,
        margin: logoMargin,
        crossOrigin: 'anonymous',
      },
      dotsOptions: {
        type: dotsType,
        color: dotsColor,
      },
      backgroundOptions: {
        color: finalBgColor,
      },
      cornersSquareOptions: {
        type: cornersSquareType,
        color: cornersSquareColor || dotsColor,
      },
      cornersDotOptions: {
        type: cornersDotType,
        color: cornersDotColor || dotsColor,
      },
      image: logoDataUrl || undefined,
    };

    previewRef.current.innerHTML = '';
    const qrCode = new QRCodeStyling(options);
    qrInstanceRef.current = qrCode;
    qrCode.append(previewRef.current);

    saveToHistory(data);
  }, [
    getEncodedData, qrSize, qrMargin, errorCorrection, logoSize, logoMargin,
    dotsType, dotsColor, isTransparentBg, bgColor, cornersSquareType,
    cornersSquareColor, cornersDotType, cornersDotColor, logoDataUrl, saveToHistory
  ]);

  useEffect(() => {
    if (activeView === 'create') {
      updateQRCode();
    }
  }, [updateQRCode, activeView]);

  // Download QR Image
  const handleDownload = useCallback((format: ExportFormat = exportFormat) => {
    const data = getEncodedData();
    const finalBgColor = isTransparentBg ? 'transparent' : bgColor;

    const exportOptions = {
      width: exportSize,
      height: exportSize,
      type: format === 'svg' ? ('svg' as const) : ('canvas' as const),
      data,
      margin: qrMargin,
      qrOptions: { errorCorrectionLevel: errorCorrection },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: logoSize,
        margin: logoMargin,
        crossOrigin: 'anonymous',
      },
      dotsOptions: { type: dotsType, color: dotsColor },
      backgroundOptions: { color: finalBgColor },
      cornersSquareOptions: { type: cornersSquareType, color: cornersSquareColor || dotsColor },
      cornersDotOptions: { type: cornersDotType, color: cornersDotColor || dotsColor },
      image: logoDataUrl || undefined,
    };

    const qrExportInstance = new QRCodeStyling(exportOptions);
    qrExportInstance.download({
      name: `qrforge-${Date.now()}`,
      extension: format,
    });
  }, [
    getEncodedData, exportFormat, exportSize, qrMargin, errorCorrection, logoSize, logoMargin,
    dotsType, dotsColor, isTransparentBg, bgColor, cornersSquareType, cornersSquareColor,
    cornersDotType, cornersDotColor, logoDataUrl
  ]);

  // Native Web Share API
  const handleNativeShare = useCallback(async () => {
    if (!previewRef.current) return;
    const svgEl = previewRef.current.querySelector('svg');
    if (!svgEl) return;

    try {
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (!isTransparentBg) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'qrforge-code.png', { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: 'QRForge Code',
                text: 'Generated with QRForge Privacy-First Studio',
                files: [file],
              });
            } catch (err) {
              console.log('Share canceled or failed', err);
            }
          } else {
            // Fallback: Copy link
            navigator.clipboard.writeText(getEncodedData());
            alert('Web Share API not supported on this device. Data copied to clipboard!');
          }
        }, 'image/png');
      };
      img.src = url;
    } catch (err) {
      console.error(err);
    }
  }, [isTransparentBg, bgColor, getEncodedData]);

  // Copy Image to Clipboard
  const handleCopyImageToClipboard = useCallback(async () => {
    if (!previewRef.current) return;
    const svgEl = previewRef.current.querySelector('svg');
    if (!svgEl) return;

    try {
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = qrSize * 2;
        canvas.height = qrSize * 2;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (!isTransparentBg) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopiedImageState(true);
            setTimeout(() => setCopiedImageState(false), 2500);
          } catch (err) {
            console.error('Clipboard copy failed', err);
          }
        }, 'image/png');
      };
      img.src = url;
    } catch (err) {
      console.error(err);
    }
  }, [qrSize, isTransparentBg, bgColor]);

  // Copy Data Link
  const handleCopyLink = useCallback(() => {
    const data = getEncodedData();
    navigator.clipboard.writeText(data).then(() => {
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    });
  }, [getEncodedData]);

  // Handle Logo File Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // QR Code Image Upload & Decoder for Reader Tab
  const handleScanImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    setScannedResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imgDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = async () => {
        if ('BarcodeDetector' in window) {
          try {
            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await detector.detect(img);
            if (barcodes && barcodes.length > 0) {
              setScannedResult(barcodes[0].rawValue);
              return;
            }
          } catch (err) {
            console.log('BarcodeDetector error', err);
          }
        }
        setScanError('Could not find a valid QR Code in this image. Please try a clearer QR code image.');
      };
      img.src = imgDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Print QR Card
  const handlePrint = () => {
    window.print();
  };

  // Apply Obsidian Preset
  const applyPreset = (preset: Preset) => {
    setDotsColor(preset.dotsColor);
    setCornersSquareColor(preset.dotsColor);
    setCornersDotColor(preset.dotsColor);
    setBgColor(preset.bgColor);
    setIsTransparentBg(false);
    setDotsType(preset.dotsType);
    setCornersSquareType(preset.cornersSquareType);
    setCornersDotType(preset.cornersDotType);
  };

  return (
    <div className="min-h-screen obsidian-grid-bg text-slate-100 flex flex-col justify-between selection:bg-blue-500/30">
      
      {/* Header Container */}
      <header className="sticky top-0 z-40 px-4 py-4 backdrop-blur-2xl bg-[#07080c]/80 border-b border-white/10 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl btn-accent flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                QRForge
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Privacy-First QR Code Generator & Scanner
              </p>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Privacy Assurance Trigger */}
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-emerald-400 hover:border-emerald-500/40"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy & Security</span>
            </button>

            {/* PWA Install Button */}
            {deferredInstallPrompt && !isAppInstalled && (
              <button
                onClick={handleInstallApp}
                className="btn-accent px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Install App</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Primary Studio View Selector */}
      <div className="max-w-7xl w-full mx-auto px-4 pt-6 no-print">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex gap-2">
            {[
              { id: 'create', label: 'QR Creator', icon: Sparkles },
              { id: 'scan', label: 'Scan / Decode', icon: Scan },
              { id: 'history', label: `History (${history.length})`, icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as MainView)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isActive ? 'obsidian-pill-active' : 'obsidian-pill'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeView === 'create' && (
            <button
              onClick={handlePrint}
              className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 hidden sm:flex"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 relative z-10">
        
        {/* VIEW 1: QR Creator */}
        {activeView === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Generator Inputs & Customizers (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Content Type Selector */}
              <div className="obsidian-card rounded-3xl p-5 space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                    Select Content Type
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {[
                      { id: 'url', label: 'URL', icon: Zap },
                      { id: 'text', label: 'Text', icon: Settings },
                      { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
                      { id: 'vcard', label: 'Contact', icon: User },
                      { id: 'event', label: 'Event', icon: Calendar },
                      { id: 'email', label: 'Email', icon: Mail },
                      { id: 'phone', label: 'Phone', icon: Phone },
                      { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = contentType === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setContentType(item.id as ContentType)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'obsidian-pill-active scale-105'
                              : 'obsidian-pill'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-4 pt-1">
                  {contentType === 'url' && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-medium text-slate-300 block">Target Website Link</label>
                        <span className="text-[10px] text-slate-400">{rawText.length} characters</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={rawText}
                          onChange={(e) => setRawText(e.target.value)}
                          placeholder="https://yourwebsite.com"
                          className="obsidian-input flex-1 px-4 py-3 rounded-2xl text-sm"
                        />
                        <button
                          onClick={handleCopyLink}
                          className="btn-secondary px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-1.5"
                        >
                          {copiedState ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedState ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {contentType === 'text' && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-medium text-slate-300 block">Plain Text Message</label>
                        <span className="text-[10px] text-slate-400">{rawText.length} characters</span>
                      </div>
                      <textarea
                        rows={3}
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Type any message, memo, or secret code..."
                        className="obsidian-input w-full px-4 py-3 rounded-2xl text-sm resize-none"
                      />
                    </div>
                  )}

                  {contentType === 'wifi' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Network Name (SSID)</label>
                        <input
                          type="text"
                          value={wifiSSID}
                          onChange={(e) => setWifiSSID(e.target.value)}
                          placeholder="Home_WiFi_5G"
                          className="obsidian-input w-full px-4 py-2.5 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Password</label>
                        <input
                          type="password"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="Network Password"
                          className="obsidian-input w-full px-4 py-2.5 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Security</label>
                        <select
                          value={wifiEncryption}
                          onChange={(e) => setWifiEncryption(e.target.value as any)}
                          className="obsidian-input w-full px-4 py-2.5 rounded-2xl text-sm"
                        >
                          <option value="WPA" className="bg-slate-900 text-white">WPA / WPA2 / WPA3</option>
                          <option value="WEP" className="bg-slate-900 text-white">WEP</option>
                          <option value="nopass" className="bg-slate-900 text-white">Open (No Password)</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                        <input
                          id="wifi-hidden-chk"
                          type="checkbox"
                          checked={wifiHidden}
                          onChange={(e) => setWifiHidden(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-800 text-blue-500"
                        />
                        <label htmlFor="wifi-hidden-chk" className="text-xs text-slate-300 cursor-pointer">Hidden SSID Network</label>
                      </div>
                    </div>
                  )}

                  {contentType === 'vcard' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">First Name</label>
                        <input
                          type="text"
                          value={vcardFirstName}
                          onChange={(e) => setVcardFirstName(e.target.value)}
                          placeholder="Alex"
                          className="obsidian-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Last Name</label>
                        <input
                          type="text"
                          value={vcardLastName}
                          onChange={(e) => setVcardLastName(e.target.value)}
                          placeholder="Morgan"
                          className="obsidian-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Phone Number</label>
                        <input
                          type="tel"
                          value={vcardPhone}
                          onChange={(e) => setVcardPhone(e.target.value)}
                          placeholder="+1 (555) 019-2834"
                          className="obsidian-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Email</label>
                        <input
                          type="email"
                          value={vcardEmail}
                          onChange={(e) => setVcardEmail(e.target.value)}
                          placeholder="alex@company.com"
                          className="obsidian-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Company</label>
                        <input
                          type="text"
                          value={vcardCompany}
                          onChange={(e) => setVcardCompany(e.target.value)}
                          placeholder="Obsidian Corp"
                          className="obsidian-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Job Title</label>
                        <input
                          type="text"
                          value={vcardTitle}
                          onChange={(e) => setVcardTitle(e.target.value)}
                          placeholder="Product Architect"
                          className="obsidian-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'event' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Event Title</label>
                        <input
                          type="text"
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                          placeholder="Product Launch Keynote"
                          className="obsidian-input w-full px-4 py-2.5 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Start Date/Time</label>
                        <input
                          type="datetime-local"
                          value={eventStartDate}
                          onChange={(e) => setEventStartDate(e.target.value)}
                          className="obsidian-input w-full px-3 py-2 rounded-2xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">End Date/Time</label>
                        <input
                          type="datetime-local"
                          value={eventEndDate}
                          onChange={(e) => setEventEndDate(e.target.value)}
                          className="obsidian-input w-full px-3 py-2 rounded-2xl text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Location / Link</label>
                        <input
                          type="text"
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                          placeholder="Main Auditorium or Zoom Link"
                          className="obsidian-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Event Description</label>
                        <textarea
                          rows={2}
                          value={eventDescription}
                          onChange={(e) => setEventDescription(e.target.value)}
                          placeholder="Event description or notes..."
                          className="obsidian-input w-full px-3.5 py-2 rounded-2xl text-sm resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'email' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Recipient Email</label>
                        <input
                          type="email"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          placeholder="support@company.com"
                          className="obsidian-input w-full px-4 py-2.5 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Subject</label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Inquiry"
                          className="obsidian-input w-full px-4 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Body Text</label>
                        <textarea
                          rows={2}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          placeholder="Write your email body..."
                          className="obsidian-input w-full px-4 py-2 rounded-2xl text-sm resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'phone' && (
                    <div>
                      <label className="text-xs font-medium text-slate-300 mb-1.5 block">Phone Number</label>
                      <input
                        type="tel"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="obsidian-input w-full px-4 py-3 rounded-2xl text-sm"
                      />
                    </div>
                  )}

                  {contentType === 'whatsapp' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">WhatsApp Number (with Country Code)</label>
                        <input
                          type="tel"
                          value={waNumber}
                          onChange={(e) => setWaNumber(e.target.value)}
                          placeholder="15551234567"
                          className="obsidian-input w-full px-4 py-2.5 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Preset Chat Message</label>
                        <input
                          type="text"
                          value={waMessage}
                          onChange={(e) => setWaMessage(e.target.value)}
                          placeholder="Hello, I would like to order..."
                          className="obsidian-input w-full px-4 py-2 rounded-2xl text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Obsidian Customization Tabs */}
              <div className="obsidian-card rounded-3xl p-5 space-y-5">
                
                {/* Tab Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: 'presets', label: 'Color Presets', icon: Sparkles },
                      { id: 'colors', label: 'Colors & Fill', icon: Palette },
                      { id: 'shapes', label: 'Dot Shapes', icon: Layers },
                      { id: 'logo', label: 'Logo Branding', icon: ImageIcon },
                      { id: 'specs', label: 'Resolution & Specs', icon: Sliders },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = customizerTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setCustomizerTab(tab.id as CustomizerTab)}
                          className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                            isActive ? 'obsidian-pill-active' : 'obsidian-pill'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TAB: Presets */}
                {customizerTab === 'presets' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {OBSIDIAN_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="btn-secondary p-3.5 rounded-2xl text-left flex flex-col justify-between h-22 hover:border-blue-500/40"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">
                            {preset.name}
                          </span>
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: preset.dotsColor }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {preset.dotsType}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* TAB: Colors */}
                {customizerTab === 'colors' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Dots Accent Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={dotsColor}
                            onChange={(e) => {
                              setDotsColor(e.target.value);
                              setCornersSquareColor(e.target.value);
                              setCornersDotColor(e.target.value);
                            }}
                            className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={dotsColor}
                            onChange={(e) => setDotsColor(e.target.value)}
                            className="obsidian-input flex-1 px-3 py-2 rounded-xl text-xs font-mono uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-300">Background Color</label>
                          <label className="flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isTransparentBg}
                              onChange={(e) => setIsTransparentBg(e.target.checked)}
                              className="rounded border-slate-700 bg-slate-800 text-blue-500"
                            />
                            <span>Transparent</span>
                          </label>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            disabled={isTransparentBg}
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent disabled:opacity-30"
                          />
                          <input
                            type="text"
                            disabled={isTransparentBg}
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="obsidian-input flex-1 px-3 py-2 rounded-xl text-xs font-mono uppercase disabled:opacity-30"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: Shapes */}
                {customizerTab === 'shapes' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                        Body Pattern Style
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {[
                          { id: 'rounded', label: 'Rounded' },
                          { id: 'dots', label: 'Dots' },
                          { id: 'classy', label: 'Classy' },
                          { id: 'classy-rounded', label: 'Smooth' },
                          { id: 'square', label: 'Square' },
                        ].map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setDotsType(style.id as any)}
                            className={`p-2.5 rounded-2xl text-xs font-semibold text-center transition-all ${
                              dotsType === style.id ? 'obsidian-pill-active' : 'obsidian-pill'
                            }`}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                        Corner Frame Shape
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'extra-rounded', label: 'Extra Rounded' },
                          { id: 'square', label: 'Sharp Square' },
                          { id: 'dot', label: 'Circular' },
                        ].map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setCornersSquareType(style.id as any)}
                            className={`p-2.5 rounded-2xl text-xs font-semibold text-center transition-all ${
                              cornersSquareType === style.id ? 'obsidian-pill-active' : 'obsidian-pill'
                            }`}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: Logo */}
                {customizerTab === 'logo' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-white/15 rounded-3xl p-6 text-center hover:border-blue-500/50 transition-colors relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                      />
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-blue-400 mb-2" />
                        <p className="text-xs font-bold text-slate-200">
                          Upload Custom Logo
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          PNG, SVG, or JPG supported
                        </p>
                      </div>
                    </div>

                    {logoDataUrl && (
                      <div className="obsidian-card rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={logoDataUrl} alt="Logo Preview" className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1" />
                            <span className="text-xs font-semibold text-slate-300">Custom Logo Active</span>
                          </div>
                          <button
                            onClick={() => setLogoDataUrl(null)}
                            className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold hover:bg-red-500/30"
                          >
                            Remove
                          </button>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Logo Scale Ratio</span>
                            <span>{Math.round(logoSize * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="0.38"
                            step="0.01"
                            value={logoSize}
                            onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                            className="w-full accent-blue-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Logo Margin</span>
                            <span>{logoMargin}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={logoMargin}
                            onChange={(e) => setLogoMargin(Number(e.target.value))}
                            className="w-full accent-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Specs */}
                {customizerTab === 'specs' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                        <span>Preview Size</span>
                        <span>{qrSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="500"
                        step="10"
                        value={qrSize}
                        onChange={(e) => setQrSize(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                        <span>Quiet Zone Margin</span>
                        <span>{qrMargin}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        step="2"
                        value={qrMargin}
                        onChange={(e) => setQrMargin(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                        Error Correction Level
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'L', label: 'Low (7%)' },
                          { id: 'M', label: 'Medium (15%)' },
                          { id: 'Q', label: 'Quartile (25%)' },
                          { id: 'H', label: 'High (30%)' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setErrorCorrection(item.id as any)}
                            className={`p-2 rounded-2xl text-xs font-semibold text-center transition-all ${
                              errorCorrection === item.id ? 'obsidian-pill-active' : 'obsidian-pill'
                            }`}
                          >
                            {item.id}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Live Studio Preview (5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 no-print">
              <div className="obsidian-card rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6">
                
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Live Preview
                  </span>
                  <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {exportSize} x {exportSize} px
                  </span>
                </div>

                {/* QR Canvas Output Container */}
                <div className="relative p-6 rounded-3xl bg-[#0b0d16] border border-white/10 shadow-2xl flex items-center justify-center min-h-[300px] w-[320px] max-w-full">
                  <div 
                    ref={previewRef} 
                    className="w-full h-full flex items-center justify-center"
                  />
                </div>

                {/* Export & Sharing Suite */}
                <div className="w-full space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownload('png')}
                      className="btn-accent py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PNG</span>
                    </button>

                    <button
                      onClick={() => {
                        setExportFormat('svg');
                        handleDownload('svg');
                      }}
                      className="btn-secondary py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-purple-400" />
                      <span>Download SVG</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleNativeShare}
                      className="btn-secondary py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 text-blue-400"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Web Share</span>
                    </button>

                    <button
                      onClick={handleCopyImageToClipboard}
                      className="btn-secondary py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      {copiedImageState ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{copiedImageState ? 'Image Copied!' : 'Copy Image'}</span>
                    </button>
                  </div>

                  {/* Quality Dropdown */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Export Quality:</span>
                    <select
                      value={exportSize}
                      onChange={(e) => setExportSize(Number(e.target.value))}
                      className="obsidian-input px-3 py-1.5 rounded-xl text-xs font-semibold"
                    >
                      <option value={512} className="bg-slate-900 text-white">Standard (512px)</option>
                      <option value={1024} className="bg-slate-900 text-white">High Res (1024px)</option>
                      <option value={2048} className="bg-slate-900 text-white">Ultra HD (2048px)</option>
                      <option value={4096} className="bg-slate-900 text-white">4K Print (4096px)</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: QR Scanner / Reader */}
        {activeView === 'scan' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="obsidian-card rounded-3xl p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl btn-accent mx-auto flex items-center justify-center shadow-xl shadow-blue-500/25">
                <Scan className="w-8 h-8 text-white animate-pulse" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-white mb-2">QR Code Reader & Decoder</h2>
                <p className="text-xs text-slate-400">
                  Upload any QR Code image file to decode its link or content 100% on-device.
                </p>
              </div>

              <div className="border-2 border-dashed border-white/15 rounded-3xl p-8 relative hover:border-blue-500/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScanImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                />
                <div className="flex flex-col items-center">
                  <Upload className="w-10 h-10 text-blue-400 mb-3" />
                  <p className="text-sm font-bold text-slate-200">Drag & Drop QR Image Here</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP, or SVG</p>
                </div>
              </div>

              {scannedResult && (
                <div className="obsidian-card rounded-2xl p-6 text-left space-y-3 border-emerald-500/30">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Decoded Content
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(scannedResult)}
                      className="btn-secondary px-3 py-1 rounded-lg text-xs flex items-center gap-1 text-slate-200"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 text-sm font-mono text-slate-100 break-all select-all">
                    {scannedResult}
                  </div>
                  {scannedResult.startsWith('http') && (
                    <a
                      href={scannedResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-accent px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Link
                    </a>
                  )}
                </div>
              )}

              {scanError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                  {scanError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: History Log */}
        {activeView === 'history' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="obsidian-card rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">QR Code History Log</h2>
                  <p className="text-xs text-slate-400">Stored locally in your browser memory.</p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('qrforge_history');
                      setHistory([]);
                    }}
                    className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:border-red-500/40 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No generated QR codes in history yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="obsidian-card rounded-2xl p-4 flex items-center justify-between">
                      <div className="space-y-1 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                            {item.type}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-200 truncate">
                          {item.data}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setRawText(item.data);
                            setActiveView('create');
                          }}
                          className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(item.data)}
                          className="btn-secondary p-2 rounded-xl text-xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Privacy Assurance Drawer / Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="obsidian-card max-w-lg w-full rounded-3xl p-6 sm:p-8 relative space-y-6 border-emerald-500/30">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Privacy & Security Architecture</h3>
                <p className="text-xs text-slate-400">Zero Server Data Transfer</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100 block mb-0.5">100% Browser Execution</strong>
                  All SVG & HTML5 Canvas QR code rendering is performed entirely inside your device's browser CPU/GPU memory.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <WifiOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100 block mb-0.5">Offline Progressive Web App</strong>
                  Once loaded, QRForge works completely offline without an internet connection.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100 block mb-0.5">No Tracking or Telemetry</strong>
                  No external analytics scripts, no cookies, no tracking pixels, and zero server logging.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="btn-accent w-full py-3 rounded-2xl text-xs font-bold"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}

      {/* Footer Container */}
      <footer className="relative z-10 py-6 px-4 text-center border-t border-white/10 backdrop-blur-lg bg-[#07080c]/90 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1.5">
            <span>QRForge</span>
            <span>•</span>
            <span>Privacy-First & On-Device</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Client-Side Only
            </span>
          </p>

          {deferredInstallPrompt && !isAppInstalled && (
            <button
              onClick={handleInstallApp}
              className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-blue-400"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Install Offline PWA App</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
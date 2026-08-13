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
  WifiOff,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import {
  trimTransparentEdges,
  createCompositeLogo,
  validateQRLogoSafety,
  type ContainerShape,
  type ErrorCorrectionLevel,
  type SafetyReport
} from './utils/qrLogoEngine';
import { ExportResolutionSelect, EXPORT_RESOLUTIONS } from './components/ExportResolutionSelect';
import { normalizeUrlInput } from './utils/urlNormalizer';
import { BackgroundRippleEffect } from './components/ui/background-ripple-effect';

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

const PALETTE_PRESETS: Preset[] = [
  {
    id: 'platinum-pure',
    name: 'Platinum Highlight',
    dotsColor: '#EEEEED',
    bgColor: '#080705',
    dotsType: 'rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  },
  {
    id: 'graphite-dark',
    name: 'Graphite Dark',
    dotsColor: '#3A3A3A',
    bgColor: '#080705',
    dotsType: 'dots',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  },
  {
    id: 'inverted-platinum',
    name: 'Inverted Platinum',
    dotsColor: '#080705',
    bgColor: '#EEEEED',
    dotsType: 'rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  },
  {
    id: 'sapphire-accent',
    name: 'Sapphire Accent',
    dotsColor: '#3b82f6',
    bgColor: '#080705',
    dotsType: 'rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  },
  {
    id: 'emerald-accent',
    name: 'Emerald Accent',
    dotsColor: '#10b981',
    bgColor: '#080705',
    dotsType: 'classy-rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  },
  {
    id: 'monochrome-crisp',
    name: 'Pure Monochrome',
    dotsColor: '#ffffff',
    bgColor: '#080705',
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

  // QR Styling Options (#080705 Black, #3A3A3A Graphite, #EEEEED Platinum)
  const [qrSize, setQrSize] = useState<number>(320);
  const [exportSize, setExportSize] = useState<number>(1024);
  const [qrMargin, setQrMargin] = useState<number>(10);
  const [dotsColor, setDotsColor] = useState<string>('#EEEEED');
  const [bgColor, setBgColor] = useState<string>('#080705');
  const [isTransparentBg, setIsTransparentBg] = useState<boolean>(false);
  const [dotsType, setDotsType] = useState<'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square'>('rounded');
  const [cornersSquareType, setCornersSquareType] = useState<'extra-rounded' | 'square' | 'dot'>('extra-rounded');
  const [cornersDotType, setCornersDotType] = useState<'dot' | 'square'>('dot');
  const [cornersSquareColor, setCornersSquareColor] = useState<string>('#EEEEED');
  const [cornersDotColor, setCornersDotColor] = useState<string>('#EEEEED');
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>('M');

  // Advanced Logo & Protective Container State
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [trimmedDataUrl, setTrimmedDataUrl] = useState<string | null>(null);
  const [compositeLogoUrl, setCompositeLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState<number>(0.22);
  const [containerShape, setContainerShape] = useState<ContainerShape>('rounded-square');
  const [containerBg, setContainerBg] = useState<string>('#080705');
  const [containerPadding, setContainerPadding] = useState<number>(6);
  const [logoBorderRadius, setLogoBorderRadius] = useState<number>(24);
  const [logoAspectRatio, setLogoAspectRatio] = useState<number>(1);

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
  const [isDraggingPage, setIsDraggingPage] = useState<boolean>(false);

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

  // Preprocess uploaded raw logo image
  const processUploadedLogo = useCallback(async (rawUrl: string) => {
    setLogoDataUrl(rawUrl);
    const trimmed = await trimTransparentEdges(rawUrl);
    setTrimmedDataUrl(trimmed.trimmedDataUrl);
    setLogoAspectRatio(trimmed.aspectRatio);
    // Auto upgrade Error Correction to Level H for optimal scanning when logo is added
    setErrorCorrection('H');
  }, []);

  // Synthesize Composite Protective Logo Container
  useEffect(() => {
    if (!logoDataUrl) {
      setCompositeLogoUrl(null);
      return;
    }

    let isMounted = true;
    createCompositeLogo({
      logoDataUrl,
      trimmedDataUrl,
      naturalWidth: 200,
      naturalHeight: 200,
      aspectRatio: logoAspectRatio,
      logoScale,
      containerShape,
      containerBg: containerShape === 'transparent' ? 'transparent' : containerBg,
      containerPadding,
      borderRadius: logoBorderRadius,
    }).then((compositeUrl) => {
      if (isMounted) {
        setCompositeLogoUrl(compositeUrl);
      }
    });

    return () => { isMounted = false; };
  }, [
    logoDataUrl, trimmedDataUrl, logoAspectRatio, logoScale,
    containerShape, containerBg, containerPadding, logoBorderRadius
  ]);

  // Compute Encoded Data String
  const getEncodedData = useCallback((): string => {
    switch (contentType) {
      case 'url':
        const urlRes = normalizeUrlInput(rawText);
        return urlRes.normalizedUrl || 'https://github.com';
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
        imageSize: logoScale,
        margin: 0,
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
      image: compositeLogoUrl || undefined,
    };

    previewRef.current.innerHTML = '';
    const qrCode = new QRCodeStyling(options);
    qrInstanceRef.current = qrCode;
    qrCode.append(previewRef.current);

    saveToHistory(data);
  }, [
    getEncodedData, qrSize, qrMargin, errorCorrection, logoScale,
    dotsType, dotsColor, isTransparentBg, bgColor, cornersSquareType,
    cornersSquareColor, cornersDotType, cornersDotColor, compositeLogoUrl, saveToHistory
  ]);

  useEffect(() => {
    if (activeView === 'create') {
      updateQRCode();
    }
  }, [updateQRCode, activeView]);

  // Real-time Readability & Safety Validation Report
  const safetyReport: SafetyReport = validateQRLogoSafety(
    logoScale,
    errorCorrection,
    dotsColor,
    bgColor,
    Boolean(logoDataUrl)
  );

  // Auto-Fix Action
  const handleAutoFix = () => {
    setErrorCorrection('H');
    setLogoScale(0.22);
    setContainerShape('rounded-square');
    setContainerBg(bgColor === 'transparent' ? '#080705' : bgColor);
    setContainerPadding(6);
    setLogoBorderRadius(24);
    if (safetyReport.contrastRatio < 3.5) {
      setDotsColor('#EEEEED');
      setBgColor('#080705');
      setCornersSquareColor('#EEEEED');
      setCornersDotColor('#EEEEED');
    }
  };

  // Download QR Image (Single Source of Truth)
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
        imageSize: logoScale,
        margin: 0,
        crossOrigin: 'anonymous',
      },
      dotsOptions: { type: dotsType, color: dotsColor },
      backgroundOptions: { color: finalBgColor },
      cornersSquareOptions: { type: cornersSquareType, color: cornersSquareColor || dotsColor },
      cornersDotOptions: { type: cornersDotType, color: cornersDotColor || dotsColor },
      image: compositeLogoUrl || undefined,
    };

    const qrExportInstance = new QRCodeStyling(exportOptions);
    qrExportInstance.download({
      name: `qrforge-${Date.now()}`,
      extension: format,
    });
  }, [
    getEncodedData, exportFormat, exportSize, qrMargin, errorCorrection, logoScale,
    dotsType, dotsColor, isTransparentBg, bgColor, cornersSquareType, cornersSquareColor,
    cornersDotType, cornersDotColor, compositeLogoUrl
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
        canvas.width = exportSize;
        canvas.height = exportSize;
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
          const file = new File([blob], `qrforge-${exportSize}px.png`, { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: 'QRForge Code',
                text: 'Generated with QRForge',
                files: [file],
              });
            } catch (err) {
              console.log('Share canceled or failed', err);
            }
          } else {
            navigator.clipboard.writeText(getEncodedData());
            alert('Web Share API not supported on this device. Data copied to clipboard!');
          }
        }, 'image/png');
      };
      img.src = url;
    } catch (err) {
      console.error(err);
    }
  }, [isTransparentBg, bgColor, getEncodedData, exportSize]);

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
        canvas.width = exportSize;
        canvas.height = exportSize;
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
  }, [exportSize, isTransparentBg, bgColor]);



  // Handle Logo File Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawUrl = event.target?.result as string;
      await processUploadedLogo(rawUrl);
    };
    reader.readAsDataURL(file);
  };

  // QR Code Image Upload & Decoder for Reader Tab
  const decodeQRFromDataUrl = useCallback((imgDataUrl: string) => {
    setScanError(null);
    setScannedResult(null);

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
  }, []);

  const handleScanImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      decodeQRFromDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Global Full-Page File Drop Handler
  const handleGlobalFileDrop = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please drop an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (activeView === 'scan') {
        decodeQRFromDataUrl(dataUrl);
      } else {
        await processUploadedLogo(dataUrl);
        setCustomizerTab('logo');
      }
    };
    reader.readAsDataURL(file);
  }, [activeView, decodeQRFromDataUrl, processUploadedLogo]);

  // Global Page Drag & Drop Listener
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsDraggingPage(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDraggingPage(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDraggingPage(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleGlobalFileDrop(files[0]);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleGlobalFileDrop]);

  // Print QR Card
  const handlePrint = () => {
    window.print();
  };

  // Apply Color Palette Preset
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

  const handleInstallApp = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredInstallPrompt(null);
    }
  };

  return (
    <div className="relative min-h-screen palette-bg text-[#EEEEED] selection:bg-white/20 overflow-hidden">
      
      {/* Ambient Interactive Ripple Background Layer */}
      <BackgroundRippleEffect />

      {/* Main Application UI Layer */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        
        {/* Full-Page Drag & Drop Overlay */}
        {isDraggingPage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-[#080705]/95 backdrop-blur-xl border-4 border-dashed border-[#EEEEED]/60 file-upload-grid transition-all animate-fadeIn">
            <div className="flex flex-col items-center justify-center space-y-6 text-center pointer-events-none">
              <div className="w-24 h-24 rounded-3xl bg-[#3A3A3A]/60 border border-[#3A3A3A] backdrop-blur-md flex items-center justify-center shadow-2xl scale-110 animate-bounce">
                <div className="w-14 h-14 rounded-2xl border border-dashed border-[#EEEEED]/60 flex items-center justify-center bg-[#080705]">
                  <Upload className="w-8 h-8 text-[#EEEEED]" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-[#EEEEED]">
                  Drop file anywhere to upload
                </h2>
                <p className="text-sm text-[#a3a3a3]">
                  {activeView === 'scan' ? 'Release to decode QR Code image' : 'Release to set as QR Logo'}
                </p>
              </div>
            </div>
          </div>
        )}
      
      {/* Header Container */}
      <header className="sticky top-0 z-40 px-4 py-4 backdrop-blur-2xl bg-[#080705]/90 border-b border-[#3A3A3A] no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#080705] border border-[#3A3A3A] flex items-center justify-center p-1.5 shadow-lg">
              <svg viewBox="0 0 512 512" className="w-full h-full">
                <rect x="100" y="100" width="110" height="110" rx="28" fill="none" stroke="#EEEEED" strokeWidth="24"/>
                <rect x="133" y="133" width="44" height="44" rx="12" fill="#EEEEED"/>
                <rect x="302" y="100" width="110" height="110" rx="28" fill="none" stroke="#EEEEED" strokeWidth="24"/>
                <rect x="335" y="133" width="44" height="44" rx="12" fill="#EEEEED"/>
                <rect x="100" y="302" width="110" height="110" rx="28" fill="none" stroke="#EEEEED" strokeWidth="24"/>
                <rect x="133" y="335" width="44" height="44" rx="12" fill="#EEEEED"/>
                <rect x="250" y="140" width="28" height="70" rx="10" fill="#EEEEED"/>
                <rect x="342" y="246" width="70" height="28" rx="10" fill="#EEEEED"/>
                <rect x="250" y="302" width="28" height="70" rx="10" fill="#EEEEED"/>
                <rect x="364" y="302" width="48" height="48" rx="12" fill="#EEEEED"/>
                <path d="M 230 220 Q 230 200 210 200 Q 230 200 230 180 Q 230 200 250 200 Q 230 200 230 220 Z" fill="#EEEEED"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#EEEEED]">
                QRForge
              </h1>
              <p className="text-xs text-[#a3a3a3] hidden sm:block">
                Privacy-First QR Code Studio
              </p>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Privacy Assurance Trigger */}
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="btn-graphite px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-emerald-400 hover:border-emerald-500/40"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy & Security</span>
            </button>

            {/* PWA Install Button */}
            {deferredInstallPrompt && !isAppInstalled && (
              <button
                onClick={handleInstallApp}
                className="btn-platinum px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <DownloadCloud className="w-4 h-4 text-[#080705]" />
                <span>Install App</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Primary View Selector */}
      <div className="max-w-7xl w-full mx-auto px-4 pt-6 no-print">
        <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-4">
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
                    isActive ? 'graphite-pill-active' : 'graphite-pill'
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
              className="btn-graphite px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 hidden sm:flex"
            >
              <Printer className="w-3.5 h-3.5 text-[#a3a3a3]" />
              <span>Print Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 relative z-10">
        
        {/* VIEW 1: QR Creator */}
        {activeView === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Generator Inputs & Customizers (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Content Type Selector */}
              <div className="graphite-card rounded-3xl p-5 space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#a3a3a3] mb-3 block">
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
                              ? 'graphite-pill-active scale-105'
                              : 'graphite-pill'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-[#080705]' : 'text-[#a3a3a3]'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-4 pt-1">
                  {contentType === 'url' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-[#EEEEED] block">Target Website Link</label>
                        <span className="text-[10px] font-mono text-[#a3a3a3]">{rawText.length} characters</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={rawText}
                          onChange={(e) => setRawText(e.target.value)}
                          placeholder="hyperionweb.vercel.app or github.com"
                          className={`graphite-input flex-1 px-4 py-3 rounded-2xl text-sm ${
                            normalizeUrlInput(rawText).status === 'invalid' ? 'border-amber-500/60 focus:border-amber-500' : ''
                          }`}
                        />
                        <button
                          onClick={() => {
                            const urlResult = normalizeUrlInput(rawText);
                            navigator.clipboard.writeText(urlResult.normalizedUrl || rawText);
                            setCopiedState(true);
                            setTimeout(() => setCopiedState(false), 2000);
                          }}
                          className="btn-graphite px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
                          title="Copy Normalized URL"
                        >
                          {copiedState ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedState ? 'Copied' : 'Copy URL'}</span>
                        </button>
                      </div>

                      {/* Real-time UX Indicator & Helper Text */}
                      {(() => {
                        const norm = normalizeUrlInput(rawText);
                        return (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-1 gap-1 px-1">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] truncate">
                              {norm.status === 'valid' && (
                                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  Valid website address
                                </span>
                              )}
                              {norm.status === 'missing_protocol' && (
                                <span className="text-emerald-400 flex items-center gap-1 font-semibold truncate">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  <span className="text-[#a3a3a3]">Encoded:</span>
                                  <code className="bg-[#3A3A3A]/40 px-1.5 py-0.5 rounded text-[#EEEEED] font-mono truncate">{norm.normalizedUrl}</code>
                                </span>
                              )}
                              {norm.status === 'invalid' && (
                                <span className="text-amber-400 flex items-center gap-1 font-semibold">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                  Please enter a valid domain or URL
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] text-[#a3a3a3] italic shrink-0">
                              HTTPS is added automatically when needed.
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {contentType === 'text' && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-medium text-[#EEEEED] block">Plain Text Message</label>
                        <span className="text-[10px] text-[#a3a3a3]">{rawText.length} characters</span>
                      </div>
                      <textarea
                        rows={3}
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Type any message, memo, or code..."
                        className="graphite-input w-full px-4 py-3 rounded-2xl text-sm resize-none"
                      />
                    </div>
                  )}

                  {contentType === 'wifi' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Network Name (SSID)</label>
                        <input
                          type="text"
                          value={wifiSSID}
                          onChange={(e) => setWifiSSID(e.target.value)}
                          placeholder="Home_WiFi_5G"
                          className="graphite-input w-full px-4 py-2.5 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Password</label>
                        <input
                          type="password"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="Network Password"
                          className="graphite-input w-full px-4 py-2.5 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Security</label>
                        <select
                          value={wifiEncryption}
                          onChange={(e) => setWifiEncryption(e.target.value as any)}
                          className="graphite-input w-full px-4 py-2.5 rounded-2xl text-sm"
                        >
                          <option value="WPA" className="bg-[#080705] text-[#EEEEED]">WPA / WPA2 / WPA3</option>
                          <option value="WEP" className="bg-[#080705] text-[#EEEEED]">WEP</option>
                          <option value="nopass" className="bg-[#080705] text-[#EEEEED]">Open (No Password)</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                        <input
                          id="wifi-hidden-chk"
                          type="checkbox"
                          checked={wifiHidden}
                          onChange={(e) => setWifiHidden(e.target.checked)}
                          className="rounded border-[#3A3A3A] bg-[#080705] text-[#EEEEED]"
                        />
                        <label htmlFor="wifi-hidden-chk" className="text-xs text-[#EEEEED] cursor-pointer">Hidden SSID Network</label>
                      </div>
                    </div>
                  )}

                  {contentType === 'vcard' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">First Name</label>
                        <input
                          type="text"
                          value={vcardFirstName}
                          onChange={(e) => setVcardFirstName(e.target.value)}
                          placeholder="Alex"
                          className="graphite-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Last Name</label>
                        <input
                          type="text"
                          value={vcardLastName}
                          onChange={(e) => setVcardLastName(e.target.value)}
                          placeholder="Morgan"
                          className="graphite-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Phone Number</label>
                        <input
                          type="tel"
                          value={vcardPhone}
                          onChange={(e) => setVcardPhone(e.target.value)}
                          placeholder="+1 (555) 019-2834"
                          className="graphite-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Email</label>
                        <input
                          type="email"
                          value={vcardEmail}
                          onChange={(e) => setVcardEmail(e.target.value)}
                          placeholder="alex@company.com"
                          className="graphite-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Company</label>
                        <input
                          type="text"
                          value={vcardCompany}
                          onChange={(e) => setVcardCompany(e.target.value)}
                          placeholder="Company Inc."
                          className="graphite-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Job Title</label>
                        <input
                          type="text"
                          value={vcardTitle}
                          onChange={(e) => setVcardTitle(e.target.value)}
                          placeholder="Product Lead"
                          className="graphite-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'event' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Event Title</label>
                        <input
                          type="text"
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                          placeholder="Product Launch"
                          className="graphite-input w-full px-4 py-2.5 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Start Date/Time</label>
                        <input
                          type="datetime-local"
                          value={eventStartDate}
                          onChange={(e) => setEventStartDate(e.target.value)}
                          className="graphite-input w-full px-3 py-2 rounded-2xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">End Date/Time</label>
                        <input
                          type="datetime-local"
                          value={eventEndDate}
                          onChange={(e) => setEventEndDate(e.target.value)}
                          className="graphite-input w-full px-3 py-2 rounded-2xl text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Location / Link</label>
                        <input
                          type="text"
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                          placeholder="Main Hall or Video Link"
                          className="graphite-input w-full px-3.5 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Event Notes</label>
                        <textarea
                          rows={2}
                          value={eventDescription}
                          onChange={(e) => setEventDescription(e.target.value)}
                          placeholder="Additional details..."
                          className="graphite-input w-full px-3.5 py-2 rounded-2xl text-sm resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'email' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Recipient Email</label>
                        <input
                          type="email"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          placeholder="contact@company.com"
                          className="graphite-input w-full px-4 py-2.5 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Subject</label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Inquiry"
                          className="graphite-input w-full px-4 py-2 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Message Body</label>
                        <textarea
                          rows={2}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          placeholder="Write your email body..."
                          className="graphite-input w-full px-4 py-2 rounded-2xl text-sm resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'phone' && (
                    <div>
                      <label className="text-xs font-medium text-[#EEEEED] mb-1.5 block">Phone Number</label>
                      <input
                        type="tel"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="graphite-input w-full px-4 py-3 rounded-2xl text-sm"
                      />
                    </div>
                  )}

                  {contentType === 'whatsapp' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">WhatsApp Number (with Country Code)</label>
                        <input
                          type="tel"
                          value={waNumber}
                          onChange={(e) => setWaNumber(e.target.value)}
                          placeholder="15551234567"
                          className="graphite-input w-full px-4 py-2.5 rounded-2xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#EEEEED] mb-1 block">Preset Message</label>
                        <input
                          type="text"
                          value={waMessage}
                          onChange={(e) => setWaMessage(e.target.value)}
                          placeholder="Hello, I would like to inquire..."
                          className="graphite-input w-full px-4 py-2 rounded-2xl text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customization Tabs */}
              <div className="graphite-card rounded-3xl p-5 space-y-5">
                
                {/* Tab Header */}
                <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-3">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: 'presets', label: 'Color Presets', icon: Sparkles },
                      { id: 'colors', label: 'Colors & Fill', icon: Palette },
                      { id: 'shapes', label: 'Dot Shapes', icon: Layers },
                      { id: 'logo', label: 'Logo Branding', icon: ImageIcon },
                      { id: 'specs', label: 'Specs & Margin', icon: Sliders },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = customizerTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setCustomizerTab(tab.id as CustomizerTab)}
                          className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                            isActive ? 'graphite-pill-active' : 'graphite-pill'
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
                    {PALETTE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="btn-graphite p-3.5 rounded-2xl text-left flex flex-col justify-between h-22 hover:border-[#EEEEED]/40"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#EEEEED]">
                            {preset.name}
                          </span>
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: preset.dotsColor }}
                          />
                        </div>
                        <span className="text-[10px] text-[#a3a3a3] capitalize">
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
                        <label className="text-xs font-semibold text-[#EEEEED] mb-1.5 block">Dots Accent Color</label>
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
                            className="graphite-input flex-1 px-3 py-2 rounded-xl text-xs font-mono uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-[#EEEEED]">Background Color</label>
                          <label className="flex items-center gap-1 text-xs text-[#a3a3a3] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isTransparentBg}
                              onChange={(e) => setIsTransparentBg(e.target.checked)}
                              className="rounded border-[#3A3A3A] bg-[#080705] text-[#EEEEED]"
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
                            className="graphite-input flex-1 px-3 py-2 rounded-xl text-xs font-mono uppercase disabled:opacity-30"
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
                      <label className="text-xs font-bold text-[#EEEEED] uppercase tracking-wider mb-2 block">
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
                              dotsType === style.id ? 'graphite-pill-active' : 'graphite-pill'
                            }`}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#EEEEED] uppercase tracking-wider mb-2 block">
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
                              cornersSquareType === style.id ? 'graphite-pill-active' : 'graphite-pill'
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
                  <div className="space-y-5">
                    {/* Dropzone Upload */}
                    <div className="relative rounded-2xl border border-dashed border-[#3A3A3A] bg-[#080705] p-6 overflow-hidden hover:border-[#EEEEED]/40 transition-all file-upload-grid group text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                      />
                      <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#3A3A3A]/40 border border-[#3A3A3A] backdrop-blur-md flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                          <div className="w-9 h-9 rounded-xl border border-dashed border-[#EEEEED]/40 flex items-center justify-center bg-[#080705]/60">
                            <Upload className="w-4 h-4 text-[#EEEEED]" />
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-bold text-[#EEEEED]">Upload Logo Image</h3>
                          <p className="text-[11px] text-[#a3a3a3]">
                            PNG, SVG, WebP, or JPG supported
                          </p>
                        </div>
                      </div>
                    </div>

                    {logoDataUrl && (
                      <div className="graphite-card rounded-2xl p-4 space-y-4">
                        {/* Header & Aspect Badge */}
                        <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={trimmedDataUrl || logoDataUrl} 
                              alt="Logo Preview" 
                              className="w-10 h-10 object-contain rounded-xl bg-black/40 border border-[#3A3A3A] p-1" 
                            />
                            <div>
                              <span className="text-xs font-bold text-[#EEEEED] block">Logo Integrated</span>
                              <span className="text-[10px] text-[#a3a3a3] font-mono">
                                Aspect Ratio: {logoAspectRatio.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setLogoDataUrl(null);
                              setTrimmedDataUrl(null);
                              setCompositeLogoUrl(null);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold hover:bg-red-500/30 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>

                        {/* Protection Container Shape */}
                        <div>
                          <label className="text-xs font-bold text-[#EEEEED] uppercase tracking-wider mb-2 block">
                            Protective Container Shape
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { id: 'rounded-square', label: 'Rounded' },
                              { id: 'circle', label: 'Circle' },
                              { id: 'square', label: 'Square' },
                              { id: 'transparent', label: 'None' },
                            ].map((shape) => (
                              <button
                                key={shape.id}
                                onClick={() => setContainerShape(shape.id as ContainerShape)}
                                className={`p-2 rounded-xl text-xs font-semibold text-center transition-all ${
                                  containerShape === shape.id ? 'graphite-pill-active' : 'graphite-pill'
                                }`}
                              >
                                {shape.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Container Background Color */}
                        {containerShape !== 'transparent' && (
                          <div>
                            <label className="text-xs font-semibold text-[#EEEEED] mb-1.5 block">
                              Container Shield Color
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={containerBg}
                                onChange={(e) => setContainerBg(e.target.value)}
                                className="w-9 h-9 rounded-xl cursor-pointer border-0 bg-transparent"
                              />
                              <div className="flex gap-1.5">
                                {['#080705', '#3A3A3A', '#EEEEED', '#ffffff'].map((hex) => (
                                  <button
                                    key={hex}
                                    onClick={() => setContainerBg(hex)}
                                    className="w-7 h-7 rounded-lg border border-white/20 shadow-sm transition-transform hover:scale-110"
                                    style={{ backgroundColor: hex }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Logo Scale Slider */}
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-[#EEEEED] mb-1">
                            <span>Logo Area Size</span>
                            <span className="font-mono">{Math.round(logoScale * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.10"
                            max="0.32"
                            step="0.01"
                            value={logoScale}
                            onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                            className="w-full accent-[#EEEEED]"
                          />
                        </div>

                        {/* Container Inner Padding Slider */}
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-[#EEEEED] mb-1">
                            <span>Container Quiet Zone Padding</span>
                            <span className="font-mono">{containerPadding}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="16"
                            step="1"
                            value={containerPadding}
                            onChange={(e) => setContainerPadding(Number(e.target.value))}
                            className="w-full accent-[#EEEEED]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Specs */}
                {customizerTab === 'specs' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#EEEEED] uppercase tracking-wider block">
                        Export Resolution Quality
                      </label>
                      <ExportResolutionSelect 
                        value={exportSize} 
                        onChange={setExportSize} 
                      />
                      {/* Synchronized Slider */}
                      <div className="pt-2">
                        <div className="flex justify-between text-xs font-semibold text-[#EEEEED] mb-1">
                          <span className="text-[#a3a3a3]">Resolution Output Slider</span>
                          <span className="font-mono">{exportSize} &times; {exportSize} px</span>
                        </div>
                        <input
                          type="range"
                          min="512"
                          max="4096"
                          step="512"
                          value={exportSize}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const closest = EXPORT_RESOLUTIONS.reduce((prev, curr) => 
                              Math.abs(curr.value - val) < Math.abs(prev.value - val) ? curr : prev
                            );
                            setExportSize(closest.value);
                          }}
                          className="w-full accent-[#EEEEED]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[#EEEEED] mb-1.5">
                        <span>Preview Canvas Display Size</span>
                        <span>{qrSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="500"
                        step="10"
                        value={qrSize}
                        onChange={(e) => setQrSize(Number(e.target.value))}
                        className="w-full accent-[#EEEEED]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[#EEEEED] mb-1.5">
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
                        className="w-full accent-[#EEEEED]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#EEEEED] uppercase tracking-wider mb-2 block">
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
                            onClick={() => setErrorCorrection(item.id as ErrorCorrectionLevel)}
                            className={`p-2 rounded-2xl text-xs font-semibold text-center transition-all ${
                              errorCorrection === item.id ? 'graphite-pill-active' : 'graphite-pill'
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

            {/* Right Column: Live Preview (5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 no-print">
              <div className="graphite-card rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6">
                
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#a3a3a3]">
                    Live Preview
                  </span>
                  <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full bg-[#3A3A3A]/40 text-[#EEEEED] border border-[#3A3A3A]">
                    {exportSize} x {exportSize} px
                  </span>
                </div>

                {/* Canvas Container */}
                <div className="relative p-6 rounded-3xl bg-[#080705] border border-[#3A3A3A] shadow-2xl flex items-center justify-center min-h-[300px] w-[320px] max-w-full">
                  <div 
                    ref={previewRef} 
                    className="w-full h-full flex items-center justify-center"
                  />
                </div>

                {/* Readability & Safety Validation Panel */}
                <div className="w-full text-left graphite-card rounded-2xl p-4 space-y-3 border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#EEEEED] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Readability & Safety Audit
                    </span>
                    {(!safetyReport.isLogoSizeSafe || !safetyReport.isContrastSafe || !safetyReport.isECSafe) && (
                      <button
                        onClick={handleAutoFix}
                        className="btn-platinum px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-md hover:scale-105"
                      >
                        <Wrench className="w-3 h-3 text-[#080705]" />
                        <span>Auto Fix</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-center">
                    {/* Badge 1: Logo Size */}
                    <div className={`p-1.5 rounded-xl border ${
                      safetyReport.isLogoSizeSafe
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}>
                      {safetyReport.isLogoSizeSafe ? '✓ Logo Safe' : '⚠ Logo Large'}
                    </div>

                    {/* Badge 2: Contrast */}
                    <div className={`p-1.5 rounded-xl border ${
                      safetyReport.isContrastSafe
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}>
                      {safetyReport.isContrastSafe ? '✓ Contrast Safe' : '⚠ Low Contrast'}
                    </div>

                    {/* Badge 3: EC Level */}
                    <div className={`p-1.5 rounded-xl border ${
                      safetyReport.isECSafe
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}>
                      {safetyReport.isECSafe ? `✓ EC Level (${errorCorrection})` : `⚠ Upgrade EC`}
                    </div>
                  </div>

                  {safetyReport.warnings.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 space-y-1">
                      {safetyReport.warnings.map((warn, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export & Sharing Suite */}
                <div className="w-full space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownload('png')}
                      className="btn-platinum py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-[#080705]" />
                      <span>Download PNG</span>
                    </button>

                    <button
                      onClick={() => {
                        setExportFormat('svg');
                        handleDownload('svg');
                      }}
                      className="btn-graphite py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-[#EEEEED]" />
                      <span>Download SVG</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleNativeShare}
                      className="btn-graphite py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 text-[#EEEEED]"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Web Share</span>
                    </button>

                    <button
                      onClick={handleCopyImageToClipboard}
                      className="btn-graphite py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      {copiedImageState ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#EEEEED]" />
                      )}
                      <span>{copiedImageState ? 'Image Copied!' : 'Copy Image'}</span>
                    </button>
                  </div>

                  {/* Custom Accessible Quality Dropdown */}
                  <div className="pt-2 border-t border-[#3A3A3A] flex items-center justify-between text-xs gap-3">
                    <span className="text-[#a3a3a3] font-medium shrink-0">Export Quality:</span>
                    <ExportResolutionSelect 
                      value={exportSize} 
                      onChange={setExportSize} 
                      className="w-48 sm:w-56"
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: QR Scanner / Reader */}
        {activeView === 'scan' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="graphite-card rounded-3xl p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl btn-platinum mx-auto flex items-center justify-center shadow-xl">
                <Scan className="w-8 h-8 text-[#080705]" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-[#EEEEED] mb-2">QR Code Reader & Decoder</h2>
                <p className="text-xs text-[#a3a3a3]">
                  Upload any QR Code image file to decode its link or content 100% on-device.
                </p>
              </div>

              <div className="relative rounded-2xl border border-dashed border-[#3A3A3A] bg-[#080705] p-10 overflow-hidden hover:border-[#EEEEED]/40 transition-all file-upload-grid group text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScanImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                />
                <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#3A3A3A]/40 border border-[#3A3A3A] backdrop-blur-md flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                    <div className="w-12 h-12 rounded-xl border border-dashed border-[#EEEEED]/40 flex items-center justify-center bg-[#080705]/60">
                      <Upload className="w-6 h-6 text-[#EEEEED]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#EEEEED]">Upload file</h3>
                    <p className="text-xs text-[#a3a3a3]">
                      Drag or drop your files here or click to upload
                    </p>
                  </div>
                </div>
              </div>

              {scannedResult && (
                <div className="graphite-card rounded-2xl p-6 text-left space-y-3 border-emerald-500/30">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Decoded Content
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(scannedResult)}
                      className="btn-graphite px-3 py-1 rounded-lg text-xs flex items-center gap-1 text-[#EEEEED]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-black/50 text-sm font-mono text-[#EEEEED] break-all select-all border border-[#3A3A3A]">
                    {scannedResult}
                  </div>
                  {scannedResult.startsWith('http') && (
                    <a
                      href={scannedResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-platinum px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#080705]" />
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
            <div className="graphite-card rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#EEEEED]">QR Code History Log</h2>
                  <p className="text-xs text-[#a3a3a3]">Stored locally in browser memory.</p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('qrforge_history');
                      setHistory([]);
                    }}
                    className="btn-graphite px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:border-red-500/40 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-12 text-center text-[#a3a3a3] text-sm">
                  No generated QR codes in history yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="graphite-card rounded-2xl p-4 flex items-center justify-between">
                      <div className="space-y-1 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#3A3A3A] text-[#EEEEED]">
                            {item.type}
                          </span>
                          <span className="text-xs text-[#a3a3a3]">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-[#EEEEED] truncate">
                          {item.data}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setRawText(item.data);
                            setActiveView('create');
                          }}
                          className="btn-graphite px-3 py-1.5 rounded-xl text-xs font-semibold"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(item.data)}
                          className="btn-graphite p-2 rounded-xl text-xs"
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
          <div className="graphite-card max-w-lg w-full rounded-3xl p-6 sm:p-8 relative space-y-6 border-emerald-500/30">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 text-[#a3a3a3] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#EEEEED]">Privacy & Security Architecture</h3>
                <p className="text-xs text-[#a3a3a3]">Zero Server Data Transfer</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#EEEEED]">
              <div className="p-3 rounded-2xl bg-[#080705] border border-[#3A3A3A] flex items-start gap-3">
                <Lock className="w-4 h-4 text-[#EEEEED] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">100% Browser Execution</strong>
                  All SVG & HTML5 Canvas QR code rendering is performed entirely inside your device's browser memory.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#080705] border border-[#3A3A3A] flex items-start gap-3">
                <WifiOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Offline Progressive Web App</strong>
                  Once loaded, QRForge works completely offline without an internet connection.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#080705] border border-[#3A3A3A] flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">No Tracking or Telemetry</strong>
                  No external analytics scripts, no cookies, no tracking pixels, and zero server logging.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="btn-platinum w-full py-3 rounded-2xl text-xs font-bold"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}

      {/* Footer Container */}
      <footer className="relative z-10 py-6 px-4 text-center border-t border-[#3A3A3A] backdrop-blur-lg bg-[#080705]/90 text-xs text-[#a3a3a3] no-print">
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
              className="btn-graphite px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-[#EEEEED]"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Install Offline PWA App</span>
            </button>
          )}
        </div>
      </footer>
      </div>
    </div>
  );
};

export default App;
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
  Moon, 
  Sun,
  User,
  Check,
  Copy,
  Sparkles,
  Sliders,
  Palette,
  Layers,
  Image as ImageIcon,
  ShieldCheck,
  Share2
} from 'lucide-react';

type ContentType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'phone' | 'whatsapp';
type ActiveTab = 'content' | 'colors' | 'shapes' | 'logo' | 'presets';
type ExportFormat = 'png' | 'svg' | 'webp' | 'jpeg';

interface Preset {
  id: string;
  name: string;
  dotsColor: string;
  bgColor: string;
  dotsType: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square';
  cornersSquareType: 'extra-rounded' | 'square' | 'dot';
  cornersDotType: 'dot' | 'square';
}

const PRESETS: Preset[] = [
  {
    id: 'apple-glass',
    name: 'Apple Slate',
    dotsColor: '#3b82f6',
    bgColor: '#ffffff',
    dotsType: 'rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    dotsColor: '#a855f7',
    bgColor: '#0f172a',
    dotsType: 'dots',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  },
  {
    id: 'emerald-mint',
    name: 'Emerald Mint',
    dotsColor: '#10b981',
    bgColor: '#064e3b',
    dotsType: 'classy-rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  },
  {
    id: 'sunset-gold',
    name: 'Sunset Amber',
    dotsColor: '#f59e0b',
    bgColor: '#1c1917',
    dotsType: 'classy',
    cornersSquareType: 'square',
    cornersDotType: 'square',
  },
  {
    id: 'minimal-mono',
    name: 'Minimal Mono',
    dotsColor: '#0f172a',
    bgColor: '#ffffff',
    dotsType: 'square',
    cornersSquareType: 'square',
    cornersDotType: 'square',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    dotsColor: '#ec4899',
    bgColor: '#ffffff',
    dotsType: 'rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
  }
];

const App = () => {
  // Theme State & Hydration
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('qrforge_theme');
      if (stored) return stored === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  const [rippleState, setRippleState] = useState<{ x: number; y: number; r: number; active: boolean }>({
    x: 0,
    y: 0,
    r: 0,
    active: false,
  });

  // Content Selection
  const [contentType, setContentType] = useState<ContentType>('url');
  const [rawText, setRawText] = useState('https://github.com');
  
  // Wi-Fi Specific State
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard Specific State
  const [vcardFirstName, setVcardFirstName] = useState('');
  const [vcardLastName, setVcardLastName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardCompany, setVcardCompany] = useState('');
  const [vcardTitle, setVcardTitle] = useState('');

  // Email Specific State
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // WhatsApp Specific State
  const [waNumber, setWaNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');

  // QR Styling State
  const [qrSize, setQrSize] = useState<number>(320);
  const [exportSize, setExportSize] = useState<number>(1024);
  const [qrMargin, setQrMargin] = useState<number>(10);
  const [dotsColor, setDotsColor] = useState<string>('#3b82f6');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [isTransparentBg, setIsTransparentBg] = useState<boolean>(false);
  const [dotsType, setDotsType] = useState<'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square'>('rounded');
  const [cornersSquareType, setCornersSquareType] = useState<'extra-rounded' | 'square' | 'dot'>('extra-rounded');
  const [cornersDotType, setCornersDotType] = useState<'dot' | 'square'>('dot');
  const [cornersSquareColor, setCornersSquareColor] = useState<string>('#3b82f6');
  const [cornersDotColor, setCornersDotColor] = useState<string>('#3b82f6');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  // Logo State
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(0.25);
  const [logoMargin, setLogoMargin] = useState<number>(4);

  // UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('content');
  const [copiedState, setCopiedState] = useState<boolean>(false);
  const [copiedImageState, setCopiedImageState] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');

  const previewRef = useRef<HTMLDivElement | null>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  // Sync initial dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Compute final QR String based on content type
  const getEncodedData = useCallback((): string => {
    switch (contentType) {
      case 'url':
        if (!rawText.trim()) return 'https://github.com';
        return rawText.startsWith('http://') || rawText.startsWith('https://') 
          ? rawText 
          : `https://${rawText}`;
      case 'text':
        return rawText || 'Hello from QRForge!';
      case 'wifi':
        if (!wifiSSID.trim()) return 'WIFI:S:MyNetwork;T:WPA;P:secret123;;';
        return `WIFI:S:${wifiSSID};T:${wifiEncryption};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardLastName};${vcardFirstName};;;\nFN:${vcardFirstName} ${vcardLastName}\nORG:${vcardCompany}\nTITLE:${vcardTitle}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
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
    contentType, 
    rawText, 
    wifiSSID, 
    wifiPassword, 
    wifiEncryption, 
    wifiHidden, 
    vcardFirstName, 
    vcardLastName, 
    vcardPhone, 
    vcardEmail, 
    vcardCompany, 
    vcardTitle, 
    emailTo, 
    emailSubject, 
    emailBody, 
    waNumber, 
    waMessage
  ]);

  // Render / Update QR Code Canvas
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
  }, [
    getEncodedData, 
    qrSize, 
    qrMargin, 
    errorCorrection, 
    logoSize, 
    logoMargin, 
    dotsType, 
    dotsColor, 
    isTransparentBg, 
    bgColor, 
    cornersSquareType, 
    cornersSquareColor, 
    cornersDotType, 
    cornersDotColor, 
    logoDataUrl
  ]);

  useEffect(() => {
    updateQRCode();
  }, [updateQRCode]);

  // Telegram-style Smooth Circular View Transition Theme Toggle
  const handleToggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const nextMode = !isDarkMode;

    const applyThemeChange = () => {
      setIsDarkMode(nextMode);
      localStorage.setItem('qrforge_theme', nextMode ? 'dark' : 'light');
      if (nextMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Check if View Transitions API is supported
    if ('startViewTransition' in document) {
      document.documentElement.style.setProperty('--click-x', `${x}px`);
      document.documentElement.style.setProperty('--click-y', `${y}px`);
      document.documentElement.style.setProperty('--click-r', `${endRadius}px`);

      const transition = (document as any).startViewTransition(() => {
        applyThemeChange();
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 650,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: nextMode ? '::view-transition-new(root)' : '::view-transition-old(root)'
          }
        );
      });
    } else {
      // Fallback CSS ripple overlay for older browsers
      setRippleState({ x, y, r: endRadius, active: true });
      applyThemeChange();
      setTimeout(() => {
        setRippleState(prev => ({ ...prev, active: false }));
      }, 650);
    }
  };

  // Export & Download QR Code
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
    getEncodedData, 
    exportFormat, 
    exportSize, 
    qrMargin, 
    errorCorrection, 
    logoSize, 
    logoMargin, 
    dotsType, 
    dotsColor, 
    isTransparentBg, 
    bgColor, 
    cornersSquareType, 
    cornersSquareColor, 
    cornersDotType, 
    cornersDotColor, 
    logoDataUrl
  ]);

  // Copy QR Image to Clipboard
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

  // Copy text link
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

  // Apply Theme Preset
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
    <div className="min-h-screen relative flex flex-col justify-between overflow-hidden">
      {/* Telegram Fallback Circular Ripple */}
      {rippleState.active && (
        <div 
          className="theme-ripple-overlay bg-indigo-600/30 backdrop-blur-md" 
          style={{
            ['--ripple-x' as any]: `${rippleState.x}px`,
            ['--ripple-y' as any]: `${rippleState.y}px`,
            ['--ripple-r' as any]: `${rippleState.r}px`,
          }}
        />
      )}

      {/* Ambient Liquid Background Glowing Blobs */}
      <div className="liquid-bg-blob blob-1" />
      <div className="liquid-bg-blob blob-2" />
      <div className="liquid-bg-blob blob-3" />

      {/* Header Container */}
      <header className="sticky top-0 z-40 px-4 py-4 backdrop-blur-xl bg-slate-900/40 dark:bg-slate-950/40 border-b border-white/10 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl glass-button glass-button-primary flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  QRForge
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
                  PRO STUDIO
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400 hidden sm:block">
                Apple Liquid Glass QR Generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% On-Device & Private</span>
            </div>

            {/* Telegram-style Theme Switch Button */}
            <button
              onClick={handleToggleTheme}
              className="glass-button p-2.5 rounded-2xl flex items-center gap-2 text-xs font-semibold hover:border-blue-400/40 group"
              title="Toggle Dark/Light Mode with Telegram Radial Sweep"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-500" />
              )}
              <span className="hidden sm:inline">
                {isDarkMode ? 'Light' : 'Dark'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Creator & Customizer Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Content Type Selector Bar */}
          <div className="glass-panel glass-panel-glow rounded-3xl p-4 sm:p-6 space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                Select Content Type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {[
                  { id: 'url', label: 'URL', icon: Zap },
                  { id: 'text', label: 'Text', icon: Settings },
                  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
                  { id: 'vcard', label: 'Contact', icon: User },
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
                          ? 'glass-pill-active scale-105'
                          : 'glass-pill hover:bg-white/10 dark:hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-blue-400 dark:text-blue-300' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smart Input Form based on Content Type */}
            <div className="space-y-4 pt-2">
              {contentType === 'url' && (
                <div>
                  <label className="text-xs font-medium text-slate-300 dark:text-slate-300 mb-1.5 block">
                    Target Website URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="glass-input flex-1 px-4 py-3 rounded-2xl text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="glass-button px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      {copiedState ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedState ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {contentType === 'text' && (
                <div>
                  <label className="text-xs font-medium text-slate-300 dark:text-slate-300 mb-1.5 block">
                    Plain Text Message
                  </label>
                  <textarea
                    rows={3}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Enter any text, code, or secret message..."
                    className="glass-input w-full px-4 py-3 rounded-2xl text-sm resize-none"
                  />
                </div>
              )}

              {contentType === 'wifi' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-slate-300 mb-1 block">Network Name (SSID)</label>
                    <input
                      type="text"
                      value={wifiSSID}
                      onChange={(e) => setWifiSSID(e.target.value)}
                      placeholder="Home_WiFi_5G"
                      className="glass-input w-full px-4 py-2.5 rounded-2xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">Password</label>
                    <input
                      type="password"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Password"
                      className="glass-input w-full px-4 py-2.5 rounded-2xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">Security Type</label>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value as any)}
                      className="glass-input w-full px-4 py-2.5 rounded-2xl text-sm"
                    >
                      <option value="WPA" className="bg-slate-900 text-white">WPA / WPA2 / WPA3</option>
                      <option value="WEP" className="bg-slate-900 text-white">WEP</option>
                      <option value="nopass" className="bg-slate-900 text-white">Open (No Password)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                    <input
                      id="wifi-hidden"
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-blue-500"
                    />
                    <label htmlFor="wifi-hidden" className="text-xs text-slate-300 cursor-pointer">Hidden Network</label>
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
                      placeholder="Steve"
                      className="glass-input w-full px-3.5 py-2 rounded-2xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">Last Name</label>
                    <input
                      type="text"
                      value={vcardLastName}
                      onChange={(e) => setVcardLastName(e.target.value)}
                      placeholder="Jobs"
                      className="glass-input w-full px-3.5 py-2 rounded-2xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">Phone Number</label>
                    <input
                      type="tel"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="glass-input w-full px-3.5 py-2 rounded-2xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">Email</label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      placeholder="steve@apple.com"
                      className="glass-input w-full px-3.5 py-2 rounded-2xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">Company / Organization</label>
                    <input
                      type="text"
                      value={vcardCompany}
                      onChange={(e) => setVcardCompany(e.target.value)}
                      placeholder="Apple Inc."
                      className="glass-input w-full px-3.5 py-2 rounded-2xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">Job Title</label>
                    <input
                      type="text"
                      value={vcardTitle}
                      onChange={(e) => setVcardTitle(e.target.value)}
                      placeholder="Chief Executive Officer"
                      className="glass-input w-full px-3.5 py-2 rounded-2xl text-sm"
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
                      placeholder="contact@company.com"
                      className="glass-input w-full px-4 py-2.5 rounded-2xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Inquiry regarding services"
                      className="glass-input w-full px-4 py-2 rounded-2xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">Email Message Body</label>
                    <textarea
                      rows={2}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Write your email body message here..."
                      className="glass-input w-full px-4 py-2 rounded-2xl text-sm resize-none"
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
                    className="glass-input w-full px-4 py-3 rounded-2xl text-sm"
                  />
                </div>
              )}

              {contentType === 'whatsapp' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">WhatsApp Phone Number (with Country Code)</label>
                    <input
                      type="tel"
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      placeholder="15551234567"
                      className="glass-input w-full px-4 py-2.5 rounded-2xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">Preset Message (Optional)</label>
                    <input
                      type="text"
                      value={waMessage}
                      onChange={(e) => setWaMessage(e.target.value)}
                      placeholder="Hello! I would like more information..."
                      className="glass-input w-full px-4 py-2 rounded-2xl text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Liquid Studio Customization Tabs */}
          <div className="glass-panel glass-panel-glow rounded-3xl p-6 space-y-6">
            
            {/* Customizer Sub-Navigation */}
            <div className="flex items-center justify-between border-b border-white/10 dark:border-white/10 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'content', label: 'Preset Themes', icon: Sparkles },
                  { id: 'colors', label: 'Colors & Fill', icon: Palette },
                  { id: 'shapes', label: 'Shapes', icon: Layers },
                  { id: 'logo', label: 'Branding Logo', icon: ImageIcon },
                  { id: 'presets', label: 'Size & Specs', icon: Sliders },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ActiveTab)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                        isActive
                          ? 'glass-pill-active'
                          : 'glass-pill hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: Preset Themes */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Select a handcrafted Apple Liquid Glass color palette & shape preset:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className="glass-button p-3.5 rounded-2xl text-left hover:scale-[1.03] transition-all flex flex-col justify-between h-24"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 dark:text-slate-200">
                          {preset.name}
                        </span>
                        <div 
                          className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
                          style={{ backgroundColor: preset.dotsColor }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                          {preset.dotsType}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Colors */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Foreground Dots Color */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">
                      Dots Foreground Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={dotsColor}
                        onChange={(e) => {
                          setDotsColor(e.target.value);
                          setCornersSquareColor(e.target.value);
                          setCornersDotColor(e.target.value);
                        }}
                        className="w-12 h-12 rounded-2xl cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={dotsColor}
                        onChange={(e) => setDotsColor(e.target.value)}
                        className="glass-input flex-1 px-3 py-2 rounded-xl text-xs font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Background Color
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
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
                        className="w-12 h-12 rounded-2xl cursor-pointer border-0 bg-transparent disabled:opacity-30"
                      />
                      <input
                        type="text"
                        disabled={isTransparentBg}
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="glass-input flex-1 px-3 py-2 rounded-xl text-xs font-mono uppercase disabled:opacity-30"
                      />
                    </div>
                  </div>
                </div>

                {/* Corners Colors */}
                <div className="border-t border-white/10 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                      Corner Outer Frame Color
                    </label>
                    <input
                      type="color"
                      value={cornersSquareColor}
                      onChange={(e) => setCornersSquareColor(e.target.value)}
                      className="w-full h-9 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                      Corner Inner Eye Color
                    </label>
                    <input
                      type="color"
                      value={cornersDotColor}
                      onChange={(e) => setCornersDotColor(e.target.value)}
                      className="w-full h-9 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Shapes */}
            {activeTab === 'shapes' && (
              <div className="space-y-5">
                {/* Dots Style */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                    Body Dots Style
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
                          dotsType === style.id ? 'glass-pill-active' : 'glass-pill hover:bg-white/10'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Frame Style */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                    Corner Frame Outer Shape
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
                          cornersSquareType === style.id ? 'glass-pill-active' : 'glass-pill hover:bg-white/10'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Dot Inner Eye */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                    Corner Inner Eye Shape
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'dot', label: 'Circular Eye' },
                      { id: 'square', label: 'Square Eye' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setCornersDotType(style.id as any)}
                        className={`p-2.5 rounded-2xl text-xs font-semibold text-center transition-all ${
                          cornersDotType === style.id ? 'glass-pill-active' : 'glass-pill hover:bg-white/10'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Logo Branding */}
            {activeTab === 'logo' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-white/20 dark:border-white/15 rounded-3xl p-6 text-center hover:border-blue-400/50 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                  />
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-blue-400 mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-slate-200">
                      Upload Logo or Icon
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PNG, SVG, or JPG supported
                    </p>
                  </div>
                </div>

                {logoDataUrl && (
                  <div className="glass-panel rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={logoDataUrl} alt="Logo Preview" className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1" />
                        <span className="text-xs font-semibold text-slate-300">Custom Logo Attached</span>
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
                        <span>Logo Quiet Zone Margin</span>
                        <span>{logoMargin}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="12"
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

            {/* TAB 5: Specs & Sizing */}
            {activeTab === 'presets' && (
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                    <span>Preview Display Size</span>
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
                          errorCorrection === item.id ? 'glass-pill-active' : 'glass-pill hover:bg-white/10'
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

        {/* Right Column: Live Apple Liquid Glass Preview Card (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="glass-panel glass-panel-glow glass-gloss rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6">
            
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Live Studio Preview
              </span>
              <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-400/20">
                {exportSize} x {exportSize} px Output
              </span>
            </div>

            {/* Responsive Liquid Canvas Frame */}
            <div className="relative p-6 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/20 shadow-2xl backdrop-blur-2xl max-w-full flex items-center justify-center min-h-[300px] w-[320px] max-w-full">
              <div 
                ref={previewRef} 
                className="w-full h-full flex items-center justify-center transition-all duration-300"
              />
            </div>

            {/* Quick Export Controls */}
            <div className="w-full space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownload('png')}
                  className="glass-button glass-button-primary py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>

                <button
                  onClick={() => handleDownload('svg')}
                  className="glass-button py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>Download SVG</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setExportFormat('webp');
                    handleDownload('webp');
                  }}
                  className={`glass-button py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 ${exportFormat === 'webp' ? 'border-emerald-500/50' : ''}`}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WebP Format</span>
                </button>

                <button
                  onClick={handleCopyImageToClipboard}
                  className="glass-button py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {copiedImageState ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{copiedImageState ? 'Image Copied!' : 'Copy Image'}</span>
                </button>
              </div>

              {/* Resolution Export Dropdown */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Export Quality:</span>
                <select
                  value={exportSize}
                  onChange={(e) => setExportSize(Number(e.target.value))}
                  className="glass-input px-3 py-1.5 rounded-xl text-xs font-semibold"
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

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 text-center border-t border-white/10 backdrop-blur-lg bg-slate-950/20 text-xs text-slate-400">
        <p className="flex items-center justify-center gap-1.5">
          <span>QRForge Studio</span>
          <span>•</span>
          <span>Privacy-First & Local Engine</span>
          <span>•</span>
          <span>Telegram Smooth Transition & Apple Liquid Glass UI</span>
        </p>
      </footer>
    </div>
  );
};

export default App;
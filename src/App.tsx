import React, { useState, useCallback, useRef } from 'react';
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
  X, 
  Moon, 
  Sun 
} from 'lucide-react';

const App = () => {
  const [text, setText] = useState('https://github.com');
  const [width, setWidth] = useState(300);
  const [margin, setMargin] = useState(0);
  const [qrOptions, setQrOptions] = useState<Partial<any>>({
    width: 300,
    height: 300,
    type: 'svg',
    data: '',
    image: undefined,
    dotsOptions: {
      type: 'rounded',
      color: '#3f83f8',
    },
    backgroundOptions: {
      color: '#ffffff',
    },
    cornersSquareOptions: {
      type: 'extra-rounded',
      color: '#3f83f8',
    },
    cornersDotOptions: {
      type: 'dot',
      color: '#3f83f8',
    },
  });

  const previewRef = useRef<HTMLDivElement | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showCustomization, setShowCustomization] = useState(false);

  const qrTypes = [
    { id: 'url', label: 'URL', icon: Zap },
    { id: 'text', label: 'Text', icon: Settings },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Phone', icon: Phone },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  ];

  const presets = [
    { id: 'portfolio', label: 'Portfolio', bg: '#1a202c', fg: '#ffffff' },
    { id: 'instagram', label: 'Instagram', bg: '#e1306c', fg: '#ffffff' },
    { id: 'business-card', label: 'Business Card', bg: '#2d3748', fg: '#ed8936' },
    { id: 'poster', label: 'Poster', bg: '#1a202c', fg: '#f6e05e' },
    { id: 'minimal', label: 'Minimal', bg: '#ffffff', fg: '#000000' },
  ];

  const handleGenerateQR = useCallback(() => {
    if (!previewRef.current) return;

    // Clear previous QR
    previewRef.current.innerHTML = '';

    // Update QR options with current state
    const options = {
      ...qrOptions,
      width,
      height: width, // Keep square for now
      data: text,
      margin,
    };

    try {
      const qrCode = new QRCodeStyling(options);
      qrCode.append(previewRef.current);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }, [text, width, margin, qrOptions]);

  const handleDownload = useCallback((format = 'png') => {
    if (!previewRef.current) return;

    const svgElement = previewRef.current.querySelector('svg');
    if (!svgElement) return;

    if (format === 'svg') {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgElement);
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `qrforge-${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // For PNG/WebP, we need to convert SVG to canvas first
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = width;
        canvas.height = width;
        ctx.fillStyle = '#ffffff'; // Background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        let mimeType = 'image/png';
        let extension = 'png';
        if (format === 'webp') {
          mimeType = 'image/webp';
          extension = 'webp';
        }

        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `qrforge-${Date.now()}.${extension}`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }, mimeType);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
      };

      img.src = url;
    }
  }, [width]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    });
  }, [text]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
      // Update QR options with logo
      setQrOptions((prev: any) => ({
        ...prev,
        image: reader.result as string,
      }));
      handleGenerateQR();
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setQrOptions((prev: any) => ({
      ...prev,
      image: undefined,
    }));
    handleGenerateQR();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Regenerate QR when options change
  React.useEffect(() => {
    handleGenerateQR();
  }, [handleGenerateQR, qrOptions, text, width, margin]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
            QRForge
          </h1>
          <p className="text-gray-400 dark:text-gray-500">
            Privacy-First QR Code Generator
          </p>
        </header>

        {/* Main Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 dark:bg-gray-700/50">
          <div className="space-y-6">
            {/* URL Input */}
            <div>
              <label htmlFor="url-input" className="block text-sm font-medium mb-2 dark:text-gray-300">
                Enter URL or Text
              </label>
              <div className="flex gap-2">
                <input
                  id="url-input"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600/50 text-gray-100 dark:bg-gray-600/50 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-100"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
                  disabled={!text.trim()}
                >
                  Copy Link
                </button>
              </div>
            </div>

            {/* QR Type Selector */}
            <div className="flex flex-wrap gap-2">
              {qrTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    // In a full implementation, we'd format the data based on type
                    // For V1, we'll just use the text as-is
                    setText(
                      type.id === 'url'
                        ? text.startsWith('http') ? text : `https://${text}`
                        : text
                    );
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium 
                    ${text.startsWith('http') && type.id === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600/50'}
                    dark:${text.startsWith('http') && type.id === 'url' ? 'bg-blue-500' : 'bg-gray-600/50'} 
                    dark:hover:${text.startsWith('http') && type.id === 'url' ? 'bg-blue-600' : 'bg-gray-500/50'}`}
                >
                  <type.icon className="h-4 w-4 mr-1" />{type.label}
                </button>
              ))}
            </div>

            {/* Logo Upload */}
            <div className="flex items-center gap-3 flex-wrap">
              <label htmlFor="logo-upload" className="flex items-center gap-2 text-sm font-medium dark:text-gray-300">
                <Upload className="h-4 w-4" />
                Add Logo (Optional)
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              {logoPreview && (
                <img src={logoPreview} alt="Logo preview" className="h-10 w-10 object-contain border rounded dark:border-gray-500" />
              )}
              {logoFile && (
                <button
                  onClick={handleRemoveLogo}
                  className="px-3 py-1 rounded-md text-xs bg-red-500 hover:bg-red-600 text-white ml-2 dark:bg-red-400 dark:hover:bg-red-500"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Customization Toggle */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className="px-4 py-2 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-sm font-medium flex items-center gap-2 dark:bg-gray-600/50 dark:hover:bg-gray-500/50"
              >
                {showCustomization ? (
                  <>
                    <X className="h-4 w-4" />
                    Less Options
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4" />
                    More Options
                  </>
                )}
              </button>
              <button
                onClick={toggleDarkMode}
                className="px-3 py-2 rounded-md bg-gray-700/50 hover:bg-gray-600/50 flex items-center gap-2 text-sm dark:bg-gray-600/50 dark:hover:bg-gray-500/50"
              >
                {isDarkMode ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 dark:bg-gray-700/50">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-gray-200">Live Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload('png')}
                  className="px-3 py-2 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-sm font-medium flex items-center gap-2 dark:bg-gray-600/50 dark:hover:bg-gray-500/50"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>
                <button
                  onClick={() => handleDownload('svg')}
                  className="px-3 py-2 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-sm font-medium flex items-center gap-2 dark:bg-gray-600/50 dark:hover:bg-gray-500/50"
                >
                  <Download className="h-4 w-4" />
                  Download SVG
                </button>
                <button
                  onClick={() => handleDownload('webp')}
                  className="px-3 py-2 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-sm font-medium flex items-center gap-2 dark:bg-gray-600/50 dark:hover:bg-gray-500/50"
                >
                  <Download className="h-4 w-4" />
                  Download WebP
                </button>
              </div>
            </div>

            <div className="relative aspect-square bg-gray-900/50 rounded-xl overflow-hidden dark:bg-gray-800/50">
              <div ref={previewRef} className="w-full h-full flex items-center justify-center">
                {/* QR Code will be rendered here */}
              </div>
            </div>
          </div>
        </div>

        {/* Customization Panel */}
        {showCustomization && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 dark:bg-gray-700/50">
            <h2 className="text-xl font-bold mb-6 dark:text-gray-200">Customization</h2>
            <div className="space-y-6">
              {/* Size Controls */}
              <div>
                <h3 className="text-lg font-medium mb-3 dark:text-gray-200">Size & Margin</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Size:</span>
                    <span>{width}px</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between">
                    <span>Margin:</span>
                    <span>{margin}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Color Controls */}
              <div>
                <h3 className="text-lg font-medium mb-3 dark:text-gray-200">Colors</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Foreground Color</label>
                    <input
                      type="color"
                      value="#3f83f8"
                      onChange={(e) => {
                        setQrOptions((prev: any) => ({
                          ...prev,
                          dotsOptions: {
                            ...prev.dotsOptions,
                            color: e.target.value,
                          },
                          cornersSquareOptions: {
                            ...prev.cornersSquareOptions,
                            color: e.target.value,
                          },
                          cornersDotOptions: {
                            ...prev.cornersDotOptions,
                            color: e.target.value,
                          },
                        }));
                      }}
                      className="w-full h-10 rounded-lg border border-gray-600/50 bg-gray-700/50 dark:bg-gray-600/50 dark:border-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Background Color</label>
                    <input
                      type="color"
                      value="#ffffff"
                      onChange={(e) => {
                        setQrOptions((prev: any) => ({
                          ...prev,
                          backgroundOptions: {
                            ...prev.backgroundOptions,
                            color: e.target.value,
                          },
                        }));
                      }}
                      className="w-full h-10 rounded-lg border border-gray-600/50 bg-gray-700/50 dark:bg-gray-600/50 dark:border-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* QR Style Selector */}
              <div>
                <h3 className="text-lg font-medium mb-3 dark:text-gray-200">QR Style</h3>
                <div className="flex flex-wrap gap-3">
                  {['classic', 'rounded', 'dots', 'square'].map((style) => (
                    <button
                      key={style}
                      onClick={() => {
                        setQrOptions((prev: any) => ({
                          ...prev,
                          dotsOptions: {
                            ...prev.dotsOptions,
                            type: style,
                          },
                        }));
                      }}
                      className={`px-3 py-2 rounded-md text-sm font-medium 
                        ${qrOptions.dotsOptions.type === style ? 'bg-blue-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600/50'}
                        dark:${qrOptions.dotsOptions.type === style ? 'bg-blue-500' : 'bg-gray-600/50'} 
                        dark:hover:${qrOptions.dotsOptions.type === style ? 'bg-blue-600' : 'bg-gray-500/50'}`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets */}
              <div>
                <h3 className="text-lg font-medium mb-3 dark:text-gray-200">Presets</h3>
                <div className="flex flex-wrap gap-3">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setQrOptions((prev: any) => ({
                          ...prev,
                          dotsOptions: {
                            ...prev.dotsOptions,
                            color: preset.fg,
                          },
                          backgroundOptions: {
                            ...prev.backgroundOptions,
                            color: preset.bg,
                          },
                        }));
                      }}
                      className={`px-3 py-2 rounded-md text-sm font-medium 
                        ${preset.id === 'minimal' && !isDarkMode ? 'bg-gray-100 text-gray-900' : 
                          preset.id === 'minimal' && isDarkMode ? 'bg-gray-800 text-gray-100' :
                          'bg-gray-700/50 hover:bg-gray-600/50'}
                        dark:${preset.id === 'minimal' && !isDarkMode ? 'bg-gray-100' : 
                          preset.id === 'minimal' && isDarkMode ? 'bg-gray-800' : 
                          'bg-gray-700/50'}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>
          QRForge - Privacy-First QR Generator • Built with React & TypeScript
        </p>
      </footer>
    </div>
  );
};

export default App;
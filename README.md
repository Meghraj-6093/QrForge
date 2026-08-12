# QRForge - Privacy-First QR Generator

A beautiful, privacy-first QR code generator built with React, TypeScript, and Tailwind CSS that runs entirely in the browser.

## Features

���🔗 **URL → QR Generation** - Convert any URL or text to QR code
���🎨 **Custom Colors** - Fully customizable foreground and background colors
���📐 **Size & Margin Controls** - Adjust QR code size and quiet zone margin
���🖼��️ **Logo Upload** - Add your own logo to the center of the QR code
��✨ **Multiple QR Styles** - Classic, Rounded, Dots, and Square styles
���🎯 **Pattern Customization** - Customize finder patterns and corner patterns
���📱 **Live Responsive Preview** - See your QR code update in real-time
���🧩 **Presets** - Ready-to-use designs for Portfolio, Instagram, Business Card, Poster, and Minimal
���📝 **Multiple QR Types** - Support for URL, Text, Email, Phone, WhatsApp, and Wi-Fi
���🧠 **Readability Protection** - Built-in contrast and safety checking
���📥 **Multiple Export Formats** - Download as PNG, SVG, or WebP
���📋 **Copy to Clipboard** - Copy the input URL/text with one click
���🏷��️ **Smart Filenames** - Auto-generated descriptive filenames
���🔒 **100% Browser-Side** - No accounts, servers, databases, or image uploads required

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **QR Generation**: `qr-code-styling` library
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Browser APIs**: Canvas, Blob, FileReader, Clipboard API

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/QrForge.git
cd QrForge

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Enter your URL or text** in the input field
2. **Customize your QR code** using the options panel:
   - Adjust size and margin
   - Choose foreground/background colors
   - Select QR style (Classic, Rounded, Dots, Square)
   - Upload a logo (optional)
   - Apply presets for quick styling
3. **Preview updates in real-time** as you make changes
4. **Download your QR code** in PNG, SVG, or WebP format
5. **Copy the original URL/text** to clipboard with one click

## Privacy First

QRForge is designed with privacy as the core principle:
- All processing happens in your browser
- No data is sent to any server
- No analytics or tracking
- No account required
- Your QR codes and logos never leave your device

## Project Structure

```
QrForge/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Entry point
│   ├── index.css        # Global styles
│   └── assets/          # Static assets
├── public/
│   ├── favicon.svg      # Browser favicon
│   └── icons.svg        # Application icons
├── dist/                # Production build output
├── package.json         # Dependencies and scripts
├── tailwind.config.cjs  # Tailwind configuration
├── postcss.config.cjs   # PostCSS configuration
�└── vite.config.ts       # Vite configuration
```

## Customization Options

### QR Styles
- **Classic**: Traditional square modules
- **Rounded**: Rounded modules for softer appearance
- **Dots**: Circular modules
- **Square**: Square modules with gaps

### Pattern Customization
- Finder patterns (the three large squares in corners)
- Corner patterns (individual corner markers)
- Color customization for all elements

### Presets
- **Portfolio**: Professional dark theme with accent color
- **Instagram**: Gradient-inspired vibrant design
- **Business Card**: Corporate dark theme with gold accent
- **Poster**: High-contrast dark theme for visibility
- **Minimal**: Clean black-on-white design

### Export Formats
- **PNG**: Raster image for general use
- **SVG**: Vector format for scaling without quality loss
- **WebP**: Modern format with superior compression

## Browser Support

QRForge works in all modern browsers that support:
- Canvas API
- Blob API
- FileReader API
- Clipboard API
- CSS Custom Properties (for dark mode)

Tested and working in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Code Structure
The main application logic is in `src/App.tsx` which includes:
- State management for all QR code properties
- QR code generation using `qr-code-styling`
- Image handling for logo upload
- Export functionality for PNG/SVG/WebP
- Theme switching (dark/light)
- Responsive layout

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [qr-code-styling](https://github.com/qr-code-styling/qr-code-styling) for the QR generation library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for the beautiful icons
- [Vite](https://vitejs.dev/) for the fast build tool

---

**QRForge** - Making QR code generation beautiful, private, and accessible to everyone.
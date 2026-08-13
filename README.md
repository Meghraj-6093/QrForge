# QRForge - Privacy-First QR Code Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Version](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-38bdf8)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.2.0-646cff)](https://vitejs.dev/)

A beautiful, privacy-first QR code generator built with React, TypeScript, and Tailwind CSS that runs entirely in the browser. Create stunning, customizable QR codes without compromising your privacy — no servers, no tracking, no data collection.

## � ✨ Features

- **���🔗 URL & Text Conversion** - Transform any URL or text into a QR code instantly
- **���🎨 Full Customization** - Adjust colors, size, margin, and error correction levels
- **���🖼��️ Logo Integration** - Upload and embed your own logo with automatic safety validation
- **��✨ Multiple Styles** - Choose from Classic, Rounded, Dots, and Square QR module styles
- **���🎯 Pattern Customization** - Personalize finder patterns, corner patterns, and gradients
- **���📱 Live Preview** - Real-time updates as you customize your QR code
- **���🎨 Designer Presets** - One-click styles for Portfolio, Instagram, Business Card, Poster, and Minimal themes
- **���📋 Multiple Data Types** - Generate QR codes for URLs, Text, Email, Phone, WhatsApp, Wi-Fi, and more
- **���🛡��️ Privacy First** - 100% client-side processing — zero data leaves your browser
- **���📥 Flexible Export** - Download as PNG, SVG, WebP, or JPEG with customizable resolution
- **���📋 Smart Clipboard** - One-click copying of input data and generated QR codes
- **���🏷��️ Intelligent Filenames** - Auto-generated descriptive filenames based on content
- **��⚠��️ Readability Protection** - Built-in contrast checking and safety validation
- **���🌓 Dark/Light Mode** - Seamless theme switching with system preference detection

## �� 🛠��️ Technology Stack

- **Framework**: React 19 with TypeScript 5.0+
- **Styling**: Tailwind CSS 4.3.3 with dark mode support
- **QR Generation**: [qr-code-styling](https://github.com/qr-code-styling/qr-code-styling) (v1.9.2)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: Vite 8.2.0
- **Browser APIs**: Canvas, Blob, FileReader, Clipboard API, MutationObserver
- **Utilities**: URL normalization, chroma-key logo processing, export resolution scaling

## �� 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Package manager (npm, pnpm, or yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/Meghraj-6093/QrForge.git
cd QrForge

# Install dependencies (using pnpm as in the lockfile)
pnpm install
# or
npm install
```

### Development Server

```bash
# Start the development server with hot reload
pnpm dev
# or
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Production Build

```bash
# Create an optimized production build
pnpm build
# or
npm run build
```

Preview the production build locally:
```bash
pnpm preview
# or
npm run preview
```

## �� 🔒 Privacy First

QRForge is engineered with privacy as a foundational principle:

- **���🌐 100% Browser-Side** - All processing occurs client-side using Web APIs
- **���🚫 No External Requests** - Zero network traffic to any servers or analytics endpoints
- **���🛡��️ Data Sovereignty** - Your QR codes, logos, and input data never leave your device
- **���🔒 No Accounts Required** - No registration, login, or personal data collection
- **���📭 No Tracking** - Absent of cookies, localStorage usage, or fingerprinting techniques

## �� 📁 Project Structure

```
QrForge/
├── src/
│   ├── App.tsx          # Main application component with state management
│   ├── main.tsx         # React DOM entry point
│   ├── index.css        # Global CSS styles and Tailwind directives
│   ├── assets/          # Static assets (icons, logos)
│   ├── components/
│   │   ├── ExportResolutionSelect.tsx  # Export quality selector
│   │   └── ui/
│   │       └── background-ripple-effect.tsx  # Animated background layer
│   └── utils/
│       ├── qrLogoEngine.ts     # Logo processing, safety validation, and chroma-keying
│       ├── urlNormalizer.ts    # Input URL standardization and validation
│       └── urlNormalizer.test.ts # Unit tests for URL normalization
├── public/
│   ├── favicon.svg      # Browser tab icon
│   └── icons.svg        # Application icon sprite
├── dist/                # Production build output (generated)
├── package.json         # Project dependencies and scripts
├── tailwind.config.cjs  # Tailwind CSS configuration
├── postcss.config.cjs   # PostCSS plugin configuration
├── tsconfig.json        # TypeScript compiler configuration
├── vite.config.ts       # Vite build configuration
├── .oxlintrc.json       # Oxlint configuration for code quality
�└── LICENSE              # MIT license text
```

## �� 🎨 Customization Options

### QR Module Styles
- **Classic**: Traditional square modules for maximum compatibility
- **Rounded**: Soft, rounded modules for a friendly appearance
- **Dots**: Circular modules creating a minimalist, modern look
- **Square**: Square modules with internal gaps for a technical aesthetic

### Pattern Customization
- **Finder Patterns**: Modify the three large position detection squares
- **Alignment Patterns**: Customize the smaller square in the bottom-right (for higher versions)
- **Timing Patterns**: Adjust the alternating dark/light lines between finder patterns
- **Format Information**: Personalize the error correction and mask pattern areas

### Color & Appearance
- **Foreground/Background**: Independent color selection with contrast validation
- **Gradient Support**: Apply linear or radial gradients to modules and patterns
- **Transparent Background**: Option for see-through QR codes (scannability may vary)
- **Quiet Zone**: Adjustable margin (whitespace border) around the QR code

### Presets
- **Portfolio**: Professional dark theme with cyan accent
- **Instagram**: Vibrant gradient-inspired design (purple to pink)
- **Business Card**: Elegant dark theme with gold accent
- **Poster**: Maximum contrast dark theme for long-distance scanning
- **Minimal**: Pure black-on-white classic design
- **Custom**: Save and reuse your own style combinations

### Export Formats
- **PNG**: Universal raster format with configurable resolution (72-300 DPI)
- **SVG**: Infinite-resolution vector format ideal for print and scaling
- **WebP**: Modern format with superior compression (lossless and lossy modes)
- **JPEG**: Photographic format for complex QR designs with gradients

## �� 🌐 Browser Support

QRForge supports all modern browsers that implement the following APIs:
- Canvas 2D Rendering Context
- Blob Construction and Slicing
- FileReader for image loading
- Clipboard API for read/write operations
- CSS Custom Properties (for theme variables)
- MutationObserver (for potential future extensions)

**Tested and verified in:**
- Chrome 90+ (Desktop and Android)
- Firefox 88+ (Desktop and Android)
- Safari 14+ (macOS and iOS)
- Edge 90+ (Desktop and Android)
- Opera 75+ (Desktop)

## �� 👨‍���💻 Development

### Available Scripts
- `pnpm dev` or `npm run dev` - Start development server with hot module replacement
- `pnpm build` or `npm run build` - Production build with TypeScript compilation and minification
- `pnpm preview` or `npm run preview` - Locally preview the production build
- `pnpm lint` or `npm run lint` - Code quality checks using Oxlint

### Code Organization
The application follows a modular architecture separating concerns:

1. **State Management** (`App.tsx`) - Centralized React state for all QR properties
2. **Utility Modules** (`src/utils/`) - Pure functions for URL handling, logo processing, and validation
3. **Component Library** (`src/components/`) - Reusable UI components with Tailwind styling
4. **Asset Processing** - Logo upload handling with automatic chroma-key transparency and safety margins
5. **Export Pipeline** - Multi-format generation using Canvas (PNG/JPEG/WebP) and SVG serialization

### State Properties
The QR code configuration is managed through these key state slices:
- `content`: Input data (URL/text/email/etc.) after normalization
- `size`: Pixel dimensions of the QR code matrix
- `margin`: Quiet zone width in modules
- `color`: Foreground and background colors (with gradient support)
- `options`: QRCodeStyling configuration object (style, pattern customization, etc.)
- `logo`: Processed logo image data with safety validation
- `export`: Selected format and resolution for download
- `theme`: Current color scheme (light/dark/system)

## �� 🤝 Contributing

We welcome contributions that enhance privacy, usability, or feature completeness. Please follow these guidelines:

1. **Fork the Repository** - Create your personal fork on GitHub
2. **Create a Feature Branch** - Use descriptive naming: `git checkout -b feature/your-feature-name`
3. **Make Your Changes** - Ensure code follows existing TypeScript and Tailwind conventions
4. **Add Tests** - Include unit tests for new utility functions when applicable
5. **Commit Your Changes** - Write clear, descriptive commit messages
6. **Push to Your Fork** - `git push origin feature/your-feature-name`
7. **Open a Pull Request** - Target the `main` branch with a detailed description

### Development Guidelines
- Maintain 100% client-side privacy - no additional network requests
- Keep dependencies minimal and well-justified
- Follow the existing code style and component patterns
- Ensure new features work in all supported browsers
- Update documentation for any user-facing changes

### Reporting Issues
Please use the GitHub Issues tracker to report bugs or request features. Include:
- Browser version and operating system
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots or screen recordings when helpful

## �� 📄 License

QRForge is released under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2023 Meghraj-6093

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
```

## �� 🙏 Acknowledgments

- [qr-code-styling](https://github.com/qr-code-styling/qr-code-styling) - For the powerful QR code generation and styling library
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework enabling rapid UI development
- [Lucide](https://lucide.dev/) - For the beautiful, consistent icon set
- [Vite](https://vitejs.dev/) - For the lightning-fast build tool and development server
- [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/) - For the robust frontend foundation

## �� 📬 Contact

**Meghraj** - GitHub: [@Meghraj-6093](https://github.com/Meghraj-6093)  
Email: meghrajravani@gmail.com  

If you find QRForge useful, please consider giving it a �� ⭐ on [GitHub](https://github.com/Meghraj-6093/QrForge)!

---

*Built with �� ❤��️ and �� 🔒 - Privacy isn't just a feature, it's the foundation.*
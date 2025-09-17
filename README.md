# CSS Tools Suite

A comprehensive React application built with Vite that provides interactive tools for CSS design and development. This suite includes border radius visualization, color palette generation, and API tools for developers and designers.

## Features Overview

### 🎯 Border Radius Visualizer
An interactive tool for visualizing and understanding CSS border radius relationships between nested elements. Demonstrates the important design principle that container border radius should equal inner element radius plus container padding for visual harmony.

**Key Features:**
- Interactive controls for inner radius and container spacing
- Real-time visual feedback with smooth animations
- Design rule validation with warnings for broken relationships
- Educational tooltips explaining the CSS principles

### 🎨 Color Palette Generator
A powerful tool for generating complete color palettes from a single hex color, with advanced controls for fine-tuning hue, saturation, and lightness distribution.

**Key Features:**
- Generate 50-950 shade palettes from any hex color
- Advanced HSL controls (hue shift, saturation adjustment, lightness range)
- Custom range configuration or automatic distribution
- Real-time preview with click-to-copy functionality
- CSS variable output for Tailwind CSS integration
- Lightness distribution visualization
- Perceived vs Linear lightness options

### 🔧 API Tools
Documentation and testing interface for palette generation APIs, useful for design tools and automated workflows.

**Key Features:**
- Interactive API endpoint testing
- Example requests and responses
- Multiple code examples (JavaScript, cURL)
- Rate limiting information
- Copy-to-clipboard functionality for all code snippets

## Technology Stack

- **React 19.1.1** - Modern React with latest features and concurrent rendering
- **Vite 7.1.5** - Lightning-fast build tool and development server
- **Ant Design 5.27.3** - Professional UI component library
- **ESLint** - Code quality and consistency enforcement

## Project Architecture

```
src/
├── components/
│   ├── RadiusVisualizer.jsx    # Border radius relationship tool
│   ├── ColorPalette.jsx        # Advanced color palette generator
│   ├── ApiTools.jsx           # API documentation and testing
│   └── Navigation.jsx         # Main navigation component
├── App.jsx                    # Root component with routing logic
├── main.jsx                   # Application entry point
├── App.css                    # Component-specific styles
└── index.css                  # Global styles and CSS variables
```

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation & Development

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

### Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## Usage Guide

### Border Radius Visualizer
1. Select an inner radius value (2-16px) for the blue element
2. Choose container spacing/padding (2-16px) for the gray container
3. Observe how the container radius is automatically calculated
4. Watch for warnings when the design rule is violated

**Design Rule:** `Container Radius = Inner Radius + Container Padding`

### Color Palette Generator
1. **Set Base Color:** Enter any hex color (e.g., #1E4BCD)
2. **Configure Range:** Use automatic ranges or define custom shade values
3. **Fine-tune Colors:**
   - Adjust hue shift (-180° to +180°)
   - Modify saturation (-100% to +100%)
   - Set lightness boundaries (0-100%)
4. **Export:** Copy CSS variables or individual color values
5. **Preview:** Click any color swatch to copy its hex value

### API Tools
1. **Test Endpoints:** Enter API URLs and test palette generation
2. **View Examples:** See request/response formats and code samples
3. **Copy Code:** Use provided JavaScript and cURL examples
4. **Understand Limits:** Review rate limiting and usage guidelines

## Educational Value

This tool suite is particularly valuable for:

- **Learning CSS:** Understanding border radius, color theory, and design systems
- **Design Systems:** Establishing consistent spacing, radius, and color scales
- **UI Development:** Making informed decisions about component styling
- **Teaching:** Demonstrating CSS concepts with interactive visualizations
- **API Integration:** Understanding how to work with color palette APIs

## Design Principles Demonstrated

### Border Radius Harmony
The relationship between container and inner element border radius is crucial for visual coherence. When properly calculated, the visual flow appears natural and professional.

### Color Palette Science
Color palettes require careful consideration of:
- **Hue relationships:** How colors relate on the color wheel
- **Saturation consistency:** Maintaining visual weight across shades
- **Lightness distribution:** Creating proper contrast and hierarchy
- **Perceptual uniformity:** Ensuring colors feel evenly distributed

## Development Notes

- **Code Quality:** ESLint configuration ensures consistent code style
- **Performance:** Vite provides fast development builds and optimized production bundles
- **Accessibility:** Ant Design components include built-in accessibility features
- **Responsive Design:** All tools work across desktop and mobile viewports

## Contributing

This project uses ESLint for code quality. Before contributing:

1. Run `npm run lint` to check for issues
2. Follow the existing code style and component patterns
3. Test all interactive features across different browsers
4. Ensure responsive design works on various screen sizes

## Future Enhancements

Potential areas for expansion:
- Additional color space support (OKLCH, P3)
- More border radius presets and patterns
- Export options for different CSS frameworks
- Integration with popular design tools
- Advanced color accessibility checking

## License

This project is private and not currently licensed for public use.
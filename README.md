# Border Radius Visualizer

A React application built with Vite that provides an interactive tool for visualizing and understanding CSS border radius relationships between nested elements.

## What This App Does

This application helps developers understand the visual relationship between container and inner element border radius values. It demonstrates an important CSS design principle: when you have a container with padding and border radius containing an inner element with its own border radius, the container's radius should typically be the sum of the inner element's radius plus the container's padding to maintain visual harmony.

### Key Features

- **Interactive Controls**: Adjust inner radius and container spacing values using dropdown selectors
- **Real-time Visualization**: See immediate visual feedback as you change values
- **Design Rule Validation**: The app warns when the border radius relationship is "broken" (when container radius is less than inner radius)
- **Smooth Animations**: CSS transitions provide smooth visual feedback when values change

### The Design Rule

The app demonstrates this CSS design principle:
```
Container Border Radius = Inner Element Border Radius + Container Padding
```

When this rule is followed, the visual flow between the container and inner element appears natural and harmonious. When broken, the design can look awkward or unfinished.

## Technology Stack

- **React 19.1.1** - Modern React with latest features
- **Vite 7.1.5** - Fast build tool and development server
- **Ant Design 5.27.3** - UI component library for polished interface
- **ESLint** - Code linting and quality assurance

## Project Structure

```
src/
├── components/
│   └── RadiusVisualizer.jsx    # Main interactive component
├── App.jsx                     # Root application component
├── main.jsx                    # Application entry point
├── App.css                     # Component-specific styles
└── index.css                   # Global styles and CSS variables
```

## Getting Started

### Prerequisites
- Node.js (version 16 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local development URL (typically `http://localhost:5173`)

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## How to Use

1. **Select Inner Radius**: Choose a border radius value for the inner blue element (2-16px)
2. **Select Container Spacing**: Choose the padding/spacing value for the gray container (2-16px)
3. **Observe the Result**: The container radius is automatically calculated and displayed
4. **Watch for Warnings**: If the relationship breaks the design rule, you'll see a warning message

## Educational Value

This tool is particularly useful for:
- **Learning CSS**: Understanding how border radius and padding interact
- **Design Systems**: Establishing consistent spacing and radius scales
- **UI Development**: Making informed decisions about component styling
- **Teaching**: Demonstrating CSS concepts visually

## Contributing

This project uses ESLint for code quality. Make sure to run `npm run lint` before submitting any changes.

## License

This project is private and not currently licensed for public use.
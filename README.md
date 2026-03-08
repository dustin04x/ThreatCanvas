# Threat Weaver

> An interactive cybersecurity simulation and learning platform for threat analysis, attack chain visualization, and defensive strategy training.

## Overview

Threat Weaver is a comprehensive cybersecurity education platform designed to help security professionals, students, and enthusiasts understand and respond to cyber threats. The platform combines interactive simulations, attack chain visualization, and hands-on learning modes (Quiz Mode and Defend Mode) to provide an engaging and effective learning experience.

Whether you're analyzing MITRE ATT&CK techniques, exploring network vulnerabilities, or developing defensive strategies, Threat Weaver provides the tools and insights you need to master modern cybersecurity concepts.

## Features

- **Interactive Simulations**: Experience realistic cyber attack scenarios and responses in real-time
- **Attack Chain Visualization**: Map and trace attack sequences through visual network graphs
- **MITRE ATT&CK Matrix**: Access comprehensive mapping of attack techniques and tactics
- **Network Topology Analysis**: Visualize system architecture and process relationships
- **Timeline View**: Track the progression of attacks with detailed event timelines
- **Activity Logging**: Monitor and analyze all system activities and security events
- **Quiz Mode**: Test your knowledge with interactive security challenges
- **Defend Mode**: Practice defensive strategies against simulated attacks
- **Process Tree Analysis**: Understand process hierarchies and execution chains
- **System Map**: Get a high-level overview of infrastructure and systems

## Tech Stack

- **Frontend Framework**: [React](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linting**: [ESLint](https://eslint.org/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or bun as your package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dustin04x/ThreatCanvas.git
   cd ThreatCanvas
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the URL displayed in your terminal)

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Build in development mode
npm run build:dev

# Preview production build locally
npm run preview

# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint
```

### Project Structure

```
src/
├── components/         # Reusable React components
│   ├── simulation/     # Simulation-specific components
│   └── ui/            # Base UI components (shadcn/ui)
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── lib/               # Utilities and helpers
├── store/             # Application state management
├── test/              # Test files
├── App.tsx            # Root application component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## Usage

1. **Launch the Application**: Access the platform through the web interface
2. **Select a Simulation**: Choose from available cybersecurity scenarios
3. **Learn & Analyze**: Use the various visualization tools to understand attack mechanics
4. **Test Your Knowledge**: Participate in Quiz Mode to assess your learning
5. **Practice Defense**: Use Defend Mode to develop and refine your defensive strategies

## Contributing

We welcome contributions to Threat Weaver! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows our linting standards by running `npm run lint` before submitting a PR.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions, issues, or suggestions, please open an issue on the [GitHub repository](https://github.com/dustin04x/threat-weaver/issues).

## Acknowledgments

- Built with modern web technologies and best practices
- Inspired by the need for practical, interactive cybersecurity education
- Community-driven development and continuous improvement

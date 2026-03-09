# 🛡️ ThreatCanvas

> **Visual Malware Attack Simulator** — An interactive cybersecurity education platform for understanding threats, analyzing attacks, and mastering defensive strategies.

<div align="center">

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[🌐 Live Demo](#) • [📖 Documentation](#) • [🐛 Report Issues](https://github.com/dustin04x/ThreatCanvas/issues) • [💬 Discussions](https://github.com/dustin04x/ThreatCanvas/discussions)

</div>

---

## 🎯 What is ThreatCanvas?

**ThreatCanvas** is a next-generation cybersecurity education platform that brings threat analysis to life. Watch malware attacks unfold in real-time, trace attack chains through visual networks, and practice defensive strategies—all without real malware.

Whether you're:
- 🎓 **A Security Student** learning MITRE ATT&CK frameworks
- 👨‍💼 **A Security Professional** honing your incident response skills
- 🔍 **A Threat Hunter** analyzing attack patterns
- 🛡️ **A Defender** developing protective strategies

ThreatCanvas provides the interactive tools and realistic simulations you need to master modern cybersecurity.

---

## ✨ Core Features

<table>
  <tr>
    <td align="center">🎮</td>
    <td><strong>Interactive Simulations</strong><br/>Experience realistic cyber attack scenarios unfolding in real-time</td>
  </tr>
  <tr>
    <td align="center">🔗</td>
    <td><strong>Attack Chain Visualization</strong><br/>Map and trace attack sequences through interactive network graphs</td>
  </tr>
  <tr>
    <td align="center">📊</td>
    <td><strong>MITRE ATT&CK Matrix</strong><br/>Understand attack techniques and tactics with comprehensive framework mapping</td>
  </tr>
  <tr>
    <td align="center">🌐</td>
    <td><strong>Network Topology</strong><br/>Visualize system architecture and process relationships</td>
  </tr>
  <tr>
    <td align="center">📈</td>
    <td><strong>Timeline Analysis</strong><br/>Track attack progression with detailed event timelines</td>
  </tr>
  <tr>
    <td align="center">📝</td>
    <td><strong>Activity Logging</strong><br/>Monitor and analyze all system activities and security events</td>
  </tr>
  <tr>
    <td align="center">🧠</td>
    <td><strong>Quiz Mode</strong><br/>Test your knowledge with interactive security challenges</td>
  </tr>
  <tr>
    <td align="center">⚔️</td>
    <td><strong>Defend Mode</strong><br/>Practice defensive strategies against simulated attacks</td>
  </tr>
  <tr>
    <td align="center">🌳</td>
    <td><strong>Process Tree Analysis</strong><br/>Understand process hierarchies and execution chains</td>
  </tr>
  <tr>
    <td align="center">🗺️</td>
    <td><strong>System Map</strong><br/>Get a high-level overview of infrastructure and systems</td>
  </tr>
</table>

---

## 🛠️ Technology Stack

Built with cutting-edge web technologies:

| Category | Technology |
|----------|-----------|
| 🎨 **Frontend Framework** | [React 18.3](https://react.dev/) |
| 🔷 **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) |
| ⚡ **Build Tool** | [Vite 5.4](https://vitejs.dev/) |
| 🎭 **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| 🎨 **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| 🧪 **Testing** | [Vitest 3.2](https://vitest.dev/) |
| 📋 **Code Quality** | [ESLint 9.32](https://eslint.org/) |
| 🎬 **Animations** | [Framer Motion 12.35](https://www.framer.com/motion/) |
| 📦 **State Management** | [Zustand 4.5](https://github.com/pmndrs/zustand) |
| 📊 **Charts** | [Recharts 2.15](https://recharts.org/) |

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm**, **yarn**, or **bun** as your package manager

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/dustin04x/ThreatCanvas.git
cd ThreatCanvas

# 2️⃣ Install dependencies
npm install
# or: yarn install | bun install

# 3️⃣ Start the development server
npm run dev

# 4️⃣ Open in your browser
# Visit http://localhost:5173 (or the URL shown in your terminal)
```

---

## 📚 Development Guide

### Available Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build locally
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode (continuous)
npm run lint         # Check code quality with ESLint
```

### Project Architecture

```
ThreatCanvas/
├── src/
│   ├── components/
│   │   ├── simulation/      # 🎮 Simulation-specific components
│   │   │   ├── AttackChain.tsx
│   │   │   ├── NetworkGraph.tsx
│   │   │   ├── ProcessTree.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── MitreMatrix.tsx
│   │   │   ├── QuizMode.tsx
│   │   │   ├── DefendMode.tsx
│   │   │   └── ...
│   │   └── ui/              # 🎨 Base UI components (shadcn)
│   ├── pages/               # 📄 Page components
│   ├── hooks/               # 🪝 Custom React hooks
│   ├── lib/                 # 🔧 Utilities and helpers
│   ├── store/               # 💾 State management (Zustand)
│   ├── App.tsx              # 🏠 Root component
│   ├── main.tsx             # ⚙️ Entry point
│   └── index.css            # 🎨 Global styles
├── public/                  # 📁 Static assets
├── package.json             # 📦 Dependencies
├── vite.config.ts           # ⚡ Vite configuration
├── tsconfig.json            # 🔷 TypeScript configuration
└── README.md                # 📖 You are here!
```

---

## 💡 How to Use ThreatCanvas

1. **🚀 Launch** — Open the application in your browser
2. **📂 Select Scenario** — Choose from available cybersecurity simulations
3. **🔍 Analyze** — Use visualization tools to understand attack mechanics
4. **📊 Learn** — Study attack techniques and defensive responses
5. **🧠 Test** — Participate in Quiz Mode to assess your knowledge
6. **⚔️ Practice** — Use Defend Mode to develop defensive strategies

---

## 🤝 Contributing

We love contributions! Here's how you can help:

### Fork & Create a Branch
```bash
git checkout -b feature/YourAmazingFeature
```

### Make Your Changes
- Follow the existing code style
- Write clear commit messages
- Test your changes thoroughly

### Submit a Pull Request
```bash
git commit -m "Add: Your amazing feature"
git push origin feature/YourAmazingFeature
```

Then open a PR on GitHub. We'll review it as soon as possible!

### Before Submitting
Please ensure your code passes our quality checks:
```bash
npm run lint    # Check code style
npm run test    # Run tests
npm run build   # Verify it builds
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

This means you can use ThreatCanvas for educational, commercial, and private purposes!

---

## 🆘 Support & Community

### Have Questions?
- 📖 Check the [Documentation](#)
- 🐛 [Report Issues](https://github.com/dustin04x/ThreatCanvas/issues)
- 💬 [Join Discussions](https://github.com/dustin04x/ThreatCanvas/discussions)

### Stay Updated
⭐ **Star this repository** to stay updated with latest releases and improvements!

---

## 🙏 Acknowledgments

- 🎨 Built with modern, cutting-edge web technologies
- 💡 Inspired by the urgent need for practical, interactive cybersecurity education
- 🌍 Driven by a passionate community dedicated to improving security awareness
- 🔬 Powered by real-world cybersecurity principles and best practices

---

<div align="center">

### Made with ❤️ by the ThreatCanvas Community

**[⭐ Star us on GitHub](https://github.com/dustin04x/ThreatCanvas)** if you find ThreatCanvas useful!

[Report Bug](https://github.com/dustin04x/ThreatCanvas/issues/new?labels=bug) • [Request Feature](https://github.com/dustin04x/ThreatCanvas/issues/new?labels=enhancement) • [View Issues](https://github.com/dustin04x/ThreatCanvas/issues)

</div>

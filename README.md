# Guardian Shield

A React-based web application with Three.js visualizations to protect users against social engineering through AI voice detection, deepfake video detection, and phishing analysis.

## Features

### 1. AI Voice Detection
Upload audio files from calls and verify if the voice is authentic or AI-generated.

### 2. Deepfake Video Detection
Analyze video files to identify signs of manipulation or synthetic content.

### 3. Phishing Detection
Verify suspicious links and analyze email content to identify phishing attempts.

## Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI components
- **Visualization**: Three.js for 3D visualizations
- **Backend**: Express.js
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/guardian-shield.git
cd guardian-shield
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

## Project Structure

- `client/` - Frontend React application
  - `src/components/` - UI components including Three.js visualizations
  - `src/pages/` - Page components for each feature
  - `src/lib/` - Utility functions and configuration
- `server/` - Express backend
  - `routes.ts` - API endpoints for analysis features
  - `storage.ts` - Mock data storage and analysis implementations
- `shared/` - Shared types and schemas

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Shadcn UI for component library
- Three.js for 3D visualizations
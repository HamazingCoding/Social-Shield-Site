# Guardian Shield

Guardian Shield is a comprehensive web application designed to protect users against social engineering through AI voice detection, deepfake video detection, and phishing analysis.

## Features

- **AI Voice Detection**: Analyze audio files to detect synthetically generated voices
- **Deepfake Video Detection**: Verify the authenticity of videos to identify manipulated content
- **Phishing Detection**: Scan URLs and email content for phishing attempts
- **Real-time Analysis**: Process audio and video streams in real-time
- **Browser Extension**: Protect yourself while browsing with our Chrome extension

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- PostgreSQL database

### Setup (Automatic)

1. Clone this repository
2. Run the setup script:
   ```bash
   chmod +x setup-local.sh
   ./setup-local.sh
   ```
3. Start the application:
   ```bash
   ./start-dev.sh
   ```
4. Open http://localhost:5000 in your browser

### Setup (Manual)

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/guardian_shield
   PGUSER=username
   PGPASSWORD=password
   PGDATABASE=guardian_shield
   PGHOST=localhost
   PGPORT=5432
   ```
4. Create the database schema:
   ```bash
   npm run db:push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open http://localhost:5000 in your browser

## Browser Extension

The browser extension provides real-time protection while browsing:

1. Navigate to the `browser-extension` directory
2. Follow the instructions in the extension's [README.md](./browser-extension/README.md)

## Project Structure

- `client/`: Frontend React application
  - `src/components/`: UI components
  - `src/pages/`: Application pages
  - `src/lib/`: Utility functions
- `server/`: Backend Express application
  - `routes.ts`: API endpoints
  - `storage.ts`: Data storage layer
- `shared/`: Shared code between frontend and backend
  - `schema.ts`: Database schema and types
- `browser-extension/`: Chrome extension for real-time protection

## Technologies Used

- **Frontend**:
  - React
  - TailwindCSS
  - Three.js for 3D visualizations
  - TanStack Query for API requests
  
- **Backend**:
  - Express.js
  - PostgreSQL with Drizzle ORM
  - TypeScript

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm run start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
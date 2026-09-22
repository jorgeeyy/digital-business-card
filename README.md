# Tap Card Configurator

A React-based tool for generating self-contained HTML digital business cards. Fill in your details, preview live, and download a single HTML file ready to host or load via NFC.

## Features

- Live preview with instant updates
- 6 brand color palettes with custom color pickers
- 4 font options (DM Serif Display, Playfair Display, Inter, DM Sans)
- 3 layout styles (Classic, Compact, Bold) with visual previews
- Social links with auto-generated URLs from handles
- Quick action buttons (Call, Email, Website)
- Portrait image/video upload with drag-and-drop
- QR code upload
- vCard download ("Save my contact")
- Share button with clipboard fallback
- LocalStorage persistence (form saves automatically)
- Dark theme with gradient backgrounds

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
```

Output will be in the `dist/` directory.

## Usage

1. Fill in your details (name, role, location, contact info)
2. Choose a brand palette, font, and layout
3. Add social links and upload a portrait/QR code
4. Preview the card live on the right
5. Click **Download Card** to get a self-contained HTML file

The downloaded HTML file can be:
- Hosted on any web server
- Loaded directly in a browser
- Written to an NFC tag for tap-to-connect

## Tech Stack

- React 19
- TypeScript
- Vite

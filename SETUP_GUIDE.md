# IISA Launchpad - Setup Guide

## Quick Start

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (v18 or higher)
- npm (comes with Node.js)

### 2. Installation

```bash
cd iisa-launchpad
npm install
```

### 3. Run Development Server

```bash
npm start
```

The application will automatically open at `http://localhost:4200`

## Using the Application

### Registration Page (/)
- Fill out the registration form with candidate information
- Upload a profile image (optional)
- Submit to register a candidate
- You'll be redirected to the dashboard after successful registration

### Dashboard (/dashboard)
- View all registered candidates in a card-based grid
- See statistics: total visits, registrations, and conversion rate
- Search candidates by name, email, or city
- Filter by age range or city
- Click on any candidate card to view full details
- Edit or delete candidates from the detail view

### Key Features
- **Live Updates**: All changes update in real-time
- **Local Storage**: Data persists in the browser
- **Responsive**: Works on mobile, tablet, and desktop
- **Space Theme**: Beautiful cosmic UI design

## Troubleshooting

### Issues with Tailwind CSS
If you see styles not applying, try:
```bash
npm run build
```

### Port Already in Use
If port 4200 is in use:
```bash
ng serve --port 4201
```

### Clear Cache
If you encounter build issues:
```bash
rm -rf node_modules .angular
npm install
npm start
```

## Building for Production

```bash
npm run build
```

Output will be in `dist/iisa-launchpad/`

## Deployment

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist/iisa-launchpad` folder to Netlify
3. No additional configuration needed (using HashLocationStrategy)

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select your dist/iisa-launchpad folder
firebase deploy
```

## Project Structure

```
src/
├── app/
│   ├── components/        # UI Components
│   │   ├── dashboard/
│   │   ├── registration-form/
│   │   ├── candidate-list/
│   │   └── candidate-detail/
│   ├── models/            # Data models
│   ├── services/          # Business logic
│   └── app.routes.ts     # Routing
└── styles.scss           # Global styles
```

## Technologies

- Angular 19
- Angular Material
- Tailwind CSS
- RxJS for state management
- LocalStorage for persistence

## Contact & Support

For issues or questions, please open an issue on GitHub.

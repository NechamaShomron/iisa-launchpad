# 🚀 Israeli Imaginary Space Agency (IISA) Launchpad

A complete Angular 19 web application for the Israeli Imaginary Space Agency's first 100% Israeli space flight registration and management system.

## 🌟 Features

### 🎯 Landing Page (Public Registration)
- **Responsive Registration Form** - Collects all required candidate information
- **Image Upload** - Profile image support (JPEG/PNG, max 5MB)
- **Real-time Validation** - Angular Reactive Forms with comprehensive validation
- **Edit Capability** - Candidates can edit their submission within 3 days
- **Beautiful UI** - Space-themed design with Angular Material and Tailwind CSS

### 📊 Management Dashboard
- **Candidate List View** - Beautiful card-based grid layout
- **Statistics Counter** - Tracks visits, registrations, and conversion rate
- **Search & Filter** - By name, email, city, and age range
- **Age Distribution** - Visual representation of candidate age groups
- **Top Hobbies** - Most popular hobbies among candidates
- **Live Updates** - Real-time updates using RxJS BehaviorSubject

## 🛠️ Technologies Used

- **Angular 19** - Latest Angular framework with standalone components
- **Angular Material** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **RxJS** - Reactive programming for live updates
- **TypeScript** - Type-safe development
- **LocalStorage** - Client-side data persistence

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iisa-launchpad
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## 🎨 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── candidate-detail/     # Candidate detail view
│   │   ├── candidate-list/       # Candidate list display
│   │   ├── dashboard/            # Main dashboard
│   │   └── registration-form/    # Registration form
│   ├── models/
│   │   └── candidate.model.ts    # Data models
│   ├── services/
│   │   └── candidate.service.ts  # Business logic & state
│   ├── app.component.ts          # Root component
│   ├── app.config.ts             # App configuration
│   └── app.routes.ts             # Routing configuration
├── styles.scss                   # Global styles
└── index.html                    # HTML template
```

## 🎯 Usage

### Registration Flow

1. Visit the landing page (`/`)
2. Fill in all required fields:
   - Full Name
   - Email
   - Phone Number
   - Age
   - City or Region
   - Hobbies
   - Why I'm the Perfect Candidate (minimum 20 characters)
   - Profile Image (optional)
3. Submit the registration
4. View your registration in the dashboard

### Management Dashboard

1. Navigate to `/dashboard`
2. View statistics for total visits, registrations, and conversion rate
3. Use search to find specific candidates
4. Filter by age range or city
5. Click on a candidate card to view details
6. Edit or delete candidates as needed

### Editing Registrations

Candidates can edit their registration within 3 days:
- The edit link is automatically preserved
- Simply return to the registration form
- Your previous data will be pre-filled

## 🚀 Key Features

### State Management
- Uses RxJS `BehaviorSubject` for reactive updates
- All changes propagate instantly across components
- LocalStorage for data persistence

### Responsive Design
- Mobile-first approach
- Works seamlessly on all device sizes
- Touch-friendly interactions

### Form Validation
- Real-time validation feedback
- Custom validators for email, phone, age
- Minimum character requirements
- Image format and size validation

### Data Visualization
- Age distribution chart
- Top hobbies display
- Conversion rate tracking
- Visit statistics

## 🎨 Design Highlights

- **Space-themed UI** - Cosmic gradients and space-inspired colors
- **Smooth Animations** - Card hover effects and transitions
- **Material Design** - Consistent, polished UI components
- **Tailwind Utilities** - Rapid UI development

## 📝 API Reference

### Candidate Service

```typescript
// Get all candidates
getCandidates(): Candidate[]

// Get candidate by ID
getCandidateById(id: string): Candidate | undefined

// Add new candidate
addCandidate(candidate: Candidate): void

// Update candidate
updateCandidate(candidate: Candidate): void

// Delete candidate
deleteCandidate(id: string): void

// Search candidates
searchCandidates(query: string): Candidate[]

// Filter by age
filterByAgeRange(min: number, max: number): Candidate[]

// Get statistics
getStats(): VisitStats
```

## 🔧 Build for Production

```bash
# Build the project
npm run build

# The build artifacts will be stored in the `dist/` directory
```

## 🌐 Deployment

The application can be deployed to:
- **Firebase Hosting**
- **Vercel**
- **Netlify**
- **GitHub Pages**

Since it uses LocalStorage, no backend is required!

## 📊 Data Persistence

All data is stored in the browser's LocalStorage:
- `iisa_candidates` - Candidate data
- `iisa_visits` - Visit tracking

## 🎯 Future Enhancements

- Real-time synchronization with backend
- WebSocket support for live updates
- Advanced analytics and reporting
- Image compression before upload
- Export functionality for data

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Acknowledgments

Built with ❤️ for the Israeli Imaginary Space Agency

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2025
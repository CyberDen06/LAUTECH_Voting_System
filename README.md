# LAUTECH JUPEB Awards Voting System

A secure, transparent voting platform for LAUTECH JUPEB students to select award nominees across multiple categories. Built with React 18, TypeScript, and Vite.

## Features

- **Student Voting**: Secure authentication via JUPEB number with one-vote-per-student enforcement
- **Admin Dashboard**: Comprehensive election management (student import/export, category/candidate management, live results)
- **CSV/XLSX Support**: Batch student import with flexible column mapping
- **Candidate Photo Upload**: Store and display nominee images with base64 encoding
- **Live Vote Tracking**: Real-time vote counts and participation metrics
- **Persistent Storage**: All data stored locally via browser localStorage (survives refresh)
- **Responsive Design**: Dark/gold theme with mobile-friendly layouts

## Tech Stack

- **Frontend Framework**: React 18.3.1 with TypeScript 5.5.4
- **Build Tool**: Vite 5.4.10
- **Routing**: React Router v6
- **Data Import**: xlsx 0.18.1 (Excel/CSV parsing)
- **Styling**: Custom CSS with dark theme and gold accents

## Project Structure

```
JUPEB Voting System/
├── public/
│   └── lautech-logo.png          # LAUTECH institution logo
├── src/
│   ├── App.tsx                   # Main application with all components
│   ├── index.css                 # Global styling (dark/gold theme)
│   └── main.tsx                  # React entry point
├── index.html                    # HTML app shell
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite build configuration
├── package.json                  # Dependencies and scripts
└── README.md                      # This file
```

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm

### Local Development

1. **Clone/download the project**
   ```bash
   cd "JUPEB Voting System"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add the LAUTECH logo**
   - The logo is already included as an SVG file in `public/lautech-logo.svg`
   - It displays automatically on the home page hero section
   - To customize: edit the SVG file with your own logo (replace colors, shapes, text as needed)

4. **Start development server**
   ```bash
   npm run dev
   ```
   - Opens at `http://localhost:5173` by default
   - Hot module reloading enabled for instant feedback

5. **Build for production**
   ```bash
   npm run build
   ```
   - TypeScript validation runs before Vite build
   - Output in `dist/` directory ready for deployment

## Authentication

### Student Access
- Enter JUPEB number to authenticate (e.g., `260700002`)
- Only authorized students can vote
- One vote per student enforced

### Admin Access
- **Default credentials**: 
  - Email: `admin@lautech.edu.ng`
  - Password: `admin1234`
- Access restricted to election administrators
- Full audit trail and results download capability

## Data Storage

All application data persists in browser localStorage:

| Key | Content |
|-----|---------|
| `lautech-students` | Registered student list with authorization status |
| `lautech-categories` | Award categories and settings |
| `lautech-candidates` | Nominee information with base64 photo data |
| `lautech-votes` | Vote records (studentId → categoryId → candidateId) |
| `lautech-election` | Election status (open/closed) |
| `lautech-student-session` | Current student login session |
| `lautech-admin-session` | Admin authentication state |

### Data Backup

- **Export Students**: Admin dashboard → Export CSV
- **Export Results**: Admin dashboard → Download Results CSV
- localStorage persists until cleared (browser storage settings)

## Admin Features

### Student Management
- Import students from CSV/XLSX with flexible column mapping
- Add/edit students manually
- Export student list with participation status
- Clear all students (with confirmation modal)
- Search and filter by JUPEB number or name

### Category Management
- Create award categories with descriptions
- Activate/deactivate categories
- Set category images/thumbnails

### Candidate Management
- Add nominees with photo upload (base64 storage)
- Assign candidates to categories
- Edit/delete candidates
- Upload and update candidate photos with preview

### Results Tracking
- Live vote counts per candidate
- Participation metrics (registered/voted/pending)
- Ranked results with percentages
- Export results to CSV for record-keeping

## Usage Workflows

### Election Setup
1. Admin login → Dashboard
2. Import student list (CSV/XLSX) or add manually
3. Create award categories
4. Add candidate nominees with photos
5. Activate categories (election status changes to "open")

### Voting Period
1. Students visit home page
2. Enter JUPEB number to authenticate
3. Vote in each active category (review required before submission)
4. System confirms vote submission

### Results Review
1. Admin dashboard shows live vote counts
2. Click "Download Results" to export CSV
3. Results ranked by vote count with percentages
4. Election status can be closed to prevent further voting

## Development

### Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production (TypeScript check + Vite)
npm run preview      # Preview production build locally
```

### Type Checking

TypeScript strict mode enabled. Verify compilation:
```bash
npx tsc --noEmit
```

### Code Style

- React functional components with hooks
- TypeScript strict typing throughout
- Component prop types defined with `type` declarations
- Consistent naming: camelCase functions, PascalCase components

## Deployment

### Building for Production

```bash
npm run build
```

Creates optimized `dist/` directory ready for hosting:
- JavaScript bundled and minified
- TypeScript validated
- CSS optimized
- Assets hashed for cache busting

### Hosting Options

#### Lovable (Recommended)
1. Push repository to GitHub
2. Connect Lovable to GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Install command: `npm install`
   - Output directory: `dist`
4. Deploy from Lovable dashboard

#### Other Platforms (Vercel, Netlify, etc.)
1. Connect GitHub repository
2. Configure build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

#### Self-Hosted (Static File Server)
1. Run `npm run build`
2. Upload `dist/` contents to web server
3. Configure server to serve `index.html` for SPA routing
4. Example Nginx config:
   ```nginx
   server {
     root /var/www/voting-system/dist;
     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

## Security Notes

- Passwords stored in localStorage (client-side only—suitable for institutional deployments)
- Vote records immutable once submitted (design-level protection)
- JUPEB number lookup provides basic authorization
- No network backend required (all data local to browser)
- For sensitive deployments, consider adding server-side vote encryption/audit trails

## Troubleshooting

### Port Already in Use
If `localhost:5173` is in use, Vite auto-selects next available port.

### localStorage Full
Large candidate photo libraries may exceed browser storage (~5-10MB limit). 
- Export/archive old elections
- Use smaller photo files

### TypeScript Errors on Build
Run `npm run build` to see full errors. Common issues:
- Missing prop types in component props
- Implicit any types
- Type mismatch in state updates

### Import Issues
Ensure `allowSyntheticDefaultImports: true` in `tsconfig.json` for simplified imports.

## Support & Contribution

For issues or suggestions, document clearly with:
- Steps to reproduce
- Expected vs. actual behavior
- Browser/OS environment
- localStorage state (if applicable)

## License

Internal LAUTECH election system. Usage restricted to authorized personnel.

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Built with Vite + React + TypeScript**

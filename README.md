# Wedding Bazaar - Modern Wedding Planning Platform

A comprehensive wedding planning platform built with React, TypeScript, Vite, and Neon PostgreSQL. Designed with micro frontends architecture for scalability and modern wedding vendor marketplace functionality.

## 🌐 Live Demo & Repository

- **Frontend**: [https://weddingbazaarph.web.app](https://weddingbazaarph.web.app)
- **GitHub**: [https://github.com/Reviled-ncst/WeddingBazaar-web](https://github.com/Reviled-ncst/WeddingBazaar-web)
- **Status**: Frontend deployed on Firebase Hosting, Backend deployment in progress

## 🚀 Features

- **Modern Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Micro Frontend Architecture**: Scalable modular component structure
- **Wedding Marketplace**: Vendor listings, service categories, booking systems
- **User Management**: Authentication, role-based access (vendors/customers)
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Database**: Neon PostgreSQL with serverless connection
- **Production Ready**: Railway deployment configuration

## 📁 Project Structure

```
├── src/
│   ├── pages/          # Main pages (homepage, landing pages)
│   ├── modules/        # Feature modules (bookings, vendors, etc.)
│   ├── shared/         # Shared components, types, services
│   └── utils/          # Utility functions
├── backend/
│   ├── database/       # Database connection and queries
│   └── services/       # Business logic services
├── server/             # Express.js API server
├── scripts/            # Deployment and setup scripts
└── docs/               # Project documentation
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Neon PostgreSQL account

### 1. Clone and Install
```bash
git clone <your-repo>
cd wedding-bazaar
npm install
```

### 2. Environment Setup
```bash
# Generate secure environment variables
npm run setup:env

# Or for production
npm run setup:env:prod
```

### 3. Configure Database
1. Create a Neon PostgreSQL database at [console.neon.tech](https://console.neon.tech)
2. Update the `DATABASE_URL` in your `.env` file
3. Initialize the database:
```bash
npm run db:init
```

### 4. Start Development
```bash
# Start both frontend and backend
npm run dev:full

# Or separately
npm run dev          # Frontend only (localhost:5173)
npm run dev:backend  # Backend only (localhost:3000)
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts (vendors, customers, admins)
- **vendors**: Wedding vendor profiles and information
- **services**: Service offerings by vendors
- **bookings**: Customer bookings and appointments
- **reviews**: Customer reviews and ratings

## 🚀 Deployment

### Railway Deployment (Recommended)

1. **Setup Railway**
```bash
npm install -g @railway/cli
railway login
railway init
```

2. **Configure Environment Variables**
```bash
# Generate production environment file
npm run setup:env:prod

# Copy variables to Railway dashboard
# See DEPLOYMENT.md for detailed instructions
```

3. **Deploy**
```bash
npm run deploy:railway
```

4. **Initialize Production Database**
```bash
npm run db:init:prod
```

### Manual Deployment

```bash
# Build the project
npm run build:full

# Start production server
npm run start:prod
```

## 📚 API Endpoints

### Health & Admin
- `GET /api/health` - Health check and database status
- `POST /api/admin/init-db` - Initialize database tables

### Vendors
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/search?q=query` - Search vendors
- `GET /api/vendors/:id` - Get vendor details
- `POST /api/vendors` - Create vendor (authenticated)
- `PUT /api/vendors/:id` - Update vendor (authenticated)
- `DELETE /api/vendors/:id` - Delete vendor (authenticated)

### Bookings
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## 🧪 Development

### Environment Variables
```bash
# Development
DATABASE_URL=postgresql://user:pass@host/db
NODE_ENV=development
JWT_SECRET=your-dev-secret
VITE_API_URL=http://localhost:3000/api

# Production
NODE_ENV=production
CORS_ORIGINS=https://yourdomain.com
```

### Available Scripts
```bash
npm run dev:full        # Start full development environment
npm run build:full      # Build frontend and backend
npm run setup:env       # Generate development .env
npm run setup:env:prod  # Generate production .env
npm run db:init         # Initialize development database
npm run lint            # Run ESLint
npm run test            # Run tests (when added)
```

## 🎨 UI Components

Built with Tailwind CSS and includes:

- **Layout Components**: Header, Footer, responsive navigation
- **Modal System**: Login, registration, and custom modals
- **Form Components**: Registration, booking forms
- **Cards**: Vendor cards, service listings
- **Responsive Design**: Mobile-first approach

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention (parameterized queries)
- Environment variable protection

## 📖 Documentation

- [Project Structure](PROJECT_STRUCTURE.md) - Detailed folder organization
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Neon Setup](NEON_SETUP.md) - Database configuration guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛟 Support

- Create an issue for bug reports
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
- Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for architecture details

---

Built with ❤️ for the wedding industry

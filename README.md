# Livin3D - Restaurant AR Menu Management

A modern, cyberpunk-themed restaurant menu management system with AR capabilities built with Next.js 14.

## 🚀 Features

- **Dashboard Management**: Complete restaurant dashboard with menu management
- **AR-Ready**: Built for 3D model integration and AR experiences
- **Cyberpunk Theme**: Unique neon aesthetic with terminal-inspired design
- **Database Integration**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase auth integration
- **QR Code Generation**: Built-in QR code system for menu sharing
- **Payment Integration**: Razorpay integration ready
- **Responsive Design**: Mobile-first approach

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **Database**: PostgreSQL with Prisma ORM v7
- **Authentication**: Supabase
- **Deployment**: Vercel/Netlify ready
- **3D/AR**: Three.js integration planned

## 📁 Project Structure

```
├── app/                    # Next.js app router
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── lib/                   # Utility functions
├── prisma/               # Database schema & migrations
└── public/               # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Supabase account (for auth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd menuAR
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   NEXT_PUBLIC_SUPABASE_URL="..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   CRON_SECRET="your-secret-key"
   ```

4. **Set up database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Add environment variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CRON_SECRET`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms

The app is compatible with:
- **Netlify**
- **Railway**
- **Render**
- **DigitalOcean App Platform**

## 🎨 Design System

### Colors
- **Primary**: Plasma Green (#00FFD1)
- **Background**: Void (#0A0A0F), Terminal (#111118)
- **Text**: Primary (#E8E8F0), Secondary (#9090A8)

### Typography
- **Display**: Orbitron for headings
- **Body**: IBM Plex Mono for content
- **UI**: System font stack

## 📱 Pages & Features

- **`/`** - Landing page
- **`/dashboard/dishes`** - Menu management
- **`/dashboard/dishes/new`** - Add new dishes
- **`/dashboard/settings`** - Restaurant settings
- **`/login`** & **`/register`** - Authentication

## 🔧 API Routes

- `POST /api/dishes` - Create dishes
- `GET /api/dishes` - Fetch dishes
- `GET /api/restaurants` - Fetch restaurants

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🎯 Future Features

- [ ] 3D model upload and viewing
- [ ] AR menu experience
- [ ] Real-time order management
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] PWA capabilities

---

Built with ❤️ using Next.js and the cyberpunk aesthetic

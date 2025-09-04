# FinTech Data Infrastructure Dashboard

A comprehensive, modern financial technology dashboard built with Next.js, TypeScript, and Tailwind CSS. This application provides real-time financial data visualization, portfolio management, and infrastructure monitoring capabilities.

## 🚀 Features

### 📊 Dashboard Overview
- Real-time financial metrics and KPIs
- Portfolio performance tracking
- Risk assessment and monitoring
- Data latency monitoring

### 💼 Portfolio Management
- Comprehensive holdings overview
- Asset allocation visualization
- Performance vs benchmark analysis
- P&L tracking and reporting

### 🏗️ Infrastructure Monitoring
- System health monitoring
- Service status tracking
- Performance metrics visualization
- Real-time alerts and notifications

### 🎨 Modern UI/UX
- Responsive design for all devices
- Dark/light theme support
- Interactive charts and graphs
- Smooth animations and transitions

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Hooks + Zustand
- **Data Fetching**: React Query + Axios

## 📁 Project Structure

```
fintech-data-infrastructure-dashboard/
├── app/                          # Next.js app directory
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Dashboard home page
│   ├── portfolio/               # Portfolio management
│   │   └── page.tsx
│   └── infrastructure/          # Infrastructure monitoring
│       └── page.tsx
├── components/                   # Reusable components
│   ├── PortfolioChart.tsx       # Portfolio performance chart
│   └── DataTable.tsx            # Data table component
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fintech-data-infrastructure-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎯 Key Components

### Dashboard (`app/page.tsx`)
Main dashboard with overview metrics, navigation, and key performance indicators.

### Portfolio Chart (`components/PortfolioChart.tsx`)
Interactive area chart component for portfolio performance visualization using Recharts.

### Data Table (`components/DataTable.tsx`)
Reusable, sortable, and searchable data table component with pagination support.

### Portfolio Page (`app/portfolio/page.tsx`)
Comprehensive portfolio management with holdings, asset allocation, and performance metrics.

### Infrastructure Page (`app/infrastructure/page.tsx`)
Real-time system monitoring with service status, performance charts, and alerts.

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#0ea5e9) - Main brand color
- **Success**: Green (#22c55e) - Positive indicators
- **Warning**: Orange (#f59e0b) - Caution states
- **Danger**: Red (#ef4444) - Error states
- **Dark**: Gray scale (#0f172a to #f8fafc) - Text and backgrounds

### Typography
- **Primary Font**: Inter - Clean, modern sans-serif
- **Monospace Font**: JetBrains Mono - For code and data

### Components
- **Cards**: Consistent card design with hover effects
- **Buttons**: Primary and secondary button styles
- **Status Indicators**: Color-coded status badges
- **Input Fields**: Form inputs with focus states

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Configuration

### Tailwind CSS
Custom color schemes, animations, and component classes are defined in `tailwind.config.js`.

### TypeScript
Strict type checking enabled with custom path mappings for clean imports.

### Next.js
App Router enabled with experimental features for enhanced performance.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on push

### Deploy to Other Platforms
The application can be deployed to any platform that supports Node.js applications.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - Chart library
- [Lucide](https://lucide.dev/) - Icon library
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the FinTech community**


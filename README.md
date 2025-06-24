# MCGS - Max Care Grand Services

A comprehensive service provider platform connecting customers with trusted professionals for home services.

## Features

- **Service Provider Directory**: Browse and search for verified service providers
- **Multiple Service Categories**: RO Technician, AC Technician, Electrician, Plumber, Mechanic, Carpenter, Painter, Cleaner, Gardener
- **User Authentication**: Secure login/signup for customers, providers, and admins
- **Provider Dashboard**: Comprehensive dashboard for service providers to manage bookings and profile
- **Admin Panel**: Administrative interface for managing providers and bookings
- **Contact System**: Integrated contact form with email notifications
- **Responsive Design**: Mobile-first design that works on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mcgs-service-providers
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your Supabase credentials in the `.env` file:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

### Database Setup

The project uses Supabase with the following main tables:
- `service_providers` - Service provider profiles
- `services` - Services offered by providers
- `reviews` - Customer reviews and ratings
- `bookings` - Service bookings
- `contacts` - Contact form submissions

Run the migrations in the `supabase/migrations` folder to set up the database schema.

### Email Integration

The contact form is integrated to send emails to `mcgs.ngpmsi@gmail.com`. To enable email functionality:

1. Set up a Supabase Edge Function for email sending
2. Configure an email service (Resend, SendGrid, etc.)
3. Add the necessary API keys to your Supabase environment variables

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── home/           # Home page sections
│   ├── layout/         # Layout components (Header, Footer)
│   ├── providers/      # Provider-related components
│   └── ui/             # Basic UI components
├── contexts/           # React contexts
├── data/              # Mock data and utilities
├── lib/               # Library configurations
├── pages/             # Page components
└── types/             # TypeScript type definitions
```

## Key Features

### For Customers
- Browse service providers by category
- View detailed provider profiles with reviews
- Book services directly through the platform
- Track booking status
- Leave reviews and ratings

### For Service Providers
- Create and manage professional profiles
- Receive and manage bookings
- Track earnings and performance
- Update availability status
- View customer reviews

### For Admins
- Manage all service providers
- Monitor bookings and transactions
- View platform analytics
- Handle customer support

## Contact Information

- **Email**: mcgs.ngpmsi@gmail.com
- **Phone**: +91 98816 70078
- **Location**: Manewada Road, Nagpur, Maharashtra, India
- **Business Hours**: Monday - Saturday: 9:00 AM - 6:00 PM

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary software owned by Max Care Grand Services (MCGS).
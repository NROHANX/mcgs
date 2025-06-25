# MCGS - Max Care Grand Services

A comprehensive service provider platform connecting customers with trusted professionals for home services.

## Features

- **Service Provider Directory**: Browse and search for verified service providers
- **Multiple Service Categories**: RO Technician, AC Technician, Electrician, Plumber, Mechanic, Carpenter, Painter, Cleaner, Gardener
- **User Authentication**: Secure login/signup for customers, providers, and admins
- **Provider Dashboard**: Comprehensive dashboard for service providers to manage bookings and profile
- **Admin Panel**: Administrative interface for managing providers and bookings
- **Contact System**: Integrated contact form with email notifications
- **Google Maps Integration**: Precise location selection for service providers
- **Responsive Design**: Mobile-first design that works on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **Maps**: Google Maps Places API with React Google Maps
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Maps API key

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

Fill in your credentials in the `.env` file:

**Client-side variables (for frontend):**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Server-side variables (for backend/edge functions):**
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**How to get these values:**
- `VITE_SUPABASE_URL` and `SUPABASE_URL`: Your Supabase project URL (found in Project Settings > API)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key (found in Project Settings > API)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (found in Project Settings > API) - **Keep this secret!**
- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key from Google Cloud Console

### Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API** for your project
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Add the API key to your `.env` file as `VITE_GOOGLE_MAPS_API_KEY`

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
- `support_tickets` - Customer support tickets
- `earnings` - Provider earnings tracking
- `payments` - Payment records

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
- Google Maps integration for precise location selection

### For Service Providers
- Create and manage professional profiles
- Receive and manage bookings
- Track earnings and performance
- Update availability status
- View customer reviews
- Google Maps location selection for service areas

### For Admins
- Manage all service providers
- Monitor bookings and transactions
- View platform analytics
- Handle customer support

## Google Maps Integration

The application includes Google Maps Places Autocomplete for:
- Precise location selection during provider registration
- Better customer-provider matching based on location
- Improved search and filtering capabilities

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
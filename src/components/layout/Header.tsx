import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogIn, LogOut, Settings, Shield } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';

interface HeaderProps {
  onCategoryClick: (categoryId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onCategoryClick }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, userProfile, signOut } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    
    if (userProfile?.user_type === 'admin') {
      navigate('/admin');
    } else if (userProfile?.user_type === 'provider') {
      navigate('/provider-dashboard');
    } else {
      navigate('/profile');
    }
  };

  const handleHomeClick = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  const getProfileButtonText = () => {
    if (!userProfile) return 'Profile';
    
    switch (userProfile.user_type) {
      case 'admin':
        return 'Admin Panel';
      case 'provider':
        return 'Dashboard';
      default:
        return 'Profile';
    }
  };

  const getProfileIcon = () => {
    if (!userProfile) return <User className="h-4 w-4" />;
    
    switch (userProfile.user_type) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'provider':
        return <Settings className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={handleHomeClick} className="flex items-center cursor-pointer">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                <span className="text-red-500">Max Care</span> <span className="text-sky-500">Grand Services</span> (<span className="text-red-500 font-extrabold">M</span><span className="text-red-500 font-extrabold">C</span><span className="text-sky-500 font-extrabold">G</span><span className="text-sky-500 font-extrabold">S</span>)
              </h1>
              <p className="text-lg text-gray-600 font-semibold">We are near you</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={handleHomeClick}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            
            <Link to="/services" className="text-gray-700 hover:text-blue-600 transition-colors">
              Services
            </Link>
            
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              About Us
            </Link>
            
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contact Us
            </Link>

            {/* Admin Login Link */}
            <Link to="/admin-login" className="text-red-600 hover:text-red-800 transition-colors font-medium">
              Admin
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user && userProfile ? (
              <>
                <Button 
                  variant="outline" 
                  icon={getProfileIcon()}
                  onClick={handleProfileClick}
                >
                  {getProfileButtonText()}
                </Button>
                <Button 
                  variant="outline" 
                  icon={<LogOut className="h-4 w-4" />}
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  icon={<LogIn className="h-4 w-4" />}
                  onClick={() => handleAuthClick('signin')}
                >
                  Login
                </Button>
                <Button 
                  icon={<User className="h-4 w-4" />}
                  onClick={() => handleAuthClick('signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <button 
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-2 animate-fadeIn">
          <nav className="flex flex-col space-y-4 py-4">
            <button 
              onClick={handleHomeClick}
              className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left"
            >
              Home
            </button>
            
            <Link to="/services" className="text-gray-700 hover:text-blue-600 transition-colors py-2">
              Services
            </Link>
            
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors py-2">
              About Us
            </Link>
            
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors py-2">
              Contact Us
            </Link>

            {/* Admin Login Link for Mobile */}
            <Link to="/admin-login" className="text-red-600 hover:text-red-800 transition-colors py-2 font-medium">
              Admin Login
            </Link>
          </nav>
          
          <div className="flex flex-col space-y-2 pt-2 pb-4">
            {user && userProfile ? (
              <>
                <Button 
                  variant="outline" 
                  fullWidth 
                  icon={getProfileIcon()}
                  onClick={handleProfileClick}
                >
                  {getProfileButtonText()}
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth 
                  icon={<LogOut className="h-4 w-4" />}
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  fullWidth 
                  icon={<LogIn className="h-4 w-4" />}
                  onClick={() => handleAuthClick('signin')}
                >
                  Login
                </Button>
                <Button 
                  fullWidth 
                  icon={<User className="h-4 w-4" />}
                  onClick={() => handleAuthClick('signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </header>
  );
};

export default Header;
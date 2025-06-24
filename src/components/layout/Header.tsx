import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogIn, LogOut } from 'lucide-react';
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
  const { user, signOut } = useAuth();

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

  const handleHomeClick = () => {
    navigate('/');
    // Close mobile menu if open
    setIsMenuOpen(false);
  };

  const handleServicesClick = () => {
    navigate('/services');
    setIsMenuOpen(false);
  };

  const handleAboutClick = () => {
    navigate('/about');
    setIsMenuOpen(false);
  };

  const handleContactClick = () => {
    navigate('/contact');
    setIsMenuOpen(false);
  };

  // Check if user is admin
  const isAdmin = user?.email === 'ashish15.nehamaiyah@gmail.com';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={handleHomeClick} className="flex items-center cursor-pointer">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                <span className="text-red-500">Max Care</span> <span className="text-sky-500">Grand Services</span> (<span className="text-red-500 font-extrabold">M</span><span className="text-red-500 font-extrabold">C</span><span className="text-sky-500 font-extrabold">G</span><span className="text-sky-500 font-extrabold">S</span>)
              </h1>
              <p className="text-base text-gray-600 font-medium">We are near you</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={handleHomeClick}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            
            <button 
              onClick={handleServicesClick}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Services
            </button>
            
            <button 
              onClick={handleAboutClick}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              About Us
            </button>
            <button 
              onClick={handleContactClick}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Contact Us
            </button>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile">
                  <Button 
                    variant="outline" 
                    icon={<User className="h-4 w-4" />}
                  >
                    My Profile
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button 
                      variant="outline"
                      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    >
                      Admin Panel
                    </Button>
                  </Link>
                )}
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
            
            <button 
              onClick={handleServicesClick}
              className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left"
            >
              Services
            </button>
            
            <button 
              onClick={handleAboutClick}
              className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left"
            >
              About Us
            </button>
            <button 
              onClick={handleContactClick}
              className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left"
            >
              Contact Us
            </button>
          </nav>
          <div className="flex flex-col space-y-2 pt-2 pb-4">
            {user ? (
              <>
                <Link to="/profile">
                  <Button 
                    variant="outline" 
                    fullWidth 
                    icon={<User className="h-4 w-4" />}
                  >
                    My Profile
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button 
                      variant="outline" 
                      fullWidth 
                      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    >
                      Admin Panel
                    </Button>
                  </Link>
                )}
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
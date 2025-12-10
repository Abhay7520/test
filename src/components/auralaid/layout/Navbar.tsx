import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Menu, X, LogOut, User, Calendar, Home, Building as Hospital } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '../ui/Logo';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Close menu when location changes
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMenuOpen ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
    >
      <div className="container-custom">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo />
            <span className="ml-2 text-xl font-heading font-bold text-primary">SwasthAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" label="Home" isActive={location.pathname === '/'} />
            <NavLink to="/hospitals" label="Hospitals" isActive={location.pathname.includes('/hospitals')} />
            {user ? (
              <>
                <NavLink to="/dashboard" label="Dashboard" isActive={location.pathname === '/dashboard'} />
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
                <Link
                  to="/dashboard"
                  className="ml-2 flex items-center justify-center rounded-full w-8 h-8 bg-primary/20 text-primary"
                >
                  {user.name?.[0] || <User size={16} />}
                </Link>
              </>
            ) : (
              <>
                <NavLink to="/login" label="Login" isActive={location.pathname === '/login'} />
                <Link
                  to="/register"
                  className="ml-2 btn btn-primary flex items-center"
                >
                  Sign Up <Mic size={16} className="ml-1" />
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white"
          >
            <div className="space-y-1 px-4 pb-5 pt-2">
              <MobileNavLink to="/" label="Home" icon={<Home size={20} />} />
              <MobileNavLink to="/hospitals" label="Hospitals" icon={<Hospital size={20} />} />

              {user ? (
                <>
                  <MobileNavLink to="/dashboard" label="Dashboard" icon={<Calendar size={20} />} />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-lg"
                  >
                    <LogOut size={20} className="mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/login" label="Login" icon={<User size={20} />} />
                  <MobileNavLink to="/register" label="Sign Up" icon={<Mic size={20} />} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  label: string;
  isActive: boolean;
}

const NavLink = ({ to, label, isActive }: NavLinkProps) => (
  <Link
    to={to}
    className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
      }`}
  >
    {label}
    {isActive && (
      <motion.div
        layoutId="navbar-indicator"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
        initial={false}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    )}
  </Link>
);

interface MobileNavLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const MobileNavLink = ({ to, label, icon }: MobileNavLinkProps) => (
  <Link
    to={to}
    className="flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-lg"
  >
    <span className="mr-3">{icon}</span>
    {label}
  </Link>
);

export default Navbar;
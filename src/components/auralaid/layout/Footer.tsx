import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Mail, Phone, MapPin, Globe } from 'lucide-react';
import Logo from '../ui/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Logo size={32} />
              <span className="ml-2 text-xl font-heading font-bold text-primary-500">AuralAid</span>
            </div>
            <p className="text-gray-600 mb-4">
              Your Voice-First Health Companion. Book appointments with top hospitals using voice commands in English, Hindi, and Telugu.
            </p>
            <div className="flex space-x-4">
              <SocialIcon>
                <Globe size={18} />
              </SocialIcon>
              <SocialIcon>
                <MessageCircle size={18} />
              </SocialIcon>
              <SocialIcon>
                <Mail size={18} />
              </SocialIcon>
            </div>
          </div>

          <div>
            <h5 className="font-heading font-semibold text-lg mb-4">Quick Links</h5>
            <ul className="space-y-3">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/hospitals" label="Find Hospitals" />
              <FooterLink to="/dashboard" label="Your Appointments" />
            </ul>
          </div>

          <div>
            <h5 className="font-heading font-semibold text-lg mb-4">Help & Support</h5>
            <ul className="space-y-3">
              <FooterLink to="/" label="FAQs" />
              <FooterLink to="/" label="Privacy Policy" />
              <FooterLink to="/" label="Terms of Service" />
              <FooterLink to="/" label="Contact Us" />
            </ul>
          </div>

          <div>
            <h5 className="font-heading font-semibold text-lg mb-4">Contact</h5>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-3 text-primary-500 mt-1 flex-shrink-0" />
                <span className="text-gray-600">
                  123 Healthcare Avenue, Medical District, Hyderabad, India, 500001
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 text-primary-500 flex-shrink-0" />
                <span className="text-gray-600">+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 text-primary-500 flex-shrink-0" />
                <span className="text-gray-600">contact@auralaid.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} AuralAid. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center">
            Made with <Heart size={14} className="mx-1 text-error-500" /> for better healthcare
          </p>
        </div>
      </div>
    </footer>
  );
};

interface FooterLinkProps {
  to: string;
  label: string;
}

const FooterLink = ({ to, label }: FooterLinkProps) => (
  <li>
    <Link 
      to={to} 
      className="text-gray-600 hover:text-primary-500 transition-colors"
    >
      {label}
    </Link>
  </li>
);

interface SocialIconProps {
  children: React.ReactNode;
}

const SocialIcon = ({ children }: SocialIconProps) => (
  <a 
    href="#" 
    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-primary-500 hover:shadow-md transition-all"
  >
    {children}
  </a>
);

export default Footer;
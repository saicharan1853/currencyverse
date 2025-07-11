
import { Facebook, Github, Instagram, Mail, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-white p-2 rounded-full">
                <div className="text-indigo-600 font-bold text-xl">CH</div>
              </div>
              <h2 className="ml-3 text-xl font-bold">CurrencyHub</h2>
            </div>
            <p className="text-gray-400">
              Modern currency exchange and management platform for global citizens.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">
              Services
            </h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Currency Exchange</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Currency Alerts</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Multi-Currency Wallets</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Transaction History</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">
              Company
            </h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">
              Contact
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <Mail size={16} className="mr-2" />
                support@currencyhub.com
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Subscribe to our newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-800 text-white px-3 py-2 rounded-l focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-r transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800 text-gray-400 text-sm text-center">
          &copy; {new Date().getFullYear()} CurrencyHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

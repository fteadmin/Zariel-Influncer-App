'use client';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#A7D129] to-[#8fb622] py-16 px-6">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#6A7B92] rounded-xl flex items-center justify-center">
                <span className="text-xl font-black text-white">Z</span>
              </div>
              <span className="text-xl font-black text-gray-900">Zariel & Co</span>
            </div>
            <p className="text-gray-800 leading-relaxed font-medium">
              The global marketplace connecting creators with brands.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-900">Company</h4>
            <ul className="space-y-3 text-gray-800">
              <li><a href="/about-us" className="hover:text-[#6A7B92] transition-colors font-medium">About Us</a></li>
              <li><a href="/#contact" className="hover:text-[#6A7B92] transition-colors font-medium">Contact</a></li>
              <li><a href="/auth/login" className="hover:text-[#6A7B92] transition-colors font-medium">Sign in</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-900">Legal</h4>
            <ul className="space-y-3 text-gray-800">
              <li><a href="/privacy-policy" className="hover:text-[#6A7B92] transition-colors font-medium">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="hover:text-[#6A7B92] transition-colors font-medium">Terms of Service</a></li>
              <li><a href="/cookie-policy" className="hover:text-[#6A7B92] transition-colors font-medium">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-800 text-sm font-medium text-center md:text-left">
              © 2026 Zariel & Co. A Future Trends Enterprise Inc. company. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="https://www.instagram.com/zariel_co/" target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-[#6A7B92] transition-colors font-medium">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
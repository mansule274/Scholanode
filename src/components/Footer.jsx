// import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 bg-[#071A52] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/80 text-sm text-center md:text-left">
            © 2026 ScholarNode. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-cyan-300 transition-colors cursor-pointer">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-cyan-300 transition-colors cursor-pointer">
              Terms of Service
            </a>
          </div>

          {/* <div className="flex items-center gap-4">
            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <Icon size={18} />
              </a>
            ))}
          </div> */}
        </div>
      </div>
    </footer>
  );
}
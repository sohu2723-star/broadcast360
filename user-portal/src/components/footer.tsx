export default function Footer() {
  return (
    <footer className="bg-[#010312] text-white border-t border-[#0B1026] mt-10">

      {/* Bottom Bar */}
      <div className="border-t border-[#0B1026] py-5 px-6 text-sm text-gray-400">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-3">

          {/* Left */}
          <p>
            © 2026 Broadcast360
          </p>

          {/* Middle Links */}
          <div className="flex flex-wrap gap-4">
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Legal</span>
            <span className="hover:text-white cursor-pointer">Accessibility</span>
            <span className="hover:text-white cursor-pointer">Manage Cookies</span>
          </div>

          {/* Right */}
          <div>
            Language: <span className="text-white">English (US)</span>
          </div>

        </div>

      </div>

    </footer>
  );
}
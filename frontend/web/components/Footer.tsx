import React from "react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16 mt-12 w-full border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-google-blue flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <span className="text-xl font-medium text-white tracking-tight">Menti.Co</span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
            The world's most advanced, AI-driven medical insights platform. We deliver surgically accurate clinical data verified by top global practitioners.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-google-blue hover:text-white transition-colors cursor-pointer">
              X
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-google-blue hover:text-white transition-colors cursor-pointer">
              in
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Platform</h4>
          <ul className="space-y-3 text-sm">
            <li className="hover:text-white cursor-pointer transition-colors">Clinical Library</li>
            <li className="hover:text-white cursor-pointer transition-colors">Telehealth Portal</li>
            <li className="hover:text-white cursor-pointer transition-colors">AI Diagnostics</li>
            <li className="hover:text-white cursor-pointer transition-colors">Practitioner Network</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-3 text-sm">
            <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
            <li className="hover:text-white cursor-pointer transition-colors">HIPAA Compliance</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <p>© {new Date().getFullYear()} Menti.Co. All rights reserved.</p>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="leading-relaxed">
              <strong className="text-slate-300">Mandatory Medical Disclaimer:</strong> This library provides research papers and AI-synthesized summaries for informational and educational purposes only. It is <strong>not</strong> a substitute for professional diagnosis, clinical advice, or treatment. Always consult a certified psychiatrist, psychologist, or medical professional. If you are in crisis, please contact your local emergency services or a crisis hotline immediately.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

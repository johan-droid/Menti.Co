export default function Disclaimer() {
  return (
    <div className="mt-16 p-6 bg-amber-50/50 backdrop-blur-sm border border-amber-200/50 rounded-2xl text-xs text-amber-800 text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-lg">⚖️</span>
        <strong className="uppercase tracking-widest text-[10px]">Medical Disclaimer</strong>
      </div>
      This library provides open-access research papers for informational and educational purposes only. 
      It does **not** offer medical advice, diagnosis, or professional treatment. 
      The AI search results are generated from scientific abstracts and should not be used as a substitute for clinical consultation.
      <br /><br />
      <span className="font-bold text-amber-900">If you are in crisis, please contact a local emergency helpline immediately.</span>
    </div>
  )
}

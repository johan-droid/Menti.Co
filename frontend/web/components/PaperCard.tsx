import Link from 'next/link'
import type { Route } from 'next'

interface Paper {
  pubmed_id: string
  title: string
  abstract_snippet: string
  disorder_tags?: string[]
  publication_date?: string
  relevance_score?: number
}

export default function PaperCard({ paper }: { paper: Paper }) {
  return (
    <Link href={`/paper/${paper.pubmed_id}` as Route}
      className="block bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 text-left border border-white/20 group">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">{paper.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-3 mb-3">{paper.abstract_snippet}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {paper.disorder_tags?.map(tag => (
          <span key={tag} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] uppercase tracking-wider font-bold rounded-full">{tag}</span>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        {paper.publication_date && (
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{paper.publication_date}</p>
        )}
        {paper.relevance_score !== undefined && (
          <div className="flex items-center gap-1">
             <div className="w-8 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${Math.min(100, (paper.relevance_score + 5) * 10)}%` }}
                />
             </div>
             <span className="text-[10px] text-emerald-600 font-bold">Rel: {paper.relevance_score}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

import { ArrowLeft, BookOpen, Calendar, Globe, Tag } from "lucide-react";
import Link from "next/link";

async function getPaper(pubmed_id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/paper/${pubmed_id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function PaperPage({ params }: { params: Promise<{ pubmed_id: string }> }) {
  const { pubmed_id } = await params;
  const paper = await getPaper(pubmed_id);

  if (!paper) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Paper Not Found</h1>
        <Link href="/" className="text-emerald-600 font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Research Assistant
        </Link>

        <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex flex-wrap gap-3 mb-6">
              {paper.disorder_tags?.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full">
                  {tag}
                </span>
              ))}
              {paper.treatment_tags?.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-6 leading-tight">
              {paper.title}
            </h1>

            <div className="flex flex-wrap gap-6 mb-10 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {paper.publication_date}
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {paper.journal}
              </div>
              {paper.url && (
                <a href={paper.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-600 hover:underline">
                  <Globe className="w-4 h-4" />
                  View on PubMed
                </a>
              )}
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-emerald-600" />
                  Abstract
                </h2>
                <div className="prose max-w-none text-gray-700 leading-relaxed text-lg">
                  {paper.abstract}
                </div>
              </section>

              <section className="pt-8 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium">
                  Authors: {paper.authors}
                </p>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  PubMed ID: {paper.pubmed_id}
                </p>
              </section>
            </div>
          </div>

          <div className="bg-emerald-50/50 p-6 border-t border-emerald-100 flex items-center justify-between">
            <p className="text-sm text-emerald-800 font-medium italic">
              "This research is provided for informational purposes only and does not constitute medical advice."
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

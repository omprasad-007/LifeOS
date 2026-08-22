'use client';

import React, { useState } from 'react';
import {
  Plus,
  Upload,
  FileText,
  Tag,
  Trash2,
  ExternalLink,
  Search,
  Calendar,
} from 'lucide-react';
import { DocumentItem } from '@/types';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onRefreshData: () => void;
  onOpenQuickCreate: () => void;
}

export default function DocumentsView({
  documents,
  onRefreshData,
  onOpenQuickCreate,
}: DocumentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(documents.flatMap((d) => d.tags.map((t) => t.toLowerCase())))
  );

  const filteredDocs = documents.filter((doc) => {
    if (selectedTag) {
      const hasTag = doc.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      if (!hasTag) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = doc.fileName.toLowerCase().includes(q);
      const matchText = doc.extractedText?.toLowerCase().includes(q);
      const matchTag = doc.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchText && !matchTag) return false;
    }

    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document entry?')) return;
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Documents Vault</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Store references, architecture blueprints, and extracted summary snippets
          </p>
        </div>

        <button
          onClick={onOpenQuickCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Search & Tag Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by file name, tag, or extracted text..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags:
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                selectedTag === null
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
          <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-slate-300">No documents stored</h3>
          <p className="text-xs text-slate-500 mt-1">
            Upload PDFs, design briefs, or architecture documents to build your personal knowledge repository.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-100 truncate" title={doc.fileName}>
                  {doc.fileName}
                </h3>

                {doc.extractedText && (
                  <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                    {doc.extractedText}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                {doc.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {doc.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    {new Date(doc.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium"
                  >
                    View File <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

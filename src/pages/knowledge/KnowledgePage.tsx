import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  FileText,
  Sparkles,
  Layers,
  Database,
  ArrowRight,
} from 'lucide-react';
import { knowledgeApi, CreateKnowledgeParams } from '../../api/knowledge.api';
import { formatDate } from '../../utils/cn';
import type { SearchResult } from '../../types';

export const KnowledgePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Form state
  const [form, setForm] = useState<CreateKnowledgeParams>({
    title: '',
    content: '',
    sourceType: 'text',
  });

  // Load documents
  const { data: docsRes, isLoading } = useQuery({
    queryKey: ['knowledge-docs'],
    queryFn: () => knowledgeApi.getDocuments(),
    retry: false,
  });
  const documents = docsRes?.data && docsRes.data.length > 0 ? docsRes.data : [
    {
      id: 'doc_1',
      userId: 'usr_demo',
      title: 'ESP32-S3 Pinout & I2S Hardware Schematic',
      sourceType: 'markdown' as any,
      content: 'Pin 12: BCLK, Pin 13: LRCLK, Pin 14: DIN (MAX98357A)',
      status: 'indexed' as any,
      chunkCount: 3,
      totalTokens: 420,
      embeddingModel: '768-dim-text',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'doc_2',
      userId: 'usr_demo',
      title: 'Robot Operational Voice Commands Reference',
      sourceType: 'text' as any,
      content: 'Commands: "Set volume to X", "Schedule reminder for Y"',
      status: 'indexed' as any,
      chunkCount: 2,
      totalTokens: 280,
      embeddingModel: '768-dim-text',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    }
  ];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (params: CreateKnowledgeParams) => knowledgeApi.createDocument(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-docs'] });
      setIsModalOpen(false);
      setForm({ title: '', content: '', sourceType: 'text' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-docs'] });
    },
  });

  // Handle semantic vector search test
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await knowledgeApi.search(searchQuery.trim());
      setSearchResults(res.data || []);
    } catch (e) {
      console.warn('Vector search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-void">
            RAG Knowledge Base & Vectors
          </h1>
          <p className="text-sm text-neutral-slate">
            Teach your AI robot personalized facts, documentation, and user notes via 768-dim vector embeddings.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl btn-primary text-sm font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Document</span>
        </button>
      </div>

      {/* Semantic Search Tester Bar */}
      <div className="p-6 rounded-3xl glass-card border border-neutral-border space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-neutral-void">
            Test Semantic Vector Search (RAG Test)
          </h3>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-slate" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query semantic memory e.g. 'What is the robot pinout?'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl input-glass text-xs font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2.5 rounded-xl btn-glass text-xs font-semibold flex items-center gap-2 shrink-0"
          >
            {isSearching ? 'Searching...' : 'Vector Search'}
          </button>
        </form>

        {/* Vector Search Results Preview */}
        {searchResults !== null && (
          <div className="mt-4 p-4 rounded-2xl bg-canvas-light border border-neutral-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-slate">
              <span>SIMILARITY RESULTS ({searchResults.length} chunks):</span>
              <button
                onClick={() => setSearchResults(null)}
                className="text-primary hover:underline"
              >
                Clear
              </button>
            </div>
            {searchResults.length === 0 ? (
              <p className="text-xs text-neutral-slate">No matching chunks above threshold.</p>
            ) : (
              searchResults.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-neutral-border text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-primary">
                    <span>Chunk #{idx + 1}</span>
                    <span>Similarity Score: {(item.score * 100).toFixed(1)}%</span>
                  </div>
                  <p className="text-neutral-void">{item.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Indexed Documents Table */}
      <div className="rounded-3xl glass-card overflow-hidden border border-neutral-border">
        <div className="p-5 border-b border-neutral-border/60 flex items-center justify-between">
          <h3 className="text-base font-display font-bold text-neutral-void">
            Indexed Knowledge Documents
          </h3>
          <span className="text-xs font-mono text-neutral-slate">
            {documents.length} Total Sources
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-2xl bg-neutral-border/40 animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-primary">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-void">No Documents Indexed Yet</h3>
            <p className="text-xs text-neutral-slate max-w-sm mx-auto">
              Add your first document to enable RAG question-answering during live voice conversations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas-light border-b border-neutral-border/60 text-neutral-slate font-mono uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title & Type</th>
                  <th className="px-4 py-4">Chunks</th>
                  <th className="px-4 py-4">Total Tokens</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/60">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-canvas-light/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-neutral-void block">{doc.title}</span>
                          <span className="text-[10px] font-mono text-neutral-slate uppercase">
                            {doc.sourceType} • {doc.embeddingModel || '768-dim'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono text-neutral-void">
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-neutral-slate" />
                        <span>{doc.chunkCount || 1} chunks</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono text-neutral-slate">
                      {doc.totalTokens || 120} tokens
                    </td>

                    <td className="px-4 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {doc.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-mono text-neutral-slate">
                      {formatDate(doc.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete document "${doc.title}" and its vectors?`)) {
                            deleteMutation.mutate(doc.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-neutral-slate hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-void/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-floating border border-neutral-border shadow-floating space-y-4">
            <h3 className="text-lg font-display font-bold text-neutral-void">
              Add RAG Knowledge Document
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(form);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl input-glass text-sm"
                  placeholder="e.g. Robot Motor Specs & GPIO Wiring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  Content (Markdown or Plain Text)
                </label>
                <textarea
                  rows={6}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl input-glass text-xs font-mono"
                  placeholder="Enter detailed facts or documentation for the AI to learn..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl btn-glass text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl btn-primary text-sm font-semibold"
                >
                  {createMutation.isPending ? 'Indexing Chunks...' : 'Save & Vectorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


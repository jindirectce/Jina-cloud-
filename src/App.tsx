/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { generateSummary, generateSpeech } from './services/geminiService';
import { AudioPlayer } from './components/AudioPlayer';
import { 
  Newspaper, 
  Mic2, 
  Sparkles, 
  Loader2, 
  History, 
  Settings2,
  ChevronRight,
  FileText,
  Volume2
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface SummaryItem {
  id: string;
  originalText: string;
  summary: string;
  audioBase64?: string;
  timestamp: number;
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<SummaryItem | null>(null);
  const [history, setHistory] = useState<SummaryItem[]>([]);
  const [voice, setVoice] = useState<'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'>('Zephyr');

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    try {
      const summary = await generateSummary(inputText);
      const audio = await generateSpeech(summary || '', voice);
      
      const newItem: SummaryItem = {
        id: Math.random().toString(36).substr(2, 9),
        originalText: inputText,
        summary: summary || 'Failed to generate summary.',
        audioBase64: audio,
        timestamp: Date.now(),
      };

      setCurrentSummary(newItem);
      setHistory(prev => [newItem, ...prev]);
      setInputText('');
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Mic2 className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">AudioNews</h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Commute Ready Summaries</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={voice}
              onChange={(e) => setVoice(e.target.value as any)}
              className="bg-zinc-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            >
              <option value="Zephyr">Zephyr (Default)</option>
              <option value="Kore">Kore (Warm)</option>
              <option value="Puck">Puck (Energetic)</option>
              <option value="Charon">Charon (Deep)</option>
              <option value="Fenrir">Fenrir (Bold)</option>
            </select>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Settings2 size={20} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Input & Current Summary */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-2 text-emerald-500">
              <Newspaper size={20} />
              <h2 className="font-semibold">Source Article</h2>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste article text or URL here..."
              className="w-full h-48 bg-zinc-950/50 border border-white/10 rounded-2xl p-6 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
            />

            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold rounded-2xl transition-all flex items-center gap-3 overflow-hidden"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Generate Audio Summary</span>
                  </>
                )}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </section>

          <AnimatePresence mode="wait">
            {currentSummary && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden"
              >
                <div className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <FileText size={20} />
                      <h2 className="font-semibold">Generated Summary</h2>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      {new Date(currentSummary.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="prose prose-invert max-w-none text-zinc-400 text-sm leading-relaxed">
                      <Markdown>{currentSummary.summary}</Markdown>
                    </div>
                    
                    <div className="sticky top-24">
                      {currentSummary.audioBase64 && (
                        <AudioPlayer base64Data={currentSummary.audioBase64} />
                      )}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2 text-zinc-400 px-2">
            <History size={18} />
            <h2 className="font-semibold text-sm uppercase tracking-wider">Recent Summaries</h2>
          </div>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="bg-zinc-900/20 border border-dashed border-white/5 rounded-2xl p-8 text-center">
                <p className="text-zinc-600 text-sm italic">No history yet</p>
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentSummary(item)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all group ${
                    currentSummary?.id === item.id 
                      ? 'bg-emerald-500/10 border-emerald-500/50' 
                      : 'bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-200 text-sm font-medium truncate mb-1">
                        {item.summary.split('\n')[0].replace(/[#*]/g, '')}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        <div className="w-1 h-1 rounded-full bg-zinc-700" />
                        <div className="flex items-center gap-1">
                          <Volume2 size={10} />
                          <span>Audio Ready</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-emerald-500 transition-colors mt-1" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-zinc-500 text-xs">
            &copy; 2026 AudioNews AI. Powered by Gemini 3.1 Pro & 2.5 Flash TTS.
          </p>
          <div className="flex items-center gap-6 text-zinc-500 text-xs font-medium">
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

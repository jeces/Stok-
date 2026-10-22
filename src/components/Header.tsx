'use client';

import React, { useState } from 'react';
import { Search, TrendingUp, DollarSign, Newspaper, MessageSquare, LineChart } from 'lucide-react';
import SearchModal from './SearchModal';

interface HeaderProps {
  activeTab: 'stocks' | 'exchanges' | 'news' | 'community';
  setActiveTab: (tab: 'stocks' | 'exchanges' | 'news' | 'community') => void;
  onSelectStock: (symbol: string) => void;
}

export default function Header({ activeTab, setActiveTab, onSelectStock }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('stocks')}
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
                <LineChart className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Toss<span className="text-blue-500">Invest</span>
              </span>
            </button>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('stocks')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'stocks'
                    ? 'bg-slate-800 text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>주식·차트</span>
              </button>

              <button
                onClick={() => setActiveTab('exchanges')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'exchanges'
                    ? 'bg-slate-800 text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>실시간 환율</span>
              </button>

              <button
                onClick={() => setActiveTab('news')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'news'
                    ? 'bg-slate-800 text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                <span>실시간 뉴스</span>
              </button>

              <button
                onClick={() => setActiveTab('community')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'community'
                    ? 'bg-slate-800 text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>커뮤니티</span>
              </button>
            </nav>
          </div>

          {/* Search bar & Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl text-slate-400 text-sm transition text-left"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">종목명/티커 검색...</span>
              <kbd className="hidden lg:inline-block text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">⌘K</kbd>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-slate-900 bg-slate-950 flex items-center justify-around py-2 px-2">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold ${
              activeTab === 'stocks' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>주식</span>
          </button>
          <button
            onClick={() => setActiveTab('exchanges')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold ${
              activeTab === 'exchanges' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>환율</span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold ${
              activeTab === 'news' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>뉴스</span>
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold ${
              activeTab === 'community' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>커뮤니티</span>
          </button>
        </div>
      </header>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectStock={onSelectStock}
      />
    </>
  );
}

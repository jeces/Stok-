'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface StockResult {
  symbol: string;
  name: string;
  nameKr: string;
  price: number;
  changePercent: number;
  currency: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock: (symbol: string) => void;
}

export default function SearchModal({ isOpen, onClose, onSelectStock }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const url = query ? `/api/stocks?search=${encodeURIComponent(query)}` : '/api/stocks';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // error handling
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 200);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="주식 종목명, 티커 검색 (예: 엔비디아, AAPL, 삼성전자)"
            className="w-full bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-sm font-medium"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 transition rounded-full hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">검색 중...</div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">검색 결과가 없습니다.</div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase">
                {query ? '검색 결과' : '인기 관심 종목'}
              </div>
              {results.map((stock) => {
                const isUp = stock.changePercent >= 0;
                return (
                  <button
                    key={stock.symbol}
                    onClick={() => {
                      onSelectStock(stock.symbol);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition">
                        {stock.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 text-sm">{stock.nameKr} ({stock.symbol})</div>
                        <div className="text-xs text-slate-400">{stock.name}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-100 text-sm">
                        {stock.currency === 'USD' ? `$${stock.price}` : `${stock.price.toLocaleString('ko-KR')}원`}
                      </div>
                      <div className={`text-xs font-semibold ${isUp ? 'text-red-400' : 'text-blue-400'}`}>
                        {isUp ? '+' : ''}{stock.changePercent}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

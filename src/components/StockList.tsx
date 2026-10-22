'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export interface StockQuote {
  symbol: string;
  name: string;
  nameKr: string;
  price: number;
  change: number;
  changePercent: number;
  currency: 'USD' | 'KRW';
  marketCap: string;
  volume: string;
  category: 'US' | 'KR';
}

interface StockListProps {
  stocks: StockQuote[];
  selectedSymbol: string;
  onSelectStock: (symbol: string) => void;
}

export default function StockList({ stocks, selectedSymbol, onSelectStock }: StockListProps) {
  const [filter, setFilter] = useState<'ALL' | 'US' | 'KR'>('ALL');

  const filtered = stocks.filter((stock) => {
    if (filter === 'US') return stock.category === 'US';
    if (filter === 'KR') return stock.category === 'KR';
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h3 className="font-extrabold text-lg text-white">실시간 주식시세</h3>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              filter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('US')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              filter === 'US' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            미국주식 🇺🇸
          </button>
          <button
            onClick={() => setFilter('KR')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              filter === 'KR' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            국내주식 🇰🇷
          </button>
        </div>
      </div>

      <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
        {filtered.map((stock) => {
          const isSelected = stock.symbol === selectedSymbol;
          const isUp = stock.change >= 0;

          return (
            <button
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl transition text-left group ${
                isSelected
                  ? 'bg-blue-600/10 border border-blue-500/30'
                  : 'hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center transition ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                  }`}
                >
                  {stock.symbol.slice(0, 3)}
                </div>
                <div>
                  <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                    {stock.nameKr}
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-normal">
                      {stock.symbol}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{stock.name}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-black text-white text-sm sm:text-base">
                  {stock.currency === 'USD'
                    ? `$${stock.price.toLocaleString()}`
                    : `${stock.price.toLocaleString('ko-KR')}원`}
                </div>
                <div
                  className={`flex items-center justify-end text-xs font-bold mt-0.5 ${
                    isUp ? 'text-red-400' : 'text-blue-400'
                  }`}
                >
                  {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>
                    {isUp ? '+' : ''}
                    {stock.changePercent}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

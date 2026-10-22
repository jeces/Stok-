'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

interface ExchangeRate {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  unit: string;
  change: number;
  changePercent: number;
}

export default function ExchangeTickerBar() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/exchanges');
      if (res.ok) {
        const data = await res.json();
        setRates(data);
        const now = new Date();
        setLastUpdated(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
      }
    } catch {
      // keep existing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs py-2 px-4 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>실시간 환율 Ticker</span>
          {lastUpdated && <span className="text-[10px] text-slate-500 font-normal">({lastUpdated} 기준)</span>}
        </div>

        {loading && rates.length === 0 ? (
          <div className="flex items-center gap-4 text-slate-400">
            <span>환율 정보를 불러오는 중...</span>
          </div>
        ) : (
          <div className="flex items-center gap-4 overflow-x-auto py-0.5 no-scrollbar">
            {rates.map((item) => {
              const isUp = item.change >= 0;
              return (
                <div key={item.code} className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-full transition cursor-default">
                  <span className="font-medium text-slate-300">{item.name}</span>
                  <span className="font-bold text-white">{item.rate.toLocaleString('ko-KR')}원</span>
                  <span className={`flex items-center text-[11px] font-semibold ${isUp ? 'text-red-400' : 'text-blue-400'}`}>
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isUp ? '+' : ''}{item.changePercent}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={fetchRates}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition text-[11px]"
          title="새로고침"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden sm:inline">새로고침</span>
        </button>
      </div>
    </div>
  );
}

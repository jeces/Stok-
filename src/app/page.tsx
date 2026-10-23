'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ExchangeTickerBar from '@/components/ExchangeTickerBar';
import Header from '@/components/Header';
import StockChart, { StockDetail } from '@/components/StockChart';
import StockList, { StockQuote } from '@/components/StockList';
import ExchangeCalculator from '@/components/ExchangeCalculator';
import NewsFeed from '@/components/NewsFeed';
import CommunityFeed from '@/components/CommunityFeed';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'stocks' | 'exchanges' | 'news' | 'community'>('stocks');
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');
  const [selectedStockDetail, setSelectedStockDetail] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Timeframe and MA States
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y' | '10Y'>('1D');
  const [showMA50, setShowMA50] = useState<boolean>(true);
  const [showMA100, setShowMA100] = useState<boolean>(true);
  const [showMA200, setShowMA200] = useState<boolean>(true);

  // Fetch list of stocks
  const fetchStocks = async () => {
    try {
      const res = await fetch('/api/stocks');
      if (res.ok) {
        const data = await res.json();
        setStocks(data);
      }
    } catch {
      // error
    }
  };

  // Fetch detailed stock quote & chart
  const fetchStockDetail = useCallback(async (symbol: string, tf: string) => {
    try {
      const res = await fetch(`/api/stocks?symbol=${symbol}&timeframe=${tf}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedStockDetail(data);
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
    fetchStockDetail(selectedSymbol, timeframe);

    // Auto refresh stock details every 5 seconds for real-time feel
    const interval = setInterval(() => {
      fetchStocks();
      fetchStockDetail(selectedSymbol, timeframe);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedSymbol, timeframe, fetchStockDetail]);

  const handleSelectStock = (symbol: string) => {
    setSelectedSymbol(symbol);
    setLoading(true);
    fetchStockDetail(symbol, timeframe);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Real-Time Exchange Rate Banner */}
      <ExchangeTickerBar />

      {/* Main Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectStock={handleSelectStock}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'stocks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {loading && !selectedStockDetail ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                  <span>주식 차트 및 실시간 시세를 불러오는 중...</span>
                </div>
              ) : selectedStockDetail ? (
                <StockChart
                  stock={selectedStockDetail}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                  showMA50={showMA50}
                  setShowMA50={setShowMA50}
                  showMA100={showMA100}
                  setShowMA100={setShowMA100}
                  showMA200={showMA200}
                  setShowMA200={setShowMA200}
                />
              ) : null}

              {/* Related Stock Community */}
              <div className="grid grid-cols-1 gap-8">
                <CommunityFeed
                  currentSymbol={selectedStockDetail?.symbol || selectedSymbol}
                  currentStockName={selectedStockDetail?.nameKr || selectedSymbol}
                />
              </div>
            </div>

            {/* Sidebar: Real-Time Stock Directory List */}
            <div className="lg:col-span-1 space-y-8">
              <StockList
                stocks={stocks}
                selectedSymbol={selectedSymbol}
                onSelectStock={handleSelectStock}
              />
            </div>
          </div>
        )}

        {activeTab === 'exchanges' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">실시간 외환 시세</h1>
              <p className="text-slate-400 text-sm">미국 달러, 일본 엔(100엔), 유로 실시간 환율 및 환전 계산기입니다.</p>
            </div>
            <ExchangeCalculator />
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">실시간 증시·환율 뉴스</h1>
              <p className="text-slate-400 text-sm">네이버 및 언론사 실시간 라이브 뉴스입니다.</p>
            </div>
            <NewsFeed />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">토스증권 주주 커뮤니티</h1>
              <p className="text-slate-400 text-sm">실시간 매수/매도 심리 및 주주들의 생생한 의견을 나누세요.</p>
            </div>
            <CommunityFeed
              currentSymbol={selectedStockDetail?.symbol || selectedSymbol}
              currentStockName={selectedStockDetail?.nameKr || selectedSymbol}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">TossInvest Real-time Trading Viewer</span>
            <span>© 2026</span>
          </div>
          <div className="text-slate-500">
            실시간 주식시세, 환율 및 스크래핑 뉴스는 정보 제공용이며 투자 책임은 본인에게 있습니다.
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ExchangeRate {
  code: string;
  name: string;
  nameEn: string;
  symbol: string;
  rate: number;
  unit: string;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  chartData: { time: string; rate: number }[];
}

export default function ExchangeCalculator() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD_KRW');
  const [amount, setAmount] = useState<string>('1');
  const [convertedResult, setConvertedResult] = useState<number>(0);

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/exchanges');
      if (res.ok) {
        const data: ExchangeRate[] = await res.json();
        setRates(data);
      }
    } catch {
      // error handling
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentRateObj = rates.find((r) => r.code === selectedCurrency) || rates[0];

  useEffect(() => {
    if (!currentRateObj) return;
    const numAmount = parseFloat(amount) || 0;
    if (currentRateObj.code === 'JPY_KRW') {
      // JPY rate is per 100 JPY
      setConvertedResult((numAmount * currentRateObj.rate) / 100);
    } else if (currentRateObj.code === 'USD_JPY') {
      setConvertedResult(numAmount * currentRateObj.rate);
    } else {
      setConvertedResult(numAmount * currentRateObj.rate);
    }
  }, [amount, selectedCurrency, currentRateObj]);

  return (
    <div className="space-y-6">
      {/* Exchange Rates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rates.map((rate) => {
          const isUp = rate.change >= 0;
          const isSelected = rate.code === selectedCurrency;

          return (
            <div
              key={rate.code}
              onClick={() => setSelectedCurrency(rate.code)}
              className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition shadow-lg ${
                isSelected
                  ? 'border-blue-500 bg-slate-900/90 ring-1 ring-blue-500/50'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                  {rate.unit}
                </span>
                <span className={`text-xs font-bold flex items-center ${isUp ? 'text-red-400' : 'text-blue-400'}`}>
                  {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {isUp ? '+' : ''}{rate.changePercent}%
                </span>
              </div>

              <div className="text-lg font-bold text-white mb-1">{rate.name}</div>
              <div className="text-2xl font-black text-white">
                {rate.rate.toLocaleString('ko-KR')}
                <span className="text-xs text-slate-400 ml-1">
                  {rate.code === 'USD_JPY' ? '엔' : '원'}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>24시간 변동</span>
                <span className={`font-semibold ${isUp ? 'text-red-400' : 'text-blue-400'}`}>
                  {isUp ? '+' : ''}{rate.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Currency Converter Card */}
      {currentRateObj && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-5 h-5 text-blue-500" />
            <h3 className="font-extrabold text-lg text-white">실시간 환전 계산기</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Input Currency */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                변환할 금액 ({currentRateObj.name})
              </label>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  className="w-full bg-transparent border-none outline-none text-2xl font-extrabold text-white"
                  placeholder="1"
                />
                <span className="text-sm font-bold bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
                  {currentRateObj.symbol} {currentRateObj.unit}
                </span>
              </div>
            </div>

            {/* Output Currency */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                계산된 예상 금액
              </label>
              <div className="flex items-center justify-between gap-3">
                <div className="text-2xl font-extrabold text-blue-400 truncate">
                  {convertedResult.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
                </div>
                <span className="text-sm font-bold bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
                  {currentRateObj.code === 'USD_JPY' ? '엔 (JPY)' : '원 (KRW)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

export interface ChartPoint {
  time: string;
  price: number;
  volume?: number;
}

export interface StockDetail {
  symbol: string;
  name: string;
  nameKr: string;
  price: number;
  change: number;
  changePercent: number;
  currency: 'USD' | 'KRW';
  marketCap: string;
  volume: string;
  high52w: number;
  low52w: number;
  peRatio?: number;
  chartData?: ChartPoint[];
}

interface StockChartProps {
  stock: StockDetail;
}

export default function StockChart({ stock }: StockChartProps) {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');

  const isUp = stock.change >= 0;
  const chartColor = isUp ? '#F04438' : '#3182F6'; // Toss style Red for UP, Blue for DOWN
  const chartGradientId = `colorPrice-${stock.symbol.replace('.', '')}`;

  const chartData = stock.chartData || [];
  const minPrice = chartData.length > 0 ? Math.min(...chartData.map((d) => d.price)) * 0.995 : stock.price * 0.98;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map((d) => d.price)) * 1.005 : stock.price * 1.02;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      {/* Top Details Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold bg-slate-800 text-blue-400 px-2.5 py-1 rounded-md">
              {stock.symbol}
            </span>
            <span className="text-xs text-slate-400">{stock.currency}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            {stock.nameKr}
            <span className="text-sm font-normal text-slate-400">({stock.name})</span>
          </h2>
        </div>

        {/* Price & Change Indicator */}
        <div className="text-right">
          <div className="text-3xl sm:text-4xl font-black text-white">
            {stock.currency === 'USD' ? `$${stock.price.toLocaleString()}` : `${stock.price.toLocaleString('ko-KR')}원`}
          </div>
          <div className={`flex items-center justify-end gap-1 text-sm sm:text-base font-bold mt-1 ${isUp ? 'text-red-500' : 'text-blue-500'}`}>
            {isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>
              {isUp ? '+' : ''}{stock.change.toLocaleString()} ({isUp ? '+' : ''}{stock.changePercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Timeframe Buttons */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                timeframe === tf
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf === '1D' ? '1일' : tf === '1W' ? '1주' : tf === '1M' ? '1달' : '1년'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>실시간 차트 (5초 자동 업데이트)</span>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-72 w-full mb-6">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                domain={[minPrice, maxPrice]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                orientation="right"
                tickFormatter={(val) => (stock.currency === 'USD' ? `$${val}` : `${val.toLocaleString()}`)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartPoint;
                    return (
                      <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl shadow-xl text-xs">
                        <div className="text-slate-400 font-medium mb-1">{data.time}</div>
                        <div className="font-bold text-white text-sm">
                          {stock.currency === 'USD' ? `$${data.price}` : `${data.price.toLocaleString()}원`}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${chartGradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            차트 데이터를 불러오는 중...
          </div>
        )}
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400">시가총액</div>
          <div className="text-sm font-extrabold text-white mt-0.5">{stock.marketCap}</div>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400">거래량</div>
          <div className="text-sm font-extrabold text-white mt-0.5">{stock.volume}</div>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400">52주 최고가</div>
          <div className="text-sm font-extrabold text-red-400 mt-0.5">
            {stock.currency === 'USD' ? `$${stock.high52w}` : `${stock.high52w.toLocaleString()}원`}
          </div>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400">52주 최저가</div>
          <div className="text-sm font-extrabold text-blue-400 mt-0.5">
            {stock.currency === 'USD' ? `$${stock.low52w}` : `${stock.low52w.toLocaleString()}원`}
          </div>
        </div>
      </div>
    </div>
  );
}

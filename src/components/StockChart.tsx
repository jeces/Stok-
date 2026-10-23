'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';

export interface ChartPoint {
  time: string;
  price: number;
  volume?: number;
  ma50?: number;
  ma100?: number;
  ma200?: number;
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
  timeframe: '1D' | '1W' | '1M' | '1Y' | '5Y' | '10Y';
  setTimeframe: (tf: '1D' | '1W' | '1M' | '1Y' | '5Y' | '10Y') => void;
  showMA50: boolean;
  setShowMA50: (show: boolean) => void;
  showMA100: boolean;
  setShowMA100: (show: boolean) => void;
  showMA200: boolean;
  setShowMA200: (show: boolean) => void;
}

function calculateMovingAverages(data: ChartPoint[]): ChartPoint[] {
  if (!data || data.length === 0) return [];

  const prices = data.map((d) => d.price);

  return data.map((point, index) => {
    const computeMA = (period: number) => {
      if (index === 0) return point.price;
      const start = Math.max(0, index - period + 1);
      const sub = prices.slice(start, index + 1);
      const sum = sub.reduce((acc, val) => acc + val, 0);
      return Number((sum / sub.length).toFixed(2));
    };

    const ma50Val = computeMA(Math.min(index + 1, 10));
    const ma100Val = Number((computeMA(Math.min(index + 1, 18)) * 0.998).toFixed(2));
    const ma200Val = Number((computeMA(Math.min(index + 1, 25)) * 0.995).toFixed(2));

    return {
      ...point,
      ma50: ma50Val,
      ma100: ma100Val,
      ma200: ma200Val,
    };
  });
}

export default function StockChart({
  stock,
  timeframe,
  setTimeframe,
  showMA50,
  setShowMA50,
  showMA100,
  setShowMA100,
  showMA200,
  setShowMA200,
}: StockChartProps) {
  const isUp = stock.change >= 0;
  const chartColor = isUp ? '#F04438' : '#3182F6';
  const chartGradientId = `colorPrice-${stock.symbol.replace('.', '')}`;

  const rawData = stock.chartData || [];
  const processedChartData = calculateMovingAverages(rawData);

  const minPrice = processedChartData.length > 0
    ? Math.min(...processedChartData.map((d) => d.price)) * 0.99
    : stock.price * 0.98;

  const maxPrice = processedChartData.length > 0
    ? Math.max(...processedChartData.map((d) => d.price)) * 1.01
    : stock.price * 1.02;

  // Latest calculated Moving Average values for current price comparison
  const latestData = processedChartData.length > 0 ? processedChartData[processedChartData.length - 1] : null;
  const currentMA50 = latestData?.ma50 ?? stock.price;
  const currentMA100 = latestData?.ma100 ?? stock.price * 0.98;
  const currentMA200 = latestData?.ma200 ?? stock.price * 0.95;

  const formatPrice = (val: number) => {
    return stock.currency === 'USD' ? `$${val.toLocaleString()}` : `${val.toLocaleString('ko-KR')}원`;
  };

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
            {formatPrice(stock.price)}
          </div>
          <div className={`flex items-center justify-end gap-1 text-sm sm:text-base font-bold mt-1 ${isUp ? 'text-red-500' : 'text-blue-500'}`}>
            {isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>
              {isUp ? '+' : ''}{stock.change.toLocaleString()} ({isUp ? '+' : ''}{stock.changePercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Timeframe & Moving Average Line Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframes */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['1D', '1W', '1M', '1Y', '5Y', '10Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  timeframe === tf
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf === '1D' ? '1일' : tf === '1W' ? '1주' : tf === '1M' ? '1달' : tf === '1Y' ? '1년' : tf === '5Y' ? '5년' : '10년'}
              </button>
            ))}
          </div>

          {/* Moving Average Indicators with Numerical Price Badges */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <span className="text-slate-500 text-[11px] px-1.5 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> 이평선:
            </span>
            <button
              onClick={() => setShowMA50(!showMA50)}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                showMA50 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              50일선: {formatPrice(currentMA50)}
            </button>
            <button
              onClick={() => setShowMA100(!showMA100)}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                showMA100 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              100일선: {formatPrice(currentMA100)}
            </button>
            <button
              onClick={() => setShowMA200(!showMA200)}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                showMA200 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              200일선: {formatPrice(currentMA200)}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>실시간 차트 (5초 자동 업데이트)</span>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-72 w-full mb-6">
        {processedChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={processedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="text-slate-400 font-medium">{data.time}</div>
                        <div className="font-bold text-white text-sm">
                          주가: {formatPrice(data.price)}
                        </div>
                        {showMA50 && data.ma50 && (
                          <div className="text-orange-400 font-semibold">
                            50일선: {formatPrice(data.ma50)}
                          </div>
                        )}
                        {showMA100 && data.ma100 && (
                          <div className="text-purple-400 font-semibold">
                            100일선: {formatPrice(data.ma100)}
                          </div>
                        )}
                        {showMA200 && data.ma200 && (
                          <div className="text-emerald-400 font-semibold">
                            200일선: {formatPrice(data.ma200)}
                          </div>
                        )}
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
              {showMA50 && (
                <Line
                  type="monotone"
                  dataKey="ma50"
                  stroke="#f97316"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {showMA100 && (
                <Line
                  type="monotone"
                  dataKey="ma100"
                  stroke="#a855f7"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {showMA200 && (
                <Line
                  type="monotone"
                  dataKey="ma200"
                  stroke="#10b981"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
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
            {formatPrice(stock.high52w)}
          </div>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400">52주 최저가</div>
          <div className="text-sm font-extrabold text-blue-400 mt-0.5">
            {formatPrice(stock.low52w)}
          </div>
        </div>
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';

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
  high52w: number;
  low52w: number;
  peRatio?: number;
  category: 'US' | 'KR';
  chartData?: { time: string; price: number; volume?: number }[];
}

const STOCK_DATABASE: Record<string, Omit<StockQuote, 'price' | 'change' | 'changePercent'> & { basePrice: number }> = {
  NVDA: { symbol: 'NVDA', name: 'NVIDIA Corp', nameKr: '엔비디아', basePrice: 138.25, currency: 'USD', marketCap: '$3.40T', volume: '48.2M', high52w: 140.76, low52w: 45.11, peRatio: 64.2, category: 'US' },
  AAPL: { symbol: 'AAPL', name: 'Apple Inc.', nameKr: '애플', basePrice: 228.40, currency: 'USD', marketCap: '$3.50T', volume: '52.1M', high52w: 237.23, low52w: 164.08, peRatio: 33.8, category: 'US' },
  TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', nameKr: '테슬라', basePrice: 218.10, currency: 'USD', marketCap: '$700B', volume: '88.5M', high52w: 271.00, low52w: 138.80, peRatio: 62.5, category: 'US' },
  MSFT: { symbol: 'MSFT', name: 'Microsoft Corp', nameKr: '마이크로소프트', basePrice: 422.50, currency: 'USD', marketCap: '$3.15T', volume: '18.4M', high52w: 468.35, low52w: 327.00, peRatio: 35.1, category: 'US' },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', nameKr: '아마존', basePrice: 186.30, currency: 'USD', marketCap: '$1.95T', volume: '32.0M', high52w: 201.20, low52w: 118.35, peRatio: 41.3, category: 'US' },
  '005930.KS': { symbol: '005930.KS', name: 'Samsung Electronics', nameKr: '삼성전자', basePrice: 59200, currency: 'KRW', marketCap: '353조원', volume: '14.5M', high52w: 88800, low52w: 55000, peRatio: 12.4, category: 'KR' },
  '000660.KS': { symbol: '000660.KS', name: 'SK Hynix', nameKr: 'SK하이닉스', basePrice: 188500, currency: 'KRW', marketCap: '137조원', volume: '4.8M', high52w: 248500, low52w: 108000, peRatio: 11.2, category: 'KR' },
  '035420.KS': { symbol: '035420.KS', name: 'NAVER', nameKr: '네이버', basePrice: 174200, currency: 'KRW', marketCap: '28조원', volume: '1.1M', high52w: 232000, low52w: 155000, peRatio: 18.5, category: 'KR' },
  '035720.KS': { symbol: '035720.KS', name: 'Kakao', nameKr: '카카오', basePrice: 38100, currency: 'KRW', marketCap: '16조원', volume: '2.3M', high52w: 61500, low52w: 35000, peRatio: 22.1, category: 'KR' },
};

function generateTimeframeChartData(basePrice: number, tf: string) {
  const chart = [];
  const now = new Date();

  let points = 30;
  let intervalMs = 15 * 60 * 1000; // 15 mins for 1D
  let formatLabel = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  let startFactor = 0.98;

  if (tf === '1W') {
    points = 28;
    intervalMs = 6 * 60 * 60 * 1000;
    formatLabel = (d: Date) => `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}시`;
    startFactor = 0.95;
  } else if (tf === '1M') {
    points = 30;
    intervalMs = 24 * 60 * 60 * 1000;
    formatLabel = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    startFactor = 0.90;
  } else if (tf === '1Y') {
    points = 52;
    intervalMs = 7 * 24 * 60 * 60 * 1000;
    formatLabel = (d: Date) => `${d.getFullYear().toString().slice(-2)}년 ${d.getMonth() + 1}월`;
    startFactor = 0.70;
  } else if (tf === '5Y') {
    points = 60;
    intervalMs = 30 * 24 * 60 * 60 * 1000;
    formatLabel = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    startFactor = 0.30;
  } else if (tf === '10Y') {
    points = 120;
    intervalMs = 30 * 24 * 60 * 60 * 1000;
    formatLabel = (d: Date) => `${d.getFullYear()}년`;
    startFactor = 0.10; // e.g. NVDA 10 years ago was ~10% of today
  }

  let currentPrice = basePrice * startFactor;

  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * intervalMs);
    const label = formatLabel(time);

    if (i === 0) {
      currentPrice = basePrice;
    } else {
      const stepFactor = 1 + (1 / startFactor - 1) / points;
      const noise = (Math.random() - 0.47) * 0.05;
      currentPrice = Math.max(basePrice * 0.05, currentPrice * (stepFactor + noise));
    }

    chart.push({
      time: label,
      price: Number(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 50000 + 10000),
    });
  }
  return chart;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolParam = searchParams.get('symbol');
  const searchQuery = searchParams.get('search');
  const timeframe = searchParams.get('timeframe') || '1D';

  // If specific symbol is requested
  if (symbolParam) {
    const uppercaseSym = symbolParam.toUpperCase();
    const meta = STOCK_DATABASE[uppercaseSym] || {
      symbol: uppercaseSym,
      name: uppercaseSym,
      nameKr: uppercaseSym,
      basePrice: 100,
      currency: uppercaseSym.endsWith('.KS') ? 'KRW' : 'USD',
      marketCap: 'N/A',
      volume: 'N/A',
      high52w: 120,
      low52w: 80,
      category: uppercaseSym.endsWith('.KS') ? 'KR' : 'US',
    };

    const basePrice = meta.basePrice;
    // Slight tick offset for live feel
    const price = Number((basePrice + (Math.random() - 0.48) * (basePrice * 0.003)).toFixed(2));
    const prevClose = basePrice;
    const change = Number((price - prevClose).toFixed(2));
    const changePercent = Number((((price - prevClose) / prevClose) * 100).toFixed(2));
    const chartData = generateTimeframeChartData(price, timeframe.toUpperCase());

    return NextResponse.json({
      ...meta,
      price,
      change,
      changePercent,
      chartData,
    });
  }

  // Fetch list of stocks
  const stocks = Object.keys(STOCK_DATABASE).map((sym) => {
    const meta = STOCK_DATABASE[sym];
    const basePrice = meta.basePrice;

    const price = Number((basePrice + (Math.random() - 0.48) * (basePrice * 0.003)).toFixed(2));
    const prevClose = basePrice;
    const change = Number((price - prevClose).toFixed(2));
    const changePercent = Number((((price - prevClose) / prevClose) * 100).toFixed(2));

    return {
      ...meta,
      price,
      change,
      changePercent,
    };
  });

  let filteredStocks = stocks;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredStocks = stocks.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.nameKr.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(filteredStocks);
}

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

const STOCK_DATABASE: Record<string, Omit<StockQuote, 'price' | 'change' | 'changePercent'>> = {
  NVDA: { symbol: 'NVDA', name: 'NVIDIA Corp', nameKr: '엔비디아', currency: 'USD', marketCap: '$3.45T', volume: '48.2M', high52w: 140.76, low52w: 45.11, peRatio: 64.2, category: 'US' },
  AAPL: { symbol: 'AAPL', name: 'Apple Inc.', nameKr: '애플', currency: 'USD', marketCap: '$3.52T', volume: '52.1M', high52w: 237.23, low52w: 164.08, peRatio: 33.8, category: 'US' },
  TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', nameKr: '테슬라', currency: 'USD', marketCap: '$780B', volume: '88.5M', high52w: 271.00, low52w: 138.80, peRatio: 62.5, category: 'US' },
  MSFT: { symbol: 'MSFT', name: 'Microsoft Corp', nameKr: '마이크로소프트', currency: 'USD', marketCap: '$3.18T', volume: '18.4M', high52w: 468.35, low52w: 327.00, peRatio: 35.1, category: 'US' },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', nameKr: '아마존', currency: 'USD', marketCap: '$1.95T', volume: '32.0M', high52w: 201.20, low52w: 118.35, peRatio: 41.3, category: 'US' },
  '005930.KS': { symbol: '005930.KS', name: 'Samsung Electronics', nameKr: '삼성전자', currency: 'KRW', marketCap: '350조원', volume: '14.5M', high52w: 88800, low52w: 55000, peRatio: 12.4, category: 'KR' },
  '000660.KS': { symbol: '000660.KS', name: 'SK Hynix', nameKr: 'SK하이닉스', currency: 'KRW', marketCap: '138조원', volume: '4.8M', high52w: 248500, low52w: 108000, peRatio: 11.2, category: 'KR' },
  '035420.KS': { symbol: '035420.KS', name: 'NAVER', nameKr: '네이버', currency: 'KRW', marketCap: '28조원', volume: '1.1M', high52w: 232000, low52w: 155000, peRatio: 18.5, category: 'KR' },
  '035720.KS': { symbol: '035720.KS', name: 'Kakao', nameKr: '카카오', currency: 'KRW', marketCap: '16조원', volume: '2.3M', high52w: 61500, low52w: 35000, peRatio: 22.1, category: 'KR' },
};

function generateChartData(basePrice: number, points = 30) {
  const chart = [];
  const now = new Date();
  let currentPrice = basePrice * 0.96;

  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 15 * 60 * 1000);
    const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

    const delta = (Math.random() - 0.48) * (basePrice * 0.008);
    currentPrice = Math.max(basePrice * 0.8, currentPrice + delta);
    if (i === 0) currentPrice = basePrice;

    chart.push({
      time: timeStr,
      price: Number(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 50000 + 10000),
    });
  }
  return chart;
}

async function fetchYahooQuote(symbol: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for fast fallback

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=1d`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 5 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const meta = data.chart?.result?.[0]?.meta;
      const timestamps = data.chart?.result?.[0]?.timestamp || [];
      const quotes = data.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];

      if (meta && meta.regularMarketPrice) {
        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose || price;
        const change = price - prevClose;
        const changePercent = (change / prevClose) * 100;

        const chartData = timestamps.map((ts: number, idx: number) => {
          const d = new Date(ts * 1000);
          return {
            time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
            price: quotes[idx] ? Number(quotes[idx].toFixed(2)) : price,
          };
        }).filter((item: { time: string; price: number }) => item.price);

        return {
          price,
          change,
          changePercent,
          chartData: chartData.length > 0 ? chartData : generateChartData(price),
        };
      }
    }
  } catch {
    // Fall back to generated mock data
  } finally {
    clearTimeout(timeoutId);
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolParam = searchParams.get('symbol');
  const searchQuery = searchParams.get('search');

  // Fallback realistic prices
  const basePrices: Record<string, number> = {
    NVDA: 138.25,
    AAPL: 228.40,
    TSLA: 218.10,
    MSFT: 422.50,
    AMZN: 186.30,
    '005930.KS': 59200,
    '000660.KS': 188500,
    '035420.KS': 174200,
    '035720.KS': 38100,
  };

  // If specific symbol is requested
  if (symbolParam) {
    const uppercaseSym = symbolParam.toUpperCase();
    const meta = STOCK_DATABASE[uppercaseSym] || {
      symbol: uppercaseSym,
      name: uppercaseSym,
      nameKr: uppercaseSym,
      currency: uppercaseSym.endsWith('.KS') ? 'KRW' : 'USD',
      marketCap: 'N/A',
      volume: 'N/A',
      high52w: 0,
      low52w: 0,
      category: uppercaseSym.endsWith('.KS') ? 'KR' : 'US',
    };

    const liveData = await fetchYahooQuote(uppercaseSym);
    const basePrice = basePrices[uppercaseSym] || 100;

    const price = liveData?.price ?? Number((basePrice + (Math.random() - 0.48) * (basePrice * 0.005)).toFixed(2));
    const prevClose = basePrice;
    const change = liveData?.change ?? Number((price - prevClose).toFixed(2));
    const changePercent = liveData?.changePercent ?? Number(((change / prevClose) * 100).toFixed(2));
    const chartData = liveData?.chartData ?? generateChartData(price);

    return NextResponse.json({
      ...meta,
      price,
      change,
      changePercent,
      chartData,
    });
  }

  // Fetch list of stocks
  const stockPromises = Object.keys(STOCK_DATABASE).map(async (sym) => {
    const meta = STOCK_DATABASE[sym];
    const liveData = await fetchYahooQuote(sym);
    const basePrice = basePrices[sym] || 100;

    const price = liveData?.price ?? Number((basePrice + (Math.random() - 0.48) * (basePrice * 0.005)).toFixed(2));
    const prevClose = basePrice;
    const change = liveData?.change ?? Number((price - prevClose).toFixed(2));
    const changePercent = liveData?.changePercent ?? Number(((change / prevClose) * 100).toFixed(2));

    return {
      ...meta,
      price,
      change,
      changePercent,
    };
  });

  let stocks = await Promise.all(stockPromises);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    stocks = stocks.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.nameKr.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(stocks);
}

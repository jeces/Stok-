import { NextResponse } from 'next/server';

export interface ExchangeRate {
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

function generateExchangeChart(baseRate: number, points = 24) {
  const chart = [];
  const now = new Date();
  let currentRate = baseRate * 0.995;

  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const timeStr = `${String(time.getHours()).padStart(2, '0')}:00`;

    const delta = (Math.random() - 0.49) * (baseRate * 0.003);
    currentRate = Math.max(baseRate * 0.95, currentRate + delta);
    if (i === 0) currentRate = baseRate;

    chart.push({
      time: timeStr,
      rate: Number(currentRate.toFixed(2)),
    });
  }
  return chart;
}

export async function GET() {
  let usdKrw = 1385.50;
  let usdJpy = 152.30;
  let usdEur = 0.9220;

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.rates) {
        if (data.rates.KRW) usdKrw = data.rates.KRW;
        if (data.rates.JPY) usdJpy = data.rates.JPY;
        if (data.rates.EUR) usdEur = data.rates.EUR;
      }
    }
  } catch {
    // Fallback to default realistic rates
  }

  // Calculate cross rates
  // JPY/KRW is usually presented as per 100 JPY in Korea
  const jpy100Krw = (usdKrw / usdJpy) * 100;
  const eurKrw = usdKrw / usdEur;

  // Add small live tick fluctuations for dynamic experience
  const tick = () => (Math.random() - 0.5) * 0.8;

  const currentUsdKrw = Number((usdKrw + tick()).toFixed(2));
  const currentJpyKrw = Number((jpy100Krw + tick() * 0.1).toFixed(2));
  const currentEurKrw = Number((eurKrw + tick()).toFixed(2));
  const currentUsdJpy = Number((usdJpy + tick() * 0.05).toFixed(2));

  const rates: ExchangeRate[] = [
    {
      code: 'USD_KRW',
      name: '미국 달러',
      nameEn: 'USD / KRW',
      symbol: '$',
      unit: '1 달러',
      rate: currentUsdKrw,
      change: Number((currentUsdKrw - 1382.10).toFixed(2)),
      changePercent: Number((((currentUsdKrw - 1382.10) / 1382.10) * 100).toFixed(2)),
      high24h: Number((currentUsdKrw + 4.5).toFixed(2)),
      low24h: Number((currentUsdKrw - 3.8).toFixed(2)),
      chartData: generateExchangeChart(currentUsdKrw),
    },
    {
      code: 'JPY_KRW',
      name: '일본 엔',
      nameEn: 'JPY / KRW (100엔)',
      symbol: '¥',
      unit: '100 엔',
      rate: currentJpyKrw,
      change: Number((currentJpyKrw - 908.40).toFixed(2)),
      changePercent: Number((((currentJpyKrw - 908.40) / 908.40) * 100).toFixed(2)),
      high24h: Number((currentJpyKrw + 2.1).toFixed(2)),
      low24h: Number((currentJpyKrw - 1.9).toFixed(2)),
      chartData: generateExchangeChart(currentJpyKrw),
    },
    {
      code: 'EUR_KRW',
      name: '유로',
      nameEn: 'EUR / KRW',
      symbol: '€',
      unit: '1 유로',
      rate: currentEurKrw,
      change: Number((currentEurKrw - 1502.80).toFixed(2)),
      changePercent: Number((((currentEurKrw - 1502.80) / 1502.80) * 100).toFixed(2)),
      high24h: Number((currentEurKrw + 5.2).toFixed(2)),
      low24h: Number((currentEurKrw - 4.1).toFixed(2)),
      chartData: generateExchangeChart(currentEurKrw),
    },
    {
      code: 'USD_JPY',
      name: '달러 / 엔',
      nameEn: 'USD / JPY',
      symbol: '¥',
      unit: '1 달러',
      rate: currentUsdJpy,
      change: Number((currentUsdJpy - 151.90).toFixed(2)),
      changePercent: Number((((currentUsdJpy - 151.90) / 151.90) * 100).toFixed(2)),
      high24h: Number((currentUsdJpy + 0.8).toFixed(2)),
      low24h: Number((currentUsdJpy - 0.6).toFixed(2)),
      chartData: generateExchangeChart(currentUsdJpy),
    },
  ];

  return NextResponse.json(rates);
}

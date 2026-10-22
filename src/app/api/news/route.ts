import { NextResponse } from 'next/server';

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  relativeTime: string;
  category: 'US' | 'KR' | 'EXCHANGE' | 'GENERAL';
  snippet?: string;
  imageUrl?: string;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  } catch {
    return '최근';
  }
}

function assignCategory(title: string): 'US' | 'KR' | 'EXCHANGE' | 'GENERAL' {
  if (title.includes('환율') || title.includes('달러') || title.includes('엔화') || title.includes('유로') || title.includes('외환')) {
    return 'EXCHANGE';
  }
  if (title.includes('엔비디아') || title.includes('애플') || title.includes('테슬라') || title.includes('미국') || title.includes('뉴욕') || title.includes('나스닥')) {
    return 'US';
  }
  if (title.includes('삼성전자') || title.includes('SK하이닉스') || title.includes('코스피') || title.includes('네이버') || title.includes('카카오')) {
    return 'KR';
  }
  return 'GENERAL';
}

function getPlaceholderImage(category: string, index: number): string {
  const stockImages = [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&auto=format&fit=crop&q=80',
  ];
  return stockImages[index % stockImages.length];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '주식 환율 증시';
  const categoryParam = searchParams.get('category');

  try {
    const encodedQuery = encodeURIComponent(query);
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=ko&gl=KR&ceid=KR:ko`;

    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch RSS: ${res.status}`);
    }

    const xmlText = await res.text();

    // Simple XML Regex Parser for RSS Items
    const items: NewsItem[] = [];
    const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];

    itemMatches.forEach((itemXml, index) => {
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);

      if (titleMatch) {
        let rawTitle = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
        let source = sourceMatch ? sourceMatch[1].trim() : '금융뉴스';

        // Google RSS titles often end with "- SourceName"
        const lastDashIndex = rawTitle.lastIndexOf(' - ');
        if (lastDashIndex > 0) {
          if (!sourceMatch) {
            source = rawTitle.substring(lastDashIndex + 3).trim();
          }
          rawTitle = rawTitle.substring(0, lastDashIndex).trim();
        }

        const link = linkMatch ? linkMatch[1].trim() : '#';
        const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
        const cat = assignCategory(rawTitle);

        items.push({
          id: `news-${index}-${Date.now()}`,
          title: rawTitle,
          link,
          source,
          pubDate,
          relativeTime: formatRelativeTime(pubDate),
          category: cat,
          imageUrl: getPlaceholderImage(cat, index),
        });
      }
    });

    let filteredItems = items;
    if (categoryParam && categoryParam !== 'all') {
      filteredItems = items.filter((item) => item.category.toLowerCase() === categoryParam.toLowerCase());
    }

    return NextResponse.json(filteredItems.slice(0, 20));
  } catch {
    // Fallback news list if RSS fetching fails
    const fallbackNews: NewsItem[] = [
      {
        id: 'fb-1',
        title: '[환율동향] 달러-원, 연준 금리 결정 앞두고 1,380원대 박스권 등락',
        link: 'https://news.google.com',
        source: '연합인포맥스',
        pubDate: new Date().toISOString(),
        relativeTime: '10분 전',
        category: 'EXCHANGE',
        imageUrl: getPlaceholderImage('EXCHANGE', 0),
      },
      {
        id: 'fb-2',
        title: '엔비디아 AI 칩 수요 지속…기술주 상승세 주도하며 나스닥 신고가',
        link: 'https://news.google.com',
        source: '한국경제',
        pubDate: new Date().toISOString(),
        relativeTime: '25분 전',
        category: 'US',
        imageUrl: getPlaceholderImage('US', 1),
      },
      {
        id: 'fb-3',
        title: '삼성전자·SK하이닉스, 반도체 실적 개선 기대감에 외국인 순매수',
        link: 'https://news.google.com',
        source: '매일경제',
        pubDate: new Date().toISOString(),
        relativeTime: '1시간 전',
        category: 'KR',
        imageUrl: getPlaceholderImage('KR', 2),
      },
      {
        id: 'fb-4',
        title: '일본 은행 금리 인상 시그널에 달러-엔 환율 변동성 확대',
        link: 'https://news.google.com',
        source: '머니투데이',
        pubDate: new Date().toISOString(),
        relativeTime: '2시간 전',
        category: 'EXCHANGE',
        imageUrl: getPlaceholderImage('EXCHANGE', 3),
      },
    ];

    return NextResponse.json(fallbackNews);
  }
}

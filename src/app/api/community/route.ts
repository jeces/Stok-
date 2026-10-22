import { NextResponse } from 'next/server';

export interface Comment {
  id: string;
  author: string;
  authorBadge?: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  symbol: string;
  stockName: string;
  author: string;
  authorAvatar?: string;
  sentiment: 'BUY' | 'SELL' | 'NEUTRAL';
  content: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isLiked?: boolean;
}

// In-memory store initialized with realistic Toss-style posts
const initialPosts: Post[] = [
  {
    id: 'post-1',
    symbol: 'NVDA',
    stockName: '엔비디아',
    author: '서학개미대장',
    authorAvatar: '🐂',
    sentiment: 'BUY',
    content: '실적 발표 전 조정받는 지금이 추매 타이밍이라고 봅니다. AI 데이터센터 서버 출하량 계속 늘어나는 중!',
    likes: 42,
    createdAt: '5분 전',
    comments: [
      { id: 'c1', author: '차트분석가', content: '동의합니다! 전고점 돌파 시도할 듯하네요.', createdAt: '3분 전' },
      { id: 'c2', author: '가치투자자', content: '장기 보유 관점에서는 든든합니다.', createdAt: '1분 전' },
    ],
  },
  {
    id: 'post-2',
    symbol: 'NVDA',
    stockName: '엔비디아',
    author: '손절은없다',
    authorAvatar: '📈',
    sentiment: 'BUY',
    content: '엔비디아 수익률 120% 달성했습니다. 토스증권 커뮤니티 분들 감사해요! 목표가는 180달러 바라봅니다.',
    likes: 89,
    createdAt: '18분 전',
    comments: [
      { id: 'c3', author: '축하해요', content: '부럽네요!! 축하드립니다 축하해요', createdAt: '15분 전' },
    ],
  },
  {
    id: 'post-3',
    symbol: '005930.KS',
    stockName: '삼성전자',
    author: '삼전존버러',
    authorAvatar: '📱',
    sentiment: 'BUY',
    content: 'HBM3E 납품 뉴스 곧 나올 타이밍입니다. 외국인 수급 들어오는 것 확인되셨나요?',
    likes: 65,
    createdAt: '30분 전',
    comments: [
      { id: 'c4', author: '반도체매니아', content: '이번 분기 실적 개선 기대됩니다!', createdAt: '20분 전' },
    ],
  },
  {
    id: 'post-4',
    symbol: 'TSLA',
    stockName: '테슬라',
    author: '로보택시가자',
    authorAvatar: '🚗',
    sentiment: 'BUY',
    content: 'FSD V12 업데이트 반응 엄청 좋네요. 자율주행 시장 압도적 1위 확정입니다.',
    likes: 31,
    createdAt: '1시간 전',
    comments: [],
  },
  {
    id: 'post-5',
    symbol: 'USD_KRW',
    stockName: '미국 달러',
    author: '환율예상가',
    authorAvatar: '💵',
    sentiment: 'SELL',
    content: '미국 연준 금리 인하 발언 나오면 1,350원 밑으로 떨어질 수 있어요. 환전하실 분 참고하세요.',
    likes: 24,
    createdAt: '2시간 전',
    comments: [],
  },
];

const postsStore: Post[] = [...initialPosts];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  let filteredPosts = postsStore;
  if (symbol) {
    filteredPosts = postsStore.filter(p => p.symbol.toUpperCase() === symbol.toUpperCase());
  }

  // Calculate sentiment statistics
  const total = filteredPosts.length;
  const buyCount = filteredPosts.filter(p => p.sentiment === 'BUY').length;

  const buyPercent = total > 0 ? Math.round((buyCount / total) * 100) : 75;
  const sellPercent = total > 0 ? 100 - buyPercent : 25;

  return NextResponse.json({
    posts: filteredPosts,
    stats: {
      totalPosts: total,
      buyPercent,
      sellPercent,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action 1: Create Post
    if (action === 'create_post') {
      const { symbol, stockName, author, sentiment, content } = body;

      if (!content || !symbol) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      const newPost: Post = {
        id: `post-${Date.now()}`,
        symbol,
        stockName: stockName || symbol,
        author: author || '익명의 주주',
        authorAvatar: sentiment === 'BUY' ? '🚀' : sentiment === 'SELL' ? '📉' : '💬',
        sentiment: sentiment || 'BUY',
        content,
        likes: 0,
        comments: [],
        createdAt: '방금 전',
      };

      postsStore.unshift(newPost);
      return NextResponse.json({ success: true, post: newPost });
    }

    // Action 2: Like Post
    if (action === 'like_post') {
      const { postId } = body;
      const targetPost = postsStore.find(p => p.id === postId);
      if (targetPost) {
        if (targetPost.isLiked) {
          targetPost.likes -= 1;
          targetPost.isLiked = false;
        } else {
          targetPost.likes += 1;
          targetPost.isLiked = true;
        }
        return NextResponse.json({ success: true, likes: targetPost.likes, isLiked: targetPost.isLiked });
      }
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Action 3: Add Comment
    if (action === 'add_comment') {
      const { postId, author, content } = body;
      const targetPost = postsStore.find(p => p.id === postId);
      if (targetPost && content) {
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          author: author || '익명 주주',
          content,
          createdAt: '방금 전',
        };
        targetPost.comments.push(newComment);
        return NextResponse.json({ success: true, comments: targetPost.comments });
      }
      return NextResponse.json({ error: 'Post or content missing' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

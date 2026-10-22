'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ThumbsUp, Send, PlusCircle } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface Post {
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

interface CommunityFeedProps {
  currentSymbol?: string;
  currentStockName?: string;
}

export default function CommunityFeed({ currentSymbol = 'NVDA', currentStockName = '엔비디아' }: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({ totalPosts: 0, buyPercent: 75, sellPercent: 25 });
  const [loading, setLoading] = useState(true);

  // New Post Form state
  const [showForm, setShowForm] = useState(false);
  const [authorInput, setAuthorInput] = useState('');
  const [sentimentInput, setSentimentInput] = useState<'BUY' | 'SELL'>('BUY');
  const [contentInput, setContentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const fetchCommunity = useCallback(async () => {
    try {
      const res = await fetch(`/api/community?symbol=${currentSymbol}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setStats(data.stats || { totalPosts: 0, buyPercent: 75, sellPercent: 25 });
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [currentSymbol]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentInput.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_post',
          symbol: currentSymbol,
          stockName: currentStockName,
          author: authorInput.trim() || '토스주주',
          sentiment: sentimentInput,
          content: contentInput,
        }),
      });

      if (res.ok) {
        setContentInput('');
        setShowForm(false);
        fetchCommunity();
      }
    } catch {
      // error
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like_post', postId }),
      });
      if (res.ok) {
        fetchCommunity();
      }
    } catch {
      // error
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_comment',
          postId,
          author: '토스개미',
          content: text.trim(),
        }),
      });

      if (res.ok) {
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        fetchCommunity();
      }
    } catch {
      // error
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h3 className="font-extrabold text-xl text-white">
            {currentStockName} <span className="text-slate-400 font-normal text-base">주주 토론방</span>
          </h3>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-4 py-2 rounded-xl transition shadow-lg shadow-blue-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>글쓰기</span>
        </button>
      </div>

      {/* Sentiment Voting Ratio Bar (Toss Invest Style) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-red-400 flex items-center gap-1">
            🔥 매수 (상승 전망) {stats.buyPercent}%
          </span>
          <span className="text-blue-400 flex items-center gap-1">
            📉 매도 (하락 전망) {stats.sellPercent}%
          </span>
        </div>

        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${stats.buyPercent}%` }}
          />
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${stats.sellPercent}%` }}
          />
        </div>
      </div>

      {/* Post Creation Modal / Form */}
      {showForm && (
        <form onSubmit={handleCreatePost} className="bg-slate-950 border border-blue-500/40 p-5 rounded-2xl mb-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white">{currentStockName}에 한마디 남기기</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSentimentInput('BUY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  sentimentInput === 'BUY'
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                🔥 매수
              </button>
              <button
                type="button"
                onClick={() => setSentimentInput('SELL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  sentimentInput === 'SELL'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                📉 매도
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="닉네임 (선택사항)"
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />

          <textarea
            placeholder="자유롭게 매수/매도 이유나 종목 의견을 적어보세요."
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            rows={3}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
            required
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
            >
              {submitting ? '등록 중...' : '게시하기'}
            </button>
          </div>
        </form>
      )}

      {/* Posts Feed */}
      {loading && posts.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">토론글을 불러오는 중입니다...</div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">아직 작성된 토론글이 없습니다. 첫 글을 작성해보세요!</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{post.authorAvatar || '👤'}</span>
                  <div>
                    <span className="font-bold text-sm text-white">{post.author}</span>
                    <span className="text-[10px] text-slate-500 ml-2">{post.createdAt}</span>
                  </div>
                </div>

                <span
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                    post.sentiment === 'BUY'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {post.sentiment === 'BUY' ? '🔥 매수' : '📉 매도'}
                </span>
              </div>

              <p className="text-sm text-slate-200 font-medium leading-relaxed mb-4 whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Likes & Comments Counter */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-900 text-xs">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition font-bold ${
                    post.isLiked
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>공감 {post.likes}</span>
                </button>

                <span className="text-slate-500 font-medium">
                  댓글 {post.comments?.length || 0}개
                </span>
              </div>

              {/* Comments list */}
              {post.comments && post.comments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-900/80 space-y-2">
                  {post.comments.map((c) => (
                    <div key={c.id} className="bg-slate-900/60 p-2.5 rounded-xl text-xs">
                      <div className="flex justify-between text-slate-400 font-semibold mb-1">
                        <span>{c.author}</span>
                        <span className="text-[10px]">{c.createdAt}</span>
                      </div>
                      <div className="text-slate-200">{c.content}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="댓글을 남겨보세요..."
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

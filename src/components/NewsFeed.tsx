'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';

interface NewsItem {
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

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?category=${selectedCategory}`);
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [fetchNews]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-500" />
          <h3 className="font-extrabold text-xl text-white">실시간 주식·환율 뉴스</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedCategory === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setSelectedCategory('exchange')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedCategory === 'exchange' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              환율
            </button>
            <button
              onClick={() => setSelectedCategory('us')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedCategory === 'us' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              미국증시
            </button>
            <button
              onClick={() => setSelectedCategory('kr')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedCategory === 'kr' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              국내증시
            </button>
          </div>

          <button
            onClick={fetchNews}
            className="p-2 text-slate-400 hover:text-white transition rounded-xl bg-slate-950 border border-slate-800"
            title="뉴스 새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && news.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">실시간 뉴스를 가져오는 중입니다...</div>
      ) : news.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">관련 뉴스가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition flex flex-col justify-between hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <span className="font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {item.source}
                  </span>
                  <span className="text-slate-500">{item.relativeTime}</span>
                </div>

                <h4 className="font-bold text-slate-100 text-sm sm:text-base group-hover:text-blue-400 transition line-clamp-2 leading-snug">
                  {item.title}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] font-semibold text-slate-500">
                  {item.category === 'EXCHANGE' ? '환율·외환' : item.category === 'US' ? '미국주식' : '국내주식'}
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition text-blue-400 font-semibold">
                  기사 읽기 <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

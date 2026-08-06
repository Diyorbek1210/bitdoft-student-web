import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNews, toggleNewsLike } from "../../app/slices/getNews";
import { ExternalLink, Clock, Loader2, Heart } from "lucide-react";

export default function News() {
  const dispatch = useDispatch();
  const { news, loading, loaded } = useSelector((state) => state.news);
  const studentId = useSelector((state) => state.auth.id);
  const [optimisticNews, setOptimisticNews] = useState({});
  const didAutoLoad = useRef(false);

  useEffect(() => {
    if (didAutoLoad.current) return;
    if (loaded || loading) return;
    didAutoLoad.current = true;
    dispatch(getNews());
  }, [loaded, loading, dispatch]);

  const sortedNews = useMemo(() => {
    if (!news) return [];
    return [...news].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [news]);

  const handleLikePress = (item) => {
    if (!studentId) return;

    const baseline = getLikeData(item);

    setOptimisticNews((prev) => ({
      ...prev,
      [item.id]: {
        isLiked: !baseline.isLiked,
        likes: baseline.likes + (baseline.isLiked ? -1 : 1),
      },
    }));

    dispatch(toggleNewsLike({ newsId: item.id, userId: studentId })).finally(
      () => {
        setOptimisticNews((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      },
    );
  };

  const getLikeData = (item) => {
    const optimistic = optimisticNews[item.id];
    if (optimistic) {
      return {
        isLiked: optimistic.isLiked,
        likes: optimistic.likes,
      };
    }
    const likedBy = Array.isArray(item.likedBy) ? item.likedBy : [];
    return {
      isLiked: likedBy.includes(studentId),
      likes: item.likes || 0,
    };
  };

  if (loading && (!news || news.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="animate-spin mb-4 text-[#00A8A8]" size={40} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">
          Загрузка ленты...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* News list */}
      <div className="mt-6 space-y-6">
        {sortedNews.map((item) => {
          const postImage =
            item.imageUrl && item.imageUrl.length > 0 ? item.imageUrl[0] : null;

          const formattedDate = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
              })
            : "Недавно";

          const likeData = getLikeData(item);

          return (
            <article
              key={item.id}
              className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#00A8A8]/10 transition-all duration-300"
            >
              {/* Header Post */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00A8A8] flex items-center justify-center text-white shadow-lg shadow-[#00A8A8]/20">
                    <span className="font-black text-xs italic">BS</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      BitSoft News
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      <Clock size={10} className="text-[#00A8A8]" />{" "}
                      {formattedDate}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative bg-black group">
                {item.youtubeId ? (
                  <div className="aspect-video w-full">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${item.youtubeId}?rel=0&modestbranding=1`}
                      title={item.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : postImage ? (
                  <img
                    src={postImage}
                    alt={item.title}
                    className="w-full h-auto max-h-[300px] object-cover"
                  />
                ) : (
                  <div className="py-14 flex flex-col items-center justify-center text-slate-400 bg-slate-50 border-y border-slate-100">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                      Media Content
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h3 className="text-lg font-black text-slate-900 leading-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium mb-4">
                  {item.desc}
                </p>

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-[#00A8A8] font-black text-[10px] uppercase tracking-[0.2em] hover:gap-5 transition-all border border-[#B5EFEF] px-4 py-2 rounded-full hover:bg-[#F0FBFB]"
                  >
                    Подробнее <ExternalLink size={14} />
                  </a>
                )}
              </div>

              {/* Footer Card */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleLikePress(item)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    likeData.isLiked
                      ? "bg-red-500 border-red-500 text-white"
                      : "bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300"
                  }`}
                >
                  <Heart
                    size={16}
                    fill={likeData.isLiked ? "currentColor" : "none"}
                  />
                  <span
                    className={`text-xs font-black ${
                      likeData.isLiked ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {likeData.likes}
                  </span>
                </button>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
            </article>
          );
        })}

        {/* Footer info */}
        {!loading && sortedNews.length > 0 && (
          <div className="text-center py-10">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
              Вы просмотрели все новости
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

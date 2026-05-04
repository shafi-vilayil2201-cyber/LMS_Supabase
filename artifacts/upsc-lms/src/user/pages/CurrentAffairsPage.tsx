import { useEffect, useState } from "react";
import { getCurrentAffairs } from "../../services/db";
import { Bookmark, BookmarkCheck, Clock, Tag, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";
const TEAL = "#1A7F8E";
const GOLD = "#F5A623";

const categories = ["All", "International Relations", "Economy", "Science & Technology", "Governance", "Environment"];
const catColors: Record<string, { bg: string; text: string }> = {
  "International Relations": { bg: `${NAVY}15`, text: NAVY },
  "Economy": { bg: `${GOLD}20`, text: "#b45309" },
  "Science & Technology": { bg: `${TEAL}15`, text: TEAL },
  "Governance": { bg: "#7c3aed20", text: "#7c3aed" },
  "Environment": { bg: "#16a34a15", text: "#16a34a" },
};

export default function CurrentAffairsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentAffairs().then((ca) => {
      setArticles(ca);
      const bm = ca.filter((a: any) => a.isBookmarked).map((a: any) => a.id);
      setBookmarked(new Set(bm));
      setLoading(false);
    });
  }, []);

  const filtered = category === "All" ? articles : articles.filter((a) => a.category === category);

  function toggleBookmark(id: string) {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Current Affairs</h1>
        <p className="text-sm text-muted-foreground mt-1">Daily current affairs curated for UPSC Prelims and Mains relevance</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} data-testid={`button-cat-${c.toLowerCase().replace(/[\s&]/g, "-")}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={category === c ? { background: NAVY, color: "white", borderColor: NAVY } : { background: "white", color: "#374151", borderColor: "#e5e7eb" }}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((article) => {
            const catStyle = catColors[article.category] ?? { bg: "#f3f4f6", text: "#374151" };
            const isExpanded = expanded === article.id;
            const isBookmarked = bookmarked.has(article.id);
            return (
              <div key={article.id} data-testid={`card-article-${article.id}`}
                className="bg-white rounded-2xl border border-border p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                    style={{ background: catStyle.bg, color: catStyle.text }}>{article.category}</span>
                  <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />{article.readTime} min read
                    </span>
                    <button onClick={() => toggleBookmark(article.id)}
                      data-testid={`button-bookmark-${article.id}`}
                      className="p-1 rounded-md hover:bg-muted transition-colors">
                      {isBookmarked
                        ? <BookmarkCheck className="w-4 h-4" style={{ color: SAFFRON }} />
                        : <Bookmark className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm mb-2 leading-snug" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{article.summary}</p>

                {isExpanded && (
                  <div className="text-xs text-foreground leading-relaxed mb-3 pt-3 border-t border-border">
                    {article.content}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    {article.relevantFor?.map((r: string) => (
                      <span key={r} className="text-xs px-2 py-0.5 rounded-md font-medium"
                        style={{ background: `${TEAL}15`, color: TEAL }}>{r}</span>
                    ))}
                    {article.tags?.slice(0, 2).map((t: string) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{t}</span>
                    ))}
                  </div>
                  <button onClick={() => setExpanded(isExpanded ? null : article.id)}
                    data-testid={`button-expand-${article.id}`}
                    className="text-xs font-semibold flex items-center gap-1 flex-shrink-0 ml-2" style={{ color: SAFFRON }}>
                    {isExpanded ? "Show less" : "Read more"} <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground/60 mt-3">
                  {new Date(article.publishedAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-border text-muted-foreground text-sm">
              No articles found for this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

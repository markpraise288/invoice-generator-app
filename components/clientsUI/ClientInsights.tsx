export default function ClientInsights({
  avgDelay,
  lateRate,
  revenue,
}: {
  avgDelay: number;
  lateRate: number;
  revenue: number;
}) {
  const insights: string[] = [];

  if (revenue > 5000) {
    insights.push("💰 High value client");
  }

  if (lateRate > 50) {
    insights.push("⚠️ Frequently pays late");
  }

  if (avgDelay > 7) {
    insights.push("🚨 High payment delay risk");
  }

  if (lateRate < 10 && revenue > 1000) {
    insights.push("✅ Reliable client");
  }

  return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
      <h2 className="font-bold mb-4 dark:text-white">Insights</h2>

      <div className="flex flex-col gap-2">
        {insights.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No insights yet</p>
        )}

        {insights.map((insight, i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl text-sm dark:text-gray-200"
          >
            {insight}
          </div>
        ))}
      </div>
    </div>
  );
}
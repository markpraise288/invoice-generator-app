"use client";

interface Props {
  total: number;
  qualified: number;
  won: number;
  value: number;
}

export default function LeadStats({
  total,
  qualified,
  won,
  value,
}: Props) {
  const cards = [
    {
      title: "Total Leads",
      value: total,
    },
    {
      title: "Qualified",
      value: qualified,
    },
    {
      title: "Won",
      value: won,
    },
    {
      title: "Pipeline Value",
      value: `$${value.toLocaleString()}`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="text-sm text-muted-foreground">
            {card.title}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}
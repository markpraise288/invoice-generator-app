export function generateRevenueData(invoices: any[]) {
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const revenueMap: Record<string, { paid: number; unpaid: number }> = {};

  months.forEach((month) => {
    revenueMap[month] = { paid: 0, unpaid: 0 };
  });

  invoices.forEach((invoice) => {
    const date = new Date(invoice.dueDate);
    const month = months[date.getMonth()];

    const paidAmount = invoice.payments?.reduce(
      (sum: number, p: any) => sum + p.amount,
      0
    ) || 0;

    const unpaid = invoice.total - paidAmount;

    if (invoice.status === "paid") {
      revenueMap[month].paid += invoice.total;
    } else {
      revenueMap[month].paid += paidAmount;
      revenueMap[month].unpaid += unpaid > 0 ? unpaid : 0;
    }
  });

  return months.map((month) => ({
    month,
    ...revenueMap[month],
  }));
}
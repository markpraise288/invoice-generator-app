import { Invoice, User } from "@/types";

interface Props {
  invoice: Invoice;
  user: User;
}

export default function InvoicePreview({ invoice, user }: Props) {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const taxAmount = subtotal * (invoice.tax.value / 100);
  const discountAmount = subtotal * (invoice.discount.value / 100);

  const total = subtotal + taxAmount - discountAmount;

  const dueDate = (date: string) => date.split("T")[0];

  const formatMoney = (number: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(number);

  return (
    <div className="bg-gray-50 text-black p-10 rounded-lg">
      {/* HEADER */}
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">
            {user.companyName || "[ Company Name ]"}
          </h1>
          <p className="text-gray-500">{user.address || "[ Address ]"}</p>
          <p className="text-gray-500">{user.phone || "[ Phone # ]"}</p>
          <p className="text-gray-500">{user.email || "[ Email ]"}</p>
        </div>

        <div className="text-right">
          <h1 className="text-4xl text-blue-400 font-semibold">
            <span className="text-blue-700 text-3xl">INVOICE</span>
          </h1>
          <p className="text-blue-400 mt-2">
            Due Date: {dueDate(invoice.dueDate)}
          </p>
        </div>
      </div>

      {/* BILL TO */}
      <div className="mb-8">
        <h2 className="text-blue-700 text-xl mb-2">Bill To:</h2>
        <p>{invoice.customerSnapshot.name}</p>
        <p>{invoice.customerSnapshot.address}</p>
        <p>{invoice.customerSnapshot.phone}</p>
        <p>{invoice.customerSnapshot.email}</p>
      </div>

      {/* ITEMS */}
      <table className="w-full mb-8">
        <thead>
          <tr className="bg-blue-700 text-white">
            <th className="text-left p-2">Description</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Price</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>

        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index}>
              <td className="p-2">{item.description}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-center">
                {formatMoney(item.price)}
              </td>
              <td className="text-center">
                {formatMoney(item.quantity * item.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-gray-500 mb-6" />

      {/* TOTAL */}
      <div className="flex justify-end">
        <div className="space-y-2 text-right">
          <p>Subtotal: {formatMoney(subtotal)}</p>
          <p>Tax: {invoice.tax.value}%</p>
          <p>Discount: {invoice.discount.value}%</p>

          <p className="text-xl font-semibold mt-3">
            Total: {formatMoney(total)}
          </p>
        </div>
      </div>
    </div>
  );
}
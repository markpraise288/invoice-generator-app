import { ArrowRight } from "lucide-react";
import Link from "next/link";

const QuickActions = () => {

        return(
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow dark:shadow-none border border-gray-100 dark:border-gray-700 flex-1">
            <h3 className="font-bold text-[1.2rem] text-gray-900 dark:text-white">Quick Actions</h3>
            <ul>
                <li className="mt-4 flex justify-between items-center">
                    <Link className="text-left" href={'/clients'}>
                        <p className="font-bold text-gray-900 dark:text-white">Manage Clients</p>
                        <p className="text-gray-500 dark:text-gray-400">Add or edit client infor</p>
                    </Link>
                    <p className="text-gray-900 dark:text-white">
                        <ArrowRight/>
                    </p>
                </li>
                <li className="mt-4 flex justify-between items-center">
                    <Link className="text-left" href={'/invoices'}>
                        <p className="font-bold text-gray-900 dark:text-white">View All Invoices</p>
                        <p className="text-gray-500 dark:text-gray-400">Track invoices status</p>
                    </Link>
                    <p className="text-gray-900 dark:text-white">
                        <ArrowRight/>
                    </p>
                </li>
                <li className="mt-4 flex justify-between items-center">
                    <Link className="text-left" href={'/invoices/create'}>
                        <p className="font-bold text-gray-900 dark:text-white">Create Invoice</p>
                        <p className="text-gray-500 dark:text-gray-400">Bill a client now</p>
                    </Link>
                    <p className="text-gray-900 dark:text-white">
                        <ArrowRight/>
                    </p>
                </li>
            </ul>
        </div>
    )
};

export default QuickActions;

import {
  ArrowUp,
  ArrowDown,
  DollarSign,
  FileText,
  Timer,
  CircleCheck,
} from "lucide-react";

import { motion } from "framer-motion";

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      {value.toLocaleString()}
    </motion.span>
  );
}

type Variant = "rising" | "dropping";
type IconType = "dollar" | "file" | "time" | "success";

interface CardProps {
  iconColor?: string;
  title: string;
  value: number | string;
  variant: Variant;
  icon: IconType;
  time?: string;
}

export default function Card({
  iconColor = "text-gray-700 dark:text-gray-300",
  title,
  value,
  variant,
  icon,
  time = "",
}: CardProps) {
  const statusIcons = {
    rising: ArrowUp,
    dropping: ArrowDown,
  };

  const icons = {
    dollar: DollarSign,
    file: FileText,
    time: Timer,
    success: CircleCheck,
  };

  const StatusIcon = statusIcons[variant];
  const MainIcon = icons[icon];

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl flex-1 lg:min-w-65 sm:min-w-55 shadow">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-500 dark:text-gray-400">{title}</h3>
        <MainIcon className={`${iconColor} w-6 h-6`} strokeWidth={1.5} />
      </div>

      {/* Value */}
      <div className="my-6">
        <p className="font-bold text-2xl text-gray-900 dark:text-white"><AnimatedNumber value={value as number}/></p>
      </div>

      {/* Status */}
      <div>
        <p
          className={`flex items-center gap-1 text-sm ${
            variant === "rising" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          <StatusIcon className="w-4 h-4" strokeWidth={1.5} />
          {time}
        </p>
      </div>
    </div>
  );
}
"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // 🔥 replace with real API later
    setTimeout(() => {
      setLoading(false);
      alert("Message sent!");
    }, 1500);
  };

  return (
    <section
      id="contact"
      className="py-24 px-6 bg-white dark:bg-gray-950 relative overflow-hidden"
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-125 h-125 bg-blue-600/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        
        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-4xl font-bold dark:text-white">
            Get in Touch
          </h2>

          <p className="text-gray-600 dark:text-gray-400">
            Have questions or need help? Reach out to us — we’re here to help you grow your business.
          </p>

          {/* CONTACT INFO */}
          <div className="space-y-4">
            <ContactItem icon={Mail} text="invoiceflow288@gmail.com" />
            <ContactItem icon={Phone} text="+265 896 831 165" />
            <ContactItem icon={MapPin} text="Blantyre, Malawi" />
          </div>
        </motion.div>

        {/* RIGHT SIDE FORM */}
        <motion.form
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl p-8 space-y-6"
        >
          <h3 className="text-xl font-semibold dark:text-white">
            Send us a message
          </h3>

          <Input placeholder="Your Name" />
          <Input placeholder="Your Email" type="email" />
          <Textarea placeholder="Your Message" />

          <button
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium shadow-lg hover:scale-[1.02] transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </motion.form>
      </div>
    </section>
  );
}

/* CONTACT ITEM */
function ContactItem({ icon: Icon, text }: any) {
  return (
    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
      <div className="p-2 rounded-lg bg-blue-100 dark:bg-gray-800">
        <Icon size={18} className="text-blue-600" />
      </div>
      <span>{text}</span>
    </div>
  );
}

/* INPUT */
function Input({ placeholder, type = "text" }: any) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="
        w-full p-3 rounded-xl
        border border-gray-300 dark:border-gray-700
        bg-white dark:bg-gray-950
        text-gray-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition
      "
    />
  );
}

/* TEXTAREA */
function Textarea({ placeholder }: any) {
  return (
    <textarea
      rows={4}
      placeholder={placeholder}
      className="
        w-full p-3 rounded-xl
        border border-gray-300 dark:border-gray-700
        bg-white dark:bg-gray-950
        text-gray-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition
      "
    />
  );
}
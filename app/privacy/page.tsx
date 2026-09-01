export default function Privacy() {
  return (
    <section className="py-24 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-sm text-indigo-600 dark:text-teal-400">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Last updated: August 2026</p>

        <div className="mt-10 flex flex-col gap-10 text-gray-600 dark:text-gray-400 leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              1. Introduction
            </h2>
            <p className="mt-3">
              This Privacy Policy explains how BusinessFlow (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) collects,
              uses, and protects information when you use our website and application (the
              &quot;Service&quot;). By using the Service, you agree to the collection and use of
              information as described here.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              2. Information We Collect
            </h2>
            <p className="mt-3">We collect information in three ways:</p>
            <ul className="mt-3 list-disc pl-5 flex flex-col gap-2">
              <li>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Account information
                </span>{" "}
                — name, email address, company name, and billing details you provide when
                creating an account.
              </li>
              <li>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Business data
                </span>{" "}
                — the leads, customers, invoices, projects, and other records you or your
                team enter into the Service.
              </li>
              <li>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Usage data
                </span>{" "}
                — log data, device information, and how you interact with the Service,
                collected automatically.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              3. How We Use Information
            </h2>
            <p className="mt-3">We use collected information to:</p>
            <ul className="mt-3 list-disc pl-5 flex flex-col gap-2">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process payments and send billing communications</li>
              <li>Respond to support requests</li>
              <li>Send product updates, which you can opt out of at any time</li>
              <li>Detect, prevent, and address fraud, abuse, or security issues</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              4. How We Share Information
            </h2>
            <p className="mt-3">
              We do not sell your data. We share information only with service providers who
              help us operate the Service (such as payment processing and hosting), when
              required by law, or when you direct us to (for example, connecting a
              third-party integration).
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              5. Data Retention
            </h2>
            <p className="mt-3">
              We retain account and business data for as long as your account is active. If
              you close your account, we retain data for a limited period to allow for
              recovery and to meet legal obligations, after which it is deleted.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              6. Security
            </h2>
            <p className="mt-3">
              We use industry-standard measures, including encryption in transit, to protect
              your data. No method of transmission or storage is completely secure, and we
              cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              7. Your Rights
            </h2>
            <p className="mt-3">
              Depending on where you live, you may have the right to access, correct, export,
              or delete your personal information. You can manage most of this directly from
              your account settings, or contact us for help.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              8. Cookies
            </h2>
            <p className="mt-3">
              We use cookies and similar technologies to keep you signed in, remember
              preferences, and understand how the Service is used. You can control cookies
              through your browser settings.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              9. Changes to This Policy
            </h2>
            <p className="mt-3">
              We may update this policy from time to time. If we make material changes,
              we&apos;ll notify you by email or through the Service before they take effect.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              10. Contact Us
            </h2>
            <p className="mt-3">
              Questions about this policy? Email us at{" "}
              <a
                href="mailto:privacy@businessflow.com"
                className="text-indigo-600 dark:text-teal-400 font-medium hover:underline"
              >
                privacy@businessflow.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
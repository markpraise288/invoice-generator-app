export default function Terms() {
  return (
    <section className="py-24 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-sm text-indigo-600 dark:text-teal-400">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-gray-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Last updated: August 2026</p>

        <div className="mt-10 flex flex-col gap-10 text-gray-600 dark:text-gray-400 leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p className="mt-3">
              By creating an account or using BusinessFlow (the &quot;Service&quot;), you agree to
              these Terms of Service. If you&apos;re using the Service on behalf of a company,
              you&apos;re agreeing on its behalf and confirming you have the authority to do so.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              2. The Service
            </h2>
            <p className="mt-3">
              BusinessFlow provides tools for managing leads, customers, sales, projects,
              expenses, and related business operations. We may add, change, or remove
              features over time.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              3. Accounts
            </h2>
            <p className="mt-3">
              You&apos;re responsible for maintaining the security of your account and for all
              activity under it. Let us know immediately if you suspect unauthorized access.
              You must provide accurate information when creating an account.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              4. Subscriptions & Billing
            </h2>
            <p className="mt-3">
              Paid plans are billed in advance on a recurring basis. Subscriptions renew
              automatically unless canceled before the renewal date. Fees are non-refundable
              except where required by law.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              5. Acceptable Use
            </h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 list-disc pl-5 flex flex-col gap-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to access data or accounts that aren&apos;t yours</li>
              <li>Interfere with or disrupt the Service&apos;s infrastructure</li>
              <li>Reverse engineer or resell the Service without permission</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              6. Your Data
            </h2>
            <p className="mt-3">
              You retain ownership of the business data you enter into the Service. You can
              export it at any time. We process it only to provide and improve the Service,
              as described in our{" "}
              <a
                href="/privacy"
                className="text-indigo-600 dark:text-teal-400 font-medium hover:underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              7. Intellectual Property
            </h2>
            <p className="mt-3">
              The Service, including its design, code, and branding, is owned by
              BusinessFlow. These Terms don&apos;t grant you any rights to our trademarks or
              intellectual property beyond what&apos;s needed to use the Service.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              8. Termination
            </h2>
            <p className="mt-3">
              You can cancel your account at any time from your settings. We may suspend or
              terminate accounts that violate these Terms, with notice where reasonably
              possible.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              9. Disclaimers & Limitation of Liability
            </h2>
            <p className="mt-3">
              The Service is provided &quot;as is&quot; without warranties of any kind. To the extent
              permitted by law, BusinessFlow is not liable for indirect, incidental, or
              consequential damages arising from your use of the Service.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              10. Changes to These Terms
            </h2>
            <p className="mt-3">
              We may update these Terms from time to time. If we make material changes,
              we&apos;ll notify you before they take effect. Continued use of the Service after
              changes take effect means you accept the updated Terms.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              11. Contact Us
            </h2>
            <p className="mt-3">
              Questions about these Terms? Email us at{" "}
              <a
                href="mailto:legal@businessflow.com"
                className="text-indigo-600 dark:text-teal-400 font-medium hover:underline"
              >
                legal@businessflow.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
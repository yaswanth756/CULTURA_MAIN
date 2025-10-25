import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Utsav Lokam Enterprises Pvt. Ltd. Terms and Conditions
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Effective Date: <span className="font-medium text-gray-700">October 25, 2025</span>
          </p>
          <p className="mt-4 text-gray-700">
            <span className="font-medium">Company Name:</span> Utsav Lokam Enterprises Pvt. Ltd.
            <br />
            <span className="font-medium">Registered Office:</span> Hill Rock Colony, Nalgonda, Telangana, India
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 leading-relaxed text-gray-800">
        {/* Intro */}
        <section aria-labelledby="intro">
          <h2 id="intro" className="text-2xl font-semibold text-gray-900">Introduction</h2>
          <p className="mt-3">
            These Terms and Conditions (“Agreement”) govern the relationship between Utsav Lokam Enterprises Pvt. Ltd. (“Company”, “we”, “our”) and vendors (“Vendor”, “you”) who register on our platform to offer services to customers; by registering and using our platform, you agree to these terms.
          </p>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 1. Vendor Registration & Account */}
        <section aria-labelledby="vendor">
          <h2 id="vendor" className="text-2xl font-semibold text-gray-900">1. Vendor Registration & Account</h2>
          <ul className="mt-3 list-disc marker:text-anzac-500 pl-6 space-y-1">
            <li>Vendors must create an account on Utsav Lokam to offer services.</li>
            <li>Vendors agree to provide accurate, complete, and up-to-date information during registration.</li>
            <li>Vendors are responsible for maintaining the confidentiality of their account credentials.</li>
            <li>Utsav Lokam Enterprises Pvt. Ltd. may suspend or terminate accounts in case of fraudulent activity or violation of terms.</li>
          </ul>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 2. Fees and Commission */}
        <section aria-labelledby="fees">
          <h2 id="fees" className="text-2xl font-semibold text-gray-900">2. Fees and Commission</h2>
          <ul className="mt-3 list-disc marker:text-anzac-500 pl-6 space-y-1">
            <li><span className="font-medium">Introductory Offer:</span> For the first 3 months after onboarding, Utsav Lokam charges a 5% commission per successful booking.</li>
            <li><span className="font-medium">Standard Commission:</span> After the introductory period, the commission will be 10–13% per booking, depending on service type.</li>
            <li><span className="font-medium">Subscription Fees:</span> Vendors may opt for premium features at ₹999/month for analytics, featured listings, and marketing benefits.</li>
            <li>Payments for bookings are collected via Utsav Lokam’s platform, and commissions are automatically deducted per booking.</li>
          </ul>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 3. Vendor Obligations */}
        <section aria-labelledby="obligations">
          <h2 id="obligations" className="text-2xl font-semibold text-gray-900">3. Vendor Obligations</h2>
          <ul className="mt-3 list-disc marker:text-anzac-500 pl-6 space-y-1">
            <li>Deliver services as described in profiles and ensure customer satisfaction.</li>
            <li>Comply with all applicable laws and regulations.</li>
            <li>Take responsibility for disputes arising from services; Utsav Lokam may mediate but is not liable for vendor-customer disputes.</li>
            <li>Do not engage in misleading marketing, misrepresentation, or illegal activities on the platform.</li>
          </ul>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 4. Customer Bookings */}
        <section aria-labelledby="bookings">
          <h2 id="bookings" className="text-2xl font-semibold text-gray-900">4. Customer Bookings</h2>
          <ul className="mt-3 list-disc marker:text-anzac-500 pl-6 space-y-1">
            <li>All bookings are confirmed through Utsav Lokam’s platform.</li>
            <li>Vendors must honor confirmed bookings unless exceptional circumstances occur, and must promptly inform both Utsav Lokam and the customer.</li>
            <li>Utsav Lokam is not liable for damages, losses, or cancellations beyond the platform’s control.</li>
          </ul>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 5. Termination */}
        <section aria-labelledby="termination">
          <h2 id="termination" className="text-2xl font-semibold text-gray-900">5. Termination</h2>
          <ul className="mt-3 list-disc marker:text-anzac-500 pl-6 space-y-1">
            <li>Vendors may terminate their account at any time with written notice.</li>
            <li>Utsav Lokam may terminate accounts for breach of terms, fraudulent activity, or non-compliance with policies.</li>
            <li>Termination does not relieve vendors of unpaid commission fees or obligations accrued prior to termination.</li>
          </ul>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 6. Intellectual Property */}
        <section aria-labelledby="ip">
          <h2 id="ip" className="text-2xl font-semibold text-gray-900">6. Intellectual Property</h2>
          <ul className="mt-3 list-disc marker:text-anzac-500 pl-6 space-y-1">
            <li>All platform content, including logos, software, and website design, is owned by the Company.</li>
            <li>Vendors may not use Utsav Lokam’s intellectual property without prior written permission.</li>
            <li>Vendors retain ownership of their content but grant Utsav Lokam a license to display it on the platform.</li>
          </ul>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 7. Limitation of Liability */}
        <section aria-labelledby="liability">
          <h2 id="liability" className="text-2xl font-semibold text-gray-900">7. Limitation of Liability</h2>
          <ul className="mt-3 list-disc marker:text-anzac-500 pl-6 space-y-1">
            <li>The platform is provided on an “as is” basis; the Company is not liable for losses, damages, or disputes between vendors and customers.</li>
            <li>The Company is not responsible for service quality, delays, or cancellations caused by vendors.</li>
            <li>Vendors agree to indemnify Utsav Lokam for claims arising from their services.</li>
          </ul>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 8. Payment Terms */}
        <section aria-labelledby="payments">
          <h2 id="payments" className="text-2xl font-semibold text-gray-900">8. Payment Terms</h2>
          <ul className="mt-3 list-disc marker:text-anzac-500 pl-6 space-y-1">
            <li>All booking payments are processed through Utsav Lokam’s platform.</li>
            <li>Commissions are automatically deducted before transferring the remaining amount to the vendor.</li>
            <li>Subscription fees are billed monthly and must be paid to retain premium features.</li>
          </ul>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 9. Amendments */}
        <section aria-labelledby="amendments">
          <h2 id="amendments" className="text-2xl font-semibold text-gray-900">9. Amendments</h2>
          <ul className="mt-3 list-disc marker:text-anzac-500 pl-6 space-y-1">
            <li>Utsav Lokam may modify these Terms and Conditions at any time.</li>
            <li>Vendors will be notified of changes via email, and continued use of the platform constitutes acceptance of revised terms.</li>
          </ul>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 10. Governing Law */}
        <section aria-labelledby="law">
          <h2 id="law" className="text-2xl font-semibold text-gray-900">10. Governing Law</h2>
          <p className="mt-3">
            These terms are governed by the laws of India, with disputes subject to the courts of Nalgonda, Telangana, India.
          </p>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* Acknowledgment */}
        <section aria-labelledby="ack">
          <h2 id="ack" className="text-2xl font-semibold text-gray-900">Acknowledgment</h2>
          <p className="mt-3">
            By registering and using Utsav Lokam Enterprises Pvt. Ltd., you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
          </p>
        </section>

        {/* Footer note (optional link styling in brand color) */}
        <p className="mt-10 text-xs text-gray-500">
          Note: For policy updates, check your registered email or announcements on the platform.
        </p>
      </main>
    </div>
  );
};

export default TermsAndConditions;

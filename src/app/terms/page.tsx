'use client'

import React from 'react'

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-theme-primary mb-3 sm:mb-4">Terms of Service</h1>
        <p className="text-base sm:text-lg text-theme-secondary">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">1. Acceptance of Terms</h2>
          <p className="text-theme-secondary mb-4">
            By accessing and using the AVA Skincare website and services, you accept and agree to be 
            bound by the terms and provision of this agreement. If you do not agree to abide by the 
            above, please do not use this service.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">2. Use License</h2>
          <p className="text-theme-secondary mb-4">
            Permission is granted to temporarily download one copy of the materials (information or 
            software) on AVA Skincare&apos;s website for personal, non-commercial transitory viewing only. 
            This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 text-theme-secondary mb-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on the website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">3. Product Information</h2>
          <p className="text-theme-secondary mb-4">
            While we strive to provide accurate product information, we do not warrant that product 
            descriptions, colors, information, or other content available on the site is accurate, 
            complete, reliable, current, or error-free. If a product offered by AVA Skincare is not 
            as described, your sole remedy is to return it in unused condition.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">4. Pricing and Payment</h2>
          <p className="text-theme-secondary mb-4">
            All prices are subject to change without notice. We reserve the right to modify or 
            discontinue any product at any time. Payment must be made at the time of order placement. 
            We accept various payment methods as indicated on our checkout page.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">5. Shipping and Delivery</h2>
          <p className="text-theme-secondary mb-4">
            We will make every effort to ship your order promptly. However, we are not responsible 
            for delays beyond our control. Delivery times are estimates only. Risk of loss and title 
            for items purchased pass to you upon delivery of the items to the carrier.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">6. Returns and Refunds</h2>
          <p className="text-theme-secondary mb-4">
            We offer a 30-day return policy for unused products in their original packaging. 
            Return shipping costs are the responsibility of the customer unless the item was 
            received damaged or incorrect. Refunds will be processed within 5-7 business days 
            of receiving the returned item.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">7. User Accounts</h2>
          <p className="text-theme-secondary mb-4">
            You are responsible for maintaining the confidentiality of your account and password. 
            You agree to accept responsibility for all activities that occur under your account 
            or password. You must be at least 18 years old to create an account.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">8. Prohibited Uses</h2>
          <p className="text-theme-secondary mb-4">
            You may not use our website or services:
          </p>
          <ul className="list-disc pl-6 text-theme-secondary mb-4">
            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>To submit false or misleading information</li>
            <li>To upload or transmit viruses or any other type of malicious code</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">9. Disclaimer</h2>
          <p className="text-theme-secondary mb-4">
            The materials on AVA Skincare&apos;s website are provided on an &apos;as is&apos; basis. AVA Skincare 
            makes no warranties, expressed or implied, and hereby disclaims and negates all other 
            warranties including without limitation, implied warranties or conditions of merchantability, 
            fitness for a particular purpose, or non-infringement of intellectual property or other 
            violation of rights.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">10. Limitations</h2>
          <p className="text-theme-secondary mb-4">
            In no event shall AVA Skincare or its suppliers be liable for any damages (including, 
            without limitation, damages for loss of data or profit, or due to business interruption) 
            arising out of the use or inability to use the materials on AVA Skincare&apos;s website, 
            even if AVA Skincare or a AVA Skincare authorized representative has been notified 
            orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">11. Revisions and Errata</h2>
          <p className="text-theme-secondary mb-4">
            The materials appearing on AVA Skincare&apos;s website could include technical, typographical, 
            or photographic errors. AVA Skincare does not warrant that any of the materials on its 
            website are accurate, complete, or current. AVA Skincare may make changes to the materials 
            contained on its website at any time without notice.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">12. Links</h2>
          <p className="text-theme-secondary mb-4">
            AVA Skincare has not reviewed all of the sites linked to its website and is not responsible 
            for the contents of any such linked site. The inclusion of any link does not imply endorsement 
            by AVA Skincare of the site. Use of any such linked website is at the user&apos;s own risk.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">13. Modifications</h2>
          <p className="text-theme-secondary mb-4">
            AVA Skincare may revise these terms of service for its website at any time without notice. 
            By using this website you are agreeing to be bound by the then current version of these 
            Terms and Conditions of Use.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">14. Governing Law</h2>
          <p className="text-theme-secondary mb-4">
            These terms and conditions are governed by and construed in accordance with the laws of 
            the United States and you irrevocably submit to the exclusive jurisdiction of the courts 
            in that location.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">15. Contact Information</h2>
          <p className="text-theme-secondary mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="bg-theme-secondary p-4 sm:p-6 rounded-lg border border-theme">
            <p className="text-theme-secondary text-sm sm:text-base">
              <strong>Email:</strong> legal@ava.com<br />
              <strong>Phone:</strong> +1 (800) AVA-SKIN<br />
              <strong>Address:</strong> 123 Beauty Street, New York, NY 10001
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default TermsPage 
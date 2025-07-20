'use client'

import React from 'react'

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-theme-primary mb-4">Privacy Policy</h1>
        <p className="text-lg text-theme-secondary">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">1. Information We Collect</h2>
          <p className="text-theme-secondary mb-4">
            We collect information you provide directly to us, such as when you create an account, 
            make a purchase, or contact us for support. This may include:
          </p>
          <ul className="list-disc pl-6 text-theme-secondary mb-4">
            <li>Name, email address, and contact information</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information (processed securely by our payment partners)</li>
            <li>Order history and preferences</li>
            <li>Communications with our customer service team</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">2. How We Use Your Information</h2>
          <p className="text-theme-secondary mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-theme-secondary mb-4">
            <li>Process and fulfill your orders</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Improve our products and services</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">3. Information Sharing</h2>
          <p className="text-theme-secondary mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            except in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-theme-secondary mb-4">
            <li>With your explicit consent</li>
            <li>To trusted third-party service providers who assist us in operating our website and serving you</li>
            <li>To comply with legal requirements or protect our rights</li>
            <li>In connection with a business transfer or merger</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">4. Data Security</h2>
          <p className="text-theme-secondary mb-4">
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc pl-6 text-theme-secondary mb-4">
            <li>SSL encryption for data transmission</li>
            <li>Secure payment processing</li>
            <li>Regular security assessments</li>
            <li>Limited access to personal information on a need-to-know basis</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">5. Cookies and Tracking</h2>
          <p className="text-theme-secondary mb-4">
            We use cookies and similar technologies to enhance your browsing experience, analyze 
            website traffic, and personalize content. You can control cookie settings through your 
            browser preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">6. Your Rights</h2>
          <p className="text-theme-secondary mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-theme-secondary mb-4">
            <li>Access and review your personal information</li>
            <li>Update or correct inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt out of marketing communications</li>
            <li>Lodge a complaint with relevant authorities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">7. Children&apos;s Privacy</h2>
          <p className="text-theme-secondary mb-4">
            Our services are not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13. If you believe we have collected 
            information from a child under 13, please contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">8. International Transfers</h2>
          <p className="text-theme-secondary mb-4">
            Your information may be transferred to and processed in countries other than your own. 
            We ensure that such transfers comply with applicable data protection laws and implement 
            appropriate safeguards.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">9. Changes to This Policy</h2>
                      <p className="text-theme-secondary mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">10. Contact Us</h2>
          <p className="text-theme-secondary mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-theme-secondary">
              <strong>Email:</strong> privacy@ava.com<br />
              <strong>Phone:</strong> +1 (800) AVA-SKIN<br />
              <strong>Address:</strong> 123 Beauty Street, New York, NY 10001
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPage 
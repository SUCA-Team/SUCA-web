import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="page">
      <div className="container">
        <div className="page-content">
          <h1 className="page-title">Terms of Service</h1>
          <div className="page-body">
            <p className="lead">
              Last updated: December 5, 2025
            </p>

            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using SUCA, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2>2. Description of Service</h2>
              <p>
                SUCA is a Japanese language learning platform that provides dictionary services, 
                flashcard tools. We reserve the right to modify, 
                suspend, or discontinue any part of the service at any time.
              </p>
            </section>

            <section>
              <h2>3. User Accounts</h2>
              <p>To access certain features, you must create an account:</p>
              <ul>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You are responsible for all activities under your account</li>
                <li>You must notify us immediately of any unauthorized use</li>
                <li>You must be at least 13 years old to create an account</li>
              </ul>
            </section>

            <section>
              <h2>4. User Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the service for any illegal purpose</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Upload malicious code or viruses</li>
                <li>Impersonate others or misrepresent your affiliation</li>
                <li>Scrape or copy content without permission</li>
              </ul>
            </section>

            <section>
              <h2>5. Intellectual Property</h2>
              <p>
                All content, features, and functionality of SUCA are owned by SUCA Team and are 
                protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                Dictionary content may be sourced from third-party APIs and is subject to their 
                respective licenses and terms.
              </p>
            </section>

            <section>
              <h2>6. User-Generated Content</h2>
              <p>
                By creating flashcards, you grant SUCA a 
                non-exclusive license to use, display, and distribute your content within the service.
              </p>
            </section>

            <section>
              <h2>7. Disclaimer of Warranties</h2>
              <p>
                SUCA is provided "as is" without warranties of any kind. We do not guarantee that:
              </p>
              <ul>
                <li>The service will be uninterrupted or error-free</li>
                <li>All information will be accurate or up-to-date</li>
                <li>The service will meet your specific requirements</li>
              </ul>
            </section>

            <section>
              <h2>8. Limitation of Liability</h2>
              <p>
                SUCA Team shall not be liable for any indirect, incidental, special, or consequential 
                damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2>9. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account at any time for violations 
                of these terms. You may also terminate your account at any time by contacting us.
              </p>
            </section>

            <section>
              <h2>10. Changes to Terms</h2>
              <p>
                We may modify these terms at any time. Continued use of SUCA after changes constitutes 
                acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2>11. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with applicable laws, 
                without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2>12. Contact Information</h2>
              <p>
                For questions about these Terms of Service, contact us at:
                <br />
                <strong>Email:</strong> legal@suca.app
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

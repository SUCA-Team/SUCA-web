import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="page">
      <div className="container">
        <div className="page-content">
          <h1 className="page-title">Privacy Policy</h1>
          <div className="page-body">
            <p className="lead">
              Last updated: December 5, 2025
            </p>

            <section>
              <h2>1. Information We Collect</h2>
              <p>
                When you use SUCA, we collect the following information:
              </p>
              <ul>
                <li><strong>Account Information:</strong> When you sign in with Google, we collect your name, email address, and profile picture.</li>
                <li><strong>Usage Data:</strong> We collect information about how you use SUCA, including dictionary searches and flashcard activity.</li>
                <li><strong>Device Information:</strong> We may collect information about your device, browser type, and IP address.</li>
              </ul>
            </section>

            <section>
              <h2>2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>Provide and improve our services</li>
                <li>Personalize your learning experience</li>
                <li>Track your progress and save your flashcards</li>
                <li>Communicate with you about updates and features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2>3. Data Storage and Security</h2>
              <p>
                Your data is stored securely using Firebase services. We implement industry-standard 
                security measures to protect your personal information. However, no method of transmission 
                over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2>4. Third-Party Services</h2>
              <p>We use the following third-party services:</p>
              <ul>
                <li><strong>Google Firebase:</strong> For authentication and data storage</li>
                <li><strong>Google Analytics:</strong> For usage analytics (if applicable)</li>
              </ul>
              <p>
                These services have their own privacy policies. We encourage you to review them.
              </p>
            </section>

            <section>
              <h2>5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of certain data collection</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h2>6. Cookies</h2>
              <p>
                We use cookies and similar technologies to maintain your session and improve your 
                experience. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2>7. Children's Privacy</h2>
              <p>
                SUCA is not intended for children under 13. We do not knowingly collect information 
                from children under 13. If you believe we have collected such information, please 
                contact us immediately.
              </p>
            </section>

            <section>
              <h2>8. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any 
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2>9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <strong>Email:</strong> <strong>sucateam1111@gmail.com</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

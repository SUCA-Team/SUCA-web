import React, { useState } from 'react';
import './ContactPage.css';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual form submission to backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-content">
          <h1 className="page-title">Contact Us</h1>
          <div className="page-body">
            <p className="lead">
              Have a question, suggestion, or need help? We'd love to hear from you!
            </p>

            <div className="contact-grid">
              <div className="contact-info">
                <h2>Get in Touch</h2>
                <div className="contact-method">
                  <h3>📧 Email</h3>
                  <p><strong>General Inquiries:</strong> hello@suca.app</p>
                  <p><strong>Support:</strong> support@suca.app</p>
                  <p><strong>Legal:</strong> legal@suca.app</p>
                </div>

                <div className="contact-method">
                  <h3>⏱️ Response Time</h3>
                  <p>We typically respond within 24-48 hours during business days.</p>
                </div>

                <div className="contact-method">
                  <h3>🐛 Bug Reports</h3>
                  <p>Found a bug? Please include details about your device, browser, and steps to reproduce the issue.</p>
                </div>

                <div className="contact-method">
                  <h3>💡 Feature Requests</h3>
                  <p>Have an idea for a new feature? We're always looking for ways to improve SUCA!</p>
                </div>
              </div>

              <div className="contact-form-container">
                <h2>Send Us a Message</h2>
                {submitted ? (
                  <div className="success-message">
                    <h3>✅ Message Sent!</h3>
                    <p>Thank you for contacting us. We'll get back to you soon.</p>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="name">Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject">Subject *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    <button type="submit" className="submit-btn">
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

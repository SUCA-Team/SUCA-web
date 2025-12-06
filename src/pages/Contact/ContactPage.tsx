import React, { useState } from 'react';
import './ContactPage.css';
import { submitContactMessage } from '../../services/contactService';
import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: '',
    honeypot: '' // Hidden field for bot detection
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const user = auth?.user ?? null;

  // Rate limiting: Check if user has submitted recently
  const checkRateLimit = (): boolean => {
    const lastSubmission = localStorage.getItem('lastContactSubmission');
    if (lastSubmission) {
      const timeSinceLastSubmission = Date.now() - parseInt(lastSubmission);
      const minInterval = 60000; // 1 minute between submissions
      if (timeSinceLastSubmission < minInterval) {
        const secondsRemaining = Math.ceil((minInterval - timeSinceLastSubmission) / 1000);
        setError(`Please wait ${secondsRemaining} seconds before submitting another message.`);
        return false;
      }
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Check if user is authenticated
    if (!user) {
      setError('You must be logged in to send a message.');
      setIsSubmitting(false);
      return;
    }

    // Honeypot check - if filled, it's likely a bot
    if (formData.honeypot) {
      console.warn('Bot detected via honeypot field');
      setIsSubmitting(false);
      return;
    }

    // Rate limiting check
    if (!checkRateLimit()) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      await submitContactMessage({
        name: formData.name,
        subject: formData.subject,
        message: formData.message,
        userId: user.uid,
        userEmail: user.email || 'no-email@provided.com'
      });
      
      // Store submission timestamp for rate limiting
      localStorage.setItem('lastContactSubmission', Date.now().toString());
      
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: '', subject: '', message: '', honeypot: '' });
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
                  <p>sucateam1111@gmail.com</p>
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
                {!user && (
                  <div className="info-message" style={{ 
                    backgroundColor: '#e3f2fd', 
                    border: '1px solid #90caf9', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    color: '#1565c0'
                  }}>
                    <p>ℹ️ You must be logged in to send us a message. Please <Link to="/login" style={{ color: '#c8102e', textDecoration: 'underline' }}>log in</Link> or sign up to continue.</p>
                  </div>
                )}
                {error && (
                  <div className="error-message" style={{ 
                    backgroundColor: '#fee', 
                    border: '1px solid #fcc', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    color: '#c00'
                  }}>
                    <p>❌ {error}</p>
                  </div>
                )}
                {submitted ? (
                  <div className="success-message">
                    <h3>✅ Message Sent!</h3>
                    <p>Thank you for contacting us. We'll get back to you soon.</p>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit}>
                    {/* Honeypot field - hidden from users, but bots will fill it */}
                    <input
                      type="text"
                      name="honeypot"
                      value={formData.honeypot}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />
                    
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
                        disabled={isSubmitting || !user}
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
                        disabled={isSubmitting || !user}
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
                        disabled={isSubmitting || !user}
                      />
                    </div>

                    <button type="submit" className="submit-btn" disabled={isSubmitting || !user}>
                      {isSubmitting ? 'Sending...' : !user ? 'Login Required' : 'Send Message'}
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

import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="page">
      <div className="container">
        <div className="page-content">
          <h1 className="page-title">About SUCA</h1>
          <div className="page-body">
            <p className="lead">
              SUCA is a comprehensive Japanese language learning platform designed to make 
              studying engaging, effective, and accessible to everyone.
            </p>
            
            <section>
              <h2>Our Mission</h2>
              <p>
                We believe that learning Japanese should be an exciting journey, not a chore.
                Our mission is to provide learners worldwide with the tools they need to master 
                the Japanese language through innovative technology and engaging learning methods.
              </p>
            </section>
            
            <section>
              <h2>What We Offer</h2>
              <ul>
                <li><strong>Comprehensive Dictionary:</strong> Search Japanese words with detailed definitions, readings, JLPT levels, and example sentences</li>
                <li><strong>Smart Flashcards:</strong> Create custom study sets and review vocabulary with spaced repetition</li>
                <li><strong>JLPT Preparation:</strong> Content organized by JLPT levels (N5-N1) to match your learning goals</li>
                <li><strong>Progress Tracking:</strong> Monitor your learning journey with detailed statistics</li>
              </ul>
            </section>
            
            <section>
              <h2>Our Story</h2>
              <p>
                SUCA was created by a team of passionate language learners and developers who 
                experienced firsthand the challenges of learning Japanese. We wanted to build 
                a platform that combines the best of traditional study methods with modern 
                technology to create an optimal learning experience.
              </p>
            </section>

            <section>
              <h2>Technology</h2>
              <p>
                Built with modern web technologies including React, TypeScript, and Firebase, 
                SUCA delivers a fast, reliable, and secure learning experience across all devices.
              </p>
            </section>
            
            <section>
              <h2>Join Our Community</h2>
              <p>
                Whether you're a complete beginner or preparing for the JLPT N1 exam, SUCA is 
                here to support your Japanese learning journey. Join thousands of learners 
                worldwide who are achieving their language goals with SUCA.
              </p>
              <p>
                <strong>Ready to start?</strong> Sign up today and begin your Japanese learning adventure!
              </p>
            </section>

            <section>
              <h2>Contact Us</h2>
              <p>
                Have questions or feedback? We'd love to hear from you! Visit our 
                <a href="/contact" style={{ color: '#c8102e', marginLeft: '0.25rem' }}>Contact page</a> or 
                email us at <strong>sucateam1111@gmail.com</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
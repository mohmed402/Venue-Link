import { useState } from 'react';
import Logo from "@/components/logo";
import Input from "@/components/input";
import Button from "@/components/button";
import "@/styles/contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <header className="contact-header">
        <section className="header-bar xzx">
          <Logo />
        </section>
      </header>

      <main className="contact-main">
        <div className="contact-container">
          <section className="contact-info">
            <h1>Contact Us</h1>
            <p>Get in touch with us for any questions about venue bookings or listings.</p>
            
            <div className="contact-details">
              <div className="contact-item">
                <h3>📍 Address</h3>
                <p>123 Venue Street<br />Manchester, M1 1AB<br />United Kingdom</p>
              </div>
              
              <div className="contact-item">
                <h3>📞 Phone</h3>
                <p>+44 (0) 123 456 7890</p>
              </div>
              
              <div className="contact-item">
                <h3>✉️ Email</h3>
                <p>support@venuelink.com</p>
              </div>
              
              <div className="contact-item">
                <h3>⏰ Business Hours</h3>
                <p>Monday - Friday: 9:00 AM - 6:00 PM<br />
                   Saturday: 10:00 AM - 4:00 PM<br />
                   Sunday: Closed</p>
              </div>
            </div>
          </section>

          <section className="contact-form">
            <h2>Send us a message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(value) => handleChange('name', value)}
                  width="100%"
                  height={50}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleChange('email', value)}
                  width="100%"
                  height={50}
                  required
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(value) => handleChange('subject', value)}
                  width="100%"
                  height={50}
                  required
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  required
                  rows={6}
                  className="contact-textarea"
                />
              </div>

              <Button
                title={submitted ? "Message Sent!" : "Send Message"}
                width={200}
                height={50}
                colour="main"
                type="submit"
                disabled={submitted}
              />
            </form>
          </section>
        </div>
      </main>
    </>
  );
} 
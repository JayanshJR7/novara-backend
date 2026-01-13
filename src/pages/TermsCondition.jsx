import React from 'react';
import './TC.css';

const TermsConditions = () => {
  return (
    <div className="policy-container">
      <div className="policy-header">
        <div className="icon-terms"></div>
        <h1>Terms & Conditions</h1>
        <p className="last-updated">Last Updated: January 9, 2026</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using the Novara Jewels website, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our website or purchase our products.</p>
        </section>

        <section className="policy-section">
          <h2>2. Eligibility</h2>
          <p>You must be at least 18 years of age to make purchases. By placing an order, you confirm that you are of legal age and have the authority to enter into a binding contract.</p>
        </section>

        <section className="policy-section">
          <h2>3. Product Information</h2>
          <p>We strive for accuracy in all product descriptions, images, and pricing. However:</p>
          <ul>
            <li>Colors may vary due to screen settings and lighting conditions</li>
            <li>Natural gemstones and materials have inherent variations</li>
            <li>We reserve the right to correct errors in pricing or descriptions</li>
            <li>Product availability is subject to change without notice</li>
            <li>Images are for illustration purposes and may not represent exact products</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Orders and Payment</h2>
          <p>All orders are subject to acceptance by Novara Jewels:</p>
          <ul>
            <li>We reserve the right to refuse or cancel any order</li>
            <li>Payment is processed at the time of order placement</li>
            <li>All transactions are in INR unless otherwise specified</li>
            <li>You authorize us to charge the total amount to your payment method</li>
            <li>Order confirmation does not guarantee acceptance</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Pricing</h2>
          <p>All prices are subject to change without notice. Prices do not include taxes, shipping, or customs fees unless stated. We reserve the right to cancel orders placed at incorrect prices.</p>
        </section>

        <section className="policy-section">
          <h2>6. Shipping and Delivery</h2>
          <p>Shipping terms:</p>
          <ul>
            <li>Delivery times are estimates and not guaranteed</li>
            <li>Risk of loss transfers to you upon delivery to carrier</li>
            <li>We are not responsible for delays by shipping carriers</li>
            <li>International orders may incur customs fees (buyer's responsibility)</li>
            <li>Incorrect addresses provided by customers may result in additional charges</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>7. Returns and Refunds</h2>
          <p>Please refer to our Return Policy. All sales are final except for damaged or defective products reported within 48 hours of delivery with proper documentation.</p>
        </section>

        <section className="policy-section disclaimer-section">
          <h2>8. Disclaimer of Warranties</h2>
          <p>PRODUCTS ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL IMPLIED WARRANTIES INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE TO THE FULLEST EXTENT PERMITTED BY LAW.</p>
        </section>

        <section className="policy-section disclaimer-section">
          <h2>9. Limitation of Liability</h2>
          <p>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE PRODUCT. WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.</p>
        </section>

        <section className="policy-section">
          <h2>10. Intellectual Property</h2>
          <p>All content on our website is protected by copyright and trademark laws. You may not reproduce, distribute, or use any content without our written consent.</p>
        </section>

        <section className="policy-section">
          <h2>11. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the website for unlawful purposes</li>
            <li>Attempt unauthorized access to our systems</li>
            <li>Engage in fraudulent activity</li>
            <li>Submit false information or documentation</li>
            <li>Abuse our return or warranty policies</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>12. Governing Law</h2>
          <p>These Terms shall be governed by the laws of India. Any disputes shall be resolved through arbitration in accordance with Indian Arbitration and Conciliation Act.</p>
        </section>

        <section className="policy-section">
          <h2>13. Modifications</h2>
          <p>We reserve the right to modify these Terms at any time. Continued use of the website constitutes acceptance of modified Terms.</p>
        </section>

        <section className="policy-section">
          <h2>14. Contact Information</h2>
          <p>For questions about these Terms, contact us at thenovarajewels@gmail.com</p>
        </section>
      </div>
    </div>
  );
};

export default TermsConditions;
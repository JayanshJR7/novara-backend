import React from 'react';
import './ReturnPolicy.css';

const ReturnPolicy = () => {
  return (
    <div className="policy-container">
      <div className="policy-header">
        <div className="icon-return"></div>
        <h1>Return & Refund Policy</h1>
        <p className="last-updated">Last Updated: January 9, 2026</p>
      </div>

      <div className="alert-box">
        <p className="alert-title">Important Notice</p>
        <p className="alert-text">Due to the nature of jewellery products and hygiene considerations, <strong>NO RETURNS are accepted after purchase</strong> except in cases of damaged or defective products.</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. No Return Policy</h2>
          <p>All sales are final. We do not accept returns, exchanges, or provide refunds for:</p>
          <ul>
            <li>Change of mind or buyer's remorse</li>
            <li>Incorrect size selection by customer</li>
            <li>Difference in color perception (due to screen settings or lighting)</li>
            <li>Natural variations in gemstones, pearls, or materials</li>
            <li>Products that have been worn, used, or altered in any way</li>
            <li>Customized or personalized jewellery items</li>
            <li>Products purchased during sales, promotions, or clearance events</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>2. Damaged or Defective Products Only</h2>
          <p>Returns are ONLY accepted if the product arrives damaged or defective. To qualify:</p>
          <ul>
            <li>You must report the issue within 48 hours of delivery</li>
            <li>Provide clear photographs showing the damage or defect from multiple angles</li>
            <li>Include photographs of the original packaging</li>
            <li>Provide your order number and delivery confirmation</li>
            <li>The product must not have been worn, altered, or used</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Damage Verification Process</h2>
          <p>Upon receiving your damage claim, we will:</p>
          <ul>
            <li>Review submitted photographs and documentation within 5-7 business days</li>
            <li>Verify the damage occurred during shipping and not due to customer mishandling</li>
            <li>Reserve the right to request additional evidence or information</li>
            <li>Make the final determination on whether the damage qualifies for return</li>
          </ul>
          <p><strong>Important:</strong> Claims submitted after 48 hours of delivery will not be considered. Our decision on damage claims is final and binding.</p>
        </section>

        <section className="policy-section">
          <h2>4. What Does NOT Qualify as Damage</h2>
          <p>The following are NOT considered defects or damage:</p>
          <ul>
            <li>Minor variations in gemstone color, clarity, or size (natural characteristics)</li>
            <li>Slight differences between product photos and actual items</li>
            <li>Normal wear marks that occur after wearing the jewellery</li>
            <li>Tarnishing of silver or gold-plated items over time</li>
            <li>Damage caused by improper storage, cleaning, or handling</li>
            <li>Damage from exposure to water, chemicals, perfumes, or cosmetics</li>
            <li>Scratches or marks caused after delivery</li>
            <li>Missing stones or components if damage is not visible in delivery photos</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Return Procedure for Damaged Items</h2>
          <p>If your return is approved:</p>
          <ul>
            <li>We will provide return shipping instructions and authorization</li>
            <li>Products must be returned in original packaging with all accessories and documentation</li>
            <li>Return shipping costs may be covered by us for verified damaged items</li>
            <li>Items must be shipped within 7 days of receiving return authorization</li>
            <li>Use a trackable shipping method and provide tracking information</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>6. Inspection and Resolution</h2>
          <p>Upon receiving the returned item:</p>
          <ul>
            <li>We will inspect the product within 7-10 business days</li>
            <li>If damage is confirmed, we will offer a replacement or full refund</li>
            <li>If inspection reveals customer-caused damage or no defect, the item will be returned to you at your expense</li>
            <li>Refunds (if applicable) will be processed to the original payment method within 14 business days</li>
          </ul>
        </section>

        <section className="policy-section highlight-section">
          <h2>7. Video Unboxing Requirement</h2>
          <p><strong>MANDATORY:</strong> We strongly recommend recording a video while unboxing your delivery. This video serves as evidence of the product's condition upon arrival and will be required for processing any damage claims. Claims without unboxing video evidence may be rejected.</p>
        </section>

        <section className="policy-section">
          <h2>8. Refund Processing</h2>
          <p>If a refund is approved:</p>
          <ul>
            <li>Refunds will be issued to the original payment method only</li>
            <li>Original shipping charges are non-refundable</li>
            <li>Processing time: 14-21 business days after approval</li>
            <li>Bank processing times may vary</li>
          </ul>
        </section>

        <section className="policy-section warning-section">
          <h2>9. Fraudulent Claims</h2>
          <p>We take fraudulent return claims very seriously. The following actions may result in claim rejection and account termination:</p>
          <ul>
            <li>Submitting false or misleading photographs</li>
            <li>Claiming damage for items that were delivered in perfect condition</li>
            <li>Returning different or substitute items</li>
            <li>Damaging products intentionally to claim a return</li>
            <li>Returning worn or used jewellery claiming it as unused</li>
            <li>Making multiple fraudulent claims</li>
          </ul>
          <p><strong>Legal Action:</strong> We reserve the right to pursue legal action and report fraudulent claims to appropriate authorities. Customers found engaging in fraudulent activities will be permanently banned from making future purchases.</p>
        </section>

        <section className="policy-section">
          <h2>10. Contact for Returns</h2>
          <p>To initiate a damage claim, contact us immediately at thenovarajewels@gmail.com with your order number, photographs, and detailed description of the issue.</p>
        </section>

        <section className="policy-section">
          <h2>11. Final Decision</h2>
          <p>Novara Jewels reserves the right to make the final decision on all return requests. Our decision is binding and not subject to appeal. We are not obligated to provide detailed explanations for rejected claims.</p>
        </section>
      </div>
    </div>
  );
};

export default ReturnPolicy;
import React, { useState } from 'react';
import './FaqSection.css';
import { FaPlus, FaMinus } from 'react-icons/fa';

const faqData = [
  {
    question: 'What is the BGMI Performance FDAnalytics?',
    answer: 'It is an AI-powered platform that analyzes your gameplay videos to provide data-driven insights. We help players identify weaknesses, understand their playstyle, and receive personalized recommendations to improve faster.'
  },
  {
    question: 'How is this different from traditional coaching?',
    answer: 'Traditional coaching is subjective. Our tool provides objective, data-driven analysis based on your actual gameplay. It complements coaching by providing concrete data points to work on, saving you time and effort.'
  },
  {
    question: 'How does the AI analysis work?',
    answer: 'You upload a gameplay video, and our computer vision model (YOLOv8) processes it frame-by-frame. It detects key events, objects, and stats to build a comprehensive performance report. This is the core feature we will build in the next phases.'
  },
  {
    question: 'Is this compatible with all devices?',
    answer: 'Yes! Our platform is a web application, making it accessible on any device with a modern web browser, including desktops, laptops, tablets, and smartphones.'
  }
];

function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    // If the clicked item is already open, close it. Otherwise, open it.
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div id="faq" className="faq-section">
      <div className="faq-container">
        <h2>Everything You Need to Know</h2>
        <div className="faq-accordion">
          {faqData.map((item, index) => (
            <div className="faq-item" key={index}>
              <div className="faq-question" onClick={() => toggleFaq(index)}>
                <h3>{item.question}</h3>
                <span>{activeIndex === index ? <FaMinus /> : <FaPlus />}</span>
              </div>
              <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FaqSection;
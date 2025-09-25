"use client";

import styled from 'styled-components';
import Image from 'next/image';

const TestimonialsSection = styled.section`
  padding: var(--section-spacing) 0;
  background: transparent;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  color: white;
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const TestimonialCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--glass-shadow-light);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--glass-shadow-medium);
  }

  p {
    color: var(--gray-700);
    font-style: italic;
    margin-bottom: 1rem;
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  img {
    border-radius: 50%;
  }

  div {
    h4 {
      margin: 0;
      color: var(--gray-700);
    }
    
    span {
      color: var(--gray-600);
      font-size: 0.875rem;
    }
  }
`;

export default function Testimonials() {
  return (
    <TestimonialsSection>
      <div className="container">
        <SectionTitle>Hva våre kunder sier</SectionTitle>
        <TestimonialGrid>
          <TestimonialCard>
            <p>
              &quot;Strømsjef hjalp meg å spare over 2000 kr per år på min strømregning. 
              Prosessen var enkel og rask!&quot;
            </p>
            <CustomerInfo>
              <Image
                src="/testimonial1.jpg"
                alt="Kund 1"
                width={50}
                height={50}
              />
              <div>
                <h4>Anna Andersson</h4>
                <span>Oslo</span>
              </div>
            </CustomerInfo>
          </TestimonialCard>
          
          <TestimonialCard>
            <p>
              &quot;Fantastisk service! De fant den beste avtalen for vårt selskap 
              og sparte oss tid og penger.&quot;
            </p>
            <CustomerInfo>
              <Image
                src="/testimonial2.jpg"
                alt="Kund 2"
                width={50}
                height={50}
              />
              <div>
                <h4>Erik Svensson</h4>
                <span>Bergen</span>
              </div>
            </CustomerInfo>
          </TestimonialCard>
          
          <TestimonialCard>
            <p>
              &quot;Anbefaler Strømsjef til alle! Transparent og pålitelig service 
              som virkelig leverer besparelser.&quot;
            </p>
            <CustomerInfo>
              <Image
                src="/testimonial3.jpg"
                alt="Kund 3"
                width={50}
                height={50}
              />
              <div>
                <h4>Maria Lindberg</h4>
                <span>Trondheim</span>
              </div>
            </CustomerInfo>
          </TestimonialCard>
        </TestimonialGrid>
      </div>
    </TestimonialsSection>
  );
} 
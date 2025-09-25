"use client";

import React from 'react';
import Image from 'next/image';

interface ContractChoiceProps {
  onSelect: (contractType: 'rorligt' | 'fastpris') => void;
  onClose: () => void;
}

export default function ContractChoice({ onSelect, onClose }: ContractChoiceProps) {
  return (
    <div style={{
      marginBottom: 18,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 22, marginRight: 6 }}>🐸</span>
      <div style={{
        background: '#f0f9ff',
        color: '#17416b',
        borderRadius: '16px 16px 16px 4px',
        padding: '16px',
        maxWidth: 320,
        fontSize: 16,
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,106,167,0.12)',
        marginLeft: 8,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, opacity: 0.7 }}>
          Grodan
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Välj ditt avtal:</strong>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => onSelect('rorligt')}
            style={{
              background: 'linear-gradient(135deg, rgba(22, 147, 255, 0.5), rgba(0, 201, 107, 0.5))',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'var(--glass-shadow-light)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = 'var(--glass-shadow-medium)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(22, 147, 255, 0.7), rgba(0, 201, 107, 0.7))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'var(--glass-shadow-light)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(22, 147, 255, 0.5), rgba(0, 201, 107, 0.5))';
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Image src="/globe.svg" alt="Globe" width={16} height={16} />
              Rörligt avtal
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Följer marknadspriset • Oftast billigast långsiktigt • Inga bindningstider
            </div>
          </button>
          
          <button
            onClick={() => onSelect('fastpris')}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 201, 107, 0.5), rgba(22, 147, 255, 0.5))',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'var(--glass-shadow-light)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = 'var(--glass-shadow-medium)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 201, 107, 0.7), rgba(22, 147, 255, 0.7))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'var(--glass-shadow-light)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 201, 107, 0.5), rgba(22, 147, 255, 0.5))';
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Image src="/window.svg" alt="Window" width={16} height={16} />
              Fastpris
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Låst pris 1-3 år • Trygghet • Förutsägbara kostnader
            </div>
          </button>
        </div>
        
        <button
          onClick={onClose}
          style={{
            background: 'rgba(148, 163, 184, 0.2)',
            color: '#64748b',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12,
            cursor: 'pointer',
            marginTop: 8,
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
          }}
        >
          Nej tack, jag tänker mig för
        </button>
      </div>
    </div>
  );
} 
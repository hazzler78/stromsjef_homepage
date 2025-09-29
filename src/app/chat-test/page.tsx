"use client";

import React from 'react';
import MobileChat from '@/components/MobileChat';

export default function ChatTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Mobil Chatt Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Testa den mobila chatt-funktionen
          </h2>
          <p className="text-gray-600 mb-4">
            Klicka på chatt-bubblan längst ner till höger för att testa funktionaliteten.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Funktioner att testa:</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Chatt-bubbla som fast knapp längst ner-höger</li>
                <li>Smidig glidning upp från botten</li>
                <li>Tangentbordsanpassning på mobil</li>
                <li>Scrollbar innehåll vid behov</li>
                <li>Safe area support för iPhone notch</li>
                <li>Responsiv design</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Testinstruktioner:</h3>
              <ol className="list-decimal list-inside text-green-800 space-y-1">
                <li>Öppna Chrome DevTools (F12)</li>
                <li>Växla till mobilvy (iPhone 14 eller liknande)</li>
                <li>Klicka på chatt-bubblan</li>
                <li>Testa att skriva meddelanden</li>
                <li>Testa tangentbordet genom att klicka i input-fältet</li>
                <li>Kontrollera att input-fältet inte överlappas av tangentbordet</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Teknisk information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Använda teknologier:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>React hooks (useState, useEffect, useRef)</li>
                <li>Visual Viewport API för tangentbordsdetektering</li>
                <li>CSS transitions och transforms</li>
                <li>Safe area insets för iPhone</li>
                <li>Responsive design med media queries</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">CSS-funktioner:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Glassmorphism-effekter</li>
                <li>Backdrop-filter för blur-effekter</li>
                <li>CSS Grid och Flexbox</li>
                <li>Custom properties (CSS variables)</li>
                <li>Accessibility support (reduced motion, high contrast)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Chat Component */}
      <MobileChat />
    </div>
  );
}

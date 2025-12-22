"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

const ADMIN_PASSWORD = "grodan2025";

const adminSections = [
  {
    title: "Hero A/B Analytics",
    description: "Analysera A/B-test för hero-sektionen (huvudrubrik)",
    href: "/admin/hero-analytics",
    icon: "📊",
    color: "bg-blue-500",
    category: "analytics"
  },
  {
    title: "Form Analytics",
    description: "Statistik över alla formulärinlämningar på hemsidan",
    href: "/admin/form-analytics",
    icon: "📝",
    color: "bg-indigo-500",
    category: "analytics"
  },
  {
    title: "Banner Analytics", 
    description: "Analysera A/B-test för AI-kalkylator banner",
    href: "/admin/banner-clicks",
    icon: "🎯",
    color: "bg-green-500",
    category: "analytics"
  },
  {
    title: "Invoices",
    description: "Hantera fakturor och OCR-analyser",
    href: "/admin/invoices",
    icon: "🧾",
    color: "bg-purple-500",
    category: "content"
  },
  {
    title: "Reminders",
    description: "Hantera påminnelser och notifikationer",
    href: "/admin/reminders",
    icon: "⏰",
    color: "bg-orange-500",
    category: "content"
  },
  {
    title: "Chat Logs",
    description: "Visa chatthistorik och AI-konversationer",
    href: "/admin/chatlog",
    icon: "💬",
    color: "bg-pink-500",
    category: "content"
  },
  {
    title: "Chat Klick",
    description: "Spåra klick från GrokChat-komponenten (Elge)",
    href: "/admin/chat-clicks",
    icon: "🖱️",
    color: "bg-purple-500",
    category: "analytics"
  },
  {
    title: "AI Kunskapsbas",
    description: "Hantera AI-chattens kunskap, kampanjer och leverantörer",
    href: "/admin/knowledge",
    icon: "🧠",
    color: "bg-emerald-500",
    category: "ai"
  },
  {
    title: "Kontraktsklick",
    description: "Spåra klick på Rörligt/Fastpris från AI-användare",
    href: "/admin/contract-clicks",
    icon: "📈",
    color: "bg-cyan-500",
    category: "analytics"
  },
  {
    title: "Delade länkar",
    description: "Hantera kort som delats via Telegram (redigera/ta bort)",
    href: "/admin/shared-cards",
    icon: "🔗",
    color: "bg-teal-500",
    category: "content"
  },
  {
    title: "Elavtal",
    description: "Hantera elavtal och priser för alla leverantörer",
    href: "/admin/plans",
    icon: "⚡",
    color: "bg-yellow-500",
    category: "pricing"
  },
  {
    title: "Bedriftsavtal",
    description: "Hantera leverantörer för företagsavtal",
    href: "/admin/business-plans",
    icon: "🏢",
    color: "bg-blue-600",
    category: "pricing"
  },
  {
    title: "Forbrukerrådet Priser",
    description: "Visa och hantera priser från Forbrukerrådets strømprisportal",
    href: "/admin/forbrukerradet-prices",
    icon: "📊",
    color: "bg-red-500",
    category: "pricing"
  },
  {
    title: "Bill Analyses",
    description: "Detaljerad analys av fakturor och kostnader från AI-analysen",
    href: "/admin/bill-analyses",
    icon: "📋",
    color: "bg-violet-500",
    category: "analytics"
  },
  {
    title: "Funnel Analytics",
    description: "Konverteringsstatistik från sidvisning till kontraktsklick",
    href: "/admin/funnel",
    icon: "🔄",
    color: "bg-amber-500",
    category: "analytics"
  },
  {
    title: "Seed Plans",
    description: "Verktyg för att fylla databasen med testdata för elavtal",
    href: "/admin/plans/seed",
    icon: "🌱",
    color: "bg-lime-500",
    category: "tools"
  },
  {
    title: "Chat Popup",
    description: "Hantera Elge popup-meddelandet som visas när chatten öppnas",
    href: "/admin/chat-popup",
    icon: "💬",
    color: "bg-blue-500",
    category: "content"
  }
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true);
    }
  }, []);

  // Filter sections based on search and category
  const filteredSections = adminSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'Alla', icon: '🔍' },
    { value: 'analytics', label: 'Analytics', icon: '📊' },
    { value: 'content', label: 'Innehåll', icon: '📝' },
    { value: 'ai', label: 'AI', icon: '🧠' },
    { value: 'pricing', label: 'Priser', icon: '💰' },
    { value: 'tools', label: 'Verktyg', icon: '🛠️' }
  ];

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem('admin_authed', 'true');
      setError('');
    } else {
      setError('Fel lösenord!');
    }
  }

  if (!authed) {
    return (
      <div style={{ 
        maxWidth: 400, 
        margin: '4rem auto', 
        padding: 24, 
        border: '1px solid #e5e7eb', 
        borderRadius: 12,
        background: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: 16, textAlign: 'center' }}>Admininloggning</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Lösenord"
            style={{ 
              width: '100%', 
              padding: 12, 
              fontSize: 16, 
              marginBottom: 12, 
              borderRadius: 8, 
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box'
            }}
            autoFocus
          />
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: 12, 
              fontSize: 16, 
              borderRadius: 8, 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Logga in
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '2rem auto', 
      padding: 24,
      minHeight: '100vh'
    }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 48,
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: 8,
          fontWeight: 700
        }}>
          🛠️ Admin Dashboard
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          opacity: 0.9,
          margin: 0
        }}>
          Hantera och analysera Elchef.se
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        marginBottom: 32,
        padding: 20,
        background: 'white',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.2rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Sök funktioner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              outline: 'none'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                padding: '4px 8px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Rensa
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>Kategorier:</span>
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                border: '1px solid #d1d5db',
                borderRadius: 20,
                background: selectedCategory === category.value ? 'var(--primary)' : 'white',
                color: selectedCategory === category.value ? 'white' : '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Visar {filteredSections.length} av {adminSections.length} funktioner
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24
      }}>
        {filteredSections.map((section, index) => (
          <Link 
            key={index} 
            href={section.href}
            style={{ 
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 16
              }}>
                <div style={{
                  fontSize: '2rem',
                  marginRight: 12
                }}>
                  {section.icon}
                </div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#1f2937'
                }}>
                  {section.title}
                </h3>
              </div>
              <p style={{
                margin: 0,
                color: '#6b7280',
                lineHeight: 1.5,
                flex: 1
              }}>
                {section.description}
              </p>
              <div style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                color: 'var(--primary)',
                fontWeight: 500
              }}>
                Öppna →
              </div>
            </div>
          </Link>
        ))}
        
        {/* No Results Message */}
        {filteredSections.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280',
            background: '#f9fafb',
            borderRadius: 12,
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Inga funktioner hittades</h3>
            <p style={{ margin: 0 }}>
              Prova att ändra söktermen eller välj en annan kategori
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              style={{
                marginTop: '1rem',
                padding: '8px 16px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              Rensa alla filter
            </button>
          </div>
        )}
      </div>

      <div style={{
        marginTop: 48,
        padding: 24,
        background: '#f9fafb',
        borderRadius: 12,
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>💡 Snabbtips</h3>
        <ul style={{ 
          margin: 0, 
          paddingLeft: 20,
          color: '#6b7280',
          lineHeight: 1.6
        }}>
          <li>Använd datumfiltren för att analysera specifika perioder</li>
          <li>Exportera data till CSV för djupare analys</li>
          <li>Jämför CTR (Click-Through Rate) mellan varianter</li>
          <li>Spåra användarbeteende över tid</li>
          <li>Uppdatera AI-chattens kunskap via kunskapsbasen</li>
          <li>Hantera aktiva kampanjer och leverantörer</li>
        </ul>
      </div>
    </div>
  );
}

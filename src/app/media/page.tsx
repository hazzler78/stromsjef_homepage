"use client";

import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';


const Section = styled.section`
  padding: var(--section-spacing) 0;
  background: transparent;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255,255,255,0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow-light);
  padding: 3rem 2rem;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
`;

const Lead = styled.p`
  font-size: 1.2rem;
  color: var(--gray-700);
  margin-bottom: 2rem;
`;

const SubTitle = styled.h3`
  font-size: 1.3rem;
  margin: 2.5rem 0 1.5rem 0;
  color: var(--primary-dark);
  font-weight: 700;
  position: relative;
  padding-bottom: 0.5rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    border-radius: 2px;
  }
`;

const PageBackground = styled.div`
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(120deg, rgba(0,106,167,0.10) 0%, rgba(254,204,0,0.10) 100%);
  padding: 0;
`;

// Nya komponenter för kort-design
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2.5rem;
  }
`;

const MediaCard = styled(Link)<{ isExpanded: boolean }>`
  background: rgba(255,255,255,0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow-light);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: block;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--glass-shadow-heavy);
    border-color: rgba(0, 106, 167, 0.3);
    text-decoration: none;
    color: inherit;
  }
  
  ${props => props.isExpanded && `
    transform: translateY(-2px);
    box-shadow: var(--glass-shadow-heavy);
    border-color: var(--primary);
  `}
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
`;

const CardTitle = styled.h2`
  font-size: 1.4rem;
  margin: 0 0 0.5rem 0;
  color: var(--primary);
  line-height: 1.3;
  
  @media (max-width: 600px) {
    font-size: 1.2rem;
  }
`;

const CardExcerpt = styled.p`
  color: var(--gray-600);
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--gray-500);
`;

const CardTag = styled.span`
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
`;

const ExpandIcon = styled.div`
  margin-left: auto;
  
  svg {
    width: 20px;
    height: 20px;
    color: var(--primary);
  }
`;

// Nya komponenter för sök och filter
const SearchContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 106, 167, 0.1);
  }
  
  &::placeholder {
    color: var(--gray-600);
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: var(--radius-full);
  background: ${props => props.active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.active ? 'white' : 'var(--gray-700)'};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  
  &:hover {
    background: ${props => props.active ? 'var(--primary-dark)' : 'rgba(0, 106, 167, 0.1)'};
    transform: translateY(-1px);
  }
`;

const MediaImage = styled.div<{ imageUrl?: string }>`
  width: 100%;
  height: 200px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, var(--primary), var(--secondary))'};
  background-size: cover;
  background-position: center;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 32, 91, 0.3), rgba(186, 12, 47, 0.3));
  }
`;

const MediaTypeIcon = styled.div<{ type: string }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  
  svg {
    width: 20px;
    height: 20px;
    color: var(--primary);
  }
`;

const ReadTime = styled.span`
  font-size: 0.85rem;
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(135deg, var(--secondary), var(--secondary-dark));
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: var(--gray-600);
  
  h3 {
    margin-bottom: 1rem;
    color: var(--gray-700);
  }
  
  p {
    margin-bottom: 0;
  }
`;

// Social sharing komponenter
const ShareContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${MediaCard}:hover & {
    opacity: 1;
  }
`;

const ShareButton = styled.button<{ platform: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: ${props => {
    switch (props.platform) {
      case 'facebook': return '#1877F2';
      case 'twitter': return '#1DA1F2';
      case 'linkedin': return '#0077B5';
      case 'copy': return 'var(--gray-600)';
      default: return 'var(--primary)';
    }
  }};
  color: white;
  
  &:hover {
    transform: translateY(-2px) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ShareIcon = ({ platform }: { platform: string }) => {
  const icons = {
    facebook: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    twitter: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    copy: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    )
  };
  
  return icons[platform as keyof typeof icons] || icons.copy;
};

// Funktion för att kategorisera innehåll baserat på URL-domän
const categorizeContent = (url: string, title: string, summary: string) => {
  const domain = new URL(url).hostname.toLowerCase();
  const content = `${title} ${summary}`.toLowerCase();
  
  // Kategorisering baserat på domän och innehåll
  if (domain.includes('youtube.com') || domain.includes('youtu.be') || content.includes('video')) {
    return { type: 'video', tag: 'Video', icon: 'video' };
  }
  if (domain.includes('twitter.com') || domain.includes('x.com') || content.includes('tweet')) {
    return { type: 'social', tag: 'Social', icon: 'twitter' };
  }
  if (domain.includes('linkedin.com') || content.includes('linkedin')) {
    return { type: 'professional', tag: 'Professionell', icon: 'linkedin' };
  }
  if (domain.includes('news') || domain.includes('aftenposten') || domain.includes('vg.no') || 
      domain.includes('nrk.no') || content.includes('nyhet') || content.includes('rapport')) {
    return { type: 'news', tag: 'Nyheter', icon: 'news' };
  }
  if (domain.includes('blog') || domain.includes('medium.com') || content.includes('artikkel') || 
      content.includes('analyse') || content.includes('guide')) {
    return { type: 'article', tag: 'Artikkel', icon: 'article' };
  }
  if (domain.includes('github.com') || content.includes('kode') || content.includes('utvikling')) {
    return { type: 'tech', tag: 'Teknologi', icon: 'code' };
  }
  
  // Standard fallback
  return { type: 'link', tag: 'Lenke', icon: 'link' };
};

// Funktion för att beräkna läsningstid baserat på textlängd
const calculateReadTime = (text: string) => {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min läsning`;
};

// Ikoner för olika mediatyper
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M8 5v14l11-7z" fill="currentColor"/>
  </svg>
);

const ArticleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NewsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M4 11a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 4a16 16 0 0 1 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5" cy="19" r="1" fill="currentColor"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16,18 22,12 16,6" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="8,6 2,12 8,18" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const getMediaIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <VideoIcon />;
    case 'article':
      return <ArticleIcon />;
    case 'news':
      return <NewsIcon />;
    case 'social':
      return <TwitterIcon />;
    case 'professional':
      return <LinkedInIcon />;
    case 'tech':
      return <CodeIcon />;
    case 'link':
      return <LinkIcon />;
    default:
      return <LinkIcon />;
  }
};

export default function Media() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sharedCards, setSharedCards] = useState<any[]>([]);
  const [filteredCards, setFilteredCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hämta delade kort från API
  const fetchSharedCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shared-cards?limit=50');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      // Bearbeta kort med kategorisering och läsningstid
      const processedCards = data.items.map((card: any) => {
        const category = categorizeContent(card.url, card.title, card.summary);
        const readTime = calculateReadTime(`${card.title} ${card.summary}`);
        
        return {
          ...card,
          type: category.type,
          tag: category.tag,
          icon: category.icon,
          readTime,
          href: card.url, // Använd extern URL istället för intern route
          featured: false, // Kan läggas till senare baserat på popularitet
          date: new Date(card.created_at).getFullYear().toString()
        };
      });
      
      setSharedCards(processedCards);
      setFilteredCards(processedCards);
    } catch (err) {
      setError('Kunde inte ladda innehåll');
      console.error('Error fetching shared cards:', err);
    } finally {
      setLoading(false);
    }
  };

  // Social sharing funktioner
  const shareToSocial = (platform: string, card: any) => {
    const url = card.url; // Använd den externa URL:en direkt
    const title = card.title;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          // Visa en kort bekräftelse
          const button = document.querySelector(`[data-share="copy-${card.id}"]`) as HTMLElement;
          if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '✓';
            setTimeout(() => {
              button.innerHTML = originalText;
            }, 2000);
          }
        });
        break;
    }
  };

  // Hämta data vid komponentens mount
  useEffect(() => {
    fetchSharedCards();
  }, []);

  // Filtrera kort baserat på sökterm och filter
  useEffect(() => {
    let filtered = sharedCards;

    // Filtrera baserat på sökterm
    if (searchTerm) {
      filtered = filtered.filter(card =>
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrera baserat på typ
    if (activeFilter !== 'all') {
      filtered = filtered.filter(card => card.type === activeFilter);
    }

    setFilteredCards(filtered);
  }, [searchTerm, activeFilter, sharedCards]);

  return (
    <PageBackground>
      <Section>
        <Container>
          <Title>Media</Title>
          <Lead>
            <b>Vi jobber aktivt med å spre kunnskap om energibesparing og bærekraftige strømavtaler.</b>
          </Lead>
          <p>
            Les mer om vårt arbeid og våre siste nyheter, eller oppdag våre rapporter og analyser om strømmarkedet.
          </p>

          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Sök artiklar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FilterContainer>
              <FilterButton
                active={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')}
              >
                Alla
              </FilterButton>
              <FilterButton
                active={activeFilter === 'video'}
                onClick={() => setActiveFilter('video')}
              >
                Video
              </FilterButton>
              <FilterButton
                active={activeFilter === 'article'}
                onClick={() => setActiveFilter('article')}
              >
                Artiklar
              </FilterButton>
              <FilterButton
                active={activeFilter === 'news'}
                onClick={() => setActiveFilter('news')}
              >
                Nyheter
              </FilterButton>
              <FilterButton
                active={activeFilter === 'social'}
                onClick={() => setActiveFilter('social')}
              >
                Social
              </FilterButton>
              <FilterButton
                active={activeFilter === 'tech'}
                onClick={() => setActiveFilter('tech')}
              >
                Teknologi
              </FilterButton>
            </FilterContainer>
          </SearchContainer>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <p>Laddar innehåll...</p>
            </div>
          ) : error ? (
            <NoResults>
              <h3>Fel vid laddning</h3>
              <p>{error}</p>
            </NoResults>
          ) : filteredCards.length === 0 ? (
            <NoResults>
              <h3>Inga artiklar hittades</h3>
              <p>Prova att ändra dina söktermer eller filter.</p>
            </NoResults>
          ) : (
            <CardsGrid>
              {filteredCards.map((card) => (
                <MediaCard 
                  key={card.id} 
                  href={card.href}
                  isExpanded={false}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MediaImage>
                    {card.featured && <FeaturedBadge>Utvald</FeaturedBadge>}
                    <MediaTypeIcon type={card.type}>
                      {getMediaIcon(card.type)}
                    </MediaTypeIcon>
                  </MediaImage>
                  <CardHeader>
                    <CardTitle>{card.title}</CardTitle>
                    <CardExcerpt>{card.summary}</CardExcerpt>
                    <CardMeta>
                      <CardTag>{card.tag}</CardTag>
                      <ReadTime>
                        <ClockIcon />
                        {card.readTime}
                      </ReadTime>
                      <span>{card.date}</span>
                      <ExpandIcon>
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </ExpandIcon>
                    </CardMeta>
                    <ShareContainer>
                      <ShareButton 
                        platform="facebook" 
                        onClick={(e) => {
                          e.preventDefault();
                          shareToSocial('facebook', card);
                        }}
                        title="Dela på Facebook"
                      >
                        <ShareIcon platform="facebook" />
                      </ShareButton>
                      <ShareButton 
                        platform="twitter" 
                        onClick={(e) => {
                          e.preventDefault();
                          shareToSocial('twitter', card);
                        }}
                        title="Dela på Twitter"
                      >
                        <ShareIcon platform="twitter" />
                      </ShareButton>
                      <ShareButton 
                        platform="linkedin" 
                        onClick={(e) => {
                          e.preventDefault();
                          shareToSocial('linkedin', card);
                        }}
                        title="Dela på LinkedIn"
                      >
                        <ShareIcon platform="linkedin" />
                      </ShareButton>
                      <ShareButton 
                        platform="copy" 
                        onClick={(e) => {
                          e.preventDefault();
                          shareToSocial('copy', card);
                        }}
                        title="Kopiera länk"
                        data-share={`copy-${card.id}`}
                      >
                        <ShareIcon platform="copy" />
                      </ShareButton>
                    </ShareContainer>
                  </CardHeader>
                </MediaCard>
              ))}
            </CardsGrid>
          )}

        </Container>
      </Section>
    </PageBackground>
  );
} 
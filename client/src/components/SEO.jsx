import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component - Updates meta tags dynamically for each page
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - SEO keywords
 * @param {string} props.image - OG image URL
 * @param {string} props.type - OG type (website, article, etc.)
 */
const SEO = ({ 
  title = 'Utsavlokam - Book Event Services',
  description = 'Find and book the best event services for your special occasions. Browse photographers, caterers, venues, decorators, and more.',
  keywords = 'event booking, wedding services, photography, catering, event venues',
  image = 'https://ik.imagekit.io/jezimf2jod/WhatsApp%20Image%202025-09-11%20at%201.01.04%20PM.jpeg',
  type = 'website'
}) => {
  const location = useLocation();
  const fullUrl = `https://utsavlokam.com${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Primary meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:type', type, true);

    // Twitter tags
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('twitter:url', fullUrl, true);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

  }, [title, description, keywords, image, type, fullUrl]);

  return null; // This component doesn't render anything
};

export default SEO;

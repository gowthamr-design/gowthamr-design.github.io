import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [counterTriggered, setCounterTriggered] = useState(false);
  const [counters, setCounters] = useState({
    events: 0,
    satisfaction: 0,
    specialists: 0,
    experience: 0,
  });

  const heroCardRef = useRef(null);
  const metricsSectionRef = useRef(null);
  const masterContainerRef = useRef(null);

  // 1. Scroll Progress Tracking (Background images remain completely static)
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. IntersectionObserver for Reveal Animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach((el) => revealObserver.observe(el));

    return () => {
      revealElements.forEach((el) => revealObserver.unobserve(el));
    };
  }, []);

  // 3. Metrics Animated Counters
  useEffect(() => {
    const targetMetrics = metricsSectionRef.current;
    if (!targetMetrics) return;

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !counterTriggered) {
            setCounterTriggered(true);

            const duration = 1800; // ms
            const startTime = performance.now();

            const updateCounters = (currentTime) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease-out expo
              const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

              setCounters({
                events: Math.floor(easeOut * 1200),
                satisfaction: Math.floor(easeOut * 98),
                specialists: Math.floor(easeOut * 50),
                experience: Math.floor(easeOut * 15),
              });

              if (progress < 1) {
                requestAnimationFrame(updateCounters);
              }
            };

            requestAnimationFrame(updateCounters);
          }
        });
      },
      { threshold: 0.25 }
    );

    counterObserver.observe(targetMetrics);
    return () => counterObserver.disconnect();
  }, [counterTriggered]);

  // 4. Hero 3D Carousel State, Auto-play & Fullscreen HD Lightbox
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [heroLightboxOpen, setHeroLightboxOpen] = useState(false);
  const [heroLightboxIndex, setHeroLightboxIndex] = useState(0);

  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
      tag: 'Luxury Weddings',
      title: 'The Grand Imperial Wedding',
      desc: 'Bespoke grand mandap setups, ethereal floral canopies & regal crystal chandeliers.',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=85',
      tag: 'Corporate Summits',
      title: 'Global Leadership Summit',
      desc: 'Cutting-edge panoramic staging, intelligent beam lighting & executive keynote production.',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1600&q=85',
      tag: 'Milestone Celebrations',
      title: 'Opulent Golden Soirée',
      desc: 'Luxe marquee illuminations, artisanal decor arrangements & VIP celebratory hosting.',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1600&q=85',
      tag: 'Concerts & Festivals',
      title: 'Electrifying Arena Stage',
      desc: 'Concert line-array acoustics, dynamic synchronized laser fixtures & stadium energy.',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1545232979-fbf69c362143?auto=format&fit=crop&w=1600&q=85',
      tag: 'Destination Galas',
      title: 'Ethereal Sunset Pavilion',
      desc: 'Panoramic beachfront florals, fairy-light canopies & timeless romantic elegance.',
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=85',
      tag: 'Royal Banquets',
      title: 'Prestige Ballroom Honors',
      desc: 'Black-tie dining staging, majestic ceiling drapery & world-class banquet coordination.',
    },
  ];

  // Auto-slide every 3.8s with pause on hover/interaction & pause when lightbox open
  useEffect(() => {
    if (isCarouselPaused || heroLightboxOpen) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isCarouselPaused, heroLightboxOpen, heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Fullscreen HD Lightbox handlers for Hero gallery
  const openHeroLightbox = (idx) => {
    setHeroLightboxIndex(idx);
    setHeroLightboxOpen(true);
  };

  const closeHeroLightbox = () => {
    setHeroLightboxOpen(false);
  };

  const nextHeroLightbox = () => {
    setHeroLightboxIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevHeroLightbox = () => {
    setHeroLightboxIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Lightbox keyboard controls (ESC, ArrowLeft, ArrowRight) + body scroll lock
  useEffect(() => {
    if (!heroLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeHeroLightbox();
      else if (e.key === 'ArrowRight') nextHeroLightbox();
      else if (e.key === 'ArrowLeft') prevHeroLightbox();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [heroLightboxOpen, heroSlides.length]);

  // Touch Swipe for Hero Lightbox
  const heroLbTouchStartX = useRef(0);
  const heroLbTouchEndX = useRef(0);

  const handleHeroLbTouchStart = (e) => {
    heroLbTouchStartX.current = e.touches[0].clientX;
  };
  const handleHeroLbTouchMove = (e) => {
    heroLbTouchEndX.current = e.touches[0].clientX;
  };
  const handleHeroLbTouchEnd = () => {
    if (!heroLbTouchStartX.current || !heroLbTouchEndX.current) return;
    const diff = heroLbTouchStartX.current - heroLbTouchEndX.current;
    if (diff > 50) nextHeroLightbox();
    else if (diff < -50) prevHeroLightbox();
    heroLbTouchStartX.current = 0;
    heroLbTouchEndX.current = 0;
  };

  // Touch Swipe for Hero Mobile
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // 5. Event Stories (Fast Horizontal Event Gallery + Fullscreen HD Lightbox)
  const [showcaseSlide, setShowcaseSlide] = useState(0);
  const [isShowcasePaused, setIsShowcasePaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragDistRef = useRef(0);

  const showcaseSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1800&q=85',
      tag: 'Royal Wedding',
      title: 'The Grand Regal Symphony',
      desc: 'An opulent fairytale wedding banquet bathed in warm amber chandeliers and celestial floral cascades.',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1800&q=85',
      tag: 'Corporate Gala',
      title: 'Global Leadership Summit',
      desc: 'Cutting-edge panoramic staging, intelligent beam lighting, and executive keynote production.',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1800&q=85',
      tag: 'Milestone Soirée',
      title: 'Golden Jubilee Celebration',
      desc: 'A masterfully curated milestone evening featuring custom artisanal installations and intimate dining.',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1800&q=85',
      tag: 'Live Concert',
      title: 'Acoustic Euphoria Arena',
      desc: 'Electrifying 3,000-seat amphitheater concert with precision line-array acoustics and lasers.',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1800&q=85',
      tag: 'Destination Wedding',
      title: 'Ethereal Shoreline Vows',
      desc: 'Sunset coastal mandap crafted with 10,000 fresh white orchids and shimmering gold mirror walkways.',
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1800&q=85',
      tag: 'Award Night',
      title: 'Prestige Honors Gala',
      desc: 'A black-tie red carpet ceremony celebrating industry luminaries under synchronized golden illuminations.',
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1800&q=85',
      tag: 'Youth Festival',
      title: 'Neon Pulse Carnival',
      desc: 'High-octane electronic celebration with dynamic pyrotechnics, LED wristbands, and VIP hospitality.',
    }
  ];

  // Auto-slide every 2.3 seconds
  useEffect(() => {
    if (isShowcasePaused || lightboxOpen) return;
    const timer = setInterval(() => {
      setShowcaseSlide((prev) => (prev + 1) % showcaseSlides.length);
    }, 2300);
    return () => clearInterval(timer);
  }, [isShowcasePaused, lightboxOpen, showcaseSlides.length]);

  const nextShowcase = () => setShowcaseSlide((prev) => (prev + 1) % showcaseSlides.length);
  const prevShowcase = () => setShowcaseSlide((prev) => (prev - 1 + showcaseSlides.length) % showcaseSlides.length);

  // Mouse Drag handlers for horizontal gallery
  const handleShowcaseMouseDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    dragDistRef.current = 0;
    setDragOffset(0);
  };

  const handleShowcaseMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const diff = e.clientX - startXRef.current;
    dragDistRef.current = diff;
    setDragOffset(diff);
  };

  const handleShowcaseMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (dragDistRef.current < -50) {
      nextShowcase();
    } else if (dragDistRef.current > 50) {
      prevShowcase();
    }
    setDragOffset(0);
  };

  const handleShowcaseMouseLeave = () => {
    if (isDraggingRef.current) {
      handleShowcaseMouseUp();
    }
    setIsShowcasePaused(false);
  };

  // Mobile Touch Swipe handlers for horizontal gallery
  const showcaseTouchStartX = useRef(0);
  const showcaseTouchDeltaX = useRef(0);

  const handleShowcaseTouchStart = (e) => {
    showcaseTouchStartX.current = e.touches[0].clientX;
    showcaseTouchDeltaX.current = 0;
    setIsShowcasePaused(true);
  };

  const handleShowcaseTouchMove = (e) => {
    const diff = e.touches[0].clientX - showcaseTouchStartX.current;
    showcaseTouchDeltaX.current = diff;
    setDragOffset(diff);
  };

  const handleShowcaseTouchEnd = () => {
    setIsShowcasePaused(false);
    if (showcaseTouchDeltaX.current < -45) {
      nextShowcase();
    } else if (showcaseTouchDeltaX.current > 45) {
      prevShowcase();
    }
    setDragOffset(0);
    showcaseTouchStartX.current = 0;
    showcaseTouchDeltaX.current = 0;
  };

  // Lightbox Controls
  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % showcaseSlides.length);
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + showcaseSlides.length) % showcaseSlides.length);
  };

  // Lightbox keyboard controls (ESC, ArrowLeft, ArrowRight) + body scroll lock
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') nextLightbox();
      else if (e.key === 'ArrowLeft') prevLightbox();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, showcaseSlides.length]);

  // Lightbox Touch Swipe handlers
  const lbTouchStartX = useRef(0);
  const lbTouchEndX = useRef(0);

  const handleLightboxTouchStart = (e) => {
    lbTouchStartX.current = e.touches[0].clientX;
  };

  const handleLightboxTouchMove = (e) => {
    lbTouchEndX.current = e.touches[0].clientX;
  };

  const handleLightboxTouchEnd = () => {
    if (!lbTouchStartX.current || !lbTouchEndX.current) return;
    const diff = lbTouchStartX.current - lbTouchEndX.current;
    if (diff > 50) nextLightbox();
    else if (diff < -50) prevLightbox();
    lbTouchStartX.current = 0;
    lbTouchEndX.current = 0;
  };

  // 6. Grand Portfolio / Moments Made Extraordinary (Scroll-Synced Luxury Card Reveal)
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [portfolioProgress, setPortfolioProgress] = useState(0);
  const portfolioSectionRef = useRef(null);

  const occasionCategories = [
    {
      id: 'weddings',
      category: 'Royal Tier',
      title: 'Luxury Weddings & Receptions',
      shortTitle: 'Weddings',
      subtitle: 'Fairytale Mandaps & Timeless Ceremonial Elegance',
      desc: 'Mesmerizing floral mandaps, ethereal lighting, royal banquet dining, and seamless ceremonial hospitality tailored for timeless memories.',
      link: '/packages/high',
      linkLabel: 'Explore Royal Package',
      badge: 'Signature Royal',
      image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=85',
      metrics: '200–2,500+ Guests • Bespoke Staging',
      features: ['Bespoke Floral Mandap Architecture', 'Multi-Cuisine Royal Banquet Service', 'Bridal & Groom VIP Concierge'],
    },
    {
      id: 'corporate',
      category: 'Corporate Elite',
      title: 'Corporate Galas & Summits',
      shortTitle: 'Corporate',
      subtitle: 'Executive Staging & High-Prestige Production',
      desc: 'Cutting-edge AV rigs, executive keynote staging, brand gala banquets, and flawless coordination designed for industry leaders.',
      link: '/packages/medium',
      linkLabel: 'Explore Corporate Package',
      badge: 'Executive Elite',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=85',
      metrics: '50–1,500+ Delegates • Full Broadcast AV',
      features: ['Keynote & Award Gala Staging', 'Ultra-HD LED Backdrops & Sound', 'VIP Hospitality & Registration'],
    },
    {
      id: 'birthdays',
      category: 'Celebration Standard',
      title: 'Birthday & Milestone Anniversaries',
      shortTitle: 'Birthday',
      subtitle: 'Immersive Themes & Vibrant Celebrations',
      desc: 'Joyful thematic balloon styling, illuminated stage backdrops, personalized dessert tables, and engaging live entertainment stalls.',
      link: '/packages/low',
      linkLabel: 'Explore Standard Package',
      badge: 'Festive Classic',
      image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1600&q=85',
      metrics: '30–500+ Guests • Thematic Staging',
      features: ['Custom Thematic Decor & Backdrops', 'Interactive Entertainment & DJ', 'Complete Catering & Cake Setup'],
    },
    {
      id: 'concerts',
      category: 'Live Experience',
      title: 'Concerts & Cultural Festivals',
      shortTitle: 'Concert',
      subtitle: 'High-Impact Sound, Lasers & Live Atmosphere',
      desc: 'Dynamic acoustic sound line-arrays, intelligent laser fixtures, massive stage sets, and professional artist and crowd management.',
      link: '/services',
      linkLabel: 'Explore Live Services',
      badge: 'Live Production',
      image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1600&q=85',
      metrics: '500–10,000+ Attendees • Arena Rigging',
      features: ['Concert-Grade Acoustic Line Arrays', 'Dynamic Intelligent Stage Lighting', 'Live Stage & Artist Logistics'],
    },
  ];

  // Scroll synchronization: directly follows user's scroll with zero delay & natural reverse
  useEffect(() => {
    let ticking = false;

    const handlePortfolioScroll = () => {
      if (!portfolioSectionRef.current) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = portfolioSectionRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const scrollDistance = portfolioSectionRef.current.offsetHeight - windowHeight;
          if (scrollDistance <= 0) {
            ticking = false;
            return;
          }
          const scrolled = -rect.top;
          const progress = Math.max(0, Math.min(1, scrolled / scrollDistance));
          setPortfolioProgress(progress);

          const numCards = occasionCategories.length;
          const targetIndex = Math.min(numCards - 1, Math.floor(progress * numCards * 0.999));
          setPortfolioIndex(targetIndex);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handlePortfolioScroll, { passive: true });
    handlePortfolioScroll(); // initialize on mount
    return () => window.removeEventListener('scroll', handlePortfolioScroll);
  }, [occasionCategories.length]);

  // Click tab to smoothly scroll directly to that card
  const scrollToPortfolioCard = (idx) => {
    if (!portfolioSectionRef.current) return;
    const rect = portfolioSectionRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const sectionTop = scrollTop + rect.top;
    const scrollDistance = portfolioSectionRef.current.offsetHeight - window.innerHeight;
    const targetScroll = sectionTop + (idx / (occasionCategories.length - 1)) * scrollDistance + 15;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  // 7. Hero Card 3D Magnetic Parallax Tilt
  const handleMouseMove = (e) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setCardTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCardTilt({ x: 0, y: 0 });
  };

  // 8. Client Reviews Horizontal Slider
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [isReviewsPaused, setIsReviewsPaused] = useState(false);

  const reviewsList = [
    {
      id: 1,
      quote: "The Royal Wedding production by Banana Brothers exceeded every expectation our family had. The celestial floral entrance and seamless banquet coordination made our big day truly unforgettable!",
      author: "Priya & Rajesh",
      role: "Grand Palace Wedding, Chennai",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      tag: "Royal Tier Celebration"
    },
    {
      id: 2,
      quote: "Banana Brothers managed our annual corporate leadership summit for 500+ attendees with surgical perfection. The 4K LED backdrops and live broadcast sound were truly world-class.",
      author: "Arun Karthik",
      role: "Managing Director, Apex Innovations",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
      tag: "Corporate Summit Gala"
    },
    {
      id: 3,
      quote: "The customized theme birthday for our son was a monumental hit! The illuminated backdrops, interactive stalls, and catering hospitality blew our guests away.",
      author: "Deepa Sundaram",
      role: "Milestone Celebration, Chennai",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
      tag: "Theme Milestone Bash"
    },
    {
      id: 4,
      quote: "From initial stage acoustics to crowd management for 2,000+ festival fans, Banana Brothers executed our cultural concert seamlessly without a single hitch.",
      author: "Vikramaditya & Sunita",
      role: "Cultural Arts Festival Board",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
      tag: "Live Festival Production"
    }
  ];

  useEffect(() => {
    if (isReviewsPaused) return;
    const timer = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % reviewsList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isReviewsPaused, reviewsList.length]);

  const nextReview = () => {
    setActiveReviewIndex((prev) => (prev + 1) % reviewsList.length);
  };

  const prevReview = () => {
    setActiveReviewIndex((prev) => (prev - 1 + reviewsList.length) % reviewsList.length);
  };

  return (
    <div className="home-master-wrapper" ref={masterContainerRef}>
      {/* Scroll Progress Bar at the Top */}
      <div className="home-scroll-progress-container">
        <div
          className="home-scroll-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Ambient Parallax Glowing Orbs */}
      <div className="ambient-glow-orb orb-1"></div>
      <div className="ambient-glow-orb orb-2"></div>
      <div className="ambient-glow-orb orb-3"></div>

      {/* =========================================================================
          1. ENHANCED HERO SECTION
          ========================================================================= */}
      <section className="hero-enhanced">
        <div className="bg-shape"></div>

        {/* Left Content Column */}
        <div className="hero-left-col reveal-left">
          <div className="hero-badge-pill">
            <span className="badge-sparkle">✦</span>
            <span>Banana Brothers Events</span>
          </div>

          <h1 className="hero-main-title">
            Where <span className="gradient-text">Moments</span> Become <span className="gradient-text">Memories.</span>
          </h1>

          <p className="hero-lead-text">
            Elevate your celebrations with Banana Brothers. From bespoke premium packages to seamless online booking, we turn your special moments into unforgettable luxury experiences.
          </p>

          <div className="hero-cta-wrapper">
            <Link to="/packages" className="btn-luxury-primary">
              <span>Explore Packages</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>

            <Link to="/packages" className="btn-luxury-outline">
              <span>Book Event</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </Link>
          </div>

          {/* Social Proof Trust Snippet */}
          <div className="hero-trust-proof">
            <div className="trust-avatar-group">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Client Avatar"
                className="trust-avatar"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Client Avatar"
                className="trust-avatar"
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                alt="Client Avatar"
                className="trust-avatar"
              />
            </div>
            <div className="trust-text-box">
              <div className="trust-rating-stars">★★★★★</div>
              <span className="trust-label">Rated 4.9/5 by 1,200+ Celebrants</span>
            </div>
          </div>
        </div>

        {/* Right Column: Luxury 3D Floating Gallery */}
        <div className="hero-right-col reveal-right">
          <div className="hero-carousel-halo"></div>

          <div
            className="hero-3d-stage"
            ref={heroCardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: isHovered
                ? `perspective(1400px) rotateX(${cardTilt.x * 0.35}deg) rotateY(${cardTilt.y * 0.35}deg)`
                : 'perspective(1400px)',
              transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          >
            {/* Left Nav Arrow */}
            <button
              className="hero-3d-nav-btn prev-btn"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous Slide"
              title="Previous Event"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* 3D Floating Cards Track */}
            <div className="hero-3d-cards-track">
              {heroSlides.map((slide, idx) => {
                const total = heroSlides.length;
                const diff = (idx - currentSlide + total) % total;
                let cardClass = 'hidden';

                if (diff === 0) {
                  cardClass = 'active';
                } else if (diff === 1) {
                  cardClass = 'next';
                } else if (diff === total - 1) {
                  cardClass = 'prev';
                } else if (diff === 2) {
                  cardClass = 'next-2';
                } else if (diff === total - 2) {
                  cardClass = 'prev-2';
                }

                return (
                  <div
                    key={slide.id}
                    className={`hero-3d-card ${cardClass}`}
                    onClick={() => {
                      if (diff === 0) {
                        openHeroLightbox(idx);
                      } else {
                        setCurrentSlide(idx);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Event ${slide.title} — ${cardClass === 'active' ? 'Click to open Fullscreen HD' : 'Click to bring to center'}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (diff === 0) openHeroLightbox(idx);
                        else setCurrentSlide(idx);
                      }
                    }}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="hero-3d-img"
                      loading={idx === currentSlide ? "eager" : "lazy"}
                    />
                    <div className="hero-3d-overlay"></div>

                    {/* Top Pill / Badge */}
                    <div className="hero-3d-card-top">
                      <span className="hero-3d-tag-pill">
                        <span className="badge-sparkle">✦</span>
                        <span>{slide.tag}</span>
                      </span>
                      {cardClass === 'active' && (
                        <div className="hero-3d-top-actions">
                          <button
                            type="button"
                            className="hero-3d-fullscreen-trigger"
                            onClick={(e) => {
                              e.stopPropagation();
                              openHeroLightbox(idx);
                            }}
                            title="Open Fullscreen HD"
                            aria-label="Open Fullscreen HD"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <polyline points="9 21 3 21 3 15"></polyline>
                              <line x1="21" y1="3" x2="14" y2="10"></line>
                              <line x1="3" y1="21" x2="10" y2="14"></line>
                            </svg>
                            <span className="trigger-label">HD</span>
                          </button>
                          <span className="hero-3d-counter-pill">
                            <span className="counter-current">{String(idx + 1).padStart(2, '0')}</span>
                            <span className="counter-sep">/</span>
                            <span className="counter-total">{String(total).padStart(2, '0')}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Caption Info (Revealed on active card) */}
                    <div className="hero-3d-card-bottom">
                      <div className="hero-3d-caption">
                        <h3 className="hero-3d-title">{slide.title}</h3>
                        <p className="hero-3d-desc">{slide.desc}</p>
                      </div>
                      <div className="hero-3d-action-row">
                        <button
                          type="button"
                          className="hero-3d-view-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openHeroLightbox(idx);
                          }}
                          title="View Fullscreen HD"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                          </svg>
                          <span>HD Lightbox</span>
                        </button>
                        <Link
                          to="/packages"
                          className="hero-3d-card-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Explore</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Nav Arrow */}
            <button
              className="hero-3d-nav-btn next-btn"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next Slide"
              title="Next Event"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Bottom Dots Indicator */}
            <div className="hero-3d-dots">
              {heroSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  className={`hero-3d-dot ${idx === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  title={slide.title}
                />
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            HERO FULLSCREEN HD LIGHTBOX MODAL
            ========================================================================= */}
        {heroLightboxOpen && (
          <div
            className="hero-lightbox-overlay"
            onClick={closeHeroLightbox}
            onTouchStart={handleHeroLbTouchStart}
            onTouchMove={handleHeroLbTouchMove}
            onTouchEnd={handleHeroLbTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-label="Event Fullscreen HD View"
          >
            {/* Ambient Golden Glow Backdrop */}
            <div className="hero-lightbox-ambient-glow" />

            {/* Top Control Bar */}
            <div className="hero-lightbox-topbar" onClick={(e) => e.stopPropagation()}>
              <div className="hero-lightbox-pill">
                <span className="badge-sparkle">✦</span>
                <span>{heroSlides[heroLightboxIndex]?.tag}</span>
                <span className="hero-lightbox-sep">•</span>
                <span className="hero-lightbox-counter">
                  {String(heroLightboxIndex + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
                </span>
              </div>

              <div className="hero-lightbox-top-actions">
                <span className="hero-lightbox-hint">ESC to close • Arrows to navigate</span>
                <button
                  type="button"
                  className="hero-lightbox-close-btn"
                  onClick={closeHeroLightbox}
                  aria-label="Close Fullscreen"
                  title="Close (ESC)"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Central Image Container */}
            <div className="hero-lightbox-center" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="hero-lightbox-arrow prev-arrow"
                onClick={prevHeroLightbox}
                aria-label="Previous Image"
                title="Previous Image (Left Arrow)"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <img
                key={heroSlides[heroLightboxIndex]?.id}
                src={heroSlides[heroLightboxIndex]?.image}
                alt={heroSlides[heroLightboxIndex]?.title}
                className="hero-lightbox-main-img"
              />

              <button
                type="button"
                className="hero-lightbox-arrow next-arrow"
                onClick={nextHeroLightbox}
                aria-label="Next Image"
                title="Next Image (Right Arrow)"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            {/* Bottom Information & CTA Card */}
            <div className="hero-lightbox-bottom" onClick={(e) => e.stopPropagation()}>
              <div className="hero-lightbox-info">
                <h3 className="hero-lightbox-title">{heroSlides[heroLightboxIndex]?.title}</h3>
                <p className="hero-lightbox-desc">{heroSlides[heroLightboxIndex]?.desc}</p>
              </div>
              <div className="hero-lightbox-cta-group">
                <Link to="/packages" className="hero-lightbox-cta" onClick={closeHeroLightbox}>
                  <span>Explore Packages</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Smooth Scroll Prompt */}
        <a href="#metrics-section" className="hero-scroll-prompt">
          <div className="mouse-scroll-icon"></div>
          <span>Scroll to Discover</span>
        </a>
      </section>

      {/* =========================================================================
          2. LIVE METRICS & IMPACT COUNTERS (Triggered on Scroll)
          ========================================================================= */}
      <section
        id="metrics-section"
        ref={metricsSectionRef}
        className="metrics-section reveal delay-100"
      >
        <div className="metrics-glass-card">
          <div className="metric-item">
            <div className="metric-number-wrapper">
              <span>{counters.events}</span>
              <span className="metric-suffix">+</span>
            </div>
            <span className="metric-label">Events Successfully Executed</span>
          </div>

          <div className="metric-item">
            <div className="metric-number-wrapper">
              <span>{counters.satisfaction}</span>
              <span className="metric-suffix">%</span>
            </div>
            <span className="metric-label">Client Satisfaction Rate</span>
          </div>

          <div className="metric-item">
            <div className="metric-number-wrapper">
              <span>{counters.specialists}</span>
              <span className="metric-suffix">+</span>
            </div>
            <span className="metric-label">Dedicated Coordinators & Chefs</span>
          </div>

          <div className="metric-item">
            <div className="metric-number-wrapper">
              <span>{counters.experience}</span>
              <span className="metric-suffix">+</span>
            </div>
            <span className="metric-label">Years of Industry Leadership</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. EVENT STORIES (Fast Horizontal Event Gallery + Fullscreen HD Lightbox)
          ========================================================================= */}
      <section className="cinematic-showcase-section">
        <div className="section-header-block reveal">
          <span className="section-tag">Featured Moments</span>
          <h2 className="section-headline">Event Stories</h2>
          <p className="section-subtext">
            Immerse yourself in our finest creations, blending tradition with modern luxury. Click any event to inspect in Fullscreen HD.
          </p>
        </div>

        <div 
          className="event-stories-gallery-container reveal delay-100"
          onMouseEnter={() => setIsShowcasePaused(true)}
          onMouseLeave={handleShowcaseMouseLeave}
          onMouseDown={handleShowcaseMouseDown}
          onMouseMove={handleShowcaseMouseMove}
          onMouseUp={handleShowcaseMouseUp}
          onTouchStart={handleShowcaseTouchStart}
          onTouchMove={handleShowcaseTouchMove}
          onTouchEnd={handleShowcaseTouchEnd}
        >
          {/* Subtle Ambient Golden Glow Behind Active Gallery Card */}
          <div className="gallery-ambient-glow"></div>

          {/* Left Arrow Button */}
          <button 
            className="gallery-nav-btn prev-btn" 
            onClick={(e) => {
              e.stopPropagation();
              prevShowcase();
            }} 
            aria-label="Previous Event"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button 
            className="gallery-nav-btn next-btn" 
            onClick={(e) => {
              e.stopPropagation();
              nextShowcase();
            }} 
            aria-label="Next Event"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Horizontal Gallery Track */}
          <div 
            className={`event-stories-track ${isDraggingRef.current ? 'is-dragging' : ''}`}
            style={{
              transform: `translateX(calc(50% - (${showcaseSlide} * (var(--story-card-w) + var(--story-card-gap)) + (var(--story-card-w) / 2)) + ${dragOffset}px))`,
            }}
          >
            {showcaseSlides.map((slide, idx) => {
              const isActive = idx === showcaseSlide;
              return (
                <div 
                  key={slide.id} 
                  className={`event-story-card ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    if (Math.abs(dragDistRef.current) > 10) return;
                    if (isActive) {
                      openLightbox(idx);
                    } else {
                      setShowcaseSlide(idx);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${slide.title}${isActive ? ' in Fullscreen HD' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (isActive) openLightbox(idx);
                      else setShowcaseSlide(idx);
                    }
                  }}
                >
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className="story-card-img" 
                    loading={Math.abs(idx - showcaseSlide) <= 2 ? "eager" : "lazy"}
                  />
                  <div className="story-card-overlay"></div>

                  {/* Top Bar Badges */}
                  <div className="story-card-topbar">
                    <span className="story-tag-pill">
                      <span className="badge-sparkle">✦</span>
                      <span>{slide.tag}</span>
                    </span>
                    <button
                      className="story-view-hd-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(idx);
                      }}
                      title="Inspect Fullscreen HD"
                      aria-label="Open Fullscreen HD"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                      </svg>
                      <span>View HD</span>
                    </button>
                  </div>

                  {/* Bottom Caption Area */}
                  <div className="story-card-caption">
                    <h3 className="story-card-title">{slide.title}</h3>
                    <p className="story-card-desc">{slide.desc}</p>
                    <div className="story-card-actions">
                      <span className="story-click-hint">
                        {isActive ? 'Click image for Fullscreen HD ⛶' : 'Click to bring to focus'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="gallery-pagination-dots">
            {showcaseSlides.map((_, idx) => (
              <button 
                key={idx} 
                className={`gallery-dot ${idx === showcaseSlide ? 'active' : ''}`}
                onClick={() => setShowcaseSlide(idx)}
                aria-label={`Go to event ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* =========================================================================
            FULLSCREEN 100% HD LIGHTBOX MODAL
            ========================================================================= */}
        {lightboxOpen && (
          <div 
            className="story-lightbox-backdrop"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Fullscreen HD Event Image"
          >
            <div className="story-lightbox-glow"></div>

            {/* Top Bar: Event Category + Counter + Close Button */}
            <div className="story-lightbox-topbar" onClick={(e) => e.stopPropagation()}>
              <div className="story-lightbox-pill">
                <span className="badge-sparkle">✦</span>
                <span>{showcaseSlides[lightboxIndex].tag}</span>
                <span className="story-lightbox-sep">•</span>
                <span className="story-lightbox-counter">
                  {String(lightboxIndex + 1).padStart(2, '0')} / {String(showcaseSlides.length).padStart(2, '0')}
                </span>
              </div>

              <div className="story-lightbox-top-actions">
                <span className="story-esc-hint">Press ESC to close</span>
                <button 
                  className="story-lightbox-close-btn"
                  onClick={closeLightbox}
                  aria-label="Close Fullscreen (Esc)"
                  title="Close (Esc)"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Main Fullscreen Stage */}
            <div 
              className="story-lightbox-content"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleLightboxTouchStart}
              onTouchMove={handleLightboxTouchMove}
              onTouchEnd={handleLightboxTouchEnd}
            >
              <img
                key={showcaseSlides[lightboxIndex].id}
                src={showcaseSlides[lightboxIndex].image}
                alt={showcaseSlides[lightboxIndex].title}
                className="story-lightbox-img"
              />

              {/* Prev Arrow */}
              <button
                className="story-lightbox-arrow prev-arrow"
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightbox();
                }}
                aria-label="Previous Image"
                title="Previous Image (←)"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              {/* Next Arrow */}
              <button
                className="story-lightbox-arrow next-arrow"
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightbox();
                }}
                aria-label="Next Image"
                title="Next Image (→)"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            {/* Bottom Details Panel */}
            <div className="story-lightbox-bottom" onClick={(e) => e.stopPropagation()}>
              <div className="story-lightbox-info">
                <h3 className="story-lightbox-title">{showcaseSlides[lightboxIndex].title}</h3>
                <p className="story-lightbox-desc">{showcaseSlides[lightboxIndex].desc}</p>
              </div>
              <Link to="/packages" className="story-lightbox-cta" onClick={closeLightbox}>
                <span>Explore Packages</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          EVENT STORIES → FEATURED EVENT VISUAL CONNECTOR
          ========================================================================= */}
      <div className="stories-to-featured-connector reveal">
        <div className="connector-gold-line"></div>
        <div className="connector-center-badge">
          <span className="badge-sparkle">✦</span>
          <span>Signature Showcase</span>
          <span className="badge-sparkle">✦</span>
        </div>
        <div className="connector-gold-line"></div>
      </div>

      {/* =========================================================================
          4. FEATURED EVENT (Large Immersive Masterpiece Section)
          ========================================================================= */}
      <section className="featured-immersive-section reveal">
        <div className="featured-immersive-wrapper">
          <div className="immersive-bg-holder">
            <img
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80"
              alt="The Palace Royale Masterpiece"
              className="immersive-hero-img"
            />
            <div className="immersive-gradient-mask"></div>
            <div className="immersive-gold-glow"></div>
          </div>

          <div className="immersive-inner-content">
            <div className="immersive-meta-badge">
              <span className="badge-sparkle">✦</span>
              <span>SIGNATURE MASTERPIECE</span>
            </div>

            <h2 className="immersive-headline">
              The Palace Royale <span className="gradient-text">Wedding Experience</span>
            </h2>

            <p className="immersive-description">
              A bespoke 2,500-guest ceremonial celebration executed in pure palace grandiosity. Featuring 360-degree intelligent acoustic rigging, custom crystal chandeliers, and an ethereal royal mandap architecture tailored to timeless perfection.
            </p>

            <div className="immersive-spec-grid">
              <div className="spec-card">
                <span className="spec-icon">👥</span>
                <div className="spec-text">
                  <strong>2,500+ Guests</strong>
                  <span>Palace Banqueting</span>
                </div>
              </div>

              <div className="spec-card">
                <span className="spec-icon">🌺</span>
                <div className="spec-text">
                  <strong>10,000+ Florals</strong>
                  <span>Fresh Exotic Blooms</span>
                </div>
              </div>

              <div className="spec-card">
                <span className="spec-icon">💡</span>
                <div className="spec-text">
                  <strong>Intelligent Lighting</strong>
                  <span>Moving Beam Rigs</span>
                </div>
              </div>

              <div className="spec-card">
                <span className="spec-icon">👑</span>
                <div className="spec-text">
                  <strong>VIP Concierge</strong>
                  <span>Complete Hospitality</span>
                </div>
              </div>
            </div>

            <div className="immersive-cta-row">
              <Link to="/packages/high" className="btn-luxury-primary">
                <span>Explore Royal Package</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <Link to="/services" className="btn-luxury-outline">
                <span>View Full Catalog</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. GRAND PORTFOLIO / MOMENTS MADE EXTRAORDINARY (Scroll-Synced Luxury Card Reveal)
          ========================================================================= */}
      <section
        className="portfolio-scroll-section"
        id="grand-portfolio"
        ref={portfolioSectionRef}
      >
        <div className="portfolio-sticky-viewport">
          {/* Ambient Cinematic Backdrop Glow */}
          <div className="portfolio-ambient-glow" />

          {/* Section Header */}
          <div className="portfolio-header-block">
            <div className="portfolio-header-pill">
              <span className="badge-sparkle">✦</span>
              <span>Grand Portfolio</span>
            </div>
            <h2 className="portfolio-headline">Moments Made Extraordinary</h2>
            <p className="portfolio-subtext">
              From intimate celebrations to grand occasions, we create experiences worth remembering.
            </p>
          </div>

          {/* Interactive Navigation & Stepper Bar */}
          <div className="portfolio-filter-bar">
            <div className="portfolio-tabs-group" role="tablist" aria-label="Event Categories">
              {occasionCategories.map((occ, idx) => {
                const isSelected = portfolioIndex === idx;
                return (
                  <button
                    key={occ.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`portfolio-tab-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => scrollToPortfolioCard(idx)}
                    title={`Jump to ${occ.title}`}
                  >
                    <span className="tab-sparkle">{isSelected ? '✦' : '✧'}</span>
                    <span>{occ.shortTitle}</span>
                  </button>
                );
              })}
            </div>

            {/* Stepper with progress track */}
            <div className="portfolio-stepper-widget">
              <span className="stepper-current">{String(portfolioIndex + 1).padStart(2, '0')}</span>
              <span className="stepper-sep">/</span>
              <span className="stepper-total">{String(occasionCategories.length).padStart(2, '0')}</span>
              <div className="stepper-track">
                <div
                  className="stepper-fill"
                  style={{ width: `${((portfolioIndex + 1) / occasionCategories.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Central Scroll-Synced Card Stacking Deck */}
          <div className="portfolio-deck-stage">
            <div className="portfolio-cards-container">
              {occasionCategories.map((occ, idx) => {
                let cardClass = 'waiting';
                if (idx === portfolioIndex) {
                  cardClass = 'active';
                } else if (idx < portfolioIndex) {
                  cardClass = 'prev';
                } else {
                  cardClass = 'next';
                }

                return (
                  <div
                    key={occ.id}
                    className={`portfolio-reveal-card ${cardClass}`}
                    role="region"
                    aria-label={occ.title}
                  >
                    {/* Media Half (Left) */}
                    <div className="portfolio-card-media">
                      <img
                        src={occ.image}
                        alt={occ.title}
                        className="portfolio-card-img"
                        loading={idx <= 1 ? "eager" : "lazy"}
                      />
                      <div className="portfolio-card-gradient" />
                      <div className="portfolio-card-badge-pill">
                        <span className="badge-sparkle">✦</span>
                        <span>{occ.category}</span>
                      </div>
                    </div>

                    {/* Content Half (Right) */}
                    <div className="portfolio-card-content">
                      <div className="portfolio-card-meta-top">
                        <span className="portfolio-card-tier-tag">{occ.badge}</span>
                        <div className="portfolio-card-counter-tag">
                          <span className="tag-cur">{String(idx + 1).padStart(2, '0')}</span>
                          <span className="tag-sep">/</span>
                          <span className="tag-tot">{String(occasionCategories.length).padStart(2, '0')}</span>
                        </div>
                      </div>

                      <div className="portfolio-card-body">
                        <span className="portfolio-card-subtitle">{occ.subtitle}</span>
                        <h3 className="portfolio-card-title">{occ.title}</h3>
                        <p className="portfolio-card-desc">{occ.desc}</p>

                        <div className="portfolio-card-chips">
                          {occ.features.map((feat, fIdx) => (
                            <span key={fIdx} className="portfolio-chip">
                              <span className="chip-sparkle">✦</span>
                              <span>{feat}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="portfolio-card-actions">
                        <Link to={occ.link} className="btn-luxury-primary">
                          <span>{occ.linkLabel}</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </Link>

                        <div className="portfolio-capacity-pill">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          <span>{occ.metrics}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Dynamic Scroll Indicator */}
          <div className="portfolio-scroll-hint">
            <span className="hint-mouse-wheel"></span>
            <span>
              {portfolioIndex === occasionCategories.length - 1
                ? 'Scroll to continue discovery ↓'
                : 'Scroll down to reveal next event ↓'}
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. WHY CHOOSE US (4 Pillars of Excellence)
          ========================================================================= */}
      <section className="pillars-section">
        <div className="section-header-block reveal">
          <span className="section-tag">Why Choose Us</span>
          <h2 className="section-headline">The Banana Brothers Distinction</h2>
          <p className="section-subtext">
            We blend artistic vision with operational precision to ensure flawless execution from inception to finale.
          </p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card reveal delay-100">
            <div className="pillar-icon-wrapper">💎</div>
            <h3>Bespoke Curation</h3>
            <p>
              Custom-built event designs tailored specifically to your family traditions, corporate branding, and unique dreams.
            </p>
          </div>

          <div className="pillar-card reveal delay-200">
            <div className="pillar-icon-wrapper">⚡</div>
            <h3>Transparent Estimator</h3>
            <p>
              No hidden fees. Configure guest counts, catering menus, and decor add-ons with immediate live cost recalculations.
            </p>
          </div>

          <div className="pillar-card reveal delay-300">
            <div className="pillar-icon-wrapper">👨‍🍳</div>
            <h3>Gourmet Catering</h3>
            <p>
              Authentic traditional banana leaf feasts and multi-cuisine luxury buffet spreads crafted by master culinary teams.
            </p>
          </div>

          <div className="pillar-card reveal delay-400">
            <div className="pillar-icon-wrapper">🎯</div>
            <h3>Stress-Free Execution</h3>
            <p>
              A dedicated on-site event coordinator supervises sound, timing, and decor transitions so you can immerse in the moment.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. HOW IT WORKS (4-Step Animated Journey)
          ========================================================================= */}
      <section className="how-it-works-section">
        <div className="section-header-block reveal">
          <span className="section-tag">The Process</span>
          <h2 className="section-headline">Seamless Planning in 4 Steps</h2>
          <p className="section-subtext">
            From initial idea to the final celebratory toast, our streamlined online portal makes event booking simple.
          </p>
        </div>

        <div className="timeline-steps-grid">
          <div className="timeline-step-card reveal delay-100">
            <span className="step-num-badge">01</span>
            <h4>Select Your Package</h4>
            <p>Choose between Standard, Premium Delight, or Royal Experience depending on your scale.</p>
          </div>

          <div className="timeline-step-card reveal delay-200">
            <span className="step-num-badge">02</span>
            <h4>Tailor Add-ons</h4>
            <p>Customize catering plates, lighting options, photography, and decor elements live on the screen.</p>
          </div>

          <div className="timeline-step-card reveal delay-300">
            <span className="step-num-badge">03</span>
            <h4>Instant Confirmation</h4>
            <p>Lock your date with clear transparency and direct booking management in your account.</p>
          </div>

          <div className="timeline-step-card reveal delay-400">
            <span className="step-num-badge">04</span>
            <h4>Celebrate in Style</h4>
            <p>Relax and enjoy the special occasion while our master crew handles all logistics flawlessly.</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. CLIENT REVIEWS (Interactive Testimonials Slider)
          ========================================================================= */}
      <section className="testimonials-section">
        <div className="section-header-block reveal">
          <span className="section-tag">Client Reviews</span>
          <h2 className="section-headline">Moments We Treasured Together</h2>
          <p className="section-subtext">
            Hear from families and corporate leaders who trusted Banana Brothers with their biggest milestones.
          </p>
        </div>

        <div 
          className="reviews-slider-container reveal delay-100"
          onMouseEnter={() => setIsReviewsPaused(true)}
          onMouseLeave={() => setIsReviewsPaused(false)}
        >
          <div className="reviews-slider-track">
            <div className="review-active-card" key={reviewsList[activeReviewIndex].id}>
              <div className="review-card-header">
                <div className="test-stars">★★★★★</div>
                <span className="review-tier-tag">{reviewsList[activeReviewIndex].tag}</span>
              </div>

              <p className="test-quote">
                "{reviewsList[activeReviewIndex].quote}"
              </p>

              <div className="test-author-row">
                <img
                  src={reviewsList[activeReviewIndex].avatar}
                  alt={reviewsList[activeReviewIndex].author}
                  className="test-avatar"
                />
                <div className="test-author-info">
                  <h5>{reviewsList[activeReviewIndex].author}</h5>
                  <span>{reviewsList[activeReviewIndex].role}</span>
                </div>
                <div className="review-verified-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Verified Client</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="reviews-slider-controls">
            <button
              className="review-nav-btn"
              onClick={prevReview}
              aria-label="Previous Review"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div className="reviews-pagination-dots">
              {reviewsList.map((_, rIdx) => (
                <button
                  key={rIdx}
                  className={`review-dot ${rIdx === activeReviewIndex ? 'active' : ''}`}
                  onClick={() => setActiveReviewIndex(rIdx)}
                  aria-label={`Go to review ${rIdx + 1}`}
                />
              ))}
            </div>

            <button
              className="review-nav-btn"
              onClick={nextReview}
              aria-label="Next Review"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FINAL CALL TO ACTION (Premium Cinematic Banner)
          ========================================================================= */}
      <section className="cta-banner-section reveal">
        <div className="cta-banner-card">
          <div className="cta-glow-circle"></div>
          <div className="cta-content">
            <span className="cta-tag">Start Planning Today</span>
            <h2>Ready to Create Something Extraordinary?</h2>
            <p>
              Connect with our master planners or explore our curated packages to get an instant cost breakdown for your dream celebration.
            </p>
            <div className="cta-btn-group">
              <Link to="/packages" className="btn-cta-gold">
                Explore Packages &rarr;
              </Link>
              <Link to="/services" className="btn-cta-ghost">
                Browse Full Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

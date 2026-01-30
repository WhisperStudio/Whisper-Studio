import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../pages/Styled_Pages/Vote.css';

import backgroundVideo from '../images/Forest witout lights.mp4';
import rune from '../images/Rune.png';
import ScrollAnimation from '../components/VOTE/info';
import ScrollAnimation2 from '../components/VOTE/info2';
import Header from '../components/header';
import Countdown from '../components/VOTE/Countdown';
import backgroundMusic from '../bilder/VOTE THEME 1.mp3';
import placeholderImage1 from '../bilder/1.webp';
import placeholderImage2 from '../bilder/smart_gnome.png';
import placeholderImage3 from '../bilder/3.webp';
import CharacterScrollytelling from '../components/VOTE/CharacterScroll';

import Vote_V from '../images/Vote_V.png';
import Vote_O from '../images/Vote_O.png';
import Vote_T from '../images/Vote_T.png';
import Vote_E from '../images/Vote_E.png';

// Rekkefølge på skjerm: V . O . T . E
// Først inn: O og T. Deretter: V og E. Dottene etter hver sin bokstav.
const PLAN = [
  // V and its dot
  { type: 'img', key: 'V', src: Vote_V, h: '12.8rem', delay: 2.0, style: { marginRight: '-1.5rem', position: 'relative', top: '0.8rem' } },
  { type: 'dot', key: 'dot1', delay: 0.5 },
  
  // O and its dot
  { type: 'img', key: 'O', src: Vote_O, h: '11.4rem', delay: 3.0, style: { marginRight: '-0.5rem', position: 'relative', top: '0.4rem' } },
  { type: 'dot', key: 'dot2', delay: 1.0 },
  
  // T and its dot
  { type: 'img', key: 'T', src: Vote_T, h: '10.2rem', delay: 4.0 },
  { type: 'dot', key: 'dot3', delay: 1.5 },
  
  // E (no dot after E)
  { type: 'img', key: 'E', src: Vote_E, h: '13.5rem', delay: 5.0, style: { marginTop: '1.2rem', position: 'relative', top: '1.5rem' } },
];

export default function VotePage() {
  const videoRef = useRef();
  const audioRef = useRef();
  const [videoDuration, setVideoDuration] = useState(null);
  const [showWhisper, setShowWhisper] = useState(false);
  const [showUnder, setShowUnder] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let current = window.scrollY || 0;
    let target = current;
    let rafId = null;

    const isScrollable = (el) => {
      if (!el || el === document.body || el === document.documentElement) return false;
      const style = window.getComputedStyle(el);
      const oy = style.overflowY;
      const canScroll = (oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1;
      return canScroll;
    };

    const hasScrollableParent = (start) => {
      let el = start;
      while (el && el !== document.body) {
        if (isScrollable(el)) return true;
        el = el.parentElement;
      }
      return false;
    };

    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const tick = () => {
      const delta = target - current;
      current += delta * 0.12;

      if (Math.abs(delta) < 0.5) {
        current = target;
        window.scrollTo(0, target);
        rafId = null;
        return;
      }

      window.scrollTo(0, current);
      rafId = window.requestAnimationFrame(tick);
    };

    const onWheel = (e) => {
      if (e.ctrlKey) return;
      if (hasScrollableParent(e.target)) return;
      e.preventDefault();
      target = Math.min(maxScroll(), Math.max(0, target + e.deltaY));
      if (!rafId) rafId = window.requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (rafId) return;
      current = window.scrollY || 0;
      target = current;
    };

    const onResize = () => {
      target = Math.min(maxScroll(), Math.max(0, target));
      current = Math.min(maxScroll(), Math.max(0, current));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    const onMeta = () => setVideoDuration(vid.duration);
    vid?.addEventListener('loadedmetadata', onMeta);
    return () => vid?.removeEventListener('loadedmetadata', onMeta);
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    const onTime = () => {
      if (!vid || !videoDuration) return;
      const timeLeft = videoDuration - vid.currentTime;
      if (timeLeft <= 2 && vid.playbackRate !== .3) vid.playbackRate = .3;
      if (timeLeft <= .5) {
        vid.pause();
        setShowWhisper(true);
        setTimeout(() => setShowUnder(true), 500);
      }
    };
    vid?.addEventListener('timeupdate', onTime);
    return () => vid?.removeEventListener('timeupdate', onTime);
  }, [videoDuration]);

  const handlePlayMusic = () => {
    const aud = audioRef.current;
    aud.muted = false;
    aud.play().then(() => {
      setIsMuted(false);
      setHasStarted(true);
    }).catch(() => {});
  };

  const handleToggleMute = () => {
    const aud = audioRef.current;
    if (!aud) return;
    if (isMuted) {
      aud.muted = false;
      aud.play().catch(() => {});
    } else {
      aud.muted = true;
    }
    setIsMuted(x => !x);
  };

  return (
    <>
      <Header />

      <div className="page-wrapper">
        <div className="page-container">
          <video
            ref={videoRef}
            className="bg-video"
            src={backgroundVideo}
            autoPlay
            muted
            playsInline
          />
          <div className="dark-overlay" />

          <div className="content-wrapper">
            {/* V.O.T.E */}
            <div className="vote-container">
              <div className="vote-row">
                {PLAN.map((item) => {
                  if (item.type === 'dot') {
                    return (
                      <span
                        key={item.key}
                        className="dot"
                        style={{ animationDelay: `${item.delay}s` }}
                      />
                    );
                  }
                  return (
                    <span
                      key={item.key}
                      className="letter-wrap"
                      style={{ animationDelay: `${item.delay}s` }}
                    >
                      <img
                        className="letter-img"
                        src={item.src}
                        alt={item.key}
                        style={{ 
                          height: item.h,
                          ...(item.style || {}) 
                        }}
                      />
                    </span>
                  );
                })}
              </div>
            </div>

            <div className={`top-overlay ${showWhisper ? 'show' : ''}`}>
              <h2 className="top-text">Vintra Studio</h2>
            </div>

            <div className={`under-overlay ${showUnder ? 'show' : ''}`}>
              <span className="under-text">Veil of the Eldertrees</span>
              <Countdown />
              {!hasStarted && (
                <button className="play-music-button" onClick={handlePlayMusic}>
                  Play music
                </button>
              )}
            </div>
          </div>

          <audio ref={audioRef} src={backgroundMusic} loop muted />
        </div>

        <div className="divider-spacer" />
        <div className="fancy-divider">
          <img className="center-rune" src={rune} alt="Rune" />
        </div>

        {hasStarted && (
          <button className="mute-button" onClick={handleToggleMute}>
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        )}

        <ScrollAnimation />
        <div className="divider-spacer tight" />
        <div className="fancy-divider fd2">
          <img className="center-rune" src={rune} alt="Rune" />
        </div>
        <ScrollAnimation2 />
        
      </div>

      <div className="divider-spacer" />  
      <div className="fancy-divider fd3">
          <img className="center-rune" src={rune} alt="Rune" />
        </div>   
      <div className="character-scroll-top-fade" />
      <CharacterScrollytelling />

      <section className="news-section">
        <div className="fancy-divider fd3">
          <img className="center-rune" src={rune} alt="Rune" />
        </div>

        <h2 className="news-section-title">Latest Updates</h2>

        <div className="card-grid">
          <div className="large-card base-card">
            <div
              className="card-image large"
              style={{ backgroundImage: `url(${placeholderImage1})` }}
            />
            <div className="card-content large">
              <div>
                <span className="card-date">June 20, 2025</span>
                <h3 className="card-title large">V.O.T.E Update</h3>
                <p className="card-description large" style={{ fontFamily: 'none' }}>
                  We are currently working on the games map, animations, characters and story.
                  Check out our Art gallery where you can explore some of the characters and destinations we are currently making.
                </p>
              </div>
              <button className="card-button">Learn More</button>
            </div>
          </div>

          <div className="small-group">
            <div className="small-card base-card">
              <div
                className="card-image"
                style={{ backgroundImage: `url(${placeholderImage2})` }}
              />
              <div className="card-content">
                <div>
                  <span className="card-date">V.O.T.E</span>
                  <h3 className="card-title">Art Gallery</h3>
                  <p className="card-description" style={{ fontFamily: 'none' }}>
                    Check out our art gallery of the landscape and creatures you might see in the game.
                  </p>
                </div>
                <Link to="/artwork" style={{ textDecoration: 'none' }}>
                  <button className="card-button">Explore</button>
                </Link>
              </div>
            </div>

            <div className="small-card base-card">
              <div
                className="card-image"
                style={{ backgroundImage: `url(${placeholderImage3})` }}
              />
              <div className="card-content">
                <div>
                  <span className="card-date">January 15, 2025</span>
                  <h3 className="card-title">Community Event</h3>
                  <p className="card-description" style={{ fontFamily: 'none' }}>
                    Join our upcoming community event and compete for exclusive rewards. Don’t miss out!
                  </p>
                </div>
                <button className="card-button">Join Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </>
  );
}

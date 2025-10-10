import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../pages/Styled_Pages/Vote.css';

import backgroundVideo from '../images/Forest witout lights.mp4';
import rune from '../images/Rune.png';
import AnimationSection from '../components/info';
import AnimationSection2 from '../components/info2';
import Header from '../components/header';
import Countdown from '../components/Countdown';
import backgroundMusic from '../bilder/VOTE THEME 1.mp3';
import placeholderImage1 from '../bilder/1.webp';
import placeholderImage2 from '../bilder/smart_gnome.png';
import placeholderImage3 from '../bilder/3.webp';
import CharacterScrollytelling from '../components/CharacterScroll';

import Vote_V from '../images/Vote_V.png';
import Vote_O from '../images/Vote_O.png';
import Vote_T from '../images/Vote_T.png';
import Vote_E from '../images/Vote_E.png';

// Rekkefølge på skjerm: V . O . T . E
// Først inn: O og T. Deretter: V og E. Dottene etter hver sin bokstav.
const PLAN = [
  { type: 'img', key: 'V', src: Vote_V, h: '12rem',  delay: 0.60 },
  { type: 'dot', key: 'dot1',           delay: 0.78 },
  { type: 'img', key: 'O', src: Vote_O, h: '9.5rem', delay: 0.00 },
  { type: 'dot', key: 'dot2',           delay: 0.90 },
  { type: 'img', key: 'T', src: Vote_T, h: '11rem',  delay: 0.00 },
  { type: 'dot', key: 'dot3',           delay: 1.02 },
  { type: 'img', key: 'E', src: Vote_E, h: '10.5rem',delay: 0.60 },
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
                        style={{ height: item.h }}
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

          <div className="fancy-divider">
            <img className="center-rune" src={rune} alt="Rune" />
          </div>

          <audio ref={audioRef} src={backgroundMusic} loop muted />
        </div>

        {hasStarted && (
          <button className="mute-button" onClick={handleToggleMute}>
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        )}

        <AnimationSection />
        <div className="fancy-divider fd2">
          <img className="center-rune" src={rune} alt="Rune" />
        </div>
        <AnimationSection2 />
        <CharacterScrollytelling />
      </div>

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

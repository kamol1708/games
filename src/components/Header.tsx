import { useState } from 'react';

const navItems = ['Games', 'About', 'Awards', 'Contact'];

function Header() {
  const [activeItem, setActiveItem] = useState('Games');
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header 
      className="fx-topbar" 
      role="banner"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Murakkab glow effektlari */}
      <div className="fx-topbar-glow fx-topbar-glow-left" aria-hidden="true">
        <div className="glow-particle" />
        <div className="glow-particle" style={{ animationDelay: '1s' }} />
        <div className="glow-particle" style={{ animationDelay: '2s' }} />
      </div>
      <div className="fx-topbar-glow fx-topbar-glow-right" aria-hidden="true">
        <div className="glow-particle" />
        <div className="glow-particle" style={{ animationDelay: '1.5s' }} />
        <div className="glow-particle" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* Neon chiziqlar */}
      <div className="neon-line neon-line-top" />
      <div className="neon-line neon-line-bottom" />
      
      {/* Scanning animatsiyasi */}
      <div className={`scan-line ${isHovered ? 'scan-active' : ''}`} />

      <a className="fx-brand" href="#" aria-label="Brand logo">
        <span className="fx-brand-core">
          <span className="fx-brand-line" />
          <span className="fx-brand-dot" />
          <span className="fx-brand-block" />
          
          {/* Qo'shimcha futuristik elementlar */}
          <span className="brand-pulse" />
          <span className="brand-ring" />
          <span className="brand-ring" style={{ animationDelay: '0.5s' }} />
          <span className="brand-ring" style={{ animationDelay: '1s' }} />
        </span>
        
        <span className="fx-brand-text">
          <small className="brand-small">
            <span className="char-animation">F</span>
            <span className="char-animation" style={{ animationDelay: '0.1s' }}>u</span>
            <span className="char-animation" style={{ animationDelay: '0.2s' }}>t</span>
            <span className="char-animation" style={{ animationDelay: '0.3s' }}>u</span>
            <span className="char-animation" style={{ animationDelay: '0.4s' }}>r</span>
            <span className="char-animation" style={{ animationDelay: '0.5s' }}>e</span>
          </small>
          <strong className="brand-strong">
            <span className="char-animation" style={{ animationDelay: '0.6s' }}>E</span>
            <span className="char-animation" style={{ animationDelay: '0.7s' }}>d</span>
            <span className="char-animation" style={{ animationDelay: '0.8s' }}>u</span>
            <span className="char-animation" style={{ animationDelay: '0.9s' }}>&nbsp;</span>
            <span className="char-animation" style={{ animationDelay: '1s' }}>G</span>
            <span className="char-animation" style={{ animationDelay: '1.1s' }}>a</span>
            <span className="char-animation" style={{ animationDelay: '1.2s' }}>m</span>
            <span className="char-animation" style={{ animationDelay: '1.3s' }}>e</span>
            <span className="char-animation" style={{ animationDelay: '1.4s' }}>s</span>
          </strong>
        </span>
      </a>

      <nav className="fx-menu" aria-label="Main navigation">
        {navItems.map((item) => (
          <a
            key={item}
            href="#"
            className={`fx-menu-link ${activeItem === item ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveItem(item);
            }}
            onMouseEnter={() => setActiveItem(item)}
          >
            {/* Hover va active effektlari */}
            <span className="menu-link-glow" />
            <span className="menu-link-border" />
            <span className="menu-link-border menu-link-border-bottom" />
            
            <span className="fx-menu-link-text">
              <span className="link-char">{item[0]}</span>
              <span className="link-rest">{item.slice(1)}</span>
            </span>
            
            {/* Hoverdagi zarrachalar */}
            <span className="menu-particle" />
            <span className="menu-particle" style={{ left: '30%', animationDelay: '0.2s' }} />
            <span className="menu-particle" style={{ left: '60%', animationDelay: '0.4s' }} />
            <span className="menu-particle" style={{ left: '90%', animationDelay: '0.6s' }} />
          </a>
        ))}
      </nav>

      <button className="fx-sign-btn" type="button">
        <span className="fx-sign-btn-ring" aria-hidden="true">
          <span className="ring-glow" />
          <span className="ring-rotate" />
        </span>
        
        <span className="btn-content">
          <span className="btn-text">Sign In</span>
          <span className="btn-icon">→</span>
        </span>
        
        {/* Hover effekti uchun */}
        <span className="btn-hover-glow" />
        <span className="btn-particles">
          <span className="particle" />
          <span className="particle" style={{ animationDelay: '0.2s' }} />
          <span className="particle" style={{ animationDelay: '0.4s' }} />
        </span>
      </button>

      <style>{`
        .fx-topbar {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: linear-gradient(
            135deg,
            rgba(10, 20, 40, 0.95) 0%,
            rgba(20, 30, 60, 0.95) 50%,
            rgba(10, 20, 40, 0.95) 100%
          );
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 255, 255, 0.3);
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.2),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
          overflow: hidden;
        }

        /* Glow effektlari */
        .fx-topbar-glow {
          position: absolute;
          top: 0;
          width: 200px;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .fx-topbar-glow-left {
          left: 0;
          background: radial-gradient(
            ellipse at left,
            rgba(0, 255, 255, 0.2) 0%,
            transparent 70%
          );
        }

        .fx-topbar-glow-right {
          right: 0;
          background: radial-gradient(
            ellipse at right,
            rgba(255, 0, 255, 0.2) 0%,
            transparent 70%
          );
        }

        .glow-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: cyan;
          border-radius: 50%;
          box-shadow: 0 0 10px cyan;
          animation: floatParticle 3s infinite;
        }

        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          25% { opacity: 1; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          75% { transform: translateY(20px) translateX(-10px); opacity: 0.5; }
        }

        /* Neon chiziqlar */
        .neon-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            cyan,
            magenta,
            transparent
          );
          animation: neonPulse 2s infinite;
        }

        .neon-line-top {
          top: 0;
        }

        .neon-line-bottom {
          bottom: 0;
        }

        @keyframes neonPulse {
          0%, 100% { opacity: 0.5; box-shadow: 0 0 5px cyan; }
          50% { opacity: 1; box-shadow: 0 0 20px cyan, 0 0 40px magenta; }
        }

        /* Scanning chizig'i */
        .scan-line {
          position: absolute;
          top: -100%;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(0, 255, 255, 0.1),
            transparent
          );
          transition: top 0.5s ease;
          pointer-events: none;
        }

        .scan-active {
          top: 100%;
        }

        /* Brand logo */
        .fx-brand {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          cursor: pointer;
          z-index: 10;
        }

        .fx-brand-core {
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fx-brand-line {
          position: absolute;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, cyan, magenta);
          transform: rotate(45deg);
          animation: rotateLine 4s linear infinite;
        }

        .fx-brand-dot {
          position: absolute;
          width: 12px;
          height: 12px;
          background: cyan;
          border-radius: 50%;
          box-shadow: 0 0 20px cyan;
          animation: pulseDot 2s ease-in-out infinite;
        }

        .fx-brand-block {
          position: absolute;
          width: 24px;
          height: 24px;
          border: 2px solid rgba(0, 255, 255, 0.5);
          transform: rotate(45deg);
          animation: rotateBlock 8s linear infinite;
        }

        .brand-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle, cyan 0%, transparent 70%);
          animation: brandPulse 2s ease-out infinite;
        }

        .brand-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 50%;
          animation: ringExpand 2s ease-out infinite;
        }

        @keyframes rotateLine {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulseDot {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px cyan; }
          50% { transform: scale(1.2); box-shadow: 0 0 40px cyan; }
        }

        @keyframes rotateBlock {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes brandPulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }

        @keyframes ringExpand {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* Brand text */
        .fx-brand-text {
          display: flex;
          flex-direction: column;
          font-family: 'Arial', sans-serif;
        }

        .brand-small {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .brand-strong {
          font-size: 1.2rem;
          font-weight: bold;
          background: linear-gradient(45deg, cyan, magenta);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 1px;
        }

        .char-animation {
          display: inline-block;
          animation: charAppear 0.5s ease forwards;
          opacity: 0;
          transform: translateY(10px);
        }

        @keyframes charAppear {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Navigation menu */
        .fx-menu {
          display: flex;
          gap: 2rem;
          z-index: 10;
        }

        .fx-menu-link {
          position: relative;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          padding: 0.5rem 1rem;
          overflow: hidden;
          transition: color 0.3s ease;
        }

        .fx-menu-link:hover,
        .fx-menu-link.active {
          color: white;
        }

        .menu-link-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s ease;
        }

        .fx-menu-link:hover .menu-link-glow {
          left: 100%;
        }

        .menu-link-border {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: cyan;
          transform: translateX(-50%);
          transition: width 0.3s ease;
          box-shadow: 0 0 10px cyan;
        }

        .menu-link-border-bottom {
          top: 0;
          bottom: auto;
          background: magenta;
          box-shadow: 0 0 10px magenta;
        }

        .fx-menu-link:hover .menu-link-border,
        .fx-menu-link.active .menu-link-border {
          width: 100%;
        }

        .fx-menu-link-text {
          position: relative;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .link-char {
          display: inline-block;
          font-size: 1.2rem;
          color: cyan;
          transition: transform 0.3s ease;
        }

        .fx-menu-link:hover .link-char {
          transform: scale(1.2) rotate(5deg);
        }

        .link-rest {
          transition: transform 0.3s ease;
        }

        .fx-menu-link:hover .link-rest {
          transform: translateX(3px);
        }

        .menu-particle {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 2px;
          height: 2px;
          background: cyan;
          border-radius: 50%;
          opacity: 0;
          animation: menuParticle 1s ease infinite;
        }

        @keyframes menuParticle {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) scale(2);
            opacity: 1;
          }
          100% {
            transform: translateY(-40px) scale(0);
            opacity: 0;
          }
        }

        /* Sign In button */
        .fx-sign-btn {
          position: relative;
          background: transparent;
          border: none;
          color: white;
          font-weight: 600;
          padding: 0.8rem 2rem;
          cursor: pointer;
          overflow: hidden;
          z-index: 10;
        }

        .fx-sign-btn-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 2px solid cyan;
          border-radius: 30px;
          transition: all 0.3s ease;
        }

        .ring-glow {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 2px solid transparent;
          border-radius: 30px;
          background: linear-gradient(45deg, cyan, magenta) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .ring-rotate {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 2px dashed transparent;
          border-radius: 30px;
          background: linear-gradient(90deg, cyan, magenta) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: rotateRing 10s linear infinite;
          opacity: 0;
        }

        .fx-sign-btn:hover .ring-glow,
        .fx-sign-btn:hover .ring-rotate {
          opacity: 1;
        }

        @keyframes rotateRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .btn-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 1;
        }

        .btn-text {
          transition: transform 0.3s ease;
        }

        .btn-icon {
          transition: transform 0.3s ease;
        }

        .fx-sign-btn:hover .btn-text {
          transform: translateX(-3px);
        }

        .fx-sign-btn:hover .btn-icon {
          transform: translateX(3px);
        }

        .btn-hover-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          transition: width 0.5s ease, height 0.5s ease;
          border-radius: 50%;
          pointer-events: none;
        }

        .fx-sign-btn:hover .btn-hover-glow {
          width: 200px;
          height: 200px;
        }

        .btn-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 4px;
          height: 4px;
          background: cyan;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: particleExplosion 0.8s ease-out forwards;
          opacity: 0;
        }

        .fx-sign-btn:hover .particle {
          animation: particleExplosion 0.8s ease-out;
        }

        @keyframes particleExplosion {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(-50% + var(--x, 50px)),
              calc(-50% + var(--y, -50px))
            ) scale(0);
            opacity: 0;
          }
        }

        .particle:nth-child(1) { --x: 50px; --y: -30px; }
        .particle:nth-child(2) { --x: -40px; --y: 40px; }
        .particle:nth-child(3) { --x: 30px; --y: 50px; }
      `}</style>
    </header>
  );
}

export default Header;

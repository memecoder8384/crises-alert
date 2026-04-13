import React, { useState, useEffect } from 'react';
import './Loader.css';

const ScrambleText = ({ text, typingSpeed = 80, delay = 0, showCursor = false }) => {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    let index = 0;
    const chars = '!<>-_\\/[]{}—=+*^?#_010101';
    setDisplayed(''); 
    
    const scrambleInterval = 75; // Slower interval to unblock React main thread
    const framesPerLetter = Math.max(1, Math.floor(typingSpeed / scrambleInterval));
    let frameCount = 0;

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index >= text.length) {
          clearInterval(interval);
          setDisplayed(text);
          return;
        }

        let result = text.substring(0, index);
        let scrambleLength = Math.min(3, text.length - index); // Scramble 3 chars deep
        
        // Output confirmed chars, and push random scramblers ahead
        for (let j = 0; j < scrambleLength; j++) {
           const nextChar = text.charAt(index + j);
           if (nextChar === '\n' || nextChar === ' ') {
               result += nextChar;
           } else {
               result += chars[Math.floor(Math.random() * chars.length)];
           }
        }
        
        setDisplayed(result);

        frameCount++;
        if (frameCount >= framesPerLetter) {
          frameCount = 0;
          index++;
        }
      }, scrambleInterval);
      
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, typingSpeed, delay]);

  return (
    <span>
      {displayed.split('\n').map((line, i, arr) => (
        <React.Fragment key={i}>
          {line}
          {i < arr.length - 1 && <br/>}
        </React.Fragment>
      ))}
      {showCursor && <span className="animate-blink font-light text-primary">_</span>}
    </span>
  );
};

const RadarDots = ({ count = 6 }) => {
  const [dots, setDots] = useState([]);
  
  useEffect(() => {
    const newDots = Array.from({ length: count }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const r = 15 + Math.random() * 70; // Keep away from center and absolute edge
      
      const left = 50 + r * Math.cos(angle);
      const top = 50 + r * Math.sin(angle);
      
      // Random delay so blinks are staggered
      const delay = Math.random() * 2;
      
      // Random size scale
      const scale = 0.6 + Math.random() * 0.8;
      
      return { id: i, left: `${left}%`, top: `${top}%`, delay: `${delay}s`, scale };
    });
    setDots(newDots);
  }, [count]);

  return (
    <>
      {dots.map(dot => (
        <div 
          key={dot.id}
          className="radar-dot"
          style={{
            left: dot.left,
            top: dot.top,
            animationDelay: dot.delay,
            transform: `scale(${dot.scale})`
          }}
        />
      ))}
    </>
  );
};

const Loader = ({ message = "Authenticating..." }) => {
  return (
    <div className="loader-overlay">
      {/* Decorative corners */}
      <div className="tech-decor top-left">
        <ScrambleText 
            text={`SYS.REQ // 849.201\nSEC.PROTO // ENCRYPTED\nNODE // ACTIVE`} 
            typingSpeed={20} delay={600} 
        />
      </div>
      <div className="tech-decor top-right">
        <ScrambleText 
            text={`[INITIALIZING SEQUENCE]\nOVERRIDE: NULL`} 
            typingSpeed={25} delay={1000} 
        />
      </div>
      <div className="tech-decor bottom-left">
        <ScrambleText 
            text={`COORD_LOCKED\nV 2.0.4.1`} 
            typingSpeed={20} delay={1400} 
        />
      </div>
      <div className="tech-decor bottom-right">
        <ScrambleText 
            text={`UPLINK_STABLE\n${new Date().toISOString().split('T')[0]}`} 
            typingSpeed={25} delay={1800} 
        />
      </div>

      <div className="loader-container flex-col items-center">
        <div className="radar">
          <div className="radar-beam"></div>
          <RadarDots count={8} />
        </div>
        <h3 className="loader-text text-center mt-6">
          <ScrambleText text={message} typingSpeed={80} delay={400} showCursor={true} />
        </h3>
        <p className="loader-subtext mt-2 uppercase tracking-[0.2em] opacity-50 text-[10px]">
           <ScrambleText text={`[ System Diagnostic Running ]`} typingSpeed={40} delay={2200} />
        </p>
      </div>
    </div>
  );
};

export default Loader;

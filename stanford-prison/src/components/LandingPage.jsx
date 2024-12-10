import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';

// Cinematic sequences
const sequences = [
  {
    id: 'intro',
    text: 'In 1971, a groundbreaking experiment changed our understanding of human nature forever...',
    duration: 4000
  },
  {
    id: 'reveal',
    text: 'Now, through the lens of artificial intelligence...',
    duration: 3000
  },
  {
    id: 'question',
    text: 'Are you ready to explore the depths of power and authority?',
    duration: 3000
  }
];

const quotes = [
  {
    text: "Power is not what you have but what the enemy thinks you have.",
    author: "Saul Alinsky",
    emotion: "power",
    color: "#FFD700"
  },
  {
    text: "The line between good and evil is permeable.",
    author: "Philip Zimbardo",
    emotion: "conflict",
    color: "#FF6347"
  },
  {
    text: "All it takes for evil to triumph is for good men to do nothing.",
    author: "Edmund Burke",
    emotion: "warning",
    color: "#FFA500"
  },
  {
    text: "Power tends to corrupt, and absolute power corrupts absolutely.",
    author: "Lord Acton",
    emotion: "corruption",
    color: "#8A2BE2"
  }
];

const LandingPage = () => {
  const [currentPhase, setCurrentPhase] = useState('cinematic');
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  const audioRef = useRef({
    ambient: null,
    hover: null,
    click: null,
    transition: null
  });

  const canvasRef = useRef(null);
  const controls = useAnimation();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  // Parallax effect values
  const parallaxX = useTransform(smoothMouseX, [0, window.innerWidth], [-50, 50]);
  const parallaxY = useTransform(smoothMouseY, [0, window.innerHeight], [-50, 50]);

  // Initialize audio and canvas
  useEffect(() => {
    // Load audio files
    audioRef.current.ambient = new Audio('/sounds/ambient.mp3');
    audioRef.current.hover = new Audio('/sounds/hover.mp3');
    audioRef.current.click = new Audio('/sounds/click.mp3');
    audioRef.current.transition = new Audio('/sounds/transition.mp3');

    // Set up canvas for neural network visualization
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Animation loop for neural network
      let animationFrame;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(66, 153, 225, 0.2)';
        
        // Draw neural network connections
        for (let i = 0; i < 50; i++) {
          const x1 = Math.sin(Date.now() / 2000 + i) * canvas.width/2 + canvas.width/2;
          const y1 = Math.cos(Date.now() / 2000 + i) * canvas.height/2 + canvas.height/2;
          const x2 = Math.sin(Date.now() / 2000 + i + Math.PI) * canvas.width/2 + canvas.width/2;
          const y2 = Math.cos(Date.now() / 2000 + i + Math.PI) * canvas.height/2 + canvas.height/2;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        animationFrame = requestAnimationFrame(animate);
      };

      animate();
      return () => cancelAnimationFrame(animationFrame);
    }
  }, []);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
      setInteractionCount(prev => prev + 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Cinematic sequence progression
  useEffect(() => {
    if (currentPhase === 'cinematic') {
      const timer = setTimeout(() => {
        if (sequenceIndex < sequences.length - 1) {
          setSequenceIndex(prev => prev + 1);
          if (audioEnabled) audioRef.current.transition.play();
        } else {
          setCurrentPhase('experience');
          if (audioEnabled) audioRef.current.ambient.play();
        }
      }, sequences[sequenceIndex].duration);

      return () => clearTimeout(timer);
    }
  }, [currentPhase, sequenceIndex, audioEnabled]);

  // Easter egg trigger
  useEffect(() => {
    if (interactionCount > 100) {
      setShowEasterEgg(true);
    }
  }, [interactionCount]);

  const renderCinematicSequence = () => (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={sequences[sequenceIndex].id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-4xl md:text-6xl text-center font-bold max-w-4xl px-8"
          style={{
            textShadow: '0 0 20px rgba(255,255,255,0.5)'
          }}
        >
          {sequences[sequenceIndex].text}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );

  const renderMainExperience = () => (
    <>
      {/* Neural Network Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
      />

      {/* Dynamic Background */}
      <motion.div 
        className="absolute inset-0 z-10"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)`
        }}
      />

      {/* Parallax Container */}
      <motion.div 
        className="relative z-20 h-screen"
        style={{ x: parallaxX, y: parallaxY }}
      >
        {/* Split Screen Experience */}
        <div className="flex h-full">
          {/* Left Side - Historical */}
          <motion.div 
            className="w-1/2 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => audioEnabled && audioRef.current.hover.play()}
          >
            <motion.div 
              className="h-full"
              style={{ 
                backgroundImage: 'url("/images/original-experiment.svg")',
                backgroundSize: 'cover',
                filter: 'grayscale(100%)'
              }}
              whileHover={{ filter: 'grayscale(50%)' }}
            >
              <motion.div 
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                <div className="text-center p-8">
                  <motion.h2 
                    className="text-6xl font-bold mb-6"
                    whileHover={{ scale: 1.1 }}
                  >
                    1971
                  </motion.h2>
                  <motion.p 
                    className="text-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    The Original Experiment
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Interactive Divider */}
          <motion.div 
            className="w-px bg-white relative"
            animate={{ 
              scaleY: [0.95, 1.05, 0.95],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div
              className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
                boxShadow: [
                  '0 0 10px rgba(255,255,255,0.5)',
                  '0 0 20px rgba(255,255,255,0.8)',
                  '0 0 10px rgba(255,255,255,0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Right Side - AI Simulation */}
          <motion.div 
            className="w-1/2 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => audioEnabled && audioRef.current.hover.play()}
          >
            <motion.div 
              className="h-full"
              style={{ 
                backgroundImage: 'url("/images/ai-simulation.svg")',
                backgroundSize: 'cover'
              }}
            >
              <motion.div 
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                <div className="text-center p-8">
                  <motion.h2 
                    className="text-6xl font-bold mb-6"
                    whileHover={{ scale: 1.1 }}
                  >
                    2024
                  </motion.h2>
                  <motion.p 
                    className="text-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    AI-Powered Simulation
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Interactive Quote Display */}
        <motion.div 
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center max-w-3xl px-8"
          animate={controls}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              <motion.div
                className="absolute -inset-8 rounded-lg"
                animate={{
                  background: `linear-gradient(135deg, ${quotes[currentQuote].color}22 0%, transparent 100%)`,
                  boxShadow: `0 0 30px ${quotes[currentQuote].color}11`
                }}
              />
              <motion.p 
                className="text-3xl italic mb-4 relative z-10"
                whileHover={{ scale: 1.05 }}
              >
                {quotes[currentQuote].text}
              </motion.p>
              <motion.p 
                className="text-lg opacity-75 relative z-10"
                whileHover={{ opacity: 1 }}
              >
                - {quotes[currentQuote].author}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Enter Button */}
        <motion.div 
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
          whileHover={{ scale: 1.1 }}
        >
          <Link to="/simulation">
            <motion.button
              className="relative px-16 py-6 bg-transparent overflow-hidden rounded-full group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => audioEnabled && audioRef.current.hover.play()}
              onClick={() => audioEnabled && audioRef.current.click.play()}
            >
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                style={{ originX: 0, originY: 0 }}
              />
              <motion.div
                className="absolute inset-0 border-2 border-white rounded-full"
                whileHover={{ scale: 1.1, opacity: 0 }}
              />
              <span className="relative z-10 text-2xl font-bold group-hover:text-black transition-colors duration-300">
                Enter Simulation
              </span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Audio Controls */}
        <motion.button
          className="fixed top-4 right-4 z-30 p-4 rounded-full bg-white/10 backdrop-blur-sm"
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setAudioEnabled(!audioEnabled);
            Object.values(audioRef.current).forEach(audio => {
              if (audio) {
                audio.muted = audioEnabled;
              }
            });
          }}
        >
          <motion.div
            animate={{ rotate: audioEnabled ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {audioEnabled ? "🔊" : "🔇"}
          </motion.div>
        </motion.button>

        {/* Easter Egg */}
        {showEasterEgg && (
          <motion.div
            className="fixed bottom-4 right-4 text-sm opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
          >
            Discovered the hidden truth... 🔓
          </motion.div>
        )}
      </motion.div>

      {/* Mouse Trailer Effect */}
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-screen"
        style={{
          x: smoothMouseX,
          y: smoothMouseY,
          width: 200,
          height: 200,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)'
        }}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <AnimatePresence mode="wait">
        {currentPhase === 'cinematic' ? renderCinematicSequence() : renderMainExperience()}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage; 
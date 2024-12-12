import { motion } from 'framer-motion';

const ComingSoonNotice = ({ cinematicComplete }) => {
  if (!cinematicComplete) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black bg-opacity-80 text-center"
    >
      <p className="text-purple-400 font-semibold">
        Experiment simulation coming soon. Follow <a 
          href="https://twitter.com/spe_ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-purple-300"
        >
          @spe_ai
        </a> for updates
      </p>
    </motion.div>
  );
};

export default ComingSoonNotice; 
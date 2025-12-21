import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, ChefHat, Sparkles } from 'lucide-react';

interface ProfessionalLoaderProps {
  message?: string;
  restaurantName?: string;
  restaurantLogo?: string;
}

export function ProfessionalLoader({ 
  message = 'Carregando menu...', 
  restaurantName,
  restaurantLogo 
}: ProfessionalLoaderProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Logo/Icon with Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            delay: 0.1 
          }}
          className="relative"
        >
          {restaurantLogo ? (
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <img
                src={restaurantLogo}
                alt={restaurantName || 'Restaurant'}
                className="relative w-24 h-24 rounded-full object-cover border-4 border-amber-500/30 shadow-2xl"
              />
            </div>
          ) : (
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center border-4 border-amber-500/30 shadow-2xl">
                <ChefHat className="w-12 h-12 text-white" />
              </div>
            </div>
          )}
        </motion.div>

        {/* Restaurant Name */}
        {restaurantName && (
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white text-center"
          >
            {restaurantName}
          </motion.h1>
        )}

        {/* Animated Dots Loader */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500"
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: index * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Loading Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="text-white/70 text-sm font-medium"
        >
          {message}
        </motion.p>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-400/40" />
          </motion.div>
        ))}

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Utensils className="w-8 h-8 text-amber-500/20" />
          </motion.div>
        </div>
        <div className="absolute bottom-1/4 right-1/4">
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Utensils className="w-8 h-8 text-amber-500/20" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Componente de Loading Skeleton alternativo (mais simples)
export function SimpleLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/70 text-sm"
        >
          Carregando...
        </motion.p>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Clock, Phone, MapPin } from 'lucide-react';
import type { Restaurant } from '@shared/schema';
import { RestaurantStatusBadge } from '@/components/RestaurantStatus';

interface HeroBannerProps {
  restaurant: Restaurant;
}

export const HeroBanner = ({ restaurant }: HeroBannerProps) => {
  return (
    <div className="relative pt-16">
      <motion.div 
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-[22vh] min-h-[180px] max-h-[240px] overflow-hidden rounded-b-3xl"
        style={{
          backgroundImage: restaurant.heroImageUrl 
            ? `url(${restaurant.heroImageUrl})` 
            : 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #1c1917 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        data-testid="banner-restaurant"
      >
        {/* Sophisticated Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(217,119,6,0.1),transparent_50%)]" />
        
        {/* Animated Gradient Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-600/20 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-amber-600/15 to-yellow-500/15 rounded-full blur-3xl" 
        />
        
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                {/* Restaurant Name & Badge */}
                <div className="flex-1">
                  <motion.h1 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1.5 tracking-tight drop-shadow-2xl" 
                    data-testid="text-restaurant-name-banner"
                  >
                    {restaurant.name}
                  </motion.h1>
                  
                  {/* Description - Elegant */}
                  {restaurant.description && (
                    <motion.p 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-white/80 text-xs sm:text-sm max-w-lg line-clamp-2 leading-relaxed drop-shadow-lg" 
                      data-testid="text-restaurant-description"
                    >
                      {restaurant.description}
                    </motion.p>
                  )}
                </div>

                {/* Status Badge - Premium Glass */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                >
                  <RestaurantStatusBadge 
                    isOpen={restaurant.isOpen === 1} 
                    businessHours={restaurant.businessHours || undefined}
                  />
                </motion.div>
              </div>
              
              {/* Info Pills - Glassmorphism */}
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap items-center gap-2"
              >
                {restaurant.businessHours && (
                  <div className="group flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 hover:border-amber-500/50 transition-all hover:bg-white/15 shadow-lg">
                    <Clock className="h-3 w-3 text-amber-400 group-hover:text-amber-300 transition-colors" />
                    <span className="text-[11px] font-medium text-white/90">{restaurant.businessHours}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="group flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 hover:border-amber-500/50 transition-all hover:bg-white/15 shadow-lg">
                    <Phone className="h-3 w-3 text-amber-400 group-hover:text-amber-300 transition-colors" />
                    <span className="text-[11px] font-medium text-white/90">{restaurant.phone}</span>
                  </div>
                )}
                {restaurant.address && (
                  <div className="group flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 hover:border-amber-500/50 transition-all hover:bg-white/15 shadow-lg max-w-[200px]">
                    <MapPin className="h-3 w-3 text-amber-400 group-hover:text-amber-300 transition-colors flex-shrink-0" />
                    <span className="text-[11px] font-medium text-white/90 truncate">{restaurant.address}</span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Shine Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      </motion.div>
    </div>
  );
};

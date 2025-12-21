import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface BusinessHour {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface RestaurantStatusProps {
  isOpen: boolean;
  businessHours?: string;
  compact?: boolean;
}

const DAYS_MAP: Record<string, string> = {
  monday: 'Seg',
  tuesday: 'Ter',
  wednesday: 'Qua',
  thursday: 'Qui',
  friday: 'Sex',
  saturday: 'Sáb',
  sunday: 'Dom',
};

const DAYS_FULL: Record<string, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export function RestaurantStatus({ isOpen, businessHours, compact = false }: RestaurantStatusProps) {
  let hours: BusinessHour[] = [];
  
  try {
    if (businessHours) {
      hours = JSON.parse(businessHours);
    }
  } catch (e) {
    console.error('Error parsing business hours:', e);
  }

  // Get current day
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = hours.find(h => h.day === currentDay);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
          isOpen 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}
      >
        {isOpen ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold">Aberto</span>
            {todayHours?.isOpen && (
              <span className="text-xs font-normal">
                até {todayHours.closeTime}
              </span>
            )}
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-xs font-bold">Fechado</span>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-neutral-600" />
          <h3 className="font-semibold text-neutral-900">Horário de Funcionamento</h3>
        </div>
        {isOpen ? (
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-bold text-green-700">Aberto Agora</span>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-bold text-red-700">Fechado</span>
          </div>
        )}
      </div>

      {/* Hours List */}
      {hours.length > 0 && (
        <div className="space-y-2">
          {hours.map((hour) => {
            const isCurrent = hour.day === currentDay;
            return (
              <div
                key={hour.day}
                className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                  isCurrent 
                    ? 'bg-amber-50 border border-amber-200' 
                    : 'bg-neutral-50'
                }`}
              >
                <span className={`text-sm font-medium ${
                  isCurrent ? 'text-amber-900' : 'text-neutral-700'
                }`}>
                  {DAYS_FULL[hour.day]}
                  {isCurrent && (
                    <span className="ml-2 text-xs text-amber-600">(Hoje)</span>
                  )}
                </span>
                {hour.isOpen ? (
                  <span className={`text-sm font-semibold ${
                    isCurrent ? 'text-amber-700' : 'text-neutral-600'
                  }`}>
                    {hour.openTime} - {hour.closeTime}
                  </span>
                ) : (
                  <span className="text-sm text-neutral-500 italic">Fechado</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Compact version for header/badges
export function RestaurantStatusBadge({ isOpen, businessHours }: RestaurantStatusProps) {
  return <RestaurantStatus isOpen={isOpen} businessHours={businessHours} compact />;
}

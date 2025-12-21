/**
 * Sistema de feedback sonoro para melhorar UX
 * Sons sutis e profissionais para ações do usuário
 */

// Configuração de sons
const SOUNDS = {
  success: {
    frequency: 800,
    duration: 100,
    volume: 0.1
  },
  identify: {
    frequency: 600,
    duration: 150,
    volume: 0.08
  },
  newUser: {
    frequency: 500,
    duration: 120,
    volume: 0.08
  },
  click: {
    frequency: 400,
    duration: 50,
    volume: 0.05
  },
  error: {
    frequency: 200,
    duration: 150,
    volume: 0.08
  }
};

// Cache do AudioContext (otimização)
let audioContext: AudioContext | null = null;

/**
 * Inicializa o AudioContext (lazy loading)
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext não suportado:', e);
      return null;
    }
  }
  
  return audioContext;
}

/**
 * Toca um som sintético usando Web Audio API
 */
function playTone(frequency: number, duration: number, volume: number = 0.1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Cria oscilador (gerador de frequência)
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configuração do som
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine'; // Onda senoidal (som suave)

    // Envelope de volume (fade in/out suave)
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Fade in rápido
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000); // Fade out

    // Toca o som
    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
  } catch (e) {
    console.warn('Erro ao tocar som:', e);
  }
}

/**
 * Toca som de sucesso (cliente identificado)
 */
export function playSoundIdentified() {
  const { frequency, duration, volume } = SOUNDS.identify;
  playTone(frequency, duration, volume);
  // Som duplo para efeito de "confirmação"
  setTimeout(() => {
    playTone(frequency * 1.5, duration * 0.7, volume * 0.7);
  }, duration * 0.5);
}

/**
 * Toca som de novo usuário
 */
export function playSoundNewUser() {
  const { frequency, duration, volume } = SOUNDS.newUser;
  playTone(frequency, duration, volume);
}

/**
 * Toca som de clique/tap
 */
export function playSoundClick() {
  const { frequency, duration, volume } = SOUNDS.click;
  playTone(frequency, duration, volume);
}

/**
 * Toca som de sucesso geral
 */
export function playSoundSuccess() {
  const { frequency, duration, volume } = SOUNDS.success;
  playTone(frequency, duration, volume);
}

/**
 * Toca som de erro
 */
export function playSoundError() {
  const { frequency, duration, volume } = SOUNDS.error;
  playTone(frequency, duration * 1.5, volume);
}

/**
 * Toca sequência de sons (para efeitos especiais)
 */
export function playSoundSequence(notes: { frequency: number; duration: number; delay: number }[]) {
  notes.forEach(({ frequency, duration, delay }) => {
    setTimeout(() => {
      playTone(frequency, duration, 0.08);
    }, delay);
  });
}

/**
 * Hook para verificar se os sons estão habilitados
 */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Verifica preferência do usuário (localStorage)
  const preference = localStorage.getItem('soundFeedbackEnabled');
  if (preference !== null) {
    return preference === 'true';
  }
  
  // Padrão: habilitado (mas respeitando prefer-reduced-motion)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return !prefersReducedMotion;
}

/**
 * Ativa/desativa sons
 */
export function setSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('soundFeedbackEnabled', String(enabled));
}

/**
 * Wrapper seguro para tocar sons (verifica preferências)
 */
export function playSound(soundType: 'identified' | 'newUser' | 'click' | 'success' | 'error') {
  if (!isSoundEnabled()) return;
  
  switch (soundType) {
    case 'identified':
      playSoundIdentified();
      break;
    case 'newUser':
      playSoundNewUser();
      break;
    case 'click':
      playSoundClick();
      break;
    case 'success':
      playSoundSuccess();
      break;
    case 'error':
      playSoundError();
      break;
  }
}

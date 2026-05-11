import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Bike, 
  TrendingUp, 
  History, 
  Settings, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  Calendar,
  Trash2,
  ChevronRight,
  Target,
  RotateCcw,
  Edit2,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Type,
  Play,
  Pause,
  Clock,
  Square,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'sonner';
import { Ride, DailyGoal, AppState, AppStateSnapshot, Activity, Platform, ActivityType, HourlyReport } from './types';

const STORAGE_KEY = 'asfalto_meta_state';
const PRESET_SOUNDS = [
  { name: 'Caixa Registradora 1', value: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3' },
  { name: 'Caixa Registradora 2', value: 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3' },
  { name: 'Caixa Registradora 3', value: 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3' },
  { name: 'Moedas Caindo', value: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' },
  { name: 'Sucesso Digital', value: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' },
  { name: 'Sino de Vitória', value: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3' },
  { name: 'Chime Brilhante', value: 'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3' },
  { name: 'Conquista Game', value: 'https://assets.mixkit.co/active_storage/sfx/2006/2006-preview.mp3' },
  { name: 'Fanfarra Curta', value: 'https://assets.mixkit.co/active_storage/sfx/2009/2009-preview.mp3' },
  { name: 'Level Up', value: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3' },
  { name: 'Tada!', value: 'https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3' },
  { name: 'Pop Suave', value: 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3' },
  { name: 'Brilho Mágico', value: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3' },
  { name: 'Notificação VIP', value: 'https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3' },
  { name: 'Vitória Retrô', value: 'https://assets.mixkit.co/active_storage/sfx/2007/2007-preview.mp3' },
  { name: 'Chime Feliz', value: 'https://assets.mixkit.co/active_storage/sfx/2008/2008-preview.mp3' },
];

const MOTORCYCLE_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2536/2536-preview.mp3';

const INITIAL_STATE: AppState = {
  rides: [],
  activities: [],
  goals: [],
  workTimer: {
    isRunning: false,
    startTime: null,
    accumulatedTime: 0,
    lastUpdateDate: new Date().toISOString().split('T')[0],
    currentShift: 'dia inteiro',
    lastRecordedHour: 0
  },
  settings: {
    defaultCountGoal: 10,
    defaultValueGoal: 150,
    defaultMonthlyGoal: 3000,
    enableShiftTracking: true,
    enableMonthlyGoal: true,
    defaultShifts: {
      manhã: { countGoal: 3, valueGoal: 50 },
      tarde: { countGoal: 4, valueGoal: 60 },
      noite: { countGoal: 3, valueGoal: 40 },
    },
    enableSound: true,
    enableAnimation: true,
    selectedRideSound: PRESET_SOUNDS[0].value,
    theme: {
      headerColor: '#FF6321', // Neon Orange
      countBarColor: '#FF6321',
      valueBarColor: '#FFD700', // Neon Yellow
      backgroundColor: 'dark',
      fontSize: 16,
      fontFamily: '"Inter", sans-serif'
    }
  },
  history: [],
  dailyJourneys: {},
  hourlyPerformance: []
};

const PRESET_COLORS = [
  { name: 'Preto', value: '#000000' },
  { name: 'Laranja Neon', value: '#FF6321' },
  { name: 'Amarelo Neon', value: '#FFD700' },
  { name: 'Verde Neon', value: '#00FF41' },
  { name: 'Azul Elétrico', value: '#00D4FF' },
  { name: 'Azul Neon', value: '#00FFFF' },
  { name: 'Vermelho Neon', value: '#FF0000' },
  { name: 'Rosa Choque', value: '#FF007F' },
  { name: 'Roxo Ultravioleta', value: '#9D00FF' },
  { name: 'Branco Asfalto', value: '#FFFFFF' },
  { name: 'Degradê Fogo', value: 'linear-gradient(135deg, #FF6321 0%, #FFD700 100%)' },
  { name: 'Degradê Oceano', value: 'linear-gradient(135deg, #00D4FF 0%, #00FFFF 100%)' },
  { name: 'Degradê Floresta', value: 'linear-gradient(135deg, #00FF41 0%, #008F11 100%)' },
  { name: 'Degradê Galáxia', value: 'linear-gradient(135deg, #9D00FF 0%, #FF007F 100%)' },
];

const PRESET_FONTS = [
  { name: 'Padrão (Inter)', value: '"Inter", sans-serif' },
  { name: 'Moderno (Outfit)', value: '"Outfit", sans-serif' },
  { name: 'Técnico (JetBrains Mono)', value: '"JetBrains Mono", monospace' },
  { name: 'Elegante (Playfair Display)', value: '"Playfair Display", serif' },
  { name: 'Brutalista (Space Grotesk)', value: '"Space Grotesk", sans-serif' },
  { name: 'Clássico (Georgia)', value: 'Georgia, serif' },
  { name: 'Sistema', value: 'system-ui, sans-serif' },
];

const PRESET_BG_IMAGES = [
  { name: 'Nenhum', value: '' },
  { name: 'Uber Logo', value: 'https://images.unsplash.com/photo-1591628001888-76cc02e0c276?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Uber Noite', value: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Crosser Vermelha', value: 'https://images.unsplash.com/photo-1558981285-e53bc946b484?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Crosser Trilha', value: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Cidade Noite', value: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Estrada Aberta', value: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Moto Detalhe', value: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Esportiva', value: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Clássica', value: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Chopper', value: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Aventura', value: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Noite Urbana', value: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Montanha', value: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Neon Futurista', value: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Asfalto Textura', value: 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Velocidade', value: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1000' },
];

const PRESET_BG_COLORS = [
  { name: 'Padrão', value: '' },
  { name: 'Azul Profundo', value: '#0A192F' },
  { name: 'Azul Marinho', value: '#001F3F' },
  { name: 'Verde Musgo', value: '#0B1A0E' },
  { name: 'Roxo Noite', value: '#1A0B2E' },
  { name: 'Cinza', value: '#333333' },
  { name: 'Cinza Chumbo', value: '#121212' },
  { name: 'Metal', value: '#4A4E52' },
  { name: 'Vinho Escuro', value: '#1A0505' },
];

const PRESET_PLATFORMS: Platform[] = ['Uber', '99', 'Outros'];

const WheelieBike = () => (
  <div 
    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 pointer-events-none"
    style={{ transform: 'translate(40%, -60%) rotate(-35deg)' }}
  >
    <Bike size={22} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
  </div>
);

export default function App() {
  const [today, setToday] = useState(() => new Date().toISOString().split('T')[0]);

  // Update today periodically
  useEffect(() => {
    const timer = setInterval(() => {
      const newToday = new Date().toISOString().split('T')[0];
      if (newToday !== today) setToday(newToday);
    }, 60000);
    return () => clearInterval(timer);
  }, [today]);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration for old state without theme
      if (!parsed.settings.theme) {
        parsed.settings.theme = INITIAL_STATE.settings.theme;
      }
      // Migration for background color
      if (!parsed.settings.theme.backgroundColor) {
        parsed.settings.theme.backgroundColor = 'dark';
      }
      if (!parsed.settings.theme.fontSize) {
        parsed.settings.theme.fontSize = 16;
      }
      if (!parsed.settings.theme.fontFamily) {
        parsed.settings.theme.fontFamily = '"Inter", sans-serif';
      }
      // Migration for history
      if (!parsed.history) {
        parsed.history = [];
      }
      if (!parsed.activities) {
        parsed.activities = [];
      }
      if (!parsed.dailyJourneys) {
        parsed.dailyJourneys = {};
      } else {
        // Migrate dailyJourneys from number to object if necessary
        Object.keys(parsed.dailyJourneys).forEach(date => {
          if (typeof parsed.dailyJourneys[date] === 'number') {
            parsed.dailyJourneys[date] = { 'dia inteiro': parsed.dailyJourneys[date] };
          }
        });
      }
      if (!parsed.hourlyPerformance) {
        parsed.hourlyPerformance = [];
      }
      // Migration for hourly saving in workTimer
      if (parsed.workTimer && parsed.workTimer.lastRecordedHour === undefined) {
        parsed.workTimer.lastRecordedHour = 0;
      }
      // Migration for sound and animation
      if (parsed.settings.enableSound === undefined) {
        parsed.settings.enableSound = true;
      }
      if (parsed.settings.enableAnimation === undefined) {
        parsed.settings.enableAnimation = true;
      }
      if (parsed.settings.enableShiftTracking === undefined) {
        parsed.settings.enableShiftTracking = true;
      }
      if (parsed.settings.selectedRideSound === undefined) {
        parsed.settings.selectedRideSound = PRESET_SOUNDS[0].value;
      }
      if (parsed.settings.defaultMonthlyGoal === undefined) {
        parsed.settings.defaultMonthlyGoal = 3000;
      }
      if (parsed.settings.enableMonthlyGoal === undefined) {
        parsed.settings.enableMonthlyGoal = true;
      }
      // Migration for shift goals
      if (!parsed.settings.defaultShifts) {
        parsed.settings.defaultShifts = INITIAL_STATE.settings.defaultShifts;
      }
      if (parsed.goals) {
        parsed.goals = parsed.goals.map((goal: any) => {
          if (!goal.shifts) {
            return {
              ...goal,
              shifts: INITIAL_STATE.settings.defaultShifts
            };
          }
          return goal;
        });
      }
      // Migration for shift
      if (parsed.rides) {
        parsed.rides = parsed.rides.map((ride: any) => ({
          ...ride,
          shift: ride.shift || 'manhã'
        }));
      }
      // Migration for workTimer
      if (!parsed.workTimer) {
        parsed.workTimer = INITIAL_STATE.workTimer;
      } else {
        if (!parsed.workTimer.currentShift) {
          parsed.workTimer.currentShift = 'dia inteiro';
        }
        
        if (parsed.workTimer.lastUpdateDate !== today) {
          // Automatically reset timer if it's a new day
          const oldDate = parsed.workTimer.lastUpdateDate;
          const timeToSave = parsed.workTimer.accumulatedTime;
          const shiftToSave = parsed.workTimer.currentShift || 'dia inteiro';
          
          // Save previous day journey if there was time
          if (timeToSave > 0) {
            if (!parsed.dailyJourneys) parsed.dailyJourneys = {};
            if (!parsed.dailyJourneys[oldDate]) parsed.dailyJourneys[oldDate] = {};
            parsed.dailyJourneys[oldDate][shiftToSave] = (parsed.dailyJourneys[oldDate][shiftToSave] || 0) + timeToSave;
          }

          parsed.workTimer = {
            ...INITIAL_STATE.workTimer,
            lastUpdateDate: today
          };
        }
      }
      return parsed;
    }
    return INITIAL_STATE;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'finance' | 'productivity' | 'settings'>('dashboard');
  const [dashboardShift, setDashboardShift] = useState<'manhã' | 'tarde' | 'noite' | 'dia'>(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'manhã';
    if (hour >= 12 && hour < 19) return 'tarde';
    return 'noite';
  });
  const [registrationShift, setRegistrationShift] = useState<'manhã' | 'tarde' | 'noite'>(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'manhã';
    if (hour >= 12 && hour < 19) return 'tarde';
    return 'noite';
  });
  const [historyShift, setHistoryShift] = useState<'all' | 'manhã' | 'tarde' | 'noite'>('all');

  // Sync history shift with dashboard shift
  useEffect(() => {
    if (state.settings.enableShiftTracking) {
      if (dashboardShift === 'dia') {
        setHistoryShift('all');
      } else {
        setHistoryShift(dashboardShift as any);
      }
      
      if (dashboardShift !== 'dia') {
        setRegistrationShift(dashboardShift);
      }
    }
  }, [dashboardShift, state.settings.enableShiftTracking]);

  const [isAddingRide, setIsAddingRide] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isEditingMonthlyGoal, setIsEditingMonthlyGoal] = useState(false);
  const [tempMonthlyGoal, setTempMonthlyGoal] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(today.substring(0, 7));
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
  const [newRideValue, setNewRideValue] = useState('');
  const [newRideDesc, setNewRideDesc] = useState('');
  const [newRideShift, setNewRideShift] = useState<'manhã' | 'tarde' | 'noite'>('manhã');
  const [newRideDate, setNewRideDate] = useState(today);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTimerResetConfirm, setShowTimerResetConfirm] = useState(false);
  const [showTimerStopConfirm, setShowTimerStopConfirm] = useState(false);

  const [newActivityType, setNewActivityType] = useState<ActivityType>('recebimento');
  const [newActivityPlatform, setNewActivityPlatform] = useState<Platform>('Uber');
  const [newActivityValue, setNewActivityValue] = useState('');
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [newActivityDate, setNewActivityDate] = useState(today);
  const [newActivityShift, setNewActivityShift] = useState<'manhã' | 'tarde' | 'noite'>('manhã');

  const [quickValue, setQuickValue] = useState('');
  const [lastAddedValue, setLastAddedValue] = useState<number | null>(null);
  const [showFloatingValue, setShowFloatingValue] = useState(false);

  // Timer Tick
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const playBeep = async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio beep failed', e);
    }
  };

  useEffect(() => {
    let interval: any;
    if (state.workTimer?.isRunning && state.workTimer.startTime) {
      const update = () => {
        const now = Date.now();
        const diff = now - state.workTimer!.startTime!;
        setElapsedTime((state.workTimer?.accumulatedTime || 0) + diff);
      };
      update(); // Update immediately
      interval = setInterval(update, 1000);
    } else {
      setElapsedTime(state.workTimer?.accumulatedTime || 0);
    }
    return () => clearInterval(interval);
  }, [state.workTimer?.isRunning, state.workTimer?.startTime, state.workTimer?.accumulatedTime]);

  const toggleTimer = () => {
    setState(prev => {
      const now = Date.now();
      const isRunning = !prev.workTimer?.isRunning;
      
      return {
        ...prev,
        workTimer: {
          isRunning,
          startTime: isRunning ? now : null,
          accumulatedTime: isRunning 
            ? (prev.workTimer?.accumulatedTime || 0) 
            : (prev.workTimer?.accumulatedTime || 0) + (prev.workTimer?.startTime ? (now - prev.workTimer.startTime) : 0),
          lastUpdateDate: today,
          currentShift: prev.workTimer?.currentShift || 'dia inteiro'
        }
      };
    });
  };

  const setTimerShift = (shift: 'dia inteiro' | 'manhã' | 'tarde' | 'noite') => {
    setState(prev => ({
      ...prev,
      workTimer: {
        ...(prev.workTimer || { isRunning: false, startTime: null, accumulatedTime: 0, lastUpdateDate: today }),
        currentShift: shift
      }
    }));
  };

  const resetTimer = () => {
    setShowTimerResetConfirm(true);
  };

  const confirmResetTimer = () => {
    setState(prev => ({
      ...prev,
      workTimer: {
        isRunning: false,
        startTime: null,
        accumulatedTime: 0,
        lastUpdateDate: today,
        currentShift: prev.workTimer?.currentShift || 'dia inteiro'
      }
    }));
    setShowTimerResetConfirm(false);
    toast.success("Cronômetro zerado!");
  };

  const stopTimer = () => {
    setShowTimerStopConfirm(true);
  };

  const confirmStopTimer = () => {
    setState(prev => {
      const timeToSave = (prev.workTimer?.accumulatedTime || 0) + 
        (prev.workTimer?.isRunning && prev.workTimer?.startTime ? (Date.now() - prev.workTimer.startTime) : 0);
      const shiftToSave = prev.workTimer?.currentShift || 'dia inteiro';
      const newDailyJourneys = { ...(prev.dailyJourneys || {}) };
      
      if (timeToSave > 0) {
        if (!newDailyJourneys[today]) newDailyJourneys[today] = {};
        newDailyJourneys[today][shiftToSave] = (newDailyJourneys[today][shiftToSave] || 0) + timeToSave;
      }

      return {
        ...prev,
        dailyJourneys: newDailyJourneys,
        workTimer: {
          isRunning: false,
          startTime: null,
          accumulatedTime: 0, // Reset after saving
          lastUpdateDate: today,
          currentShift: prev.workTimer?.currentShift || 'dia inteiro'
        }
      };
    });
    setShowTimerStopConfirm(false);
    toast.success("Jornada finalizada e salva!");
  };

  const deleteJourneyTime = (date: string, shift: string) => {
    setState(prev => {
      const newDailyJourneys = { ...(prev.dailyJourneys || {}) };
      if (newDailyJourneys[date]) {
        const dateJourneys = { ...newDailyJourneys[date] };
        delete dateJourneys[shift];
        
        if (Object.keys(dateJourneys).length === 0) {
          delete newDailyJourneys[date];
        } else {
          newDailyJourneys[date] = dateJourneys;
        }
      }
      
      return {
        ...prev,
        dailyJourneys: newDailyJourneys
      };
    });
    toast.success("Tempo de trabalho removido!");
  };

  const deleteHourlyReport = (timestamp: number) => {
    setState(prev => ({
      ...prev,
      hourlyPerformance: (prev.hourlyPerformance || []).filter(p => p.timestamp !== timestamp)
    }));
    toast.success("Registro horário removido!");
  };

  const formatElapsedTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Refs to track goal completion state
  const countGoalReachedRef = useRef(false);
  const valueGoalReachedRef = useRef(false);
  const nearGoalReachedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const motorcycleAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(state.settings.selectedRideSound || PRESET_SOUNDS[0].value);
    motorcycleAudioRef.current = new Audio(MOTORCYCLE_SOUND);
  }, []);

  // Update ride sound when setting changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = state.settings.selectedRideSound || PRESET_SOUNDS[0].value;
    }
  }, [state.settings.selectedRideSound]);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getCurrentShift = (): 'manhã' | 'tarde' | 'noite' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'manhã';
    if (hour >= 12 && hour < 19) return 'tarde';
    return 'noite';
  };

  const currentGoal = useMemo(() => {
    const goal = state.goals.find(g => g.date === today);
    return goal || { 
      date: today, 
      countGoal: state.settings.defaultCountGoal, 
      valueGoal: state.settings.defaultValueGoal,
      shifts: state.settings.defaultShifts || INITIAL_STATE.settings.defaultShifts
    };
  }, [state.goals, state.settings, today]);

  const todayRides = useMemo(() => {
    return state.rides.filter(r => r.date === today);
  }, [state.rides, today]);

  const totalJourneyTime = useMemo(() => {
    const dailyJourneysObj = state.dailyJourneys?.[today] || {};
    return (Object.values(dailyJourneysObj) as number[]).reduce((acc: number, curr: number) => acc + curr, 0) + elapsedTime;
  }, [state.dailyJourneys, today, elapsedTime]);

  const todayStats = useMemo(() => {
    const count = todayRides.length;
    
    // Revenue (Faturamento) comes strictly from rides
    const value = todayRides.reduce((acc, curr) => acc + curr.value, 0);
    
    const todayActivities = state.activities.filter(a => a.date === today && a.type === 'recebimento');
    
    const shifts = {
      manhã: { count: 0, value: 0 },
      tarde: { count: 0, value: 0 },
      noite: { count: 0, value: 0 }
    };

    todayRides.forEach(ride => {
      const s = ride.shift || 'manhã';
      shifts[s].count++;
      shifts[s].value += ride.value;
    });

    // Manual activities (recebimentos) are tracked but don't affect Faturamento metrics
    const totalActivitiesValue = todayActivities.reduce((acc, curr) => acc + curr.value, 0);

    // Total value for daily goal (Unified: Rides + Manual Receipts)
    const totalDayValue = value + totalActivitiesValue;

    const isDayView = dashboardShift === 'dia' || !state.settings.enableShiftTracking;
    const currentShift = isDayView ? registrationShift : dashboardShift;
    
    // Journey Time Calculation
    const journeyTime = isDayView ? totalJourneyTime : (((state.dailyJourneys?.[today] || {}) as Record<string, number>)[currentShift] || 0) + 
      (state.workTimer?.currentShift === currentShift ? elapsedTime : 0);
    
    // For shift view, we still use shift-specific values
    // For day view, we use the unified total
    const currentShiftStats = isDayView 
      ? { count, value: totalDayValue } 
      : shifts[currentShift as 'manhã' | 'tarde' | 'noite'];
      
    const currentShiftGoal = isDayView
      ? { countGoal: currentGoal.countGoal, valueGoal: currentGoal.valueGoal }
      : (currentGoal.shifts || INITIAL_STATE.settings.defaultShifts!)[currentShift as 'manhã' | 'tarde' | 'noite'];

    return { count, value, shifts, currentShift, currentShiftStats, currentShiftGoal, isDayView, journeyTime };
  }, [todayRides, state.activities, state.dailyJourneys, state.workTimer, elapsedTime, currentGoal, dashboardShift, today, registrationShift, totalJourneyTime, state.settings.enableShiftTracking]);

  // Hourly performance tracking effect
  useEffect(() => {
    if (!state.workTimer?.isRunning) return;

    const currentHour = Math.floor(totalJourneyTime / 3600000); 
    const lastRecorded = state.workTimer?.lastRecordedHour || 0;

    if (currentHour > lastRecorded && currentHour > 0) {
      // A new hour has passed!
      const currentValue = todayRides.reduce((acc, curr) => acc + curr.value, 0);
      
      const todayReports = (state.hourlyPerformance || []).filter(p => p.date === today);
      const lastSnapshot = todayReports.sort((a, b) => b.hourMark - a.hourMark)[0];
      const incremental = lastSnapshot ? currentValue - lastSnapshot.valueAtMark : currentValue;
      
      const newReport: HourlyReport = {
        timestamp: Date.now(),
        date: today,
        hourMark: currentHour,
        valueAtMark: currentValue,
        incrementalValue: incremental
      };

      setState(prev => ({
        ...prev,
        workTimer: {
          ...prev.workTimer!,
          lastRecordedHour: currentHour
        },
        hourlyPerformance: [newReport, ...(prev.hourlyPerformance || [])]
      }));

      if (state.settings.enableSound) {
        playBeep();
      }
      toast.success(`Hora ${currentHour} registrada! +R$ ${incremental.toFixed(2)}`, {
        icon: <TrendingUp className="text-green-500" size={16} />
      });
    }
  }, [totalJourneyTime, state.workTimer?.isRunning, state.workTimer?.lastRecordedHour, todayRides, state.hourlyPerformance, state.settings.enableSound, today]);


  const monthlyStats = useMemo(() => {
    const monthActivities = state.activities.filter(a => a.date.startsWith(selectedMonth) && a.type === 'recebimento');
    const activitiesValue = monthActivities.reduce((acc, curr) => acc + curr.value, 0);
    
    const monthRides = state.rides.filter(r => r.date.startsWith(selectedMonth));
    const ridesValue = monthRides.reduce((acc, curr) => acc + curr.value, 0);

    const totalValue = activitiesValue + ridesValue;
    
    const goal = state.settings.defaultMonthlyGoal || 3000;
    const remaining = Math.max(0, goal - totalValue);
    
    const [year, month] = selectedMonth.split('-').map(Number);
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    
    const currentMonthStr = today.substring(0, 7);
    let daysRemaining = lastDayOfMonth;
    
    if (selectedMonth === currentMonthStr) {
      const currentDay = new Date().getDate();
      daysRemaining = Math.max(1, lastDayOfMonth - currentDay + 1);
    } else if (selectedMonth < currentMonthStr) {
      daysRemaining = 1; // Month passed, show stats as final
    }
    
    const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));
    
    const dailyNeeded = remaining / daysRemaining;
    const weeklyNeeded = remaining / weeksRemaining;
    
    const progress = Math.min(100, (totalValue / goal) * 100);
    
    return { totalValue, goal, remaining, dailyNeeded, weeklyNeeded, progress, daysRemaining, weeksRemaining, selectedMonth };
  }, [state.activities, state.rides, state.settings.defaultMonthlyGoal, today, selectedMonth]);

  const financeStats = useMemo(() => {
    const now = new Date();
    const currentDay = today;
    
    // Helper to get start of week (Sunday)
    const getStartOfWeek = (d: Date) => {
      const day = d.getDay();
      const diff = d.getDate() - day;
      return new Date(d.setDate(diff)).toISOString().split('T')[0];
    };
    const startOfWeek = getStartOfWeek(new Date(now));
    const currentMonth = today.substring(0, 7);

    const filterByDate = (activities: Activity[], start: string, end?: string) => {
      if (end) {
        return activities.filter(a => a.date >= start && a.date <= end);
      }
      return activities.filter(a => a.date.startsWith(start));
    };

    const calculateTotals = (activities: Activity[], rides: Ride[]) => {
      const totals = {
        faturamento: 0, // Only rides
        recebimentoManual: { total: 0, Uber: 0, 99: 0, Outros: 0 },
        despesa: { total: 0, Uber: 0, 99: 0, Outros: 0 },
        totalRecebido: 0 // Rides + Manual
      };

      activities.forEach(a => {
        if (a.type === 'recebimento') {
          totals.recebimentoManual.total += a.value;
          totals.recebimentoManual[a.platform] += a.value;
          totals.totalRecebido += a.value;
        } else {
          totals.despesa.total += a.value;
          totals.despesa[a.platform] += a.value;
        }
      });

      // Ride values are strictly for Faturamento
      rides.forEach(r => {
        totals.faturamento += r.value;
        totals.totalRecebido += r.value;
      });

      return totals;
    };

    const dayActivities = state.activities.filter(a => a.date === currentDay);
    const weekActivities = state.activities.filter(a => a.date >= startOfWeek);
    const monthActivities = state.activities.filter(a => a.date.startsWith(currentMonth));

    const dayRides = state.rides.filter(r => r.date === currentDay);
    const weekRides = state.rides.filter(r => r.date >= startOfWeek);
    const monthRides = state.rides.filter(r => r.date.startsWith(currentMonth));

    return {
      day: calculateTotals(dayActivities, dayRides),
      week: calculateTotals(weekActivities, weekRides),
      month: calculateTotals(monthActivities, monthRides)
    };
  }, [state.activities, state.rides, today]);

  // Celebration and Near-Goal logic
  useEffect(() => {
    const isShiftMode = state.settings.enableShiftTracking;
    
    const countReached = isShiftMode 
      ? todayStats.currentShiftStats.count >= todayStats.currentShiftGoal.countGoal && todayStats.currentShiftGoal.countGoal > 0
      : todayStats.count >= currentGoal.countGoal && currentGoal.countGoal > 0;
      
    const valueReached = isShiftMode
      ? todayStats.currentShiftStats.value >= todayStats.currentShiftGoal.valueGoal && todayStats.currentShiftGoal.valueGoal > 0
      : todayStats.value >= currentGoal.valueGoal && currentGoal.valueGoal > 0;

    // Near goal logic: 1 ride left OR 90% of value reached
    const targetCountGoal = isShiftMode ? todayStats.currentShiftGoal.countGoal : currentGoal.countGoal;
    const targetValueGoal = isShiftMode ? todayStats.currentShiftGoal.valueGoal : currentGoal.valueGoal;
    const targetCount = isShiftMode ? todayStats.currentShiftStats.count : todayStats.count;
    const targetValue = isShiftMode ? todayStats.currentShiftStats.value : todayStats.value;

    const isNearCountGoal = targetCount === targetCountGoal - 1 && targetCountGoal > 1;
    const isNearValueGoal = targetValue >= targetValueGoal * 0.9 && targetValue < targetValueGoal && targetValueGoal > 0;

    if ((isNearCountGoal || isNearValueGoal) && !nearGoalReachedRef.current && !countReached && !valueReached) {
      notifyNearGoal();
      nearGoalReachedRef.current = true;
    }

    // Reset near goal ref if we move away from the near state (e.g. undo)
    if (!isNearCountGoal && !isNearValueGoal && !countReached && !valueReached) {
      nearGoalReachedRef.current = false;
    }

    if (countReached && !countGoalReachedRef.current) {
      triggerCelebration(isShiftMode ? `Meta de Corridas do Turno (${todayStats.currentShift}) Batida!` : 'Meta de Corridas Diária Batida!');
      countGoalReachedRef.current = true;
    } else if (!countReached) {
      countGoalReachedRef.current = false;
    }

    if (valueReached && !valueGoalReachedRef.current) {
      triggerCelebration(isShiftMode ? `Meta de Faturamento do Turno (${todayStats.currentShift}) Batida!` : 'Meta de Faturamento Diário Batida!');
      valueGoalReachedRef.current = true;
    } else if (!valueReached) {
      valueGoalReachedRef.current = false;
    }
  }, [todayStats, currentGoal, state.settings.enableShiftTracking]);

  const notifyNearGoal = () => {
    const message = "Falta pouco para você largar!";
    
    // Written notification
    toast.info(message, {
      description: "Você está quase batendo sua meta de hoje!",
      duration: 5000,
      icon: <Bike className="text-blue-500" size={18} />
    });

    // Sound notification (TTS)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const triggerCelebration = (text: string) => {
    // Play motorcycle sound
    if (state.settings.enableSound && motorcycleAudioRef.current) {
      motorcycleAudioRef.current.currentTime = 0;
      motorcycleAudioRef.current.play().catch(e => console.log('Motorcycle audio play failed:', e));
    }

    // Voice message
    if (state.settings.enableSound && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Parabéns, meta concluída com sucesso");
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }

    // Play chaching sound too
    if (state.settings.enableSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    if (state.settings.enableAnimation) {
      // Confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  };

  const saveHistory = (prevState: AppState) => {
    const snapshot: AppStateSnapshot = {
      rides: prevState.rides,
      activities: prevState.activities,
      goals: prevState.goals
    };
    return [snapshot, ...prevState.history].slice(0, 10); // Keep last 10 actions
  };

  const addActivity = () => {
    if (!newActivityValue) return;
    const val = parseFloat(newActivityValue.replace(',', '.'));
    if (isNaN(val)) return;

    const activity: Activity = {
      id: crypto.randomUUID(),
      date: newActivityDate,
      type: newActivityType,
      platform: newActivityPlatform,
      value: val,
      description: newActivityDesc || (newActivityType === 'recebimento' ? 'Recebimento' : 'Despesa'),
      shift: newActivityShift
    };

    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      activities: [activity, ...prev.activities]
    }));

    setNewActivityValue('');
    setNewActivityDesc('');
    setNewActivityShift(registrationShift);
    setIsAddingActivity(false);
    setEditingActivity(null);
  };

  const updateActivity = () => {
    if (!editingActivity || !newActivityValue) return;
    const val = parseFloat(newActivityValue.replace(',', '.'));
    if (isNaN(val)) return;

    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      activities: prev.activities.map(a => a.id === editingActivity.id ? {
        ...a,
        date: newActivityDate,
        type: newActivityType,
        platform: newActivityPlatform,
        value: val,
        description: newActivityDesc,
        shift: newActivityShift
      } : a)
    }));

    setNewActivityValue('');
    setNewActivityDesc('');
    setNewActivityShift(registrationShift);
    setIsAddingActivity(false);
    setEditingActivity(null);
  };

  const deleteActivity = (id: string) => {
    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      activities: prev.activities.filter(a => a.id !== id)
    }));
  };

  const startEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setNewActivityType(activity.type);
    setNewActivityPlatform(activity.platform);
    setNewActivityValue(activity.value.toString());
    setNewActivityDesc(activity.description);
    setNewActivityDate(activity.date);
    setNewActivityShift(activity.shift || 'manhã');
    setIsAddingActivity(true);
  };

  const quickAddRide = (value: number, description: string = 'Corrida', date: string = today) => {
    const ride: Ride = {
      id: crypto.randomUUID(),
      date: date,
      timestamp: Date.now(),
      value: value,
      description: description,
      shift: date === today ? registrationShift : 'manhã'
    };

    if (value > 0) {
      setLastAddedValue(value);
      if (state.settings.enableAnimation) {
        setShowFloatingValue(true);
        setTimeout(() => setShowFloatingValue(false), 2000);
      }
      
      // Play cash register sound
      if (state.settings.enableSound && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }

    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      rides: [ride, ...prev.rides]
    }));
  };

  const handleQuickValueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickValue.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      quickAddRide(val, `Entrada Rápida R$ ${val}`);
      setQuickValue('');
      toast.success(`Adicionado R$ ${val.toFixed(2)}`);
    }
  };

  const addRide = () => {
    if (!newRideValue) return;
    
    const val = parseFloat(newRideValue);
    const ride: Ride = {
      id: crypto.randomUUID(),
      date: newRideDate,
      timestamp: Date.now(),
      value: val,
      description: newRideDesc || 'Corrida',
      shift: newRideShift
    };

    if (val > 0) {
      setLastAddedValue(val);
      if (state.settings.enableAnimation) {
        setShowFloatingValue(true);
        setTimeout(() => setShowFloatingValue(false), 2000);
      }
      
      // Play cash register sound
      if (state.settings.enableSound && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }

    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      rides: [ride, ...prev.rides]
    }));

    setNewRideValue('');
    setNewRideDesc('');
    setNewRideDate(today);
    setIsAddingRide(false);
  };

  const updateRide = () => {
    if (!editingRide || !newRideValue) return;

    const val = parseFloat(newRideValue);
    
    if (val > 0 && val !== editingRide.value) {
      // Play cash register sound
      if (state.settings.enableSound && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }

    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      rides: prev.rides.map(r => r.id === editingRide.id ? {
        ...r,
        value: val,
        description: newRideDesc || 'Corrida',
        shift: newRideShift,
        date: newRideDate,
        timestamp: r.timestamp || Date.now()
      } : r)
    }));

    setNewRideValue('');
    setNewRideDesc('');
    setNewRideDate(today);
    setEditingRide(null);
  };

  const deleteRide = (id: string) => {
    setState(prev => ({
      ...prev,
      history: saveHistory(prev),
      rides: prev.rides.filter(r => r.id !== id)
    }));
  };

  const undo = () => {
    if (state.history.length === 0) return;

    const [lastSnapshot, ...remainingHistory] = state.history;
    setState(prev => ({
      ...prev,
      rides: lastSnapshot.rides,
      activities: lastSnapshot.activities || [],
      goals: lastSnapshot.goals,
      history: remainingHistory
    }));
  };

  const startEdit = (ride: Ride) => {
    setEditingRide(ride);
    setNewRideValue(ride.value.toString());
    setNewRideDesc(ride.description || '');
    setNewRideShift(ride.shift || 'manhã');
    setNewRideDate(ride.date);
    setIsAddingRide(true);
  };

  const updateSettings = (count: number, value: number) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        defaultCountGoal: count,
        defaultValueGoal: value
      }
    }));
  };

  const updateShiftGoal = (shift: 'manhã' | 'tarde' | 'noite', key: 'countGoal' | 'valueGoal', value: number) => {
    setState(prev => {
      const currentShifts = prev.settings.defaultShifts || INITIAL_STATE.settings.defaultShifts!;
      const newShifts = {
        ...currentShifts,
        [shift]: {
          ...currentShifts[shift],
          [key]: value
        }
      };
      
      return {
        ...prev,
        settings: {
          ...prev.settings,
          defaultShifts: newShifts
        }
      };
    });
  };

  const updatePreference = (key: 'enableSound' | 'enableAnimation' | 'enableShiftTracking' | 'enableMonthlyGoal' | 'defaultMonthlyGoal' | 'defaultCountGoal' | 'defaultValueGoal', value: any) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const updateTheme = (key: keyof AppState['settings']['theme'], value: string | number) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: {
          ...prev.settings.theme,
          [key]: value
        }
      }
    }));
  };

  const motionProps = (initial: any, animate: any, exit?: any) => {
    if (!state.settings.enableAnimation) return {};
    return { initial, animate, exit };
  };

  const countProgress = state.settings.enableShiftTracking
    ? Math.min((todayStats.currentShiftStats.count / todayStats.currentShiftGoal.countGoal) * 100, 100)
    : Math.min((todayStats.count / currentGoal.countGoal) * 100, 100);
    
  const valueProgress = state.settings.enableShiftTracking
    ? Math.min((todayStats.currentShiftStats.value / todayStats.currentShiftGoal.valueGoal) * 100, 100)
    : Math.min((todayStats.value / currentGoal.valueGoal) * 100, 100);

  const isDark = state.settings.theme.backgroundColor === 'dark';
  
  const targetCount = state.settings.enableShiftTracking ? todayStats.currentShiftStats.count : todayStats.count;
  const targetCountGoal = state.settings.enableShiftTracking ? todayStats.currentShiftGoal.countGoal : currentGoal.countGoal;
  const targetValue = state.settings.enableShiftTracking ? todayStats.currentShiftStats.value : todayStats.value;
  const targetValueGoal = state.settings.enableShiftTracking ? todayStats.currentShiftGoal.valueGoal : currentGoal.valueGoal;

  const bgColor = state.settings.theme.customBgColor || (isDark ? '#0F1115' : '#FFFFFF');
  const textColor = isDark ? 'text-white' : 'text-black';
  const mutedTextColor = isDark ? 'text-white/50' : 'text-black/50';
  const subMutedTextColor = isDark ? 'text-white/30' : 'text-black/30';
  const cardClass = isDark ? 'glass-card glass-card-dark' : 'glass-card glass-card-light';

  const mainBgStyle = {
    backgroundColor: bgColor,
    backgroundImage: state.settings.theme.bgImage ? `url(${state.settings.theme.bgImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed' as const,
    fontSize: state.settings.theme.fontSize ? `${state.settings.theme.fontSize}px` : '16px',
    fontFamily: state.settings.theme.fontFamily || '"Inter", sans-serif'
  };

  const getStyle = (color: string, isText = false) => {
    if (color.startsWith('linear-gradient')) {
      if (isText) {
        return {
          background: color,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        };
      }
      return { background: color };
    }
    return isText ? { color } : { backgroundColor: color };
  };

  const getSolidColor = (color: string) => {
    if (color.startsWith('linear-gradient')) {
      // Extract first color from gradient for things that don't support gradients well (like accentColor)
      const match = color.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/);
      return match ? match[0] : '#FF6321';
    }
    return color;
  };

  return (
    <div className={`min-h-screen ${textColor} transition-colors duration-500 pb-24 relative`} style={mainBgStyle}>
      {state.settings.theme.bgImage && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-500" 
          style={{ 
            backgroundColor: bgColor, 
            opacity: 1 - (state.settings.theme.bgOpacity ?? 0.3) 
          }} 
        />
      )}
      <Toaster position="top-center" theme={isDark ? 'dark' : 'light'} richColors />
      {/* Header */}
      <header className="p-4 sm:p-6 pt-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-20 -mr-16 -mt-16 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400" 
            alt="Motorcycle" 
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2 rounded-lg neon-glow transition-colors duration-500"
              style={getStyle(state.settings.theme.headerColor)}
            >
              <Bike className="text-white" size={24} />
            </div>
            <h1 className="text-5xl font-bold tracking-tighter uppercase italic">
              Marcos <span style={getStyle(state.settings.theme.headerColor, true)}>Meta</span>
            </h1>
          </div>
          <p className={`${mutedTextColor} text-sm font-mono`}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 space-y-6 pb-32">
        {activeTab === 'dashboard' && (
          <motion.div 
            {...motionProps({ opacity: 0, y: 20 }, { opacity: 1, y: 0 })}
            className="space-y-6"
          >
            {/* Work Timer Section */}
            <div className={`${cardClass} p-3 sm:p-4 flex flex-col gap-2 relative overflow-hidden ring-1 ring-white/5`}>
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${state.workTimer?.isRunning ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-white/40'}`}>
                    <Clock size={16} className={state.workTimer?.isRunning ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <p className={`${mutedTextColor} text-[9px] uppercase font-mono tracking-widest`}>Controle de Jornada</p>
                    <p className="text-2xl font-bold font-mono tracking-tighter">
                      {formatElapsedTime(elapsedTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1.5">
                  <button 
                    onClick={resetTimer}
                    className={`p-2 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'} ${subMutedTextColor} transition-colors`}
                    title="Reiniciar (Limpa sem salvar)"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button 
                    onClick={stopTimer}
                    className={`p-2 rounded-xl ${isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500' : 'bg-red-50 hover:bg-red-100 text-red-600'} transition-colors`}
                    title="Parar e Salvar"
                  >
                    <Square size={16} fill="currentColor" />
                  </button>
                  <button 
                    onClick={toggleTimer}
                    className={`p-2.5 rounded-xl transition-all shadow-lg active:scale-95 ${state.workTimer?.isRunning ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-green-500 text-white shadow-green-500/20'}`}
                    title={state.workTimer?.isRunning ? 'Pausar' : 'Iniciar'}
                  >
                    {state.workTimer?.isRunning ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                </div>
              </div>

              {/* Shift Selector for Timer */}
              {state.settings.enableShiftTracking && (
                <div className="flex gap-1.5 mb-1">
                  {(['dia inteiro', 'manhã', 'tarde', 'noite'] as const).map(shift => (
                    <button
                      key={shift}
                      onClick={() => setTimerShift(shift)}
                      disabled={state.workTimer?.isRunning}
                      className={`flex-1 py-1.5 px-0.5 rounded-xl text-[9px] uppercase font-mono font-bold tracking-tight transition-all ${
                        state.workTimer?.currentShift === shift
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                          : isDark ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-black/5 text-black/40 hover:bg-black/10'
                      } ${state.workTimer?.isRunning ? 'opacity-50 cursor-not-allowed border border-white/5' : ''}`}
                    >
                      {shift === 'dia inteiro' ? 'Dia' : shift}
                    </button>
                  ))}
                </div>
              )}
              
              {state.workTimer?.isRunning && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1 h-0.5 bg-green-500/20 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-green-500"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                  <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-green-500/60 font-bold whitespace-nowrap">Em serviço</span>
                </motion.div>
              )}
            </div>

            {/* Shift Selector */}
            {state.settings.enableShiftTracking && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {(['manhã', 'tarde', 'noite', 'dia'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setDashboardShift(s)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                        dashboardShift === s 
                          ? isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                          : isDark ? 'bg-white/5 text-white/40 border-white/5' : 'bg-black/5 text-black/40 border-black/5'
                      }`}
                    >
                      {s === 'dia' ? 'Dia' : s}
                    </button>
                  ))}
                </div>
                
                {dashboardShift === 'dia' && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">Registrar em:</span>
                    <div className="flex gap-2 flex-1">
                      {(['manhã', 'tarde', 'noite'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setRegistrationShift(s)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                            registrationShift === s 
                              ? isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                              : isDark ? 'bg-white/5 text-white/40 border-white/5' : 'bg-black/5 text-black/40 border-black/5'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress Cards */}
            <div className="grid grid-cols-1 gap-4">
              {/* Count Goal */}
              <div className={`${cardClass} p-6 space-y-4`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`${mutedTextColor} text-lg uppercase font-mono tracking-widest`}>
                        {state.settings.enableShiftTracking ? `Corridas - ${todayStats.currentShift}` : 'Total de Corridas'}
                      </p>
                      {state.history.length > 0 && (
                        <button 
                          onClick={undo}
                          className={`${subMutedTextColor} hover:text-white transition-colors`}
                          title="Desfazer última ação"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-bold font-mono">
                      {targetCount}
                      <span className={`${subMutedTextColor} text-xl sm:text-2xl`}>
                        /{targetCountGoal}
                      </span>
                    </h2>
                    {state.settings.enableShiftTracking && (
                      <p className={`${subMutedTextColor} text-[10px] font-mono mt-1 uppercase tracking-widest`}>
                        Total do dia: <span className="font-bold" style={getStyle(state.settings.theme.headerColor, true)}>{todayStats.count}</span>
                      </p>
                    )}
                  </div>
                  <div className={`p-2 rounded-full ${countProgress >= 100 ? 'bg-green-500/20 text-green-500' : isDark ? 'bg-white/5 text-white/40' : 'bg-black/5 text-black/40'}`}>
                    {countProgress >= 100 ? <CheckCircle2 size={24} className={state.settings.enableAnimation ? "animate-bounce" : ""} /> : <CheckCircle2 size={24} />}
                  </div>
                </div>
                
                {countProgress >= 100 && (
                  state.settings.enableAnimation ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center"
                    >
                      <p className="text-xs font-bold text-green-500 uppercase tracking-widest">🏆 Meta de Corridas Batida!</p>
                    </motion.div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
                      <p className="text-xs font-bold text-green-500 uppercase tracking-widest">🏆 Meta de Corridas Batida!</p>
                    </div>
                  )
                )}
                
                <div className="space-y-2">
                  <div className="progress-bar-container">
                    {state.settings.enableAnimation ? (
                      <motion.div 
                        className="progress-bar-fill relative"
                        style={getStyle(state.settings.theme.countBarColor)}
                        initial={{ width: 0 }}
                        animate={{ width: `${countProgress}%` }}
                      >
                        {countProgress > 0 && <WheelieBike />}
                      </motion.div>
                    ) : (
                      <div 
                        className="progress-bar-fill relative"
                        style={{ 
                          ...getStyle(state.settings.theme.countBarColor),
                          width: `${countProgress}%`
                        }}
                      >
                        {countProgress > 0 && <WheelieBike />}
                      </div>
                    )}
                  </div>
                  <div className={`flex justify-between text-sm font-mono ${subMutedTextColor} uppercase tracking-tighter`}>
                    <span>Início</span>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <span>{countProgress.toFixed(0)}% Concluído</span>
                        {state.history.length > 0 && (
                          <button 
                            onClick={undo}
                            className="underline hover:text-white transition-colors"
                          >
                            Desfazer
                          </button>
                        )}
                      </div>
                      <div className="mt-1">
                        {targetCount < targetCountGoal ? (
                          <span className="text-white font-bold text-xl">Faltam {targetCountGoal - targetCount} corridas</span>
                        ) : (
                          <span className="text-green-500 font-bold">Meta Batida! (+{targetCount - targetCountGoal} extra)</span>
                        )}
                      </div>
                    </div>
                    <span>Meta</span>
                  </div>

                  {/* Quick Buttons for Count */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button 
                      onClick={() => quickAddRide(0, 'Corrida +1')}
                      className={`flex-1 py-3 px-4 rounded-lg border border-white/10 text-lg font-bold uppercase tracking-widest hover:bg-white/5 transition-colors`}
                      style={getStyle(state.settings.theme.countBarColor, true)}
                    >
                      +1 Corrida
                    </button>
                    <button 
                      onClick={() => {
                        quickAddRide(0, 'Corrida +1');
                        quickAddRide(0, 'Corrida +1');
                      }}
                      className={`flex-1 py-3 px-4 rounded-lg border border-white/10 text-lg font-bold uppercase tracking-widest hover:bg-white/5 transition-colors`}
                      style={getStyle(state.settings.theme.countBarColor, true)}
                    >
                      +2 Corridas
                    </button>
                  </div>
                </div>
              </div>

              {/* Value Goal */}
              <div className={`${cardClass} p-6 space-y-4`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`${mutedTextColor} text-lg uppercase font-mono tracking-widest`}>
                        {state.settings.enableShiftTracking ? `Faturamento - ${todayStats.currentShift}` : 'Faturamento Diário'}
                      </p>
                      {state.history.length > 0 && (
                        <button 
                          onClick={undo}
                          className={`${subMutedTextColor} hover:text-white transition-colors`}
                          title="Desfazer última ação"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      {state.settings.enableAnimation ? (
                        <motion.h2 
                          key={targetValue}
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          className="text-4xl sm:text-6xl font-bold font-mono"
                        >
                          R$ {targetValue.toFixed(2)}
                          <span className={`${subMutedTextColor} text-xl sm:text-2xl`}>
                            /{targetValueGoal}
                          </span>
                        </motion.h2>
                      ) : (
                        <h2 className="text-4xl sm:text-6xl font-bold font-mono">
                          R$ {targetValue.toFixed(2)}
                          <span className={`${subMutedTextColor} text-xl sm:text-2xl`}>
                            /{targetValueGoal}
                          </span>
                        </h2>
                      )}
                      
                      {state.settings.enableShiftTracking && (
                        <p className={`${subMutedTextColor} text-[10px] font-mono mt-1 uppercase tracking-widest`}>
                          Total do dia: <span className="font-bold" style={getStyle(state.settings.theme.valueBarColor, true)}>R$ {todayStats.value.toFixed(2)}</span>
                        </p>
                      )}
                      
                      <AnimatePresence>
                        {showFloatingValue && lastAddedValue && (
                          <motion.div
                            initial={{ opacity: 0, y: 0, scale: 0.5 }}
                            animate={{ opacity: 1, y: -60, scale: 1.5 }}
                            exit={{ opacity: 0, y: -100, scale: 1 }}
                            className="absolute top-0 right-0 font-bold text-3xl text-green-500 pointer-events-none z-50"
                            style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}
                          >
                            +R$ {lastAddedValue.toFixed(2)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full ${valueProgress >= 100 ? 'bg-green-500/20 text-green-500' : isDark ? 'bg-white/5 text-white/40' : 'bg-black/5 text-black/40'}`}>
                    {valueProgress >= 100 ? <DollarSign size={24} className={state.settings.enableAnimation ? "animate-bounce" : ""} /> : <DollarSign size={24} />}
                  </div>
                </div>
                
                {valueProgress >= 100 && (
                  state.settings.enableAnimation ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center"
                    >
                      <p className="text-xs font-bold text-green-500 uppercase tracking-widest">🏆 Meta de Faturamento Batida!</p>
                    </motion.div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
                      <p className="text-xs font-bold text-green-500 uppercase tracking-widest">🏆 Meta de Faturamento Batida!</p>
                    </div>
                  )
                )}
                
                <div className="space-y-2">
                  <div className="progress-bar-container">
                    {state.settings.enableAnimation ? (
                      <motion.div 
                        className="progress-bar-fill relative"
                        style={getStyle(state.settings.theme.valueBarColor)}
                        initial={{ width: 0 }}
                        animate={{ width: `${valueProgress}%` }}
                      >
                        {valueProgress > 0 && <WheelieBike />}
                      </motion.div>
                    ) : (
                      <div 
                        className="progress-bar-fill relative"
                        style={{ 
                          ...getStyle(state.settings.theme.valueBarColor),
                          width: `${valueProgress}%`
                        }}
                      >
                        {valueProgress > 0 && <WheelieBike />}
                      </div>
                    )}
                  </div>
                  <div className={`flex justify-between text-sm font-mono ${subMutedTextColor} uppercase tracking-tighter`}>
                    <span>R$ 0</span>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <span>{valueProgress.toFixed(0)}% Concluído</span>
                        {state.history.length > 0 && (
                          <button 
                            onClick={undo}
                            className="underline hover:text-white transition-colors"
                          >
                            Desfazer
                          </button>
                        )}
                      </div>
                      <div className="mt-1">
                        {targetValue < targetValueGoal ? (
                          <span className="text-white font-bold text-xl">
                            Faltam R$ {(targetValueGoal - targetValue).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-green-500 font-bold">Meta Batida! (+R$ {(targetValue - targetValueGoal).toFixed(2)})</span>
                        )}
                      </div>
                    </div>
                    <span>R$ {state.settings.enableShiftTracking ? todayStats.currentShiftGoal.valueGoal : currentGoal.valueGoal}</span>
                  </div>

                  {/* Quick Buttons for Revenue */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <form 
                      onSubmit={handleQuickValueSubmit}
                      className="col-span-1 flex"
                    >
                      <input 
                        type="number" 
                        inputMode="decimal"
                        placeholder="R$"
                        value={quickValue}
                        onChange={(e) => setQuickValue(e.target.value)}
                        className={`w-full py-3 px-2 text-lg font-mono font-bold rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} focus:outline-none focus:border-white/30 transition-colors placeholder:text-[10px]`}
                      />
                    </form>
                    {[4, 5, 6, 7, 8, 9, 10].map(val => (
                      <button 
                        key={val}
                        onClick={() => quickAddRide(val, `Corrida R$ ${val}`)}
                        className={`py-3 px-1 rounded-lg border border-white/10 text-xl font-bold uppercase tracking-widest hover:bg-white/5 transition-colors`}
                        style={getStyle(state.settings.theme.valueBarColor, true)}
                      >
                        +R$ {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Journey Card */}
            <div className={`${cardClass} p-6 border-l-4 border-green-500`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`${mutedTextColor} text-lg uppercase font-mono tracking-widest`}>
                      Tempo de Trabalho
                    </p>
                    {state.workTimer?.isRunning && (
                      <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                    {state.dailyJourneys?.[today] && (
                      <button 
                        onClick={() => {
                          if (confirm('Deseja apagar TODO o tempo já registrado hoje?') && state.dailyJourneys?.[today]) {
                            Object.keys(state.dailyJourneys[today]).forEach(shift => {
                              deleteJourneyTime(today, shift);
                            });
                          }
                        }}
                        className={`ml-2 p-1.5 rounded-xl ${subMutedTextColor} hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all flex items-center justify-center bg-white/5 border border-white/5`}
                        title="Zerar registros de hoje"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-bold font-mono">
                    {formatElapsedTime(todayStats.journeyTime)}
                  </h2>
                  <p className={`${subMutedTextColor} text-[10px] font-mono mt-1 uppercase tracking-widest`}>
                    {dashboardShift === 'dia' ? 'Total Trabalhado Hoje' : `Jornada no turno ${dashboardShift}`}
                  </p>
                </div>
                <div className={`p-4 rounded-3xl ${state.workTimer?.isRunning ? 'bg-green-500/20 text-green-500' : isDark ? 'bg-white/5 text-white/40' : 'bg-black/5 text-black/40'}`}>
                  <Clock size={40} strokeWidth={state.workTimer?.isRunning ? 2.5 : 2} />
                </div>
              </div>
            </div>

            {/* Shift Breakdown */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(['manhã', 'tarde', 'noite'] as const).map((s) => (
                <div key={s} className={`${cardClass} p-3 sm:p-4 flex flex-col items-center justify-center text-center space-y-1`}>
                  <p className={`${subMutedTextColor} text-[8px] sm:text-[10px] uppercase font-mono tracking-tighter`}>{s}</p>
                  <p className="text-lg sm:text-xl font-bold font-mono">{todayStats.shifts[s].count}</p>
                  <p className={`${mutedTextColor} text-[8px] sm:text-[10px] font-mono`}>R$ {todayStats.shifts[s].value.toFixed(0)}</p>
                </div>
              ))}
            </div>

            {/* Recent Rides */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-sm font-bold uppercase tracking-widest ${mutedTextColor}`}>Corridas de Hoje</h3>
                <div className="flex items-center gap-2">
                  <form onSubmit={handleQuickValueSubmit} className="flex items-center gap-1">
                    <input 
                      type="number" 
                      inputMode="decimal"
                      placeholder="R$ Rápido"
                      value={quickValue}
                      onChange={(e) => setQuickValue(e.target.value)}
                      className={`w-24 h-8 px-2 text-xs font-mono font-bold rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} focus:outline-none focus:border-white/30 transition-colors`}
                    />
                    <button 
                      type="submit"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title="Adicionar rápido"
                    >
                      <Plus size={16} />
                    </button>
                  </form>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  {state.history.length > 0 && (
                    <button 
                      onClick={undo}
                      className={`flex items-center gap-1 text-xs font-bold uppercase tracking-tighter ${subMutedTextColor} hover:text-white transition-colors`}
                      title="Desfazer última ação"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setNewRideShift(registrationShift);
                      setIsAddingRide(true);
                    }}
                    className="p-1.5 rounded-lg transition-colors"
                    style={getStyle(state.settings.theme.headerColor)}
                    title="Adicionar detalhado"
                  >
                    <Plus size={16} className="text-white" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {todayRides.filter(r => !state.settings.enableShiftTracking || dashboardShift === 'dia' || r.shift === dashboardShift).length === 0 ? (
                  <div className={`${cardClass} p-8 text-center border-dashed border-white/5`}>
                    <p className={`${subMutedTextColor} text-sm italic`}>Nenhuma corrida registrada {dashboardShift !== 'dia' ? `no turno ${dashboardShift}` : 'hoje'}.</p>
                  </div>
                ) : (
                  todayRides.filter(r => !state.settings.enableShiftTracking || dashboardShift === 'dia' || r.shift === dashboardShift).map(ride => (
                    <motion.div 
                      key={ride.id}
                      layout={state.settings.enableAnimation}
                      {...motionProps({ opacity: 0, x: -20 }, { opacity: 1, x: 0 })}
                      className={`${cardClass} p-4 flex justify-between items-center`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-white/5 text-white/40' : 'bg-black/5 text-black/40'} flex items-center justify-center`}>
                          <Bike size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm truncate max-w-[140px] sm:max-w-none">{ride.description}</p>
                          <p className={`text-[10px] font-mono ${subMutedTextColor} uppercase tracking-tighter`}>
                            {new Date(ride.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {ride.shift}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <p className="font-mono font-bold mr-2" style={{ color: state.settings.theme.valueBarColor }}>R$ {ride.value.toFixed(2)}</p>
                        <button 
                          onClick={() => startEdit(ride)}
                          className={`${subMutedTextColor} hover:text-blue-500 transition-colors`}
                          title="Editar corrida"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteRide(ride.id)}
                          className={`${subMutedTextColor} hover:text-red-500 transition-colors`}
                          title="Excluir corrida"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div 
            {...motionProps({ opacity: 0, y: 20 }, { opacity: 1, y: 0 })}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${mutedTextColor}`}>Histórico de Atividade</h3>
              {state.settings.enableShiftTracking && (
                <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                  {(['all', 'manhã', 'tarde', 'noite'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setHistoryShift(s)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter transition-all ${
                        historyShift === s 
                          ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                          : isDark ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'
                      }`}
                    >
                      {s === 'all' ? 'Tudo' : s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-8">
              {/* Group records by date */}
              {Array.from(new Set([
                ...state.rides.map(r => r.date), 
                ...Object.keys(state.dailyJourneys || {})
              ])).sort().reverse().map(date => {
                const dayRides = state.rides.filter(r => r.date === date && (historyShift === 'all' || r.shift === historyShift));
                
                const dailyJourneysObj = state.dailyJourneys?.[date] || {};
                let dayJourneyTime = 0;
                if (historyShift === 'all') {
                  dayJourneyTime = (Object.values(dailyJourneysObj) as number[]).reduce((acc: number, curr: number) => acc + curr, 0);
                  if (date === today) {
                    dayJourneyTime += elapsedTime;
                  }
                } else {
                  dayJourneyTime = (dailyJourneysObj as Record<string, number>)[historyShift] || 0;
                  if (date === today && state.workTimer?.currentShift === historyShift) {
                    dayJourneyTime += elapsedTime;
                  }
                }
                
                if (dayRides.length === 0 && dayJourneyTime === 0) return null;
                const total = dayRides.reduce((acc, curr) => acc + curr.value, 0);
                
                const shiftsToShow = (['manhã', 'tarde', 'noite'] as const).filter(s => historyShift === 'all' || s === historyShift);

                return (
                  <div key={date} className="space-y-3">
                    <div className="flex justify-between items-end px-2 border-b border-white/10 pb-2">
                      <div className="space-y-0.5">
                        <p className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest`}>
                          {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        {dayJourneyTime > 0 && (
                          <div className="flex items-center gap-1.5 text-sm font-mono text-green-500 font-bold uppercase tracking-tight mt-1">
                            <div className="flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-md">
                              <Clock size={14} />
                              <span>Total: {formatElapsedTime(dayJourneyTime)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono uppercase tracking-widest opacity-40 mb-0.5">Total Dia</p>
                        <p className="text-lg font-mono font-bold leading-none" style={{ color: state.settings.theme.valueBarColor }}>R$ {total.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Special case for 'dia inteiro' journey if showing all */}
                      {historyShift === 'all' && (dailyJourneysObj['dia inteiro'] || (date === today && state.workTimer?.currentShift === 'dia inteiro' ? elapsedTime : 0)) ? (
                        <div className={`px-3 py-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-black/5'} flex justify-between items-center border-l-4 border-green-500 group`}>
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] opacity-40`}>Jornada</span>
                            <span className={`text-xs font-bold uppercase tracking-widest ${subMutedTextColor}`}>Dia Inteiro</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-mono font-bold text-green-500 uppercase tracking-tight">
                                {formatElapsedTime((dailyJourneysObj['dia inteiro'] || 0) + (date === today && state.workTimer?.currentShift === 'dia inteiro' ? elapsedTime : 0))}
                              </span>
                            </div>
                            {dailyJourneysObj['dia inteiro'] && (
                              <button 
                                onClick={() => deleteJourneyTime(date, 'dia inteiro')}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all bg-white/5 border border-white/5 shadow-sm active:scale-90"
                                title="Apagar tempo registrado"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {shiftsToShow.map(shift => {
                        const shiftRides = dayRides.filter(r => r.shift === shift);
                        const shiftJourneyTime = (dailyJourneysObj[shift] || 0) + 
                          (date === today && state.workTimer?.currentShift === shift ? elapsedTime : 0);

                        if (shiftRides.length === 0 && shiftJourneyTime === 0) return null;
                        const shiftTotal = shiftRides.reduce((acc, curr) => acc + curr.value, 0);

                        return (
                          <div key={shift} className="space-y-2">
                            <div className={`flex justify-between items-center px-3 py-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-black/5'} border-l-2 border-white/10 group`}>
                              <div className="flex flex-col">
                                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${subMutedTextColor}`}>{shift}</span>
                                {shiftJourneyTime > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-green-500 uppercase tracking-tight mt-0.5">
                                      <Clock size={10} className="inline mr-1 mb-0.5" />
                                      {formatElapsedTime(shiftJourneyTime)}
                                    </span>
                                    {(dailyJourneysObj[shift]) && (
                                      <button 
                                        onClick={() => deleteJourneyTime(date, shift)}
                                        className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-all bg-white/5 border border-white/5 active:scale-90"
                                        title="Apagar tempo registrado"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <span className={`text-[8px] font-bold uppercase tracking-widest ${subMutedTextColor} opacity-40 block mb-0.5`}>Ganhos</span>
                                <span className="text-xs font-mono font-bold opacity-80">R$ {shiftTotal.toFixed(2)}</span>
                              </div>
                            </div>
                            
                            <div className={`${cardClass} overflow-hidden`}>
                              {shiftRides.map((ride, idx) => (
                                <div 
                                  key={ride.id} 
                                  className={`p-4 flex justify-between items-center ${idx !== shiftRides.length - 1 ? isDark ? 'border-b border-white/5' : 'border-b border-black/5' : ''}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={subMutedTextColor}><Bike size={16} /></div>
                                    <div>
                                      <p className="text-base font-medium">{ride.description}</p>
                                      <p className={`text-xs font-mono ${subMutedTextColor} uppercase tracking-tighter`}>
                                        {ride.shift}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <p className={`text-base font-mono font-bold`} style={{ color: state.settings.theme.valueBarColor }}>R$ {ride.value.toFixed(2)}</p>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => startEdit(ride)}
                                        className={`${subMutedTextColor} hover:text-blue-500 transition-colors p-1`}
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button 
                                        onClick={() => deleteRide(ride.id)}
                                        className={`${subMutedTextColor} hover:text-red-500 transition-colors p-1`}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {state.rides.length === 0 && Object.keys(state.dailyJourneys || {}).length === 0 && (
                <div className={`${cardClass} p-12 text-center border-dashed border-white/5`}>
                  <History className={`mx-auto ${subMutedTextColor} mb-4`} size={48} />
                  <p className={`${subMutedTextColor} text-sm italic`}>Seu histórico aparecerá aqui.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'finance' && (
          <motion.div 
            {...motionProps({ opacity: 0, y: 20 }, { opacity: 1, y: 0 })}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-bold uppercase tracking-widest ${mutedTextColor}`}>Controle Financeiro</h3>
              <button 
                onClick={() => {
                  setEditingActivity(null);
                  setNewActivityType('recebimento');
                  setNewActivityPlatform('Uber');
                  setNewActivityValue('');
                  setNewActivityDesc('');
                  setNewActivityDate(today);
                  setNewActivityShift(registrationShift);
                  setIsAddingActivity(true);
                }}
                className="p-3 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
                style={getStyle(state.settings.theme.headerColor)}
              >
                <Plus size={20} className="text-white" />
                <span className="text-white">Novo Registro</span>
              </button>
            </div>

            {/* Monthly Goal Card */}
            {state.settings.enableMonthlyGoal && (
              <div className={`${cardClass} p-6 space-y-8 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Target size={80} />
                </div>
                
                {/* Monthly Section */}
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className={`${mutedTextColor} text-xs uppercase font-mono tracking-widest`}>Meta Mensal</p>
                        <input 
                          type="month"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className={`bg-white/10 border border-white/10 rounded-md px-4 py-1.5 text-base font-mono uppercase focus:outline-none ${subMutedTextColor} cursor-pointer hover:text-white hover:bg-white/20 transition-all`}
                        />
                      </div>
                      <h4 className="text-2xl font-bold font-mono">R$ {monthlyStats.totalValue.toFixed(2)}</h4>
                    </div>
                    <div className="text-right">
                      <p className={`${subMutedTextColor} text-[10px] uppercase font-mono tracking-tighter`}>Objetivo</p>
                      {isEditingMonthlyGoal ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={tempMonthlyGoal}
                            onChange={(e) => setTempMonthlyGoal(e.target.value)}
                            className={`w-28 p-2 text-base font-mono font-bold rounded border ${isDark ? 'bg-white/5 border-white/20 text-white' : 'bg-black/5 border-black/20 text-black'} focus:outline-none focus:border-white/40`}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = parseInt(tempMonthlyGoal);
                                if (!isNaN(val) && val > 0) {
                                  updatePreference('defaultMonthlyGoal', val);
                                  setIsEditingMonthlyGoal(false);
                                }
                              }
                              if (e.key === 'Escape') setIsEditingMonthlyGoal(false);
                            }}
                          />
                          <button 
                            onClick={() => {
                              const val = parseInt(tempMonthlyGoal);
                              if (!isNaN(val) && val > 0) {
                                updatePreference('defaultMonthlyGoal', val);
                                setIsEditingMonthlyGoal(false);
                              }
                            }}
                            className="text-green-500 hover:text-green-400 transition-colors"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-2 cursor-pointer group"
                          onClick={() => {
                            setTempMonthlyGoal(monthlyStats.goal.toString());
                            setIsEditingMonthlyGoal(true);
                          }}
                        >
                          <p className="text-lg font-bold font-mono">R$ {monthlyStats.goal.toFixed(0)}</p>
                          <Edit2 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="progress-bar-container h-2.5">
                      <motion.div 
                        className="progress-bar-fill relative"
                        style={getStyle(state.settings.theme.headerColor)}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, monthlyStats.progress)}%` }}
                      >
                        {monthlyStats.progress > 0 && <WheelieBike />}
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-xs font-mono uppercase tracking-tighter opacity-60">
                      <span>{monthlyStats.progress.toFixed(1)}% Concluído</span>
                      <span>Faltam R$ {monthlyStats.remaining.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Weekly Section */}
                <div className="space-y-3 relative z-10 border-t border-white/5 pt-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className={`${mutedTextColor} text-xs uppercase font-mono tracking-widest mb-1`}>Meta Semanal</p>
                      <h4 className="text-2xl font-bold font-mono">R$ {financeStats.week.totalRecebido.toFixed(2)}</h4>
                    </div>
                    <div className="text-right">
                      <p className={`${subMutedTextColor} text-[10px] uppercase font-mono tracking-tighter`}>Faltam</p>
                      <p className="text-lg font-bold font-mono">R$ {Math.max(0, monthlyStats.weeklyNeeded - financeStats.week.totalRecebido).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="progress-bar-container h-2">
                      <motion.div 
                        className="progress-bar-fill"
                        style={getStyle(state.settings.theme.valueBarColor)}
                        initial={{ width: 0 }}
                        animate={{ width: `${monthlyStats.weeklyNeeded > 0 ? Math.min(100, (financeStats.week.totalRecebido / monthlyStats.weeklyNeeded) * 100) : (monthlyStats.remaining === 0 ? 100 : 0)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-tighter opacity-60">
                      <span>{monthlyStats.weeklyNeeded > 0 ? Math.min(100, (financeStats.week.totalRecebido / monthlyStats.weeklyNeeded) * 100).toFixed(1) : (monthlyStats.remaining === 0 ? '100' : '0')}% da Meta Semanal</span>
                      <span>Objetivo: R$ {monthlyStats.weeklyNeeded.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Daily Section */}
                <div className="space-y-3 relative z-10 border-t border-white/5 pt-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className={`${mutedTextColor} text-xs uppercase font-mono tracking-widest mb-1`}>Meta Diária</p>
                      <h4 className="text-2xl font-bold font-mono">R$ {financeStats.day.totalRecebido.toFixed(2)}</h4>
                    </div>
                    <div className="text-right">
                      <p className={`${subMutedTextColor} text-[10px] uppercase font-mono tracking-tighter`}>Faltam</p>
                      <p className="text-lg font-bold font-mono">R$ {Math.max(0, monthlyStats.dailyNeeded - financeStats.day.totalRecebido).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="progress-bar-container h-2">
                      <motion.div 
                        className="progress-bar-fill"
                        style={getStyle(state.settings.theme.valueBarColor)}
                        initial={{ width: 0 }}
                        animate={{ width: `${monthlyStats.dailyNeeded > 0 ? Math.min(100, (financeStats.day.totalRecebido / monthlyStats.dailyNeeded) * 100) : (monthlyStats.remaining === 0 ? 100 : 0)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-tighter opacity-60">
                      <span>{monthlyStats.dailyNeeded > 0 ? Math.min(100, (financeStats.day.totalRecebido / monthlyStats.dailyNeeded) * 100).toFixed(1) : (monthlyStats.remaining === 0 ? '100' : '0')}% da Meta Diária</span>
                      <span>Objetivo: R$ {monthlyStats.dailyNeeded.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4">
              {(['day', 'week', 'month'] as const).map((period) => (
                <div key={period} className={`${cardClass} p-6 space-y-4`}>
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-bold uppercase tracking-widest opacity-60">
                      {period === 'day' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês'}
                    </h4>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-xs uppercase font-mono tracking-tighter text-green-500">Total Recebido</p>
                        <p className="text-xl font-bold font-mono text-green-500">R$ {financeStats[period].totalRecebido.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase font-mono tracking-tighter text-red-500">Despesas</p>
                        <p className="text-xl font-bold font-mono text-red-500">R$ {financeStats[period].despesa.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                    {(['Uber', '99', 'Outros'] as const).map((platform) => (
                      <div key={platform} className="space-y-1">
                        <p className="text-sm uppercase font-mono font-bold tracking-tighter opacity-80">{platform}</p>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-green-500/90">+R$ {(financeStats[period].recebimentoManual[platform] + (platform === 'Outros' ? financeStats[period].faturamento : 0)).toFixed(0)}</span>
                          <span className="text-sm font-bold text-red-500/90">-R$ {financeStats[period].despesa[platform].toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <p className="text-base font-bold uppercase tracking-widest opacity-40">Saldo Líquido</p>
                    <p className={`text-3xl font-bold font-mono ${(financeStats[period].totalRecebido - financeStats[period].despesa.total) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      R$ {(financeStats[period].totalRecebido - financeStats[period].despesa.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activities List */}
            <div className="space-y-4">
              <h3 className={`text-lg font-bold uppercase tracking-widest ${mutedTextColor}`}>Atividades Recentes</h3>
              <div className="space-y-3">
                {state.activities.length === 0 ? (
                  <div className={`${cardClass} p-12 text-center border-dashed border-white/5`}>
                    <Wallet className={`mx-auto ${subMutedTextColor} mb-4`} size={48} />
                    <p className={`${subMutedTextColor} text-base italic`}>Nenhuma atividade financeira registrada.</p>
                  </div>
                ) : (
                  state.activities.slice(0, 20).map(activity => (
                    <motion.div 
                      key={activity.id}
                      layout={state.settings.enableAnimation}
                      {...motionProps({ opacity: 0, x: -20 }, { opacity: 1, x: 0 })}
                      className={`${cardClass} p-5 flex justify-between items-center`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${activity.type === 'recebimento' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} flex items-center justify-center`}>
                          {activity.type === 'recebimento' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                        </div>
                        <div>
                          <p className="font-bold text-base">{activity.description}</p>
                          <p className={`text-base font-mono ${subMutedTextColor} uppercase tracking-tighter font-bold`}>
                            {activity.platform} • {new Date(activity.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <p className={`font-mono font-bold text-lg mr-2 ${activity.type === 'recebimento' ? 'text-green-500' : 'text-red-500'}`}>
                          {activity.type === 'recebimento' ? '+' : '-'} R$ {activity.value.toFixed(2)}
                        </p>
                        <button 
                          onClick={() => startEditActivity(activity)}
                          className={`${subMutedTextColor} hover:text-blue-500 transition-colors p-1`}
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => deleteActivity(activity.id)}
                          className={`${subMutedTextColor} hover:text-red-500 transition-colors p-1`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'productivity' && (
          <motion.div 
            {...motionProps({ opacity: 0, y: 20 }, { opacity: 1, y: 0 })}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-bold uppercase tracking-widest ${mutedTextColor}`}>Produção por Hora</h3>
              <div className={`p-2 rounded-xl border border-white/10 ${isDark ? 'bg-white/5' : 'bg-black/5'} flex items-center gap-2 pr-4`}>
                <Clock size={16} className="text-green-500" />
                <span className="text-sm font-mono font-bold tracking-tighter">{formatElapsedTime(elapsedTime)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {state.hourlyPerformance && state.hourlyPerformance.length > 0 ? (
                Array.from(new Set(state.hourlyPerformance.map(p => p.date))).sort().reverse().map(date => {
                  const reports = state.hourlyPerformance!.filter(p => p.date === date).sort((a, b) => b.hourMark - a.hourMark);
                  const dailyTotal = (state.dailyJourneys?.[date] ? Object.values(state.dailyJourneys![date]).reduce((a: number, b) => a + (b as number), 0) : 0);
                  
                  return (
                    <div key={date} className="space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 px-1 mt-4">
                        <p className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest`}>
                          {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        {date === today && (
                          <span className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Em tempo real
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {reports.map((report, idx) => (
                          <motion.div 
                            key={report.timestamp}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`${cardClass} p-4 flex justify-between items-center border-l-4 border-orange-500 group`}
                          >
                            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-mono text-xs sm:text-base font-bold border border-orange-500/20">
                                {report.hourMark}h
                              </div>
                              <div>
                                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest opacity-30">Intervalo</p>
                                <p className="text-xs sm:text-sm font-bold">{report.hourMark - 1}h → {report.hourMark}h</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                              <div className="text-right">
                                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-green-500 opacity-60">Produção</p>
                                <p className="text-lg sm:text-xl font-bold font-mono">+R$ {report.incrementalValue.toFixed(2)}</p>
                                <p className="text-[8px] sm:text-[10px] font-mono opacity-30 mt-0.5">R$ {report.valueAtMark.toFixed(2)}</p>
                              </div>
                              <button 
                                onClick={() => deleteHourlyReport(report.timestamp)}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all bg-white/5 border border-white/5 active:scale-90"
                                title="Excluir registro"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={`${cardClass} p-12 text-center border-dashed border-white/5`}>
                  <TrendingUp className={`mx-auto ${subMutedTextColor} mb-4`} size={48} />
                  <p className={`${subMutedTextColor} text-sm italic`}>
                    Seus registros de produção por hora aparecerão aqui conforme você trabalha.
                  </p>
                  <p className={`${subMutedTextColor} text-xs mt-2 opacity-50`}>
                    A cada 1 hora de cronômetro, registraremos quanto você faturou.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            {...motionProps({ opacity: 0, y: 20 }, { opacity: 1, y: 0 })}
            className="space-y-6"
          >
            <h3 className={`text-lg font-bold uppercase tracking-widest ${mutedTextColor}`}>Configurações de Metas</h3>
            
            <div className={`${cardClass} p-6 space-y-6`}>
              <div className="space-y-4 border-b border-white/5 pb-6">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold uppercase tracking-widest">Meta Mensal (R$)</label>
                  <span className="font-mono font-bold text-2xl" style={getStyle(state.settings.theme.headerColor, true)}>R$ {state.settings.defaultMonthlyGoal}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="10000" 
                  step="100"
                  value={state.settings.defaultMonthlyGoal}
                  onChange={(e) => updatePreference('defaultMonthlyGoal', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  style={{ accentColor: state.settings.theme.headerColor }}
                />
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-widest text-sm">Meta Mensal</p>
                  <p className={`${subMutedTextColor} text-xs`}>Exibir progresso e metas mensais no financeiro</p>
                </div>
                <button 
                  onClick={() => updatePreference('enableMonthlyGoal', !state.settings.enableMonthlyGoal)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${state.settings.enableMonthlyGoal ? 'bg-green-500' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: state.settings.enableMonthlyGoal ? 24 : 4 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-widest text-sm">Rastreamento por Turno</p>
                  <p className={`${subMutedTextColor} text-xs`}>Contar corridas e faturamento separados por turno</p>
                </div>
                <button 
                  onClick={() => updatePreference('enableShiftTracking', !state.settings.enableShiftTracking)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${state.settings.enableShiftTracking ? 'bg-green-500' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: state.settings.enableShiftTracking ? 24 : 4 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              {!state.settings.enableShiftTracking ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest block`}>Meta de Corridas (Qtd)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        value={state.settings.defaultCountGoal}
                        onChange={(e) => updateSettings(parseInt(e.target.value), state.settings.defaultValueGoal)}
                        className="flex-1"
                        style={{ accentColor: getSolidColor(state.settings.theme.countBarColor) }}
                      />
                      <span className="font-mono font-bold text-3xl w-16 text-right">{state.settings.defaultCountGoal}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest block`}>Meta de Faturamento (R$)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="50" 
                        max="1000" 
                        step="10"
                        value={state.settings.defaultValueGoal}
                        onChange={(e) => updateSettings(state.settings.defaultCountGoal, parseInt(e.target.value))}
                        className="flex-1"
                        style={{ accentColor: getSolidColor(state.settings.theme.valueBarColor) }}
                      />
                      <span className="font-mono font-bold text-3xl w-20 text-right">{state.settings.defaultValueGoal}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {(['manhã', 'tarde', 'noite'] as const).map((shift) => {
                    const shiftGoal = (state.settings.defaultShifts || INITIAL_STATE.settings.defaultShifts!)[shift];
                    return (
                      <div key={shift} className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: state.settings.theme.headerColor }} />
                          Turno: {shift}
                        </h4>
                        
                        <div className="space-y-2">
                          <label className={`text-[10px] font-mono ${subMutedTextColor} uppercase tracking-widest block`}>Meta de Corridas</label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" 
                              min="1" 
                              max="30" 
                              value={shiftGoal.countGoal}
                              onChange={(e) => updateShiftGoal(shift, 'countGoal', parseInt(e.target.value))}
                              className="flex-1"
                              style={{ accentColor: getSolidColor(state.settings.theme.countBarColor) }}
                            />
                            <span className="font-mono font-bold text-2xl w-12 text-right">{shiftGoal.countGoal}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className={`text-[10px] font-mono ${subMutedTextColor} uppercase tracking-widest block`}>Meta de Faturamento</label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" 
                              min="10" 
                              max="500" 
                              step="5"
                              value={shiftGoal.valueGoal}
                              onChange={(e) => updateShiftGoal(shift, 'valueGoal', parseInt(e.target.value))}
                              className="flex-1"
                              style={{ accentColor: getSolidColor(state.settings.theme.valueBarColor) }}
                            />
                            <span className="font-mono font-bold text-2xl w-16 text-right">{shiftGoal.valueGoal}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <h3 className={`text-lg font-bold uppercase tracking-widest ${mutedTextColor}`}>Efeitos e Sons</h3>
            
            <div className={`${cardClass} p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-widest text-sm">Sons de Feedback</p>
                  <p className={`${subMutedTextColor} text-xs`}>Ativar som de caixa registradora e comemorações</p>
                </div>
                <button 
                  onClick={() => updatePreference('enableSound', !state.settings.enableSound)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${state.settings.enableSound ? 'bg-green-500' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: state.settings.enableSound ? 24 : 4 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-widest text-sm">Animações Visuais</p>
                  <p className={`${subMutedTextColor} text-xs`}>Ativar valores flutuantes e confetes</p>
                </div>
                <button 
                  onClick={() => updatePreference('enableAnimation', !state.settings.enableAnimation)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${state.settings.enableAnimation ? 'bg-green-500' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: state.settings.enableAnimation ? 24 : 4 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              {state.settings.enableSound && (
                <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                  <label className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest block`}>Som de Faturamento</label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                    {PRESET_SOUNDS.map(sound => (
                      <button 
                        key={sound.value}
                        onClick={() => {
                          setState(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              selectedRideSound: sound.value
                            }
                          }));
                          // Play preview
                          const preview = new Audio(sound.value);
                          preview.play().catch(e => console.log('Preview failed:', e));
                        }}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase tracking-tighter transition-all ${state.settings.selectedRideSound === sound.value ? isDark ? 'border-white bg-white/10' : 'border-black bg-black/5' : isDark ? 'border-white/5 text-white/40' : 'border-black/5 text-black/40'}`}
                      >
                        {sound.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <h3 className={`text-lg font-bold uppercase tracking-widest ${mutedTextColor}`}>Personalização Visual</h3>
            
            <div className={`${cardClass} p-6 space-y-6`}>
              {/* Background Mode */}
              <div className="space-y-3">
                <label className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest block`}>Modo de Fundo</label>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      updateTheme('backgroundColor', 'dark');
                      updateTheme('customBgColor', '');
                    }}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest ${isDark && !state.settings.theme.customBgColor ? 'border-white bg-white/10' : 'border-black/10 text-black/40'}`}
                  >
                    <div className="w-4 h-4 rounded-full bg-asphalt border border-white/20" />
                    Escuro
                  </button>
                  <button 
                    onClick={() => {
                      updateTheme('backgroundColor', 'light');
                      updateTheme('customBgColor', '');
                    }}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest ${!isDark ? 'border-black bg-black/5' : 'border-white/10 text-white/40'}`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white border border-black/20" />
                    Claro
                  </button>
                </div>
              </div>

              {/* Custom Background Colors */}
              <div className="space-y-3">
                <label className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest block`}>Cores de Fundo Personalizadas</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_BG_COLORS.map(color => (
                    <button 
                      key={color.value}
                      onClick={() => {
                        updateTheme('customBgColor', color.value);
                        if (color.value) updateTheme('backgroundColor', 'dark');
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${state.settings.theme.customBgColor === color.value ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value || (isDark ? '#0F1115' : '#FFFFFF') }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Background Images */}
              <div className="space-y-3">
                <label className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest block`}>Imagens de Fundo</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_BG_IMAGES.map(img => (
                    <button 
                      key={img.value}
                      onClick={() => updateTheme('bgImage', img.value)}
                      className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${state.settings.theme.bgImage === img.value ? 'border-white scale-105' : 'border-transparent opacity-60'}`}
                      title={img.name}
                    >
                      {img.value ? (
                        <img src={img.value} alt={img.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-black/20 flex items-center justify-center text-xs font-bold uppercase">Nenhum</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Opacity */}
              {state.settings.theme.bgImage && (
                <div className="space-y-2">
                  <label className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest block`}>Intensidade da Imagem (Opacidade)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1"
                      value={state.settings.theme.bgOpacity ?? 0.3}
                      onChange={(e) => updateTheme('bgOpacity', parseFloat(e.target.value))}
                      className="flex-1"
                      style={{ accentColor: getSolidColor(state.settings.theme.headerColor) }}
                    />
                    <span className="font-mono font-bold text-sm w-10 text-right">{Math.round((state.settings.theme.bgOpacity ?? 0.3) * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Font Size Control */}
              <div className="space-y-2">
                <label className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest flex items-center gap-2`}>
                  <Type size={16} />
                  Tamanho da Letra
                </label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => updateTheme('fontSize', Math.max(12, (state.settings.theme.fontSize ?? 16) - 1))}
                    className={`p-2 rounded-lg ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'} transition-colors`}
                  >
                    <span className="text-lg font-bold">-</span>
                  </button>
                  <div className="flex-1 text-center">
                    <span className="font-mono font-bold text-lg">{state.settings.theme.fontSize ?? 16}px</span>
                  </div>
                  <button 
                    onClick={() => updateTheme('fontSize', Math.min(24, (state.settings.theme.fontSize ?? 16) + 1))}
                    className={`p-2 rounded-lg ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'} transition-colors`}
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="24" 
                  step="1"
                  value={state.settings.theme.fontSize ?? 16}
                  onChange={(e) => updateTheme('fontSize', parseInt(e.target.value))}
                  className="w-full"
                  style={{ accentColor: getSolidColor(state.settings.theme.headerColor) }}
                />
              </div>

              {/* Font Family Selection */}
              <div className="space-y-3">
                <label className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest flex items-center gap-2`}>
                  <Type size={16} />
                  Tipo de Letra (Fonte)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PRESET_FONTS.map(font => (
                    <button 
                      key={font.value}
                      onClick={() => updateTheme('fontFamily', font.value)}
                      className={`p-3 rounded-xl border-2 transition-all text-left flex justify-between items-center ${state.settings.theme.fontFamily === font.value ? 'border-white bg-white/10 scale-[1.02]' : 'border-transparent bg-white/5 opacity-70 hover:opacity-100'}`}
                      style={{ fontFamily: font.value }}
                    >
                      <span className="text-base font-medium">{font.name}</span>
                      {state.settings.theme.fontFamily === font.value && <CheckCircle2 size={18} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Header Color */}
              <div className="space-y-3">
                <label className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest block`}>Cor do Logo e Destaques</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button 
                      key={color.value}
                      onClick={() => updateTheme('headerColor', color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${state.settings.theme.headerColor === color.value ? isDark ? 'border-white scale-110' : 'border-black scale-110' : 'border-transparent'}`}
                      style={getStyle(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Count Bar Color */}
              <div className="space-y-3">
                <label className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest block`}>Cor da Barra de Corridas</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button 
                      key={color.value}
                      onClick={() => updateTheme('countBarColor', color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${state.settings.theme.countBarColor === color.value ? isDark ? 'border-white scale-110' : 'border-black scale-110' : 'border-transparent'}`}
                      style={getStyle(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Value Bar Color */}
              <div className="space-y-3">
                <label className={`text-sm font-mono ${subMutedTextColor} uppercase tracking-widest block`}>Cor da Barra de Faturamento</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button 
                      key={color.value}
                      onClick={() => updateTheme('valueBarColor', color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${state.settings.theme.valueBarColor === color.value ? isDark ? 'border-white scale-110' : 'border-black scale-110' : 'border-transparent'}`}
                      style={getStyle(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={`${cardClass} p-6`}>
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 text-sm font-bold uppercase tracking-widest hover:bg-red-500/10 transition-colors"
              >
                Limpar Todos os Dados
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 p-3 sm:p-4 ${isDark ? 'bg-asphalt/90' : 'bg-white/90'} backdrop-blur-2xl border-t ${isDark ? 'border-white/5' : 'border-black/5'} z-40`}>
        <div className="max-w-md mx-auto flex overflow-x-auto scrollbar-hide items-center justify-between gap-8 px-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors flex-shrink-0 ${activeTab === 'dashboard' ? '' : subMutedTextColor}`}
            style={activeTab === 'dashboard' ? getStyle(state.settings.theme.headerColor, true) : undefined}
          >
            <TrendingUp size={28} />
            <span className="text-[12px] font-bold uppercase tracking-tight">Painel</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 transition-colors flex-shrink-0 ${activeTab === 'history' ? '' : subMutedTextColor}`}
            style={activeTab === 'history' ? getStyle(state.settings.theme.headerColor, true) : undefined}
          >
            <History size={28} />
            <span className="text-[12px] font-bold uppercase tracking-tight">Histórico</span>
          </button>

          <button 
            onClick={() => setActiveTab('finance')}
            className={`flex flex-col items-center gap-1 transition-colors flex-shrink-0 ${activeTab === 'finance' ? '' : subMutedTextColor}`}
            style={activeTab === 'finance' ? getStyle(state.settings.theme.headerColor, true) : undefined}
          >
            <Wallet size={28} />
            <span className="text-[12px] font-bold uppercase tracking-tight">Finanças</span>
          </button>

          <button 
            onClick={() => setActiveTab('productivity')}
            className={`flex flex-col items-center gap-1 transition-colors flex-shrink-0 ${activeTab === 'productivity' ? '' : subMutedTextColor}`}
            style={activeTab === 'productivity' ? getStyle(state.settings.theme.headerColor, true) : undefined}
          >
            <Zap size={28} />
            <span className="text-[12px] font-bold uppercase tracking-tight">Produção</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 transition-colors flex-shrink-0 ${activeTab === 'settings' ? '' : subMutedTextColor}`}
            style={activeTab === 'settings' ? getStyle(state.settings.theme.headerColor, true) : undefined}
          >
            <Settings size={28} />
            <span className="text-[12px] font-bold uppercase tracking-tight">Ajustes</span>
          </button>
        </div>
      </nav>

      {/* Add/Edit Ride Modal */}
      <AnimatePresence>
        {(isAddingRide || editingRide) && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              {...motionProps({ opacity: 0 }, { opacity: 1 }, { opacity: 0 })}
              onClick={() => {
                setIsAddingRide(false);
                setEditingRide(null);
                setNewRideValue('');
                setNewRideDesc('');
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              {...motionProps({ y: '100%' }, { y: 0 }, { y: '100%' })}
              className={`relative w-full max-w-md ${isDark ? 'bg-asphalt' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-black/10'} rounded-t-3xl sm:rounded-3xl p-8 space-y-6`}
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  {editingRide ? 'Editar Corrida' : 'Nova Corrida'}
                </h2>
                <p className={`${mutedTextColor} text-sm`}>
                  {editingRide ? 'Atualize os dados desta corrida.' : 'Registre o valor recebido na última corrida.'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={`text-xs font-mono ${subMutedTextColor} uppercase tracking-widest`}>Valor (R$)</label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${subMutedTextColor} font-mono text-lg`}>R$</span>
                    <input 
                      type="number" 
                      inputMode="decimal"
                      value={newRideValue}
                      onChange={(e) => setNewRideValue(e.target.value)}
                      placeholder="0,00"
                      className={`w-full ${isDark ? 'bg-white/5' : 'bg-black/5'} border rounded-xl py-4 pl-12 pr-4 text-3xl font-mono font-bold focus:outline-none transition-colors`}
                      style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDark ? 'white' : 'black' }}
                      onFocus={(e) => e.target.style.borderColor = state.settings.theme.headerColor}
                      onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-mono ${subMutedTextColor} uppercase tracking-widest`}>Descrição (Opcional)</label>
                  <input 
                    type="text" 
                    value={newRideDesc}
                    onChange={(e) => setNewRideDesc(e.target.value)}
                    placeholder="Ex: Entrega iFood, Corrida Uber..."
                    className={`w-full ${isDark ? 'bg-white/5' : 'bg-black/5'} border rounded-xl py-4 px-4 text-base focus:outline-none transition-colors`}
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDark ? 'white' : 'black' }}
                    onFocus={(e) => e.target.style.borderColor = state.settings.theme.headerColor}
                    onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-mono ${subMutedTextColor} uppercase tracking-widest`}>Data</label>
                  <input 
                    type="date" 
                    value={newRideDate}
                    onChange={(e) => setNewRideDate(e.target.value)}
                    className={`w-full ${isDark ? 'bg-white/5' : 'bg-black/5'} border rounded-xl py-4 px-4 text-base focus:outline-none transition-colors`}
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDark ? 'white' : 'black' }}
                    onFocus={(e) => e.target.style.borderColor = state.settings.theme.headerColor}
                    onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-mono ${subMutedTextColor} uppercase tracking-widest`}>Turno</label>
                  <div className="flex gap-2">
                    {(['manhã', 'tarde', 'noite'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setNewRideShift(s)}
                        className={`flex-1 py-4 rounded-xl border text-sm font-bold uppercase tracking-widest transition-all ${
                          newRideShift === s 
                            ? isDark ? 'border-white bg-white/10' : 'border-black bg-black/5' 
                            : isDark ? 'border-white/5 text-white/40' : 'border-black/5 text-black/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setIsAddingRide(false);
                    setEditingRide(null);
                    setNewRideValue('');
                    setNewRideDesc('');
                  }}
                  className={`flex-1 py-4 rounded-xl ${isDark ? 'bg-white/5 text-white/60' : 'bg-black/5 text-black/60'} font-bold text-sm uppercase tracking-widest`}
                >
                  Cancelar
                </button>
                <button 
                  onClick={editingRide ? updateRide : addRide}
                  className="flex-2 py-4 rounded-xl text-white font-bold text-sm uppercase tracking-widest neon-glow"
                  style={{ backgroundColor: state.settings.theme.headerColor }}
                >
                  {editingRide ? 'Salvar Alterações' : 'Salvar Corrida'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {(isAddingActivity || editingActivity) && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              {...motionProps({ opacity: 0 }, { opacity: 1 }, { opacity: 0 })}
              onClick={() => setIsAddingActivity(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              {...motionProps({ y: '100%' }, { y: 0 }, { y: '100%' })}
              className={`relative w-full max-w-md ${isDark ? 'bg-asphalt' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-black/10'} rounded-t-3xl sm:rounded-3xl p-8 space-y-6`}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                  {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
                </h2>
                <p className={`${mutedTextColor} text-base`}>
                  Registre seus ganhos ou despesas diárias.
                </p>
              </div>

              <div className="space-y-4">
                {/* Type Toggle */}
                <div className="flex p-1 rounded-xl bg-black/5 dark:bg-white/5">
                  {(['recebimento', 'despesa'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewActivityType(type)}
                      className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${newActivityType === type ? (type === 'recebimento' ? 'bg-green-500 text-white shadow-md' : 'bg-red-500 text-white shadow-md') : subMutedTextColor}`}
                    >
                      {type === 'recebimento' ? 'Recebimento' : 'Despesa'}
                    </button>
                  ))}
                </div>

                {/* Platform Selection */}
                <div className="space-y-2">
                  <label className={`text-xs font-mono ${subMutedTextColor} uppercase tracking-widest`}>Plataforma</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_PLATFORMS.map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setNewActivityPlatform(platform)}
                        className={`py-3 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all ${newActivityPlatform === platform ? 'border-white bg-white/10' : 'border-white/5 opacity-50'}`}
                        style={newActivityPlatform === platform ? { borderColor: state.settings.theme.headerColor, backgroundColor: state.settings.theme.headerColor + '20' } : {}}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-mono ${subMutedTextColor} uppercase tracking-widest`}>Valor (R$)</label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${subMutedTextColor} font-mono text-lg`}>R$</span>
                    <input 
                      type="number" 
                      inputMode="decimal"
                      value={newActivityValue}
                      onChange={(e) => setNewActivityValue(e.target.value)}
                      placeholder="0,00"
                      className={`w-full ${isDark ? 'bg-white/5' : 'bg-black/5'} border rounded-xl py-4 pl-12 pr-4 text-3xl font-mono font-bold focus:outline-none transition-colors`}
                      style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDark ? 'white' : 'black' }}
                      onFocus={(e) => e.target.style.borderColor = state.settings.theme.headerColor}
                      onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-mono ${subMutedTextColor} uppercase tracking-widest`}>Descrição</label>
                  <input 
                    type="text" 
                    value={newActivityDesc}
                    onChange={(e) => setNewActivityDesc(e.target.value)}
                    placeholder="Ex: Gasolina, Almoço, Gorjeta..."
                    className={`w-full ${isDark ? 'bg-white/5' : 'bg-black/5'} border rounded-xl py-4 px-4 text-base focus:outline-none transition-colors`}
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDark ? 'white' : 'black' }}
                    onFocus={(e) => e.target.style.borderColor = state.settings.theme.headerColor}
                    onBlur={(e) => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-mono ${subMutedTextColor} uppercase tracking-widest`}>Data</label>
                  <input 
                    type="date" 
                    value={newActivityDate}
                    onChange={(e) => setNewActivityDate(e.target.value)}
                    className={`w-full ${isDark ? 'bg-white/5' : 'bg-black/5'} border rounded-xl py-4 px-4 text-base focus:outline-none transition-colors`}
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDark ? 'white' : 'black' }}
                  />
                </div>

                {/* Shift Selection for Activity */}
                <div className="space-y-2">
                  <label className={`text-xs font-mono ${subMutedTextColor} uppercase tracking-widest`}>Turno</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['manhã', 'tarde', 'noite'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setNewActivityShift(s)}
                        className={`py-3 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all ${newActivityShift === s ? 'border-white bg-white/10' : 'border-white/5 opacity-50'}`}
                        style={newActivityShift === s ? { borderColor: state.settings.theme.headerColor, backgroundColor: state.settings.theme.headerColor + '20' } : {}}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsAddingActivity(false)}
                  className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-sm ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'} transition-colors`}
                >
                  Cancelar
                </button>
                <button 
                  onClick={editingActivity ? updateActivity : addActivity}
                  className="flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-sm text-white shadow-lg shadow-black/20 transition-transform active:scale-95"
                  style={getStyle(state.settings.theme.headerColor)}
                >
                  {editingActivity ? 'Salvar' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showTimerResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              {...motionProps({ opacity: 0 }, { opacity: 1 }, { opacity: 0 })}
              onClick={() => setShowTimerResetConfirm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
            />
            <motion.div 
              {...motionProps({ scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1 }, { scale: 0.9, opacity: 0 })}
              className={`relative w-full max-w-sm ${isDark ? 'bg-asphalt' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-black/10'} rounded-3xl p-8 space-y-6 text-center shadow-2xl`}
            >
              <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Reiniciar Tempo?</h2>
                <p className={`${mutedTextColor} text-sm leading-relaxed`}>
                  Deseja limpar o tempo atual? Isso **NÃO** salvará o tempo no histórico.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowTimerResetConfirm(false)}
                  className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-xs ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'} transition-colors`}
                >
                  Voltar
                </button>
                <button 
                  onClick={confirmResetTimer}
                  className="flex-1 py-4 rounded-xl bg-red-500 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 transition-transform active:scale-95"
                >
                  Limpar
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showTimerStopConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              {...motionProps({ opacity: 0 }, { opacity: 1 }, { opacity: 0 })}
              onClick={() => setShowTimerStopConfirm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
            />
            <motion.div 
              {...motionProps({ scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1 }, { scale: 0.9, opacity: 0 })}
              className={`relative w-full max-w-sm ${isDark ? 'bg-asphalt' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-black/10'} rounded-3xl p-8 space-y-6 text-center shadow-2xl`}
            >
              <div className="w-20 h-20 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Square size={40} fill="currentColor" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Parar Jornada?</h2>
                <p className={`${mutedTextColor} text-sm leading-relaxed`}>
                  Deseja encerrar o serviço e salvar {formatElapsedTime(elapsedTime)} no seu histórico de hoje?
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowTimerStopConfirm(false)}
                  className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-xs ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'} transition-colors`}
                >
                  Continuar
                </button>
                <button 
                  onClick={confirmStopTimer}
                  className="flex-1 py-4 rounded-xl bg-orange-500 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20 transition-transform active:scale-95"
                >
                  Parar e Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              {...motionProps({ opacity: 0 }, { opacity: 1 }, { opacity: 0 })}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
            />
            <motion.div 
              {...motionProps({ scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1 }, { scale: 0.9, opacity: 0 })}
              className={`relative w-full max-w-sm ${isDark ? 'bg-asphalt' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-black/10'} rounded-3xl p-8 space-y-6 text-center shadow-2xl`}
            >
              <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Limpar Tudo?</h2>
                <p className={`${mutedTextColor} text-sm leading-relaxed`}>
                  Esta ação apagará permanentemente todas as suas corridas, atividades e configurações. Não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-xs ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'} transition-colors`}
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    setState(INITIAL_STATE);
                    setShowClearConfirm(false);
                    toast.success("Todos os dados foram apagados.");
                  }}
                  className="flex-1 py-4 rounded-xl bg-red-500 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 transition-transform active:scale-95"
                >
                  Apagar Tudo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

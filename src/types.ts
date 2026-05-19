/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Platform = 'Uber' | '99' | 'Outros';
export type ActivityType = 'recebimento' | 'despesa';

export interface Activity {
  id: string;
  date: string;
  type: ActivityType;
  platform: Platform;
  value: number;
  description: string;
  shift?: 'manhã' | 'tarde' | 'noite';
}

export interface Ride {
  id: string;
  date: string;
  timestamp: number;
  value: number;
  distance?: number;
  description?: string;
  shift: 'manhã' | 'tarde' | 'noite';
}

export interface ShiftGoal {
  countGoal: number;
  valueGoal: number;
}

export interface DailyGoal {
  date: string;
  countGoal: number;
  valueGoal: number;
  shifts?: {
    manhã: ShiftGoal;
    tarde: ShiftGoal;
    noite: ShiftGoal;
  };
}

export interface WorkTimer {
  isRunning: boolean;
  startTime: number | null;
  accumulatedTime: number;
  lastUpdateDate: string;
  currentShift: 'dia inteiro' | 'manhã' | 'tarde' | 'noite';
  lastRecordedHour?: number;
}

export interface HourlyReport {
  timestamp: number;
  date: string;
  hourMark: number;
  valueAtMark: number;
  incrementalValue: number;
}

export interface AppState {
  rides: Ride[];
  activities: Activity[];
  goals: DailyGoal[];
  workTimer?: WorkTimer;
  hourlyPerformance?: HourlyReport[];
  settings: {
    defaultCountGoal: number;
    defaultValueGoal: number;
    defaultMonthlyGoal?: number;
    defaultShifts?: {
      manhã: ShiftGoal;
      tarde: ShiftGoal;
      noite: ShiftGoal;
    };
    enableSound?: boolean;
    enableAnimation?: boolean;
    enableShiftTracking?: boolean;
    enableMonthlyGoal?: boolean;
    selectedRideSound?: string;
    theme: {
      headerColor: string;
      countBarColor: string;
      valueBarColor: string;
      backgroundColor: 'dark' | 'light';
      customBgColor?: string;
      bgImage?: string;
      bgOpacity?: number;
      fontSize?: number;
      fontFamily?: string;
      fontColor?: string;
    };
  };
  history: AppStateSnapshot[];
  dailyJourneys?: { [date: string]: { [shift: string]: number } };
  finalizedDays?: string[];
}

export interface AppStateSnapshot {
  rides: Ride[];
  activities: Activity[];
  goals: DailyGoal[];
}

import { format, differenceInHours, differenceInMinutes, addHours, startOfDay, endOfDay } from 'date-fns';

export const dateUtils = {
  formatTime(date: Date): string {
    return format(date, 'HH:mm');
  },

  formatDate(date: Date): string {
    return format(date, 'MMM dd, yyyy');
  },

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  },

  formatTimeRemaining(endTime: Date, currentTime?: Date): string {
    const now = currentTime || new Date();
    const totalSeconds = Math.floor((endTime.getTime() - now.getTime()) / 1000);
    
    if (totalSeconds <= 0) {
      return '0s';
    }
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  },
  getProgressPercentage(startTime: Date, endTime: Date, currentTime?: Date): number {
    const now = currentTime || new Date();
    const totalDuration = differenceInMinutes(endTime, startTime);
    const elapsed = differenceInMinutes(now, startTime);
    
    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;
    
    return Math.round((elapsed / totalDuration) * 100);
  },

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  },

  addHoursToDate(date: Date, hours: number): Date {
    return addHours(date, hours);
  },

  getDayStart(date: Date): Date {
    return startOfDay(date);
  },

  getDayEnd(date: Date): Date {
    return endOfDay(date);
  },
};
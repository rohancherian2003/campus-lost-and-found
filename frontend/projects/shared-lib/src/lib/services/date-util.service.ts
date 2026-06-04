import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilService {
  
  /**
   * Parses either an ISO string or a legacy date string "DD MMM YYYY" into a Date object.
   */
  parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    if (dateStr.includes('-') || dateStr.includes('T')) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    // Legacy parser fallback:
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    const parts = dateStr.trim().split(' ');
    if (parts.length < 3) {
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    
    // "25 May 2026, 09:45 AM" -> split on comma or space
    const day = Number(parts[0]);
    const monthStr = parts[1].replace(',', '');
    const month = months[monthStr] !== undefined ? months[monthStr] : 0;
    const year = Number(parts[2].replace(',', ''));
    
    const date = new Date(year, month, day);
    
    // check if there is time like "09:45 AM"
    const timeIndex = dateStr.indexOf(',');
    if (timeIndex !== -1) {
      const timePart = dateStr.substring(timeIndex + 1).trim(); // "09:45 AM"
      const timeMatch = timePart.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeMatch) {
        let hours = Number(timeMatch[1]);
        const minutes = Number(timeMatch[2]);
        const ampm = timeMatch[3];
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
        date.setHours(hours, minutes, 0, 0);
      }
    }
    return date;
  }

  /**
   * Formats a date string (ISO or legacy) to the user-friendly local display format:
   * e.g., "03 Jun 2026" or "03 Jun 2026, 10:30 AM"
   */
  formatDisplayDate(dateStr: string, includeTime = false): string {
    if (!dateStr) return '';
    try {
      const date = this.parseDate(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      let result = `${day} ${month} ${year}`;
      if (includeTime) {
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const hoursStr = String(hours).padStart(2, '0');
        result += `, ${hoursStr}:${minutes} ${ampm}`;
      }
      return result;
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Converts local HTML5 date and time inputs into a standard ISO 8601 UTC string.
   */
  toUtcIsoString(dateVal: string, timeVal?: string): string {
    if (!dateVal) return '';
    try {
      if (timeVal) {
        const [hours, minutes] = timeVal.split(':').map(Number);
        const [year, month, day] = dateVal.split('-').map(Number);
        const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
        return date.toISOString();
      } else {
        const [year, month, day] = dateVal.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        return date.toISOString();
      }
    } catch (e) {
      return new Date(dateVal).toISOString();
    }
  }

  /**
   * Calculates days elapsed since the given date string.
   */
  getDaysElapsed(dateStr: string): number {
    if (!dateStr) return 0;
    const reported = this.parseDate(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    reported.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((today.getTime() - reported.getTime()) / 86400000));
  }

  /**
   * Calculates remaining days in the 60-day claim window.
   */
  getDaysRemaining(dateStr: string): number {
    return Math.max(0, 60 - this.getDaysElapsed(dateStr));
  }

  /**
   * Checks if an item is expired.
   */
  isExpired(dateStr: string): boolean {
    return this.getDaysElapsed(dateStr) >= 60;
  }

  /**
   * Gets countdown status: "active", "expiring", "last10", "expired"
   */
  getCountdownStatus(dateStr: string): 'active' | 'expiring' | 'last10' | 'expired' {
    const elapsed = this.getDaysElapsed(dateStr);
    const remaining = Math.max(0, 60 - elapsed);
    if (elapsed >= 60) return 'expired';
    if (remaining <= 10) return 'last10';
    if (remaining <= 30) return 'expiring';
    return 'active';
  }
}

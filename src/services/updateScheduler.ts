/**
 * Automated Update Scheduler
 * Manages periodic updates of the goBilda parts database
 */

import { partsUpdater } from './partsUpdater';

export class UpdateScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly DEFAULT_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private isRunning = false;

  constructor(private customInterval?: number) {}

  /**
   * Start the scheduled updates
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Update scheduler is already running');
      return;
    }

    const interval = this.customInterval || this.DEFAULT_INTERVAL;
    
    console.log(`Starting update scheduler with ${interval / 1000 / 60 / 60}h interval`);
    
    this.intervalId = setInterval(async () => {
      try {
        console.log('Scheduled parts update starting...');
        
        if (partsUpdater.shouldUpdate()) {
          const result = await partsUpdater.updatePartsDatabase();
          
          console.log(`Scheduled update completed: ${result.added} added, ${result.updated} updated`);
          
          if (result.errors.length > 0) {
            console.warn('Update completed with errors:', result.errors);
          }
          
          // Notify UI about update (could trigger a toast notification)
          this.notifyUpdate(result);
        } else {
          console.log('Parts are up to date, skipping scheduled update');
        }
      } catch (error) {
        console.error('Scheduled update failed:', error);
      }
    }, interval);
    
    this.isRunning = true;
    
    // Also run an initial update if needed
    this.runInitialUpdateCheck();
  }

  /**
   * Stop the scheduled updates
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('Update scheduler stopped');
    }
  }

  /**
   * Check if scheduler is running
   */
  isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get current schedule info
   */
  getScheduleInfo(): {
    isRunning: boolean;
    interval: number;
    nextUpdate: string | null;
  } {
    const interval = this.customInterval || this.DEFAULT_INTERVAL;
    const lastUpdate = localStorage.getItem('lastPartsUpdate');
    
    let nextUpdate = null;
    if (lastUpdate) {
      const nextUpdateTime = new Date(new Date(lastUpdate).getTime() + interval);
      nextUpdate = nextUpdateTime.toISOString();
    }

    return {
      isRunning: this.isRunning,
      interval,
      nextUpdate
    };
  }

  /**
   * Update the schedule interval
   */
  updateInterval(newInterval: number): void {
    this.customInterval = newInterval;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Run initial update check when scheduler starts
   */
  private async runInitialUpdateCheck(): Promise<void> {
    try {
      if (partsUpdater.shouldUpdate()) {
        console.log('Running initial parts update check...');
        const result = await partsUpdater.updatePartsDatabase();
        
        if (result.added > 0 || result.updated > 0) {
          console.log(`Initial update completed: ${result.added} added, ${result.updated} updated`);
          this.notifyUpdate(result);
        }
      }
    } catch (error) {
      console.warn('Initial update check failed:', error);
    }
  }

  /**
   * Notify about updates (could be extended to show UI notifications)
   */
  private notifyUpdate(result: { added: number; updated: number; errors: string[] }): void {
    // Store update notification for UI to pick up
    const notification = {
      timestamp: new Date().toISOString(),
      type: 'parts-update',
      message: `Parts database updated: ${result.added} new, ${result.updated} updated`,
      hasErrors: result.errors.length > 0,
      errors: result.errors
    };
    
    // Store in localStorage for UI to display
    const notifications = JSON.parse(localStorage.getItem('update_notifications') || '[]');
    notifications.unshift(notification);
    
    // Keep only last 10 notifications
    notifications.splice(10);
    
    localStorage.setItem('update_notifications', JSON.stringify(notifications));
    
    // Dispatch custom event for real-time UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('partsUpdated', { detail: result }));
    }
  }

  /**
   * Get recent update notifications
   */
  getRecentNotifications(): Array<{
    timestamp: string;
    type: string;
    message: string;
    hasErrors: boolean;
    errors: string[];
  }> {
    return JSON.parse(localStorage.getItem('update_notifications') || '[]');
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    localStorage.removeItem('update_notifications');
  }
}

// Singleton instance
export const updateScheduler = new UpdateScheduler();

// Auto-start scheduler when module loads (in browser environment)
if (typeof window !== 'undefined') {
  // Start with a delay to allow app to initialize
  setTimeout(() => {
    updateScheduler.start();
  }, 5000);
}

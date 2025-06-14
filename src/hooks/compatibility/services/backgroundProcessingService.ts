
import { supabase } from "@/integrations/supabase/client";
import { logInfo, logError, logWarning } from "./loggingService";
import { cacheService } from "./cacheService";

export interface BackgroundTask {
  id: string;
  type: 'compatibility_calculation' | 'popular_matches_precalc';
  userId: string;
  payload: any;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  scheduledFor?: Date;
}

export interface CompatibilityCalculationPayload {
  targetUserIds?: string[];
  batchSize?: number;
  skipCache?: boolean;
}

export class BackgroundProcessingService {
  private taskQueue: BackgroundTask[] = [];
  private isProcessing = false;
  private maxConcurrentTasks = 3;
  private retryAttempts = 3;

  // Queue a compatibility calculation task
  async queueCompatibilityCalculation(
    userId: string, 
    payload: CompatibilityCalculationPayload,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<string> {
    const taskId = `calc_${userId}_${Date.now()}`;
    
    const task: BackgroundTask = {
      id: taskId,
      type: 'compatibility_calculation',
      userId,
      payload,
      priority,
      status: 'pending',
      createdAt: new Date()
    };

    this.taskQueue.push(task);
    this.sortTasksByPriority();
    
    logInfo('backgroundProcessing', `Queued compatibility calculation task: ${taskId}`, { userId, priority });
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return taskId;
  }

  // Queue popular matches pre-calculation
  async queuePopularMatchesCalculation(
    userId: string,
    priority: 'low' | 'medium' | 'high' = 'low'
  ): Promise<string> {
    const taskId = `popular_${userId}_${Date.now()}`;
    
    const task: BackgroundTask = {
      id: taskId,
      type: 'popular_matches_precalc',
      userId,
      payload: {},
      priority,
      status: 'pending',
      createdAt: new Date()
    };

    this.taskQueue.push(task);
    this.sortTasksByPriority();
    
    logInfo('backgroundProcessing', `Queued popular matches calculation: ${taskId}`, { userId });
    
    if (!this.isProcessing) {
      this.processQueue();
    }

    return taskId;
  }

  // Process the task queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    logInfo('backgroundProcessing', 'Starting queue processing', { queueLength: this.taskQueue.length });

    try {
      const activeTasks: Promise<void>[] = [];
      
      while (this.taskQueue.length > 0 && activeTasks.length < this.maxConcurrentTasks) {
        const task = this.taskQueue.shift();
        if (task) {
          activeTasks.push(this.processTask(task));
        }
      }

      if (activeTasks.length > 0) {
        await Promise.allSettled(activeTasks);
      }

      // Continue processing if there are more tasks
      if (this.taskQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      } else {
        this.isProcessing = false;
        logInfo('backgroundProcessing', 'Queue processing completed');
      }
    } catch (error) {
      logError('backgroundProcessing', error as Error);
      this.isProcessing = false;
    }
  }

  // Process individual task
  private async processTask(task: BackgroundTask): Promise<void> {
    task.status = 'processing';
    logInfo('backgroundProcessing', `Processing task: ${task.id}`, { type: task.type });

    try {
      switch (task.type) {
        case 'compatibility_calculation':
          await this.executeCompatibilityCalculation(task);
          break;
        case 'popular_matches_precalc':
          await this.executePopularMatchesCalculation(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      task.status = 'completed';
      logInfo('backgroundProcessing', `Task completed: ${task.id}`);
    } catch (error) {
      task.status = 'failed';
      logError('backgroundProcessing', error as Error, { taskId: task.id });
      
      // Retry logic could be implemented here
      if (this.shouldRetry(task)) {
        task.status = 'pending';
        this.taskQueue.unshift(task); // Put back at front for retry
      }
    }
  }

  // Execute compatibility calculation using Edge Function
  private async executeCompatibilityCalculation(task: BackgroundTask): Promise<void> {
    const { targetUserIds, batchSize, skipCache } = task.payload as CompatibilityCalculationPayload;

    try {
      const { data, error } = await supabase.functions.invoke('calculate-compatibility', {
        body: {
          userId: task.userId,
          targetUserIds,
          batchSize: batchSize || 20
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data?.results) {
        // Cache the results
        if (!skipCache) {
          for (const result of data.results) {
            const cacheKey = `compatibility_${task.userId}_${result.targetUserId}`;
            cacheService.set(cacheKey, result, 30 * 60 * 1000); // Cache for 30 minutes
          }
        }

        logInfo('backgroundProcessing', `Processed ${data.results.length} compatibility calculations`, {
          userId: task.userId,
          taskId: task.id
        });
      }
    } catch (error) {
      logError('backgroundProcessing', error as Error, { taskId: task.id });
      throw error;
    }
  }

  // Execute popular matches pre-calculation
  private async executePopularMatchesCalculation(task: BackgroundTask): Promise<void> {
    try {
      // Get users with highest compatibility scores for this user
      const { data, error } = await supabase.functions.invoke('calculate-compatibility', {
        body: {
          userId: task.userId,
          batchSize: 50 // Calculate more for popular matches
        }
      });

      if (error) {
        throw new Error(`Popular matches calculation failed: ${error.message}`);
      }

      if (data?.results) {
        // Sort and cache top matches
        const topMatches = data.results
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 10);

        const cacheKey = `popular_matches_${task.userId}`;
        cacheService.set(cacheKey, topMatches, 60 * 60 * 1000); // Cache for 1 hour

        logInfo('backgroundProcessing', `Pre-calculated ${topMatches.length} popular matches`, {
          userId: task.userId,
          taskId: task.id
        });
      }
    } catch (error) {
      logError('backgroundProcessing', error as Error, { taskId: task.id });
      throw error;
    }
  }

  // Sort tasks by priority
  private sortTasksByPriority(): void {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    this.taskQueue.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }

  // Check if task should be retried
  private shouldRetry(task: BackgroundTask): boolean {
    // Simple retry logic - could be enhanced
    return false; // For now, don't retry failed tasks
  }

  // Get queue status
  getQueueStatus(): { pending: number; processing: number; total: number } {
    const pending = this.taskQueue.filter(t => t.status === 'pending').length;
    const processing = this.taskQueue.filter(t => t.status === 'processing').length;
    
    return {
      pending,
      processing,
      total: this.taskQueue.length
    };
  }

  // Clear completed tasks from memory
  clearCompletedTasks(): void {
    this.taskQueue = this.taskQueue.filter(t => t.status !== 'completed' && t.status !== 'failed');
    logInfo('backgroundProcessing', 'Cleared completed tasks from queue');
  }
}

export const backgroundProcessingService = new BackgroundProcessingService();

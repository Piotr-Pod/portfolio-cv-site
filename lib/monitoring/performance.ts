/**
 * Performance monitoring utilities for AI assistant
 */

export interface PerformanceMetrics {
  timestamp: number;
  type: 'backend' | 'frontend';
  operation: 'ai_processing' | 'api_request' | 'frontend_response';
  duration: number;
  threadId?: string;
  responseLength?: number;
  ip?: string;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics in memory

  /**
   * Log performance metrics
   */
  log(metrics: Omit<PerformanceMetrics, 'timestamp'>): void {
    const fullMetrics: PerformanceMetrics = {
      ...metrics,
      timestamp: Date.now()
    };

    this.metrics.push(fullMetrics);
    
    // Keep only last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metrics.type}/${metrics.operation}: ${metrics.duration}ms${metrics.success ? '' : ' (ERROR)'}`);
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    totalRequests: number;
    averageResponseTime: number;
    successRate: number;
    recentMetrics: PerformanceMetrics[];
  } {
    const recent = this.metrics.slice(-100); // Last 100 requests
    const totalRequests = recent.length;
    const averageResponseTime = totalRequests > 0 
      ? recent.reduce((sum, m) => sum + m.duration, 0) / totalRequests 
      : 0;
    const successRate = totalRequests > 0 
      ? recent.filter(m => m.success).length / totalRequests 
      : 0;

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      successRate: Math.round(successRate * 100) / 100,
      recentMetrics: recent.slice(-10) // Last 10 for debugging
    };
  }

  /**
   * Get metrics for a specific thread
   */
  getThreadMetrics(threadId: string): PerformanceMetrics[] {
    return this.metrics.filter(m => m.threadId === threadId);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Helper function to log backend AI processing metrics
 */
export function logBackendProcessing(
  duration: number,
  threadId: string,
  responseLength: number,
  success: boolean,
  error?: string
): void {
  performanceMonitor.log({
    type: 'backend',
    operation: 'ai_processing',
    duration,
    threadId,
    responseLength,
    success,
    error
  });
}

/**
 * Helper function to log API request metrics
 */
export function logApiRequest(
  duration: number,
  ip: string,
  success: boolean,
  error?: string
): void {
  performanceMonitor.log({
    type: 'backend',
    operation: 'api_request',
    duration,
    ip,
    success,
    error
  });
}

/**
 * Helper function to log frontend response metrics
 */
export function logFrontendResponse(
  duration: number,
  success: boolean,
  error?: string
): void {
  performanceMonitor.log({
    type: 'frontend',
    operation: 'frontend_response',
    duration,
    success,
    error
  });
}

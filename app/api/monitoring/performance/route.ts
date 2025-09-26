import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/monitoring/performance';

/**
 * GET /api/monitoring/performance
 * Returns performance statistics for the AI assistant
 */
export async function GET(req: NextRequest) {
  try {
    // Simple authentication check (in production, use proper auth)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.MONITORING_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = performanceMonitor.getStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Performance monitoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/monitoring/performance
 * Clears all performance metrics
 */
export async function DELETE(req: NextRequest) {
  try {
    // Simple authentication check
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.MONITORING_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    performanceMonitor.clear();
    
    return NextResponse.json({
      success: true,
      message: 'Performance metrics cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Performance monitoring clear API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { TimelinessMonitor } from '@/lib/timeliness-monitor';

// GET /api/fulfillment-records/timeliness - 获取时效监控数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overdue':
        // 获取逾期记录
        const overdueRecords = await TimelinessMonitor.detectAllOverdueRecords();
        return NextResponse.json({
          success: true,
          data: {
            overdueRecords,
            summary: {
              totalOverdue: overdueRecords.length,
              warningCount: overdueRecords.filter(r => r.warningLevel === 'warning').length,
              criticalCount: overdueRecords.filter(r => r.warningLevel === 'critical').length,
              expiredCount: overdueRecords.filter(r => r.warningLevel === 'expired').length
            }
          }
        });

      case 'stats':
        // 获取时效统计
        const stats = await TimelinessMonitor.calculateTimelinessStats();
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'report':
        // 获取完整时效报告
        const report = await TimelinessMonitor.generateTimelinessReport();
        return NextResponse.json({
          success: true,
          data: report
        });

      case 'overview':
      default:
        // 获取概览数据
        const [overdueData, statsData, reportData] = await Promise.all([
          TimelinessMonitor.detectAllOverdueRecords(),
          TimelinessMonitor.calculateTimelinessStats(),
          TimelinessMonitor.generateTimelinessReport()
        ]);

        return NextResponse.json({
          success: true,
          data: {
            overview: {
              totalRecords: statsData.totalRecords,
              onTimeRecords: statsData.onTimeRecords,
              overdueRecords: statsData.overdueRecords,
              onTimeRate: reportData.summary.onTimeRate,
              overdueRate: reportData.summary.overdueRate,
              avgCompletionHours: statsData.avgCompletionHours
            },
            currentOverdue: {
              total: overdueData.length,
              warning: overdueData.filter(r => r.warningLevel === 'warning').length,
              critical: overdueData.filter(r => r.warningLevel === 'critical').length,
              expired: overdueData.filter(r => r.warningLevel === 'expired').length,
              records: overdueData.slice(0, 5) // 只返回前5条
            },
            topIssues: overdueData
              .filter(r => r.warningLevel === 'critical' || r.warningLevel === 'expired')
              .slice(0, 3)
              .map(record => ({
                fulfillmentRecordId: record.fulfillmentRecordId,
                currentStatus: record.currentStatus,
                overdueHours: record.overdueHours,
                warningLevel: record.warningLevel,
                primaryAction: record.suggestedActions[0] || '联系相关负责人'
              }))
          }
        });
    }

  } catch (error) {
    console.error('获取时效监控数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取时效监控数据失败' },
      { status: 500 }
    );
  }
} 
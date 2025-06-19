import { NextRequest, NextResponse } from 'next/server';
import { serializeBigInt } from '@/lib/bigint-serializer';

// GET /api/fulfillment-records/[id]/status-logs - 获取状态变更历史
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    if (!id) {
      return NextResponse.json(
        { success: false, error: '履约单ID不能为空' },
        { status: 400 }
      );
    }

    // 解析查询参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // 模拟状态日志数据（在实际环境中这些数据会从数据库查询）
    const mockStatusLogs = [
      {
        id: "1",
        fromStatus: null,
        toStatus: "pending_sample",
        stageStartTime: Math.floor(Date.now() / 1000) - 86400, // 24小时前
        stageEndTime: Math.floor(Date.now() / 1000) - 82800, // 23小时前
        stageDeadline: Math.floor(Date.now() / 1000) - 82800 + 86400, // 1小时后
        plannedDurationHours: 24,
        actualDurationHours: 1,
        isOverdue: false,
        overdueHours: 0,
        nextStageDeadline: Math.floor(Date.now() / 1000) + 86400,
        changeReason: "履约单创建",
        remarks: "系统自动创建履约单",
        operatorId: "1001",
        createdAt: Math.floor(Date.now() / 1000) - 86400
      },
      {
        id: "2",
        fromStatus: "pending_sample",
        toStatus: "sample_sent",
        stageStartTime: Math.floor(Date.now() / 1000) - 82800,
        stageEndTime: Math.floor(Date.now() / 1000),
        stageDeadline: Math.floor(Date.now() / 1000) + 86400,
        plannedDurationHours: 24,
        actualDurationHours: 23,
        isOverdue: false,
        overdueHours: 0,
        nextStageDeadline: Math.floor(Date.now() / 1000) + 172800,
        changeReason: "样品已寄出",
        remarks: "物流单号：SF1234567890",
        operatorId: "1001",
        createdAt: Math.floor(Date.now() / 1000)
      }
    ];

    // 计算分页
    const skip = (page - 1) * limit;
    const paginatedLogs = mockStatusLogs.slice(skip, skip + limit);
    const total = mockStatusLogs.length;

    // 计算统计信息
    const stats = {
      totalLogs: total,
      overdueCount: mockStatusLogs.filter(log => log.isOverdue).length,
      avgActualDuration: mockStatusLogs.reduce((sum, log) => sum + (log.actualDurationHours || 0), 0) / mockStatusLogs.length,
      maxActualDuration: Math.max(...mockStatusLogs.map(log => log.actualDurationHours || 0))
    };

    // 添加友好的时间显示
    const enrichedLogs = paginatedLogs.map((log: any) => ({
      ...log,
      stageStartTimeFormatted: log.stageStartTime 
        ? new Date(log.stageStartTime * 1000).toLocaleString('zh-CN')
        : null,
      stageEndTimeFormatted: log.stageEndTime 
        ? new Date(log.stageEndTime * 1000).toLocaleString('zh-CN')
        : null,
      stageDeadlineFormatted: log.stageDeadline 
        ? new Date(log.stageDeadline * 1000).toLocaleString('zh-CN')
        : null,
      nextStageDeadlineFormatted: log.nextStageDeadline 
        ? new Date(log.nextStageDeadline * 1000).toLocaleString('zh-CN')
        : null,
      createdAtFormatted: log.createdAt 
        ? new Date(log.createdAt * 1000).toLocaleString('zh-CN')
        : null,
      
      // 状态描述
      statusChangeDescription: log.fromStatus 
        ? `${log.fromStatus} → ${log.toStatus}`
        : `初始状态 → ${log.toStatus}`,
      
      // 时效状态
      timelinessStatus: log.isOverdue 
        ? `逾期 ${log.overdueHours || 0} 小时`
        : '正常',
      
      // 耗时描述
      durationDescription: log.actualDurationHours !== null
        ? `实际耗时 ${log.actualDurationHours} 小时${log.plannedDurationHours ? ` (计划 ${log.plannedDurationHours} 小时)` : ''}`
        : '耗时未知'
    }));

    return NextResponse.json({
      success: true,
      data: {
        fulfillmentRecord: {
          id: id,
          productName: "测试产品",
          currentStatus: "sample_sent"
        },
        logs: enrichedLogs,
        stats: stats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取状态日志失败:', error);
    return NextResponse.json(
      { success: false, error: '获取状态日志失败' },
      { status: 500 }
    );
  }
} 
import { 
  FulfillmentStatus, 
  FulfillmentRecordStatus, 
  Priority,
  OverdueDetectionResult,
  TimelinessStats,
  FulfillmentStatsQuery,
  TimelinessMonitorConfig,
  OverdueWarningNotification
} from '@/types/fulfillment';

/**
 * 时效监控系统
 * 负责逾期检测、预警通知、时效统计等功能
 */
export class TimelinessMonitor {
  
  /**
   * 默认监控配置
   */
  private static readonly DEFAULT_CONFIG: TimelinessMonitorConfig = {
    enableAutoWarning: true,
    warningThresholdHours: 2,
    criticalThresholdHours: 24,
    enableAutoEscalation: true,
    escalationTargets: [],
    checkIntervalMinutes: 30,
    enableEmailNotification: true,
    enableSmsNotification: false
  };

  /**
   * 检测所有逾期的履约单
   */
  public static async detectAllOverdueRecords(): Promise<OverdueDetectionResult[]> {
    const currentTime = Math.floor(Date.now() / 1000);
    
    // 模拟检测逾期记录
    const mockResults: OverdueDetectionResult[] = [
      {
        fulfillmentRecordId: "1",
        currentStatus: FulfillmentStatus.SAMPLE_SENT,
        isOverdue: true,
        overdueHours: 12,
        stageDeadline: currentTime - 43200,
        warningLevel: 'warning',
        suggestedActions: [
          '联系达人确认样品收货情况',
          '跟进物流配送状态',
          '准备重新发送样品'
        ]
      }
    ];

    return mockResults;
  }

  /**
   * 检测特定履约单的逾期情况
   */
  public static async detectRecordOverdue(fulfillmentRecordId: string): Promise<OverdueDetectionResult | null> {
    const allResults = await this.detectAllOverdueRecords();
    return allResults.find(result => result.fulfillmentRecordId === fulfillmentRecordId) || null;
  }

  /**
   * 获取预警级别描述
   */
  public static getWarningLevelDescription(level: 'normal' | 'warning' | 'critical' | 'expired'): string {
    const descriptions = {
      normal: '正常',
      warning: '预警',
      critical: '严重',
      expired: '已过期'
    };
    return descriptions[level] || '未知';
  }

  /**
   * 计算时效统计数据
   */
  public static async calculateTimelinessStats(): Promise<TimelinessStats> {
    // 模拟统计数据
    const mockStats: TimelinessStats = {
      totalRecords: 156,
      onTimeRecords: 132,
      overdueRecords: 24,
      avgCompletionHours: 86.5,
      maxCompletionHours: 240,
      statusBreakdown: {
        [FulfillmentStatus.PENDING_SAMPLE]: {
          count: 12,
          avgHours: 18.5,
          overdueCount: 2
        },
        [FulfillmentStatus.SAMPLE_SENT]: {
          count: 18,
          avgHours: 65.2,
          overdueCount: 3
        },
        [FulfillmentStatus.SAMPLE_RECEIVED]: {
          count: 8,
          avgHours: 9.8,
          overdueCount: 0
        },
        [FulfillmentStatus.CONTENT_PLANNING]: {
          count: 15,
          avgHours: 42.3,
          overdueCount: 1
        },
        [FulfillmentStatus.CONTENT_PRODUCTION]: {
          count: 32,
          avgHours: 98.7,
          overdueCount: 8
        },
        [FulfillmentStatus.CONTENT_REVIEW]: {
          count: 22,
          avgHours: 20.1,
          overdueCount: 4
        },
        [FulfillmentStatus.CONTENT_APPROVED]: {
          count: 15,
          avgHours: 8.9,
          overdueCount: 1
        },
        [FulfillmentStatus.CONTENT_REJECTED]: {
          count: 5,
          avgHours: 16.2,
          overdueCount: 1
        },
        [FulfillmentStatus.CONTENT_PUBLISHED]: {
          count: 18,
          avgHours: 0.8,
          overdueCount: 0
        },
        [FulfillmentStatus.TRACKING_STARTED]: {
          count: 8,
          avgHours: 156.4,
          overdueCount: 2
        },
        [FulfillmentStatus.TRACKING_COMPLETED]: {
          count: 2,
          avgHours: 18.5,
          overdueCount: 0
        },
        [FulfillmentStatus.SETTLEMENT_PENDING]: {
          count: 1,
          avgHours: 45.2,
          overdueCount: 1
        },
        [FulfillmentStatus.SETTLEMENT_COMPLETED]: {
          count: 0,
          avgHours: 0,
          overdueCount: 0
        },
        [FulfillmentStatus.CANCELLED]: {
          count: 0,
          avgHours: 0,
          overdueCount: 0
        },
        [FulfillmentStatus.EXPIRED]: {
          count: 0,
          avgHours: 0,
          overdueCount: 0
        }
      },
      priorityBreakdown: {
        [Priority.LOW]: {
          count: 45,
          avgHours: 95.2,
          overdueCount: 8
        },
        [Priority.MEDIUM]: {
          count: 78,
          avgHours: 82.1,
          overdueCount: 12
        },
        [Priority.HIGH]: {
          count: 28,
          avgHours: 76.8,
          overdueCount: 3
        },
        [Priority.URGENT]: {
          count: 5,
          avgHours: 68.5,
          overdueCount: 1
        }
      }
    };

    return mockStats;
  }

  /**
   * 生成逾期预警通知
   */
  public static async generateOverdueWarnings(): Promise<OverdueWarningNotification[]> {
    const overdueRecords = await this.detectAllOverdueRecords();
    const notifications: OverdueWarningNotification[] = [];

    for (const record of overdueRecords) {
      if (record.warningLevel === 'normal') continue;

      // 模拟履约单详细信息（实际环境中从数据库查询）
      const mockFulfillmentRecord = {
        id: record.fulfillmentRecordId,
        influencerId: "10001",
        productId: "20001",
        planId: "30001",
        ownerId: "40001",
        title: `履约单-${record.fulfillmentRecordId}`,
        priority: Priority.HIGH,
        currentStatus: record.currentStatus,
        recordStatus: FulfillmentRecordStatus.ACTIVE,
        currentStageStartTime: Math.floor(Date.now() / 1000) - 86400,
        currentStageDeadline: record.stageDeadline,
        isCurrentStageOverdue: record.isOverdue,
        status: 1,
        createdAt: Math.floor(Date.now() / 1000) - 172800
      } as any;

      notifications.push({
        type: record.warningLevel as 'warning' | 'critical' | 'expired',
        fulfillmentRecord: mockFulfillmentRecord,
        overdueHours: record.overdueHours,
        currentStageDeadline: record.stageDeadline,
        suggestedActions: record.suggestedActions,
        recipients: ['40001', '50001'], // 负责人和主管
        channels: ['email', 'in_app']
      });
    }

    return notifications;
  }

  /**
   * 获取时效性能指标
   */
  public static async getPerformanceMetrics(): Promise<{
    onTimeRate: number;
    overdueRate: number;
    avgCompletionTime: number;
    trends: {
      period: string;
      onTimeRate: number;
      overdueRate: number;
      avgCompletionTime: number;
    }[];
  }> {
    const stats = await this.calculateTimelinessStats();
    
    const onTimeRate = Math.round((stats.onTimeRecords / stats.totalRecords) * 100 * 100) / 100;
    const overdueRate = Math.round((stats.overdueRecords / stats.totalRecords) * 100 * 100) / 100;

    return {
      onTimeRate,
      overdueRate,
      avgCompletionTime: stats.avgCompletionHours,
      trends: [
        {
          period: '本周',
          onTimeRate: onTimeRate + 2.5,
          overdueRate: overdueRate - 2.5,
          avgCompletionTime: stats.avgCompletionHours - 5.2
        },
        {
          period: '上周',
          onTimeRate: onTimeRate - 1.8,
          overdueRate: overdueRate + 1.8,
          avgCompletionTime: stats.avgCompletionHours + 3.1
        },
        {
          period: '上月',
          onTimeRate: onTimeRate - 3.2,
          overdueRate: overdueRate + 3.2,
          avgCompletionTime: stats.avgCompletionHours + 8.5
        }
      ]
    };
  }

  /**
   * 获取状态分布统计
   */
  public static async getStatusDistribution(): Promise<{
    status: FulfillmentStatus;
    displayName: string;
    count: number;
    percentage: number;
    avgHours: number;
    overdueCount: number;
    overdueRate: number;
  }[]> {
    const stats = await this.calculateTimelinessStats();
    const results = [];

    for (const [status, data] of Object.entries(stats.statusBreakdown)) {
      if (data.count === 0) continue;

      results.push({
        status: status as FulfillmentStatus,
        displayName: this.getStatusDisplayName(status as FulfillmentStatus),
        count: data.count,
        percentage: Math.round((data.count / stats.totalRecords) * 100 * 100) / 100,
        avgHours: data.avgHours,
        overdueCount: data.overdueCount,
        overdueRate: Math.round((data.overdueCount / data.count) * 100 * 100) / 100
      });
    }

    // 按数量排序
    return results.sort((a, b) => b.count - a.count);
  }

  /**
   * 获取优先级分布统计
   */
  public static async getPriorityDistribution(): Promise<{
    priority: Priority;
    displayName: string;
    count: number;
    percentage: number;
    avgHours: number;
    overdueCount: number;
    overdueRate: number;
  }[]> {
    const stats = await this.calculateTimelinessStats();
    const results = [];

    const priorityDisplayNames = {
      [Priority.LOW]: '低优先级',
      [Priority.MEDIUM]: '中优先级', 
      [Priority.HIGH]: '高优先级',
      [Priority.URGENT]: '紧急'
    };

    for (const [priority, data] of Object.entries(stats.priorityBreakdown)) {
      results.push({
        priority: priority as Priority,
        displayName: priorityDisplayNames[priority as Priority],
        count: data.count,
        percentage: Math.round((data.count / stats.totalRecords) * 100 * 100) / 100,
        avgHours: data.avgHours,
        overdueCount: data.overdueCount,
        overdueRate: Math.round((data.overdueCount / data.count) * 100 * 100) / 100
      });
    }

    // 按优先级排序
    const priorityOrder = [Priority.URGENT, Priority.HIGH, Priority.MEDIUM, Priority.LOW];
    return results.sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));
  }

  /**
   * 检查是否需要发送预警通知
   */
  public static shouldSendWarning(
    overdueHours: number,
    warningLevel: 'normal' | 'warning' | 'critical' | 'expired',
    config: TimelinessMonitorConfig = this.DEFAULT_CONFIG
  ): boolean {
    if (!config.enableAutoWarning) {
      return false;
    }

    switch (warningLevel) {
      case 'warning':
        return overdueHours >= config.warningThresholdHours;
      case 'critical':
      case 'expired':
        return overdueHours >= config.criticalThresholdHours;
      default:
        return false;
    }
  }

  /**
   * 获取状态显示名称
   */
  private static getStatusDisplayName(status: FulfillmentStatus): string {
    const displayNames: Record<FulfillmentStatus, string> = {
      [FulfillmentStatus.PENDING_SAMPLE]: '待寄样',
      [FulfillmentStatus.SAMPLE_SENT]: '样品已寄出',
      [FulfillmentStatus.SAMPLE_RECEIVED]: '样品已收到',
      [FulfillmentStatus.CONTENT_PLANNING]: '内容策划中',
      [FulfillmentStatus.CONTENT_PRODUCTION]: '内容制作中',
      [FulfillmentStatus.CONTENT_REVIEW]: '内容审核中',
      [FulfillmentStatus.CONTENT_APPROVED]: '内容已通过',
      [FulfillmentStatus.CONTENT_REJECTED]: '内容被拒绝',
      [FulfillmentStatus.CONTENT_PUBLISHED]: '内容已发布',
      [FulfillmentStatus.TRACKING_STARTED]: '开始数据跟踪',
      [FulfillmentStatus.TRACKING_COMPLETED]: '数据跟踪完成',
      [FulfillmentStatus.SETTLEMENT_PENDING]: '待结算',
      [FulfillmentStatus.SETTLEMENT_COMPLETED]: '结算完成',
      [FulfillmentStatus.CANCELLED]: '已取消',
      [FulfillmentStatus.EXPIRED]: '已过期'
    };
    return displayNames[status] || status;
  }

  /**
   * 格式化时间显示
   */
  public static formatDuration(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)}分钟`;
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10}小时`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round((hours % 24) * 10) / 10;
      return remainingHours > 0 ? `${days}天${remainingHours}小时` : `${days}天`;
    }
  }

  /**
   * 生成时效报告
   */
  public static async generateTimelinessReport(): Promise<{
    summary: {
      totalRecords: number;
      onTimeRecords: number;
      overdueRecords: number;
      onTimeRate: number;
      overdueRate: number;
    };
    overdueDetails: OverdueDetectionResult[];
  }> {
    const stats = await this.calculateTimelinessStats();
    const overdueRecords = await this.detectAllOverdueRecords();

    const onTimeRate = Math.round((stats.onTimeRecords / stats.totalRecords) * 100 * 100) / 100;
    const overdueRate = Math.round((stats.overdueRecords / stats.totalRecords) * 100 * 100) / 100;

    return {
      summary: {
        totalRecords: stats.totalRecords,
        onTimeRecords: stats.onTimeRecords,
        overdueRecords: stats.overdueRecords,
        onTimeRate,
        overdueRate
      },
      overdueDetails: overdueRecords.filter(record => record.isOverdue)
    };
  }
} 
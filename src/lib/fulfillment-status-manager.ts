import prisma from '@/lib/prisma';
import { 
  FulfillmentStatus, 
  FulfillmentRecordStatus, 
  StatusChangeReason,
  StatusTransitionRequest,
  StatusTransitionResponse,
  StatusTransitionValidation,
  OverdueDetectionResult
} from '@/types/fulfillment';

/**
 * 履约状态管理器
 * 负责处理状态流转、时效计算、验证等核心业务逻辑
 */
export class FulfillmentStatusManager {
  
  /**
   * 状态流转映射配置
   */
  private static readonly STATUS_FLOW_MAP: Record<FulfillmentStatus, FulfillmentStatus[]> = {
    [FulfillmentStatus.PENDING_SAMPLE]: [
      FulfillmentStatus.SAMPLE_SENT,
      FulfillmentStatus.CANCELLED,
      FulfillmentStatus.EXPIRED
    ],
    [FulfillmentStatus.SAMPLE_SENT]: [
      FulfillmentStatus.SAMPLE_RECEIVED,
      FulfillmentStatus.CANCELLED,
      FulfillmentStatus.EXPIRED
    ],
    [FulfillmentStatus.SAMPLE_RECEIVED]: [
      FulfillmentStatus.CONTENT_PLANNING,
      FulfillmentStatus.CANCELLED
    ],
    [FulfillmentStatus.CONTENT_PLANNING]: [
      FulfillmentStatus.CONTENT_PRODUCTION,
      FulfillmentStatus.CANCELLED
    ],
    [FulfillmentStatus.CONTENT_PRODUCTION]: [
      FulfillmentStatus.CONTENT_REVIEW,
      FulfillmentStatus.CANCELLED
    ],
    [FulfillmentStatus.CONTENT_REVIEW]: [
      FulfillmentStatus.CONTENT_APPROVED,
      FulfillmentStatus.CONTENT_REJECTED,
      FulfillmentStatus.CANCELLED
    ],
    [FulfillmentStatus.CONTENT_APPROVED]: [
      FulfillmentStatus.CONTENT_PUBLISHED,
      FulfillmentStatus.CANCELLED
    ],
    [FulfillmentStatus.CONTENT_REJECTED]: [
      FulfillmentStatus.CONTENT_PRODUCTION,
      FulfillmentStatus.CANCELLED
    ],
    [FulfillmentStatus.CONTENT_PUBLISHED]: [
      FulfillmentStatus.TRACKING_STARTED
    ],
    [FulfillmentStatus.TRACKING_STARTED]: [
      FulfillmentStatus.TRACKING_COMPLETED
    ],
    [FulfillmentStatus.TRACKING_COMPLETED]: [
      FulfillmentStatus.SETTLEMENT_PENDING
    ],
    [FulfillmentStatus.SETTLEMENT_PENDING]: [
      FulfillmentStatus.SETTLEMENT_COMPLETED
    ],
    [FulfillmentStatus.SETTLEMENT_COMPLETED]: [],
    [FulfillmentStatus.CANCELLED]: [],
    [FulfillmentStatus.EXPIRED]: []
  };

  /**
   * 默认时效配置（小时）
   */
  private static readonly DEFAULT_SLA_HOURS: Record<FulfillmentStatus, { standard: number; warning: number; max: number }> = {
    [FulfillmentStatus.PENDING_SAMPLE]: { standard: 24, warning: 20, max: 48 },
    [FulfillmentStatus.SAMPLE_SENT]: { standard: 72, warning: 60, max: 120 },
    [FulfillmentStatus.SAMPLE_RECEIVED]: { standard: 12, warning: 10, max: 24 },
    [FulfillmentStatus.CONTENT_PLANNING]: { standard: 48, warning: 40, max: 72 },
    [FulfillmentStatus.CONTENT_PRODUCTION]: { standard: 120, warning: 100, max: 168 },
    [FulfillmentStatus.CONTENT_REVIEW]: { standard: 24, warning: 20, max: 48 },
    [FulfillmentStatus.CONTENT_APPROVED]: { standard: 12, warning: 10, max: 24 },
    [FulfillmentStatus.CONTENT_REJECTED]: { standard: 24, warning: 20, max: 48 },
    [FulfillmentStatus.CONTENT_PUBLISHED]: { standard: 1, warning: 0.5, max: 2 },
    [FulfillmentStatus.TRACKING_STARTED]: { standard: 168, warning: 140, max: 240 },
    [FulfillmentStatus.TRACKING_COMPLETED]: { standard: 24, warning: 20, max: 48 },
    [FulfillmentStatus.SETTLEMENT_PENDING]: { standard: 72, warning: 60, max: 120 },
    [FulfillmentStatus.SETTLEMENT_COMPLETED]: { standard: 0, warning: 0, max: 0 },
    [FulfillmentStatus.CANCELLED]: { standard: 0, warning: 0, max: 0 },
    [FulfillmentStatus.EXPIRED]: { standard: 0, warning: 0, max: 0 }
  };

  /**
   * 验证状态转换是否合法
   */
  public static validateTransition(
    fromStatus: FulfillmentStatus,
    toStatus: FulfillmentStatus,
    forceTransition: boolean = false
  ): StatusTransitionValidation {
    const result: StatusTransitionValidation = {
      isValid: false,
      canTransition: false,
      errors: [],
      warnings: [],
      requiredFields: [],
      suggestedNextStatuses: this.STATUS_FLOW_MAP[fromStatus] || []
    };

    // 强制转换时跳过验证
    if (forceTransition) {
      result.isValid = true;
      result.canTransition = true;
      result.warnings.push('已启用强制转换，跳过状态流转验证');
      return result;
    }

    // 检查状态是否存在
    if (!Object.values(FulfillmentStatus).includes(fromStatus)) {
      result.errors.push(`无效的源状态: ${fromStatus}`);
      return result;
    }

    if (!Object.values(FulfillmentStatus).includes(toStatus)) {
      result.errors.push(`无效的目标状态: ${toStatus}`);
      return result;
    }

    // 检查是否允许该状态转换
    const allowedTransitions = this.STATUS_FLOW_MAP[fromStatus];
    if (!allowedTransitions.includes(toStatus)) {
      result.errors.push(`不允许从 ${fromStatus} 转换到 ${toStatus}`);
      return result;
    }

    // 检查特殊业务规则
    this.validateBusinessRules(fromStatus, toStatus, result);

    // 如果没有错误，则允许转换
    if (result.errors.length === 0) {
      result.isValid = true;
      result.canTransition = true;
    }

    return result;
  }

  /**
   * 验证业务规则
   */
  private static validateBusinessRules(
    fromStatus: FulfillmentStatus,
    toStatus: FulfillmentStatus,
    result: StatusTransitionValidation
  ): void {
    // 内容审核相关规则
    if (fromStatus === FulfillmentStatus.CONTENT_REVIEW) {
      if (toStatus === FulfillmentStatus.CONTENT_APPROVED) {
        result.requiredFields.push('videoUrl', 'videoTitle');
      }
      if (toStatus === FulfillmentStatus.CONTENT_REJECTED) {
        result.requiredFields.push('remarks');
      }
    }

    // 样品相关规则
    if (fromStatus === FulfillmentStatus.SAMPLE_SENT && toStatus === FulfillmentStatus.SAMPLE_RECEIVED) {
      result.requiredFields.push('trackingNumber');
    }

    // 发布相关规则
    if (fromStatus === FulfillmentStatus.CONTENT_APPROVED && toStatus === FulfillmentStatus.CONTENT_PUBLISHED) {
      result.requiredFields.push('publishTime');
    }

    // 结算相关规则
    if (toStatus === FulfillmentStatus.SETTLEMENT_COMPLETED) {
      result.requiredFields.push('adsRoi');
    }
  }

  /**
   * 检测逾期的履约单
   */
  public static async detectOverdueRecords(): Promise<OverdueDetectionResult[]> {
    const currentTime = Math.floor(Date.now() / 1000);
    
    // 模拟检测逾期记录（实际环境中从数据库查询）
    const mockResults: OverdueDetectionResult[] = [
      {
        fulfillmentRecordId: "1",
        currentStatus: FulfillmentStatus.SAMPLE_SENT,
        isOverdue: true,
        overdueHours: 12,
        stageDeadline: currentTime - 43200, // 12小时前
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
   * 生成建议操作
   */
  private static generateSuggestedActions(
    currentStatus: FulfillmentStatus,
    warningLevel: 'normal' | 'warning' | 'critical' | 'expired',
    overdueHours: number
  ): string[] {
    const actions: string[] = [];

    // 基于预警级别的通用建议
    if (warningLevel === 'warning') {
      actions.push('联系相关负责人确认进度');
      actions.push('检查是否需要额外资源支持');
    } else if (warningLevel === 'critical') {
      actions.push('立即联系负责人和上级主管');
      actions.push('评估是否需要重新安排时间线');
      actions.push('考虑启用应急处理流程');
    } else if (warningLevel === 'expired') {
      actions.push('启动升级流程，通知高级管理层');
      actions.push('评估项目风险和补救措施');
      actions.push('考虑是否需要重新协商截止时间');
    }

    // 基于当前状态的特定建议
    switch (currentStatus) {
      case FulfillmentStatus.PENDING_SAMPLE:
        actions.push('确认样品准备情况');
        actions.push('检查物流安排');
        break;
      case FulfillmentStatus.SAMPLE_SENT:
        actions.push('跟进物流状态');
        actions.push('联系达人确认收货情况');
        break;
      case FulfillmentStatus.CONTENT_PRODUCTION:
        actions.push('联系达人了解制作进度');
        actions.push('提供必要的制作支持');
        break;
      case FulfillmentStatus.CONTENT_REVIEW:
        actions.push('加急安排内容审核');
        actions.push('准备审核反馈');
        break;
    }

    return actions;
  }

  /**
   * 获取可转换的状态列表
   */
  public static getNextPossibleStatuses(currentStatus: FulfillmentStatus): FulfillmentStatus[] {
    return this.STATUS_FLOW_MAP[currentStatus] || [];
  }

  /**
   * 获取状态的默认时效配置
   */
  public static getDefaultSLA(status: FulfillmentStatus): { standard: number; warning: number; max: number } {
    return this.DEFAULT_SLA_HOURS[status] || { standard: 24, warning: 20, max: 48 };
  }

  /**
   * 判断状态是否为终态
   */
  public static isFinalStatus(status: FulfillmentStatus): boolean {
    const finalStatuses = [
      FulfillmentStatus.SETTLEMENT_COMPLETED,
      FulfillmentStatus.CANCELLED,
      FulfillmentStatus.EXPIRED
    ];
    return finalStatuses.includes(status);
  }

  /**
   * 获取状态的显示名称
   */
  public static getStatusDisplayName(status: FulfillmentStatus): string {
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
} 
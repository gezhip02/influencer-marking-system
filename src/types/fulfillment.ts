// 履约状态枚举
export enum FulfillmentStatus {
  PENDING_SAMPLE = 'pending_sample',           // 待寄样
  SAMPLE_SENT = 'sample_sent',                 // 样品已寄出  
  SAMPLE_RECEIVED = 'sample_received',         // 样品已收到
  CONTENT_CREATION = 'content_creation',       // 内容制作（统一使用这个，与数据库一致）
  CONTENT_PRODUCTION = 'content_production',   // 内容制作中（保留向后兼容）
  CONTENT_REVIEW = 'content_review',           // 内容审核中
  CONTENT_APPROVED = 'content_approved',       // 内容已通过
  CONTENT_REJECTED = 'content_rejected',       // 内容被拒绝
  CONTENT_PUBLISHED = 'content_published',     // 内容已发布
  TRACKING_STARTED = 'tracking_started',       // 开始数据跟踪
  TRACKING_COMPLETED = 'tracking_completed',   // 数据跟踪完成
  SETTLEMENT_PENDING = 'settlement_pending',   // 待结算
  SETTLEMENT_COMPLETED = 'settlement_completed', // 结算完成
  CANCELLED = 'cancelled',                     // 已取消
  EXPIRED = 'expired'                          // 已过期
}

// 履约记录状态枚举
export enum FulfillmentRecordStatus {
  ACTIVE = 'active',           // 进行中
  COMPLETED = 'completed',     // 已完成
  CANCELLED = 'cancelled',     // 已取消
  PAUSED = 'paused'           // 已暂停
}

// 优先级枚举
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 合作类型枚举
export enum CooperationType {
  SAMPLE_TRIAL = 'sample_trial',       // 试用
  PAID_PROMOTION = 'paid_promotion',   // 付费推广
  BRAND_AMBASSADOR = 'brand_ambassador', // 品牌大使
  CONTENT_CREATION = 'content_creation', // 内容创作
  LIVE_STREAMING = 'live_streaming'    // 直播带货
}

// 状态变更原因枚举
export enum StatusChangeReason {
  SYSTEM_AUTO = 'system_auto',         // 系统自动
  MANUAL_UPDATE = 'manual_update',     // 手动更新
  TIMEOUT_TRIGGER = 'timeout_trigger', // 超时触发
  EXTERNAL_CALLBACK = 'external_callback', // 外部回调
  BATCH_PROCESS = 'batch_process',     // 批处理
  USER_ACTION = 'user_action'          // 用户操作
}

// 基础履约单信息
export interface FulfillmentRecord {
  id: string;
  influencerId: string;
  productId: string;
  planId: string;
  ownerId: string;
  
  // 基础信息
  title?: string;
  description?: string;
  priority: Priority;
  
  // 当前状态信息
  currentStatus: FulfillmentStatus;
  recordStatus: FulfillmentRecordStatus;
  currentStageStartTime: number;
  currentStageDeadline?: number;
  isCurrentStageOverdue: boolean;
  
  // 业务数据
  trackingNumber?: string;
  sampleDeliveryTime?: number;
  contentGuidelines?: string;
  videoUrl?: string;
  videoTitle?: string;
  publishTime?: number;
  adsRoi?: number;
  conversionTags?: Record<string, any>;
  
  // 系统字段
  status: number;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
  updatedBy?: string;
}

// 履约方案配置
export interface FulfillmentPlan {
  id: string;
  name: string;
  description?: string;
  cooperationType: CooperationType;
  needSample: boolean;
  defaultPriority: Priority;
  isActive: boolean;
  
  // 系统字段
  status: number;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
}

// 履约时效配置
export interface FulfillmentSLA {
  id: string;
  planId: string;
  fromStatus: FulfillmentStatus;
  toStatus: FulfillmentStatus;
  
  // 时效配置
  standardHours: number;
  warningHours?: number;
  maxHours?: number;
  
  // 业务规则
  isRequired: boolean;
  canSkip: boolean;
  autoTransition: boolean;
  requiresApproval: boolean;
  allowedOperators?: string[];
  
  // 系统字段
  status: number;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
}

// 状态变更日志
export interface FulfillmentStatusLog {
  id: string;
  fulfillmentRecordId: string;
  fromStatus?: FulfillmentStatus;
  toStatus: FulfillmentStatus;
  
  // 时效信息
  stageStartTime: number;
  stageEndTime: number;
  stageDeadline?: number;
  plannedDurationHours?: number;
  actualDurationHours?: number;
  isOverdue: boolean;
  overdueHours?: number;
  
  // 下一阶段信息
  nextStageDeadline?: number;
  
  // 操作信息
  changeReason?: StatusChangeReason;
  remarks?: string;
  operatorId?: string;
  
  createdAt?: number;
}

// 状态转换配置
export interface StatusTransition {
  fromStatus: FulfillmentStatus;
  toStatus: FulfillmentStatus;
  standardHours: number;
  warningHours?: number;
  maxHours?: number;
  isRequired: boolean;
  canSkip: boolean;
  autoTransition: boolean;
  requiresApproval: boolean;
  allowedOperators?: string[];
}

// 状态转换请求
export interface StatusTransitionRequest {
  fulfillmentRecordId: string;
  toStatus: FulfillmentStatus;
  changeReason?: StatusChangeReason;
  remarks?: string;
  operatorId?: string;
  forceTransition?: boolean; // 强制转换，跳过验证
}

// 状态转换响应
export interface StatusTransitionResponse {
  success: boolean;
  data?: {
    fulfillmentRecord: FulfillmentRecord;
    statusLog: FulfillmentStatusLog;
    nextPossibleStatuses: FulfillmentStatus[];
    timelineInfo: {
      currentStageDeadline?: number;
      nextStageDeadline?: number;
      isOverdue: boolean;
      overdueHours?: number;
    };
  };
  error?: string;
  warnings?: string[];
}

// 逾期检测结果
export interface OverdueDetectionResult {
  fulfillmentRecordId: string;
  currentStatus: FulfillmentStatus;
  isOverdue: boolean;
  overdueHours: number;
  stageDeadline?: number;
  warningLevel: 'normal' | 'warning' | 'critical' | 'expired';
  suggestedActions: string[];
}

// 时效统计数据
export interface TimelinessStats {
  totalRecords: number;
  onTimeRecords: number;
  overdueRecords: number;
  avgCompletionHours: number;
  maxCompletionHours: number;
  statusBreakdown: Record<FulfillmentStatus, {
    count: number;
    avgHours: number;
    overdueCount: number;
  }>;
  priorityBreakdown: Record<Priority, {
    count: number;
    avgHours: number;
    overdueCount: number;
  }>;
}

// 履约统计查询参数
export interface FulfillmentStatsQuery {
  planId?: string;
  influencerId?: string;
  ownerId?: string;
  priority?: Priority;
  status?: FulfillmentStatus[];
  recordStatus?: FulfillmentRecordStatus[];
  dateRange?: {
    startDate: number;
    endDate: number;
  };
  includeOverdueOnly?: boolean;
}

// API响应基础类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// 分页查询参数
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 履约记录查询参数
export interface FulfillmentRecordQuery extends PaginationQuery {
  influencerId?: string;
  productId?: string;
  planId?: string;
  ownerId?: string;
  currentStatus?: FulfillmentStatus[];
  recordStatus?: FulfillmentRecordStatus[];
  priority?: Priority[];
  isOverdue?: boolean;
  createdDateRange?: {
    startDate: number;
    endDate: number;
  };
  keyword?: string; // 搜索关键词
}

// 状态日志查询参数
export interface StatusLogQuery extends PaginationQuery {
  fulfillmentRecordId?: string;
  fromStatus?: FulfillmentStatus;
  toStatus?: FulfillmentStatus;
  isOverdue?: boolean;
  operatorId?: string;
  changeReason?: StatusChangeReason[];
  dateRange?: {
    startDate: number;
    endDate: number;
  };
}

// 状态转换验证结果
export interface StatusTransitionValidation {
  isValid: boolean;
  canTransition: boolean;
  errors: string[];
  warnings: string[];
  requiredFields: string[];
  suggestedNextStatuses: FulfillmentStatus[];
}

// 批量状态更新请求
export interface BatchStatusUpdateRequest {
  fulfillmentRecordIds: string[];
  toStatus: FulfillmentStatus;
  changeReason: StatusChangeReason;
  remarks?: string;
  operatorId?: string;
  forceTransition?: boolean;
}

// 批量状态更新响应
export interface BatchStatusUpdateResponse {
  success: boolean;
  successCount: number;
  failureCount: number;
  results: Array<{
    fulfillmentRecordId: string;
    success: boolean;
    error?: string;
    statusLog?: FulfillmentStatusLog;
  }>;
  summary: {
    totalProcessed: number;
    successful: number;
    failed: number;
    skipped: number;
  };
}

// 时效监控配置
export interface TimelinessMonitorConfig {
  enableAutoWarning: boolean;
  warningThresholdHours: number;
  criticalThresholdHours: number;
  enableAutoEscalation: boolean;
  escalationTargets: string[]; // 用户ID列表
  checkIntervalMinutes: number;
  enableEmailNotification: boolean;
  enableSmsNotification: boolean;
}

// 预警通知数据
export interface OverdueWarningNotification {
  type: 'warning' | 'critical' | 'expired';
  fulfillmentRecord: FulfillmentRecord;
  overdueHours: number;
  currentStageDeadline?: number;
  suggestedActions: string[];
  recipients: string[]; // 接收人ID列表
  channels: ('email' | 'sms' | 'in_app')[]; // 通知渠道
} 
// 基础类型定义
export interface BaseEntity {
  id: string; // BigInt序列化为string
  createdAt?: number; // 秒级时间戳
  updatedAt?: number; // 秒级时间戳
}

// 用户相关类型
export interface User extends BaseEntity {
  email: string;
  name: string | null;
  image: string | null;
  username?: string | null;
  displayName?: string | null;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  department?: string | null;
  status: number; // 0=无效, 1=有效
  
  // 偏好设置
  preferences?: any;
  timezone?: string | null;
  language: string;
  
  // 登录信息
  lastLogin?: number | null; // 秒级时间戳
  loginCount: number;
}

// 平台类型
export interface Platform extends BaseEntity {
  name: string;
  displayName: string;
  apiEndpoint?: string | null;
  apiConfig?: any;
  status: number; // 0=无效, 1=有效
}

// 标签类型
export interface Tag extends BaseEntity {
  name: string;
  displayName?: string | null;
  description?: string | null;
  category: 'CONTENT' | 'AUDIENCE' | 'PERFORMANCE' | 'INDUSTRY' | 'GEOGRAPHY' | 'COOPERATION';
  color?: string | null;
  icon?: string | null;
  parentId?: string | null;
  status: number; // 0=无效, 1=有效
  sortOrder: number;
  isSystem: boolean;
  createdBy?: string | null;
  
  // 关联数据
  parent?: Tag | null;
  children?: Tag[];
  creator?: User | null;
  _count?: {
    influencers: number;
  };
}

// 达人类型
export interface Influencer extends BaseEntity {
  platformId: string;
  platformUserId: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  
  // 联系方式
  whatsappAccount?: string | null;
  email?: string | null;
  phone?: string | null;
  wechat?: string | null;
  telegram?: string | null;
  
  // 地理信息
  country?: string | null;
  region?: string | null;
  city?: string | null;
  timezone?: string | null;
  zipCode?: string | null;
  province?: string | null;
  street?: string | null;
  address1?: string | null;
  address2?: string | null;
  receiverPhone?: string | null;
  receiveName?: string | null;
  
  // 基础属性
  gender?: string | null;
  ageRange?: string | null;
  language?: string | null;
  
  // 粉丝数据
  followersCount: number;
  followingCount: number;
  totalLikes: string; // BigInt序列化为string
  totalVideos: number;
  avgVideoViews: number;
  engagementRate?: number | null;
  
  // 内容属性
  primaryCategory?: string | null;
  contentStyle?: any;
  contentLanguage?: string | null;
  tendencyCategory?: any; // JSON数组
  
  // 质量评估
  qualityScore?: number | null;
  riskLevel: string; // low, medium, high, unknown
  blacklistReason?: string | null;
  
  // 数据来源
  dataSource: string; // fastmoss, excel, manual, tiktok
  lastDataSync?: number | null; // 秒级时间戳
  dataAccuracy?: number | null;
  
  // 达人合作详情
  cooperateStatus?: number | null; // 1=待合作, 2=已合作, 3=终止合作
  hasSign?: number | null; // 0=未签约, 1=签约中, 2=已签约
  lastCooperateTime?: number | null; // 秒级时间戳
  cooperateProductCount?: number | null;
  fulfillCount?: number | null;
  cooperateProductName?: string | null;
  correspondScore?: number | null;
  avgFulfillDays?: number | null;
  
  // 内容描述
  videoStyle?: any;
  videoStyleForUs?: any;
  contentScore?: number | null;
  orderScore?: number | null;
  adsRoi?: number | null;
  
  // 带货能力
  gmvTotal?: string | null;
  gmvCountryRank?: number | null;
  gmvVideo?: string | null;
  gmvLive?: string | null;
  gpmVideo?: string | null;
  gpmLive?: string | null;
  
  // 系统字段
  status: number; // 0=禁用, 1=启用
  createdBy?: string | null;
  updatedBy?: string | null;
  
  // 扩展字段
  platformSpecificData?: any;
  notes?: string | null;
  
  // 关联数据
  platform?: Platform;
  creator?: User | null;
  tags?: InfluencerTag[];
  fulfillmentRecords?: FulfillmentRecord[];
}

// 达人标签关联
export interface InfluencerTag extends BaseEntity {
  influencerId: string;
  tagId: string;
  confidence?: number | null;
  source?: string | null;
  status: number; // 0=无效, 1=有效
  createdBy?: string | null;
  
  // 关联数据
  influencer?: Influencer;
  tag?: Tag;
}

// 履约记录标签关联
export interface FulfillmentRecordTag extends BaseEntity {
  fulfillmentRecordId: string;
  tagId: string;
  confidence?: number | null;
  source?: string | null;
  status: number; // 0=无效, 1=有效
  createdBy?: string | null;
  
  // 关联数据
  fulfillmentRecord?: FulfillmentRecord;
  tag?: Tag;
}

// 合作产品
export interface CooperationProduct extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  price?: number;
  currency?: string;
  budget?: number;
  targetAudience?: string;
  contentRequirements?: string;
  deliverables?: any;
  kpis?: any;
  startDate?: number;
  endDate?: number;
  priority?: string;
  
  // 新增字段
  country: string;
  skuSeries: string;
  
  status: number;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
}

// 履约记录
export interface FulfillmentRecord extends BaseEntity {
  id: string;
  influencerId: string;
  productId: string;
  planId: string;
  ownerId: string;
  
  // 基础信息
  title?: string;
  description?: string;
  priority: string;
  
  // 当前状态信息
  currentStatus: string;
  recordStatus: string;
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
  conversionTags?: any;
  
  // 系统字段
  status: number;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
  updatedBy?: string;
  
  // 关联数据（可选）
  influencer?: Influencer;
  product?: CooperationProduct;
  plan?: FulfillmentPlan;
  owner?: User;
}

// 履约方案相关类型
export interface FulfillmentPlan {
  id: string;
  planCode: string;
  planName: string;
  requiresSample: boolean;
  contentType: string;
  isInfluencerMade: boolean;
  initialStatus: string;
  description?: string;
  status: number;
  createdAt?: number;
  updatedAt?: number;
}

// 时效配置相关类型
export interface FulfillmentSLA {
  id: string;
  planId: string;
  fromStatus: string;
  toStatus: string;
  durationHours: number;
  description?: string;
  status: number;
  createdAt?: number;
}

// 履约状态日志相关类型
export interface FulfillmentStatusLog {
  id: string;
  fulfillmentRecordId: string;
  fromStatus?: string;
  toStatus: string;
  
  // 时效数据
  stageStartTime: number;
  stageEndTime: number;
  stageDeadline?: number;
  plannedDurationHours?: number;
  actualDurationHours?: number;
  isOverdue: boolean;
  overdueHours?: number;
  
  // 下一阶段预设
  nextStageDeadline?: number;
  
  // 操作信息
  changeReason?: string;
  remarks?: string;
  operatorId?: string;
  
  status: number;
  createdAt?: number;
  
  // 关联数据（可选）
  operator?: User;
}

// 沟通记录
export interface CommunicationLog extends BaseEntity {
  influencerId: string;
  fulfillmentRecordId?: string | null;
  
  // 沟通信息
  type: string; // email, whatsapp, telegram, wechat, phone, meeting
  direction: string; // inbound, outbound
  subject?: string | null;
  content: string;
  attachments?: any;
  
  // 状态
  status: number; // 0=无效, 1=有效
  isImportant: boolean;
  isFollowUpRequired: boolean;
  followUpDate?: number | null; // 秒级时间戳
  
  // 系统字段
  communicationDate: number; // 秒级时间戳
  createdBy?: string | null;
  
  // 关联数据
  influencer?: Influencer;
  fulfillmentRecord?: FulfillmentRecord | null;
  creator?: User | null;
}

// 达人数据历史记录
export interface InfluencerMetricsHistory extends BaseEntity {
  influencerId: string;
  followersCount: number;
  followingCount: number;
  totalLikes: string; // BigInt序列化为string
  totalVideos: number;
  avgVideoViews: number;
  engagementRate?: number | null;
  recordDate: number; // 秒级时间戳
  status: number; // 0=无效, 1=有效
  
  // 关联数据
  influencer?: Influencer;
}

// 导入记录
export interface ImportRecord extends BaseEntity {
  fileName: string;
  fileSize?: number | null;
  fileType?: string | null;
  importType: string; // influencers, tags, fulfillment_records
  status: number; // 0=处理中, 1=成功, 2=失败
  
  // 处理统计
  totalRows?: number | null;
  successRows?: number | null;
  errorRows?: number | null;
  duplicateRows?: number | null;
  
  // 处理结果
  errorLog?: string | null;
  mapping?: string | null;
  
  // 时间记录
  startTime?: number | null; // 秒级时间戳
  endTime?: number | null; // 秒级时间戳
  processingTime?: number | null;
  
  createdBy?: string | null;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// 筛选器接口
export interface TagFilters {
  search?: string;
  category?: string;
  status?: number;
  page?: number;
  limit?: number;
}

export interface InfluencerFilters {
  search?: string;
  platform?: string;
  status?: number;
  tags?: string[];
  minFollowers?: number;
  maxFollowers?: number;
  cooperateStatus?: number;
  hasSign?: number;
  country?: string;
  riskLevel?: string;
  dataSource?: string;
  page?: number;
  limit?: number;
}

export interface FulfillmentRecordFilters {
  search?: string;
  influencerId?: string;
  productId?: string;
  cooperateStatus?: number;
  hasSign?: number;
  fulfillmentStatus?: string;
  needSample?: number;
  page?: number;
  limit?: number;
}

// 表单接口
export interface CreateTagForm {
  name: string;
  displayName?: string;
  description?: string;
  category: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

export interface UpdateTagForm extends Partial<CreateTagForm> {
  id: string;
}

export interface CreateInfluencerForm {
  platformId: string;
  platformUserId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  
  // 联系方式
  whatsappAccount?: string;
  email?: string;
  phone?: string;
  wechat?: string;
  telegram?: string;
  
  // 地理信息
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  zipCode?: string;
  province?: string;
  street?: string;
  address1?: string;
  address2?: string;
  receiverPhone?: string;
  receiveName?: string;
  
  // 基础属性
  gender?: string;
  ageRange?: string;
  language?: string;
  
  // 粉丝数据
  followersCount?: number;
  followingCount?: number;
  totalLikes?: string;
  totalVideos?: number;
  avgVideoViews?: number;
  engagementRate?: number;
  
  // 内容属性
  primaryCategory?: string;
  contentStyle?: any;
  contentLanguage?: string;
  tendencyCategory?: any;
  
  // 质量评估
  qualityScore?: number;
  riskLevel?: string;
  blacklistReason?: string;
  
  // 数据来源
  dataSource?: string;
  dataAccuracy?: number;
  
  notes?: string;
}

export interface UpdateInfluencerForm extends Partial<CreateInfluencerForm> {
  id: string;
}

export interface CreateFulfillmentRecordForm {
  influencerId: string;
  productId: string;
  productName: string;
  cooperationType: string;
  fulfillmentDesc?: string;
  fulfillmentStatus?: string;
  needSample?: number;
  
  // 达人合作详情
  cooperateStatus?: number;
  hasSign?: number;
  correspondScore?: number;
  fulfillDays?: number;
  
  // 内容描述
  videoStyle?: string;
  videoStyleForUs?: string;
  contentScore?: number;
  orderScore?: number;
  adsRoi?: number;
  videoQuantityDesc?: string;
  liveQuantityDesc?: string;
  
  // 责任人
  ownerId?: string;
  ownerName?: string;
  
  // 标签和备注
  fulfillRemark?: string;
}

export interface UpdateFulfillmentRecordForm extends Partial<CreateFulfillmentRecordForm> {
  id: string;
}

export interface CreateCooperationProductForm {
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  price?: number;
  currency?: string;
  budget?: number;
  targetAudience?: string;
  contentRequirements?: string;
  deliverables?: any;
  kpis?: any;
  startDate?: number;
  endDate?: number;
  priority?: string;
}

export interface UpdateCooperationProductForm extends Partial<CreateCooperationProductForm> {
  id: string;
}

// 枚举类型
export enum InfluencerStatus {
  DISABLED = 0,
  ACTIVE = 1
}

export enum CooperateStatus {
  PENDING = 1,      // 待合作
  COOPERATED = 2,   // 已合作
  TERMINATED = 3    // 终止合作
}

export enum SignStatus {
  UNSIGNED = 0,     // 未签约
  SIGNING = 1,      // 签约中
  SIGNED = 2        // 已签约
}

export enum TagCategory {
  CONTENT = 'CONTENT',         // 内容类型
  AUDIENCE = 'AUDIENCE',       // 受众群体
  PERFORMANCE = 'PERFORMANCE', // 表现指标
  INDUSTRY = 'INDUSTRY',       // 行业分类
  GEOGRAPHY = 'GEOGRAPHY',     // 地理位置
  COOPERATION = 'COOPERATION'  // 合作相关
}

export enum ImportStatus {
  PENDING = 0,      // 待处理
  PROCESSING = 1,   // 处理中
  SUCCESS = 2,      // 成功
  FAILED = 3        // 失败
}

// 统计数据接口
export interface Statistics {
  totalInfluencers: number;
  activeInfluencers: number;
  totalTags: number;
  activeFulfillments: number;
  monthlyConversionRate: number;
  platformDistribution: Record<string, number>;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  entityId: string;
  entityType: string;
  timestamp: number; // 秒级时间戳
  metadata?: Record<string, any>;
}

export enum ActivityType {
  INFLUENCER_CREATED = 'INFLUENCER_CREATED',
  INFLUENCER_UPDATED = 'INFLUENCER_UPDATED',
  INFLUENCER_TAGGED = 'INFLUENCER_TAGGED',
  FULFILLMENT_CREATED = 'FULFILLMENT_CREATED',
  FULFILLMENT_UPDATED = 'FULFILLMENT_UPDATED',
  FULFILLMENT_COMPLETED = 'FULFILLMENT_COMPLETED',
  TAG_CREATED = 'TAG_CREATED',
  TAG_UPDATED = 'TAG_UPDATED',
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED'
}

// 分页结果接口
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 分页参数接口
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 履约单创建请求类型
export interface CreateFulfillmentRecordRequest {
  influencerId: string;
  productId: string;
  planId: string;
  ownerId: string;
  title?: string;
  description?: string;
  priority?: string;
  videoTitle?: string;
}

// 履约单更新请求类型
export interface UpdateFulfillmentRecordRequest {
  title?: string;
  description?: string;
  priority?: string;
  trackingNumber?: string;
  contentGuidelines?: string;
  videoUrl?: string;
  videoTitle?: string;
  adsRoi?: number;
  conversionTags?: any;
}

// 履约单列表查询参数
export interface FulfillmentRecordQuery {
  page?: number;
  limit?: number;
  influencerId?: string;
  productId?: string;
  planId?: string;
  ownerId?: string;
  currentStatus?: string;
  recordStatus?: string;
  priority?: string;
  isOverdue?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 履约单统计数据类型
export interface FulfillmentStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdue: number;
  completedThisMonth: number;
  avgCompletionDays: number;
}

// 状态更新请求类型
export interface UpdateStatusRequest {
  newStatus: string;
  changeReason?: string;
  remarks?: string;
  additionalData?: {
    trackingNumber?: string;
    sampleDeliveryTime?: number;
    contentGuidelines?: string;
    videoUrl?: string;
    publishTime?: number;
    adsRoi?: number;
    conversionTags?: any;
  };
}

// API响应类型
export interface FulfillmentRecordListResponse {
  success: boolean;
  data: FulfillmentRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats?: FulfillmentStats;
}

export interface FulfillmentRecordResponse {
  success: boolean;
  data: FulfillmentRecord;
}

export interface FulfillmentPlansResponse {
  success: boolean;
  data: FulfillmentPlan[];
}

export interface FulfillmentSLAResponse {
  success: boolean;
  data: FulfillmentSLA[];
} 
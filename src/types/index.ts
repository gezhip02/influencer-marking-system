// 基础类型定义
export interface BaseEntity {
  id: string; // 雪花算法生成的ID，序列化为string
  createdAt: string;
  updatedAt: string;
}

// 用户相关类型
export interface User extends BaseEntity {
  email: string;
  name: string | null;
  image: string | null;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

// 平台类型
export interface Platform extends BaseEntity {
  name: string;
  displayName: string | null;
  icon: string | null;
  baseUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DEPRECATED';
  sortOrder: number;
}

// 标签类型
export interface Tag extends BaseEntity {
  name: string;
  displayName: string | null;
  description: string | null;
  category: 'CONTENT' | 'AUDIENCE' | 'PERFORMANCE' | 'INDUSTRY' | 'GEOGRAPHY' | 'COOPERATION';
  color: string | null;
  icon: string | null;
  parentId: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  sortOrder: number;
  isSystem: boolean;
  createdBy: string | null;
  
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
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  verified: boolean;
  
  // 联系信息
  email: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
  
  // 粉丝数据
  followersCount: number;
  followingCount: number;
  postsCount: number;
  
  // 互动数据
  avgLikes: number | null;
  avgComments: number | null;
  avgShares: number | null;
  engagementRate: number | null;
  
  // 商务信息
  rateRange: string | null;
  currency: string | null;
  contactStatus: string | null;
  
  // 系统字段
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED' | 'PENDING_REVIEW' | 'ARCHIVED';
  priority: string | null;
  notes: string | null;
  lastSyncAt: string | null;
  createdBy: string | null;
  
  // 关联数据
  platform?: Platform;
  creator?: User | null;
  tags?: InfluencerTag[];
}

// 达人标签关联
export interface InfluencerTag extends BaseEntity {
  influencerId: string;
  tagId: string;
  confidence: number | null;
  source: string | null;
  createdBy: string | null;
  
  // 关联数据
  influencer?: Influencer;
  tag?: Tag;
}

// 合作项目
export interface CooperationProject extends BaseEntity {
  name: string;
  description: string | null;
  brand: string | null;
  campaign: string | null;
  budget: number | null;
  currency: string | null;
  startDate: string | null;
  endDate: string | null;
  status: 'PLANNING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
  priority: string | null;
  
  // 目标和要求
  targetAudience: string | null;
  contentRequirements: string | null;
  deliverables: any;
  kpis: any;
  
  createdBy: string | null;
  
  // 关联数据
  creator?: User | null;
  cooperationRecords?: CooperationRecord[];
}

// 合作记录
export interface CooperationRecord extends BaseEntity {
  influencerId: string;
  projectId: string | null;
  
  // 合作基本信息
  cooperationType: string | null;
  platform: string | null;
  status: 'CONTACTED' | 'RESPONDED' | 'NEGOTIATING' | 'AGREED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  priority: string | null;
  
  // 商务信息
  budget: number | null;
  currency: string | null;
  negotiationNotes: string | null;
  contractSigned: boolean;
  paymentStatus: string | null;
  
  // 时间安排
  contactDate: string | null;
  responseDate: string | null;
  agreementDate: string | null;
  contentDeadline: string | null;
  publishDate: string | null;
  
  // 内容要求
  contentBrief: string | null;
  contentDraft: string | null;
  contentFinal: string | null;
  contentUrl: string | null;
  
  // 效果数据
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  clicks: number | null;
  conversions: number | null;
  conversionRate: number | null;
  roi: number | null;
  
  // 评价
  performanceScore: number | null;
  cooperationRating: number | null;
  feedback: string | null;
  
  createdBy: string | null;
  
  // 关联数据
  influencer?: Influencer;
  project?: CooperationProject | null;
  creator?: User | null;
  communicationLogs?: CommunicationLog[];
}

// 沟通记录
export interface CommunicationLog extends BaseEntity {
  influencerId: string;
  cooperationRecordId: string | null;
  
  // 沟通信息
  type: string;
  direction: string;
  subject: string | null;
  content: string;
  attachments: any;
  
  // 状态
  status: string | null;
  isImportant: boolean;
  isFollowUpRequired: boolean;
  followUpDate: string | null;
  
  // 系统字段
  communicationDate: string;
  createdBy: string | null;
  
  // 关联数据
  influencer?: Influencer;
  cooperationRecord?: CooperationRecord | null;
  creator?: User | null;
}

// API 响应类型
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

// 搜索和过滤参数
export interface TagFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface InfluencerFilters {
  search?: string;
  platform?: string;
  status?: string;
  tags?: string[];
  minFollowers?: number;
  maxFollowers?: number;
  page?: number;
  limit?: number;
}

// 表单数据类型
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
  avatar?: string;
  bio?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  rateRange?: string;
  currency?: string;
  notes?: string;
}

export interface UpdateInfluencerForm extends Partial<CreateInfluencerForm> {
  id: string;
}

// 达人状态
export enum InfluencerStatus {
  ACTIVE = 'ACTIVE',           // 活跃
  INACTIVE = 'INACTIVE',       // 不活跃
  BLACKLISTED = 'BLACKLISTED', // 黑名单
  POTENTIAL = 'POTENTIAL'      // 潜在
}

// 标签分类
export enum TagCategory {
  CONTENT = 'CONTENT',         // 内容类型
  AUDIENCE = 'AUDIENCE',       // 受众群体
  PERFORMANCE = 'PERFORMANCE', // 表现指标
  INDUSTRY = 'INDUSTRY',       // 行业分类
  GEOGRAPHY = 'GEOGRAPHY',     // 地理位置
  COOPERATION = 'COOPERATION'  // 合作相关
}

// 合作状态
export enum CooperationStatus {
  PLANNED = 'PLANNED',         // 计划中
  NEGOTIATING = 'NEGOTIATING', // 洽谈中
  CONFIRMED = 'CONFIRMED',     // 已确认
  IN_PROGRESS = 'IN_PROGRESS', // 进行中
  COMPLETED = 'COMPLETED',     // 已完成
  CANCELLED = 'CANCELLED'      // 已取消
}

// 合作结果
export interface CooperationResult {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  roi?: number;
}

// 搜索过滤器
export interface InfluencerFilter {
  keyword?: string;
  platforms?: Platform[];
  tags?: string[];
  minFollowers?: number;
  maxFollowers?: number;
  minEngagementRate?: number;
  maxEngagementRate?: number;
  status?: InfluencerStatus[];
  lastContactBefore?: Date;
  lastContactAfter?: Date;
}

// 分页参数
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页结果
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 统计数据
export interface Statistics {
  totalInfluencers: number;
  totalTags: number;
  activeCooperations: number;
  monthlyConversionRate: number;
  platformDistribution: Record<Platform, number>;
  recentActivities: Activity[];
}

// 活动记录
export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  entityId: string;
  entityType: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 活动类型
export enum ActivityType {
  INFLUENCER_CREATED = 'INFLUENCER_CREATED',
  INFLUENCER_UPDATED = 'INFLUENCER_UPDATED',
  INFLUENCER_TAGGED = 'INFLUENCER_TAGGED',
  COOPERATION_CREATED = 'COOPERATION_CREATED',
  COOPERATION_UPDATED = 'COOPERATION_UPDATED',
  COOPERATION_COMPLETED = 'COOPERATION_COMPLETED',
  TAG_CREATED = 'TAG_CREATED',
  TAG_UPDATED = 'TAG_UPDATED'
} 
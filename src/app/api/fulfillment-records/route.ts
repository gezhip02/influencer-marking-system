import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serializeBigInt, serializeEntity } from '@/lib/bigint-serializer';
import snowflake from '@/lib/snowflake';
import type { 
  CreateFulfillmentRecordRequest, 
  FulfillmentRecordQuery,
  FulfillmentRecordListResponse 
} from '@/types';

// GET /api/fulfillment-records - 获取履约单列表（性能优化版本）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const query: FulfillmentRecordQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // 限制最大页面大小
      influencerId: searchParams.get('influencerId') || undefined,
      productId: searchParams.get('productId') || undefined,
      planId: searchParams.get('planId') || undefined,
      ownerId: searchParams.get('ownerId') || undefined,
      currentStatus: searchParams.get('currentStatus') || undefined,
      recordStatus: searchParams.get('recordStatus') || undefined,
      priority: searchParams.get('priority') || undefined,
      isOverdue: searchParams.get('isOverdue') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    };

    // 构建优化的查询条件
    const where: any = {
      status: 1 // 只查询有效数据
    };

    // 使用精确匹配而不是模糊查询以提高性能
    if (query.influencerId) where.influencerId = BigInt(query.influencerId);
    if (query.productId) where.productId = BigInt(query.productId);
    if (query.planId) where.planId = BigInt(query.planId);
    if (query.ownerId) where.ownerId = BigInt(query.ownerId);
    if (query.currentStatus) where.currentStatus = query.currentStatus;
    if (query.recordStatus) where.recordStatus = query.recordStatus;
    if (query.priority) where.priority = query.priority;
    if (query.isOverdue !== undefined) where.isCurrentStageOverdue = query.isOverdue;

    // 优化搜索功能 - 限制搜索字段和使用索引
    if (query.search) {
      const searchTerm = query.search.trim();
      if (searchTerm.length >= 2) { // 只对2个字符以上的搜索词进行搜索
        where.OR = [
          { title: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { videoTitle: { contains: searchTerm } }
        ];
      }
    }

    // 计算分页
    const skip = ((query.page || 1) - 1) * (query.limit || 20);

    // 使用Promise.all并行执行查询和计数
    const [records, total] = await Promise.all([
      prisma.fulfillmentRecord.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc'
        },
        // 选择必需的字段以减少数据传输
        select: {
          id: true,
          influencerId: true,
          productId: true,
          planId: true,
          ownerId: true,
          title: true,
          description: true,
          videoTitle: true,
          currentStatus: true,
          recordStatus: true,
          priority: true,
          isCurrentStageOverdue: true,
          currentStageDeadline: true,
          createdAt: true,
          updatedAt: true,
          adsRoi: true,
          trackingNumber: true,
          publishTime: true
        }
      }),
      // 使用_count进行高效计数
      prisma.fulfillmentRecord.count({ where })
    ]);

    // 批量获取关联数据以减少N+1查询问题
    const influencerIds = [...new Set(records.map(r => r.influencerId))];
    const productIds = [...new Set(records.map(r => r.productId))];
    const planIds = [...new Set(records.map(r => r.planId))];
    const ownerIds = [...new Set(records.map(r => r.ownerId))];

    const [influencers, products, plans, owners] = await Promise.all([
      influencerIds.length > 0 ? prisma.influencer.findMany({
        where: { id: { in: influencerIds }, status: 1 },
        select: { id: true, displayName: true, avatarUrl: true }
      }) : [],
      productIds.length > 0 ? prisma.cooperationProduct.findMany({
        where: { id: { in: productIds }, status: 1 },
        select: { id: true, name: true, description: true }
      }) : [],
      planIds.length > 0 ? prisma.fulfillmentPlan.findMany({
        where: { id: { in: planIds }, status: 1 },
        select: { id: true, planName: true, contentType: true }
      }) : [],
      ownerIds.length > 0 ? prisma.user.findMany({
        where: { id: { in: ownerIds }, status: 1 },
        select: { id: true, name: true, email: true }
      }) : []
    ]);

    // 创建映射表以快速查找
    const influencerMap = new Map(influencers.map(i => [i.id.toString(), i]));
    const productMap = new Map(products.map(p => [p.id.toString(), p]));
    const planMap = new Map(plans.map(p => [p.id.toString(), p]));
    const ownerMap = new Map(owners.map(o => [o.id.toString(), o]));

    // 合并数据
    const enrichedRecords = records.map(record => ({
      ...record,
      influencer: influencerMap.get(record.influencerId.toString()),
      product: productMap.get(record.productId.toString()),
      plan: planMap.get(record.planId.toString()),
      owner: ownerMap.get(record.ownerId.toString())
    }));

    // 序列化BigInt
    const serializedRecords = serializeBigInt(enrichedRecords);

    // 构建响应
    const response: FulfillmentRecordListResponse = {
      success: true,
      data: serializedRecords,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        pages: Math.ceil(total / (query.limit || 20))
      },
      // 添加性能指标（临时注释，因为类型不匹配）
      // meta: {
      //   queryTime: Date.now(),
      //   cachedData: false
      // }
    };

    // 设置缓存头以提高性能
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    headers.set('Content-Type', 'application/json');

    return new NextResponse(JSON.stringify(response), { headers });

  } catch (error) {
    console.error('获取履约单列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取履约单列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/fulfillment-records - 创建履约单
export async function POST(request: NextRequest) {
  try {
    const body: CreateFulfillmentRecordRequest = await request.json();

    // 验证必需字段
    if (!body.influencerId || !body.productId || !body.planId || !body.ownerId) {
      return NextResponse.json(
        { success: false, error: '缺少必需字段' },
        { status: 400 }
      );
    }

    // 验证关联数据是否存在
    const [influencer, product, plan, owner] = await Promise.all([
      prisma.influencer.findFirst({
        where: { id: BigInt(body.influencerId), status: 1 }
      }),
      prisma.cooperationProduct.findFirst({
        where: { id: BigInt(body.productId), status: 1 }
      }),
      prisma.fulfillmentPlan.findFirst({
        where: { id: BigInt(body.planId), status: 1 }
      }),
      prisma.user.findFirst({
        where: { id: BigInt(body.ownerId), status: 1 }
      })
    ]);

    if (!influencer) {
      return NextResponse.json(
        { success: false, error: '达人不存在或已失效' },
        { status: 400 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: '产品不存在或已失效' },
        { status: 400 }
      );
    }

    if (!plan) {
      return NextResponse.json(
        { success: false, error: '履约方案不存在或已失效' },
        { status: 400 }
      );
    }

    if (!owner) {
      return NextResponse.json(
        { success: false, error: '负责人不存在或已失效' },
        { status: 400 }
      );
    }

    // 检查唯一性约束（influencer + product + plan + videoTitle）
    if (body.videoTitle) {
      const existingRecord = await prisma.fulfillmentRecord.findFirst({
        where: {
          influencerId: BigInt(body.influencerId),
          productId: BigInt(body.productId),
          planId: BigInt(body.planId),
          videoTitle: body.videoTitle,
          status: 1
        }
      });

      if (existingRecord) {
        return NextResponse.json(
          { success: false, error: '该达人已为此产品和方案创建了同名内容的履约单' },
          { status: 400 }
        );
      }
    }

    const currentTime = Math.floor(Date.now() / 1000);

    // 获取下一阶段的时效配置
    const nextSLA = await prisma.fulfillmentSLA.findFirst({
      where: {
        planId: BigInt(body.planId),
        fromStatus: plan.initialStatus,
        status: 1
      }
    });

    // 计算下一阶段截止时间
    const currentStageDeadline = nextSLA 
      ? currentTime + (nextSLA.durationHours * 3600) // 转换为秒
      : null;

    // 创建履约单
    const fulfillmentRecord = await prisma.fulfillmentRecord.create({
      data: {
        id: snowflake.nextId(),
        influencerId: BigInt(body.influencerId),
        productId: BigInt(body.productId),
        planId: BigInt(body.planId),
        ownerId: BigInt(body.ownerId),
        title: body.title || `${influencer.displayName || influencer.username} - ${product.name}`,
        description: body.description,
        priority: body.priority || 'medium',
        currentStatus: plan.initialStatus,
        recordStatus: 'active',
        currentStageStartTime: currentTime,
        currentStageDeadline,
        isCurrentStageOverdue: false,
        videoTitle: body.videoTitle,
        status: 1,
        createdAt: currentTime,
        updatedAt: currentTime,
        createdBy: BigInt(body.ownerId) // 假设创建者就是负责人
      }
    });

    // 创建状态日志
    await prisma.fulfillmentStatusLog.create({
      data: {
        id: snowflake.nextId(),
        fulfillmentRecordId: fulfillmentRecord.id,
        fromStatus: null,
        toStatus: plan.initialStatus,
        stageStartTime: currentTime,
        stageEndTime: currentTime,
        stageDeadline: currentStageDeadline,
        plannedDurationHours: nextSLA?.durationHours,
        actualDurationHours: 0,
        isOverdue: false,
        nextStageDeadline: currentStageDeadline,
        changeReason: '创建履约单',
        operatorId: BigInt(body.ownerId),
        status: 1,
        createdAt: currentTime
      }
    });

    // 序列化响应
    const serializedRecord = serializeEntity(fulfillmentRecord);

    return NextResponse.json({
      success: true,
      data: serializedRecord
    });

  } catch (error) {
    console.error('创建履约单失败:', error);
    return NextResponse.json(
      { success: false, error: '创建履约单失败' },
      { status: 500 }
    );
  }
} 
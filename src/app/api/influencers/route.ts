import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { serializePagination } from '@/lib/bigint-serializer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const platform = searchParams.get('platform') || '';
    const country = searchParams.get('country') || '';
    const minFollowers = searchParams.get('minFollowers') || '';
    const maxFollowers = searchParams.get('maxFollowers') || '';
    const tags = searchParams.get('tags') || '';

    const skip = (page - 1) * limit;

    // 构建查询条件 - 先简化查询，不使用关联
    let query = supabase
      .from('influencers')
      .select('*')
      .eq('status', 1);

    // 添加搜索条件 - 修正字段名为camelCase
    if (search) {
      query = query.or(`username.ilike.%${search}%,displayName.ilike.%${search}%`);
    }

    if (platform) {
      query = query.eq('platformId', platform);
    }

    if (country) {
      query = query.eq('country', country);
    }

    if (minFollowers) {
      query = query.gte('followersCount', parseInt(minFollowers));
    }

    if (maxFollowers) {
      query = query.lte('followersCount', parseInt(maxFollowers));
    }

    // 暂时跳过标签过滤，稍后处理
    // if (tags) {
    //   const tagIds = tags.split(',').map(id => id.trim());
    //   query = query.in('influencer_tags.tagId', tagIds);
    // }

    // 添加排序和分页
    const { data: influencers, error: influencersError, count } = await query
      .order('qualityScore', { ascending: false })
      .order('followersCount', { ascending: false })
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1);

    if (influencersError) {
      console.error('获取达人列表失败:', influencersError);
      throw influencersError;
    }

    // 获取统计信息 - 简化处理
    const statsQueries = await Promise.allSettled([
      supabase.from('influencers').select('*', { count: 'exact', head: true }).eq('status', 1),
      supabase.from('influencers').select('*', { count: 'exact', head: true }).eq('status', 1),
      supabase.from('tags').select('*', { count: 'exact', head: true }).eq('status', 1)
    ]);

    const totalCount = statsQueries[0].status === 'fulfilled' ? statsQueries[0].value.count || 0 : 0;
    const activeCount = statsQueries[1].status === 'fulfilled' ? statsQueries[1].value.count || 0 : 0;
    const totalTags = statsQueries[2].status === 'fulfilled' ? statsQueries[2].value.count || 0 : 0;

    const statsData = {
      total: totalCount || 0,
      active: activeCount || 0,
      contacted: 0, // 暂时设为0，稍后实现
      totalTags: totalTags || 0
    };

    // 处理返回数据格式 - 暂时简化
    const processedInfluencers = influencers?.map(influencer => ({
      ...influencer,
      platform: null, // 稍后单独查询
      tags: [] // 稍后单独查询
    })) || [];

    const result = serializePagination({
      items: processedInfluencers,
      total: count || 0,
      page,
      limit
    });

    return NextResponse.json({
      success: true,
      data: result,
      stats: statsData
    });

  } catch (error) {
    console.error('获取达人列表失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error',
        message: '获取达人列表失败'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.platformId || !body.platformUserId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: '缺少必填字段：平台ID和平台用户ID'
        },
        { status: 400 }
      );
    }

    // 检查是否已存在相同的平台用户
    const { data: existingInfluencer } = await supabase
      .from('influencers')
      .select('id')
      .eq('platformId', body.platformId)
      .eq('platformUserId', body.platformUserId)
      .single();

    if (existingInfluencer) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Influencer already exists',
          message: '该平台用户已存在'
        },
        { status: 409 }
      );
    }

    // 分离标签数据和其他数据
    const { tagIds, ...influencerData } = body;
    
    // 准备创建数据 - 使用camelCase字段
    const createData = {
      id: Date.now().toString(), // 使用时间戳作为ID
      platformId: body.platformId,
      platformUserId: body.platformUserId,
      username: body.username,
      displayName: body.displayName,
      avatarUrl: body.avatarUrl,
      bio: body.bio,
      whatsappAccount: body.whatsappAccount,
      email: body.email,
      phone: body.phone,
      wechat: body.wechat,
      telegram: body.telegram,
      country: body.country,
      region: body.region,
      city: body.city,
      timezone: body.timezone,
      zipCode: body.zipCode,
      province: body.province,
      street: body.street,
      address1: body.address1,
      address2: body.address2,
      receiverPhone: body.receiverPhone,
      receiveName: body.receiveName,
      gender: body.gender,
      ageRange: body.ageRange,
      language: body.language,
      followersCount: body.followersCount || 0,
      followingCount: body.followingCount || 0,
      totalLikes: body.totalLikes || 0,
      totalVideos: body.totalVideos || 0,
      avgVideoViews: body.avgVideoViews || 0,
      engagementRate: body.engagementRate,
      primaryCategory: body.primaryCategory,
      contentStyle: body.contentStyle,
      contentLanguage: body.contentLanguage,
      tendencyCategory: body.tendencyCategory,
      qualityScore: body.qualityScore,
      riskLevel: body.riskLevel || 'unknown',
      blacklistReason: body.blacklistReason,
      dataSource: body.dataSource || 'manual',
      lastDataSync: body.lastDataSync,
      dataAccuracy: body.dataAccuracy,
      cooperateStatus: body.cooperateStatus,
      hasSign: body.hasSign,
      lastCooperateTime: body.lastCooperateTime,
      cooperateProductCount: body.cooperateProductCount,
      fulfillCount: body.fulfillCount,
      cooperateProductName: body.cooperateProductName,
      correspondScore: body.correspondScore,
      avgFulfillDays: body.avgFulfillDays,
      videoStyle: body.videoStyle,
      videoStyleForUs: body.videoStyleForUs,
      contentScore: body.contentScore,
      orderScore: body.orderScore,
      adsRoi: body.adsRoi,
      gmvTotal: body.gmvTotal,
      gmvCountryRank: body.gmvCountryRank,
      gmvVideo: body.gmvVideo,
      gmvLive: body.gmvLive,
      gpmVideo: body.gpmVideo,
      gpmLive: body.gpmLive,
      platformSpecificData: body.platformSpecificData,
      notes: body.notes,
      status: 1,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
      createdBy: body.createdBy
    };

    // 创建达人记录
    const { data: influencer, error: createError } = await supabase
      .from('influencers')
      .insert(createData)
      .select()
      .single();

    if (createError) {
      console.error('创建达人失败:', createError);
      throw createError;
    }

    // 处理标签关联
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      const tagRelations = tagIds.map(tagId => ({
        id: `${influencer.id}_${tagId}_${Date.now()}`,
        influencer_id: influencer.id,
        tag_id: tagId,
        confidence: 1.0,
        source: 'manual',
        status: 1,
        created_at: Math.floor(Date.now() / 1000),
        created_by: body.createdBy
      }));

      const { error: tagError } = await supabase
        .from('influencer_tags')
        .insert(tagRelations);

      if (tagError) {
        console.error('创建标签关联失败:', tagError);
        // 不抛出错误，只记录日志
      }
    }

    return NextResponse.json({
      success: true,
      data: influencer,
      message: '达人创建成功'
    });

  } catch (error) {
    console.error('创建达人失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error',
        message: '创建达人失败'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing ID',
          message: '缺少达人ID'
        },
        { status: 400 }
      );
    }

    // 检查达人是否存在
    const { data: existingInfluencer } = await supabase
      .from('influencers')
      .select('*')
      .eq('id', body.id)
      .eq('status', 1)
      .single();

    if (!existingInfluencer) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Influencer not found',
          message: '达人不存在'
        },
        { status: 404 }
      );
    }

    // 分离标签数据和其他数据
    const { tagIds, ...updateFields } = body;
    
    // 准备更新数据（不包含标签）
    const updateData = {
      ...updateFields,
      updated_at: Math.floor(Date.now() / 1000),
      updated_by: updateFields.updatedBy
    };
    
    // 移除不应该更新的字段
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.created_by;
    delete updateData.platform_id; // 平台关系不能直接更新

    // 使用事务处理更新和标签关联
    const { data: updatedInfluencer, error: updateError } = await supabase
      .from('influencers')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (updateError) {
      console.error('更新达人失败:', updateError);
      throw updateError;
    }

    // 处理标签关联更新
    if (tagIds !== undefined) {
      console.log('更新标签关联:', tagIds);
      
      // 删除现有的标签关联（物理删除，避免唯一约束冲突）
      const { error: deleteError } = await supabase
        .from('influencer_tags')
        .delete()
        .eq('influencer_id', body.id);

      if (deleteError) {
        console.error('删除标签关联失败:', deleteError);
        // 不抛出错误，只记录日志
      }

      // 如果有新标签，创建新的关联
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        console.log('新标签关联:', tagIds);
        
        const tagRelations = tagIds.map(tagId => ({
          id: `${body.id}_${tagId}_${Date.now()}`,
          influencer_id: body.id,
          tag_id: tagId,
          confidence: 1.0,
          source: 'manual',
          status: 1,
          created_at: Math.floor(Date.now() / 1000),
          created_by: updateFields.updatedBy
        }));

        const { error: tagError } = await supabase
          .from('influencer_tags')
          .insert(tagRelations);

        if (tagError) {
          console.error('创建标签关联失败:', tagError);
          // 不抛出错误，只记录日志
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedInfluencer,
      message: '达人更新成功'
    });

  } catch (error) {
    console.error('更新达人失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error',
        message: '更新达人失败'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing ID',
          message: '缺少达人ID'
        },
        { status: 400 }
      );
    }

    // 检查达人是否存在且有效
    const { data: existingInfluencer } = await supabase
      .from('influencers')
      .select('*')
      .eq('id', id)
      .eq('status', 1)
      .single();
    
    if (!existingInfluencer) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Influencer not found',
          message: '达人不存在或已被删除'
        },
        { status: 404 }
      );
    }

    // 使用软删除：只需要将status设置为0
    const { error: deleteError } = await supabase
      .from('influencers')
      .update({ status: 0 })
      .eq('id', id);

    if (deleteError) {
      console.error('删除达人失败:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: '达人删除成功'
    });

  } catch (error) {
    console.error('删除达人失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error',
        message: '删除达人失败'
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const parentId = searchParams.get('parentId');

    const skip = (page - 1) * limit;

    // 构建查询
    let query = supabase
      .from('tags')
      .select('*')
      .eq('status', 1);

    // 添加搜索条件
    if (search) {
      query = query.or(`name.ilike.%${search}%,displayName.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (parentId !== null && parentId !== undefined) {
      if (parentId === 'null' || parentId === '') {
        query = query.is('parentId', null);
      } else {
        query = query.eq('parentId', parentId);
      }
    }

    // 添加排序和分页
    const { data: tags, error: tagsError, count } = await query
      .order('sortOrder', { ascending: true })
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1);

    if (tagsError) {
      console.error('获取标签列表失败:', tagsError);
      throw tagsError;
    }

    // 获取统计信息
    const [
      { count: totalTags },
      { count: totalInfluencers },
      { data: categoryStats, error: categoryError }
    ] = await Promise.all([
      supabase.from('tags').select('*', { count: 'exact', head: true }).eq('status', 1),
      supabase.from('influencers').select('*', { count: 'exact', head: true }).eq('status', 1),
      supabase.from('tags')
        .select('category')
        .eq('status', 1)
        .not('category', 'is', null)
    ]);

    // 处理分类统计
    const categoryCount: Record<string, number> = {};
    if (categoryStats) {
      categoryStats.forEach((item: any) => {
        const cat = item.category;
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    }

    const categoryStatsArray = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      _count: { category: count }
    }));

    const statsData = {
      total: totalTags || 0,
      totalInfluencers: totalInfluencers || 0,
      categories: categoryStatsArray
    };

    // 处理返回数据 - 数据库字段已经是camelCase，无需映射
    const processedTags = tags || [];

    return NextResponse.json({
      success: true,
      data: processedTags,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      stats: statsData
    });

  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch tags', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayName, description, category, color, icon, parentId } = body;

    // 验证必填字段
    if (!name || !displayName || !category) {
      return NextResponse.json(
        { error: 'Name, display name, and category are required' },
        { status: 400 }
      );
    }

    // 检查名称是否已存在
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('name', name)
      .eq('status', 1)
      .single();

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag name already exists' },
        { status: 400 }
      );
    }

    // 准备创建数据
    const createData = {
      id: Date.now().toString(),
      name,
      displayName,
      description,
      category,
      color: color || '#6B7280',
      icon,
      parentId: parentId || null,
      status: 1,
      isSystem: false,
      sortOrder: 0,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
      createdBy: null
    };

    const { data: tag, error: createError } = await supabase
      .from('tags')
      .insert(createData)
      .select()
      .single();

    if (createError) {
      console.error('创建标签失败:', createError);
      throw createError;
    }

    // 处理返回数据 - 数据库字段已经是camelCase，无需映射
    const processedTag = tag;

    return NextResponse.json({
      success: true,
      data: processedTag
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, displayName, description, category, color, icon, parentId } = body;

    // 验证必填字段
    if (!id || !name || !displayName || !category) {
      return NextResponse.json(
        { error: 'ID, name, display name, and category are required' },
        { status: 400 }
      );
    }

    // 检查标签是否存在
    const { data: existingTag } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .eq('status', 1)
      .single();

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // 检查名称是否与其他标签冲突
    const { data: nameConflict } = await supabase
      .from('tags')
      .select('id')
      .eq('name', name)
      .eq('status', 1)
      .neq('id', id)
      .single();

    if (nameConflict) {
      return NextResponse.json(
        { error: 'Tag name already exists' },
        { status: 400 }
      );
    }

    // 准备更新数据
    const updateData = {
      name,
      displayName,
      description,
      category,
      color: color || '#6B7280',
      icon,
      parentId: parentId || null,
      updatedAt: Math.floor(Date.now() / 1000)
    };

    const { data: updatedTag, error: updateError } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('更新标签失败:', updateError);
      throw updateError;
    }

    // 处理返回数据 - 数据库字段已经是camelCase，无需映射
    const processedTag = updatedTag;

    return NextResponse.json({
      success: true,
      data: processedTag
    });

  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag', details: error instanceof Error ? error.message : 'Unknown error' },
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
        { error: 'Tag ID is required' },
        { status: 400 }
      );
    }

    // 检查标签是否存在
    const { data: existingTag } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .eq('status', 1)
      .single();

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // 检查是否被使用
    const { count: usageCount } = await supabase
      .from('influencer_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tagId', id)
      .eq('status', 1);

    if (usageCount && usageCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tag that is in use by influencers' },
        { status: 400 }
      );
    }

    // 软删除标签
    const { error: deleteError } = await supabase
      .from('tags')
      .update({ 
        status: 0,
        updatedAt: Math.floor(Date.now() / 1000)
      })
      .eq('id', id);

    if (deleteError) {
      console.error('删除标签失败:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
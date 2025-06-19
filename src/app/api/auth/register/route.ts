import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateId } from '@/lib/snowflake';
import { serializeBigInt, timestampUtils } from '@/lib/bigint-serializer';
import bcrypt from 'bcryptjs';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  department?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password, role, department } = body;

    // 验证必需字段
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: '请填写所有必需字段' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6个字符' },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return NextResponse.json(
        { error: '密码必须包含字母和数字' },
        { status: 400 }
      );
    }

    // 验证角色
    const validRoles = ['USER', 'MANAGER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: '无效的角色' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册，请使用其他邮箱' },
        { status: 409 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const currentTime = timestampUtils.now();
    const userId = generateId();

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase(),
        role,
        department: department?.trim() || null,
        status: 1, // 活跃状态
        preferences: {
          language: 'zh-CN',
          timezone: 'Asia/Shanghai',
          notifications: {
            email: true,
            system: true
          }
        },
        timezone: 'Asia/Shanghai',
        language: 'zh-CN',
        loginCount: 0,
        createdAt: currentTime,
        updatedAt: currentTime
      }
    });

    // 创建账户记录（用于存储密码等认证信息）
    await prisma.account.create({
      data: {
        id: generateId(),
        userId: userId,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: userId.toString(),
        refresh_token: null,
        access_token: hashedPassword, // 临时存储加密密码
        expires_at: null,
        token_type: 'password',
        scope: null,
        id_token: null,
        session_state: null
      }
    });

    // 生成session token（简单的JWT替代）
    const sessionToken = `session_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建session
    await prisma.session.create({
      data: {
        id: generateId(),
        sessionToken,
        userId: userId,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期
      }
    });

    // 序列化用户数据
    const serializedUser = serializeBigInt({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      status: newUser.status,
      timezone: newUser.timezone,
      language: newUser.language,
      createdAt: newUser.createdAt
    });

    // 记录审计日志
    try {
      await prisma.auditLog.create({
        data: {
          id: generateId(),
          userId: userId,
          action: 'USER_REGISTER',
          resource: 'User',
          resourceId: userId,
          oldValues: null,
          newValues: JSON.stringify({
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            department: newUser.department
          }),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          createdAt: currentTime
        }
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // 不影响注册流程
    }

    return NextResponse.json({
      success: true,
      message: '注册成功',
      data: {
        user: serializedUser,
        token: sessionToken
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    // 处理特定的数据库错误
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: '邮箱或用户名已存在' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateId } from '@/lib/snowflake';
import { serializeBigInt, timestampUtils } from '@/lib/bigint-serializer';
import bcrypt from 'bcryptjs';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password, rememberMe = false } = body;

    // 验证必需字段
    if (!email || !password) {
      return NextResponse.json(
        { error: '请输入邮箱和密码' },
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

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        accounts: {
          where: {
            provider: 'credentials',
            type: 'credentials'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 检查用户状态
    if (user.userStatus !== 1) {
      return NextResponse.json(
        { error: '账户已被禁用，请联系管理员' },
        { status: 403 }
      );
    }

    // 验证密码
    const account = user.accounts[0];
    if (!account || !account.access_token) {
      return NextResponse.json(
        { error: '账户信息异常，请联系管理员' },
        { status: 500 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, account.access_token);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 更新登录统计
    const currentTime = timestampUtils.now();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: currentTime,
        loginCount: {
          increment: 1
        },
        updatedAt: currentTime
      }
    });

    // 生成新的session token
    const sessionToken = `session_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = rememberMe 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 1天

    // 清理旧的session（可选）
          await prisma.session.updateMany({
        where: {
          userId: user.id,
          expires: {
            lt: new Date()
          },
          status: 1
        },
        data: {
          status: 0
        }
      });

    // 创建新session
    await prisma.session.create({
      data: {
        id: generateId(),
        sessionToken,
        userId: user.id,
        expires: expiresAt
      }
    });

    // 序列化用户数据
    const serializedUser = serializeBigInt({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      userStatus: user.userStatus,
      timezone: user.timezone,
      language: user.language,
      lastLogin: currentTime,
      loginCount: user.loginCount + 1,
      createdAt: user.createdAt
    });

    // 记录审计日志
    try {
      await prisma.auditLog.create({
        data: {
          id: generateId(),
          userId: user.id,
          action: 'USER_LOGIN',
          resource: 'User',
          resourceId: user.id,
          oldValues: null,
          newValues: JSON.stringify({
            loginTime: currentTime,
            rememberMe
          }),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          createdAt: currentTime
        }
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // 不影响登录流程
    }

    return NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        user: serializedUser,
        token: sessionToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
} 
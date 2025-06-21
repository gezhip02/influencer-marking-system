import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 🔍 详细调试 Vercel 环境变量
    const dbUrl = process.env.DATABASE_URL;
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      databaseUrl: {
        exists: !!dbUrl,
        length: dbUrl?.length || 0,
        first20Chars: dbUrl?.substring(0, 20) || 'undefined',
        startsWithPostgresql: dbUrl?.startsWith('postgresql://') || false,
        startsWithPostgres: dbUrl?.startsWith('postgres://') || false,
        hasQuotes: dbUrl?.includes('"') || false,
        hasSpaces: dbUrl?.includes(' ') || false,
        fullUrl: dbUrl || 'undefined'
      },
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('DATABASE') || 
        key.includes('SUPABASE') || 
        key.includes('PRISMA')
      )
    };
    
    console.log('🔍 DEBUG ENV INFO:', JSON.stringify(debugInfo, null, 2));
    
    return NextResponse.json({
      success: true,
      data: debugInfo
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug API failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

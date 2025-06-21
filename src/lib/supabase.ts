import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'influencer-marking-system'
    }
  }
})

// 数据库操作类型定义
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          emailVerified: string | null
          image: string | null
          username: string | null
          displayName: string | null
          role: string
          department: string | null
          status: number
          preferences: any | null
          timezone: string | null
          language: string
          lastLogin: number | null
          loginCount: number
          createdAt: number | null
          updatedAt: number | null
        }
        Insert: {
          id: string
          name?: string | null
          email: string
          emailVerified?: string | null
          image?: string | null
          username?: string | null
          displayName?: string | null
          role?: string
          department?: string | null
          status?: number
          preferences?: any | null
          timezone?: string | null
          language?: string
          lastLogin?: number | null
          loginCount?: number
          createdAt?: number | null
          updatedAt?: number | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          emailVerified?: string | null
          image?: string | null
          username?: string | null
          displayName?: string | null
          role?: string
          department?: string | null
          status?: number
          preferences?: any | null
          timezone?: string | null
          language?: string
          lastLogin?: number | null
          loginCount?: number
          createdAt?: number | null
          updatedAt?: number | null
        }
      }
      platforms: {
        Row: {
          id: string
          name: string
          displayName: string
          apiEndpoint: string | null
          apiConfig: any | null
          status: number
          createdAt: number | null
          updatedAt: number | null
        }
        Insert: {
          id: string
          name: string
          displayName: string
          apiEndpoint?: string | null
          apiConfig?: any | null
          status?: number
          createdAt?: number | null
          updatedAt?: number | null
        }
        Update: {
          id?: string
          name?: string
          displayName?: string
          apiEndpoint?: string | null
          apiConfig?: any | null
          status?: number
          createdAt?: number | null
          updatedAt?: number | null
        }
      }
      influencers: {
        Row: {
          id: string
          platformId: string
          platformUserId: string
          username: string | null
          displayName: string | null
          avatarUrl: string | null
          bio: string | null
          followersCount: number
          followingCount: number
          totalLikes: number
          totalVideos: number
          avgVideoViews: number
          engagementRate: number | null
          primaryCategory: string | null
          contentLanguage: string | null
          qualityScore: number | null
          riskLevel: string
          status: number
          createdAt: number | null
          updatedAt: number | null
          createdBy: string | null
          updatedBy: string | null
        }
        Insert: {
          id: string
          platformId: string
          platformUserId: string
          username?: string | null
          displayName?: string | null
          avatarUrl?: string | null
          bio?: string | null
          followersCount?: number
          followingCount?: number
          totalLikes?: number
          totalVideos?: number
          avgVideoViews?: number
          engagementRate?: number | null
          primaryCategory?: string | null
          contentLanguage?: string | null
          qualityScore?: number | null
          riskLevel?: string
          status?: number
          createdAt?: number | null
          updatedAt?: number | null
          createdBy?: string | null
          updatedBy?: string | null
        }
        Update: {
          id?: string
          platformId?: string
          platformUserId?: string
          username?: string | null
          displayName?: string | null
          avatarUrl?: string | null
          bio?: string | null
          followersCount?: number
          followingCount?: number
          totalLikes?: number
          totalVideos?: number
          avgVideoViews?: number
          engagementRate?: number | null
          primaryCategory?: string | null
          contentLanguage?: string | null
          qualityScore?: number | null
          riskLevel?: string
          status?: number
          createdAt?: number | null
          updatedAt?: number | null
          createdBy?: string | null
          updatedBy?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 类型化的Supabase客户端
export type TypedSupabaseClient = ReturnType<typeof createClient<Database>>

// 创建类型化的客户端
export const typedSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 数据库操作辅助函数
export const db = {
  // 用户操作
  users: {
    async getAll() {
      const { data, error } = await typedSupabase
        .from('users')
        .select('*')
        .eq('status', 1)
        .order('createdAt', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    async getById(id: string) {
      const { data, error } = await typedSupabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('status', 1)
        .single()
      
      if (error) throw error
      return data
    },
    
    async create(user: Database['public']['Tables']['users']['Insert']) {
      const { data, error } = await typedSupabase
        .from('users')
        .insert(user)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async update(id: string, updates: Database['public']['Tables']['users']['Update']) {
      const { data, error } = await typedSupabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  // 平台操作
  platforms: {
    async getAll() {
      const { data, error } = await typedSupabase
        .from('platforms')
        .select('*')
        .eq('status', 1)
        .order('createdAt', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    async getById(id: string) {
      const { data, error } = await typedSupabase
        .from('platforms')
        .select('*')
        .eq('id', id)
        .eq('status', 1)
        .single()
      
      if (error) throw error
      return data
    },
    
    async create(platform: Database['public']['Tables']['platforms']['Insert']) {
      const { data, error } = await typedSupabase
        .from('platforms')
        .insert(platform)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async update(id: string, updates: Database['public']['Tables']['platforms']['Update']) {
      const { data, error } = await typedSupabase
        .from('platforms')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  // 达人操作
  influencers: {
    async getAll(page = 1, limit = 10, search?: string) {
      let query = typedSupabase
        .from('influencers')
        .select('*')
        .eq('status', 1)
      
      if (search) {
        query = query.or(`username.ilike.%${search}%,displayName.ilike.%${search}%`)
      }
      
      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('createdAt', { ascending: false })
      
      if (error) throw error
      return { data, count }
    },
    
    async getById(id: string) {
      const { data, error } = await typedSupabase
        .from('influencers')
        .select('*')
        .eq('id', id)
        .eq('status', 1)
        .single()
      
      if (error) throw error
      return data
    },
    
    async create(influencer: Database['public']['Tables']['influencers']['Insert']) {
      const { data, error } = await typedSupabase
        .from('influencers')
        .insert(influencer)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async update(id: string, updates: Database['public']['Tables']['influencers']['Update']) {
      const { data, error } = await typedSupabase
        .from('influencers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  }
}

// 连接测试函数
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    return {
      success: true,
      message: 'Supabase连接成功'
    }
  } catch (error) {
    return {
      success: false,
      message: `Supabase连接失败: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
} 
-- Supabase 数据插入脚本
-- 执行前请确保已经运行了 create_tables.sql 创建表结构

-- 1. 插入用户数据
INSERT INTO "users" (
    "id", "name", "email", "role", "language", "loginCount", 
    "status", "createdAt", "updatedAt"
) VALUES 
(1001, 'Admin User', 'admin@example.com', 'ADMIN', 'zh-CN', 0, 1, extract(epoch from now()), extract(epoch from now())),
(1002, 'Manager User', 'manager@example.com', 'MANAGER', 'zh-CN', 0, 1, extract(epoch from now()), extract(epoch from now())),
(1003, 'Operator User', 'operator@example.com', 'USER', 'zh-CN', 0, 1, extract(epoch from now()), extract(epoch from now()));

-- 2. 插入平台数据
INSERT INTO "platforms" (
    "id", "name", "displayName", "status", "createdAt", "updatedAt"
) VALUES 
(2001, 'tiktok', 'TikTok', 1, extract(epoch from now()), extract(epoch from now())),
(2002, 'instagram', 'Instagram', 1, extract(epoch from now()), extract(epoch from now())),
(2003, 'youtube', 'YouTube', 1, extract(epoch from now()), extract(epoch from now())),
(2004, 'facebook', 'Facebook', 1, extract(epoch from now()), extract(epoch from now()));

-- 3. 插入标签数据
INSERT INTO "tags" (
    "id", "name", "displayName", "description", "category", "color", 
    "status", "sortOrder", "isSystem", "createdAt", "updatedAt", "createdBy"
) VALUES 
(3001, 'beauty', '美妆', '美妆护肤相关内容', 'CONTENT', '#FF69B4', 1, 1, false, extract(epoch from now()), extract(epoch from now()), 1001),
(3002, 'lifestyle', '生活方式', '生活方式相关内容', 'CONTENT', '#32CD32', 1, 2, false, extract(epoch from now()), extract(epoch from now()), 1001),
(3003, 'tech', '科技', '科技产品相关内容', 'CONTENT', '#1E90FF', 1, 3, false, extract(epoch from now()), extract(epoch from now()), 1001),
(3004, 'fashion', '时尚', '时尚穿搭相关内容', 'CONTENT', '#9370DB', 1, 4, false, extract(epoch from now()), extract(epoch from now()), 1001),
(3005, 'food', '美食', '美食相关内容', 'CONTENT', '#FF4500', 1, 5, false, extract(epoch from now()), extract(epoch from now()), 1001);

-- 4. 插入达人数据
INSERT INTO "influencers" (
    "id", "platformId", "platformUserId", "username", "displayName", 
    "followersCount", "followingCount", "totalLikes", "totalVideos", "avgVideoViews",
    "engagementRate", "primaryCategory", "contentLanguage", "qualityScore", 
    "riskLevel", "dataSource", "cooperateStatus", "hasSign", 
    "status", "createdAt", "updatedAt", "createdBy"
) VALUES 
(4001, 2001, 'beauty_queen_2024', 'beauty_queen', 'Beauty Queen', 
 500000, 1200, 5000000, 300, 80000, 6.5, 'beauty', 'en', 92.0, 
 'low', 'api', 1, 1, 1, extract(epoch from now()), extract(epoch from now()), 1001),

(4002, 2001, 'tech_reviewer_pro', 'tech_reviewer', 'Tech Reviewer Pro', 
 800000, 800, 8000000, 150, 120000, 8.2, 'tech', 'en', 88.5, 
 'low', 'api', 1, 1, 1, extract(epoch from now()), extract(epoch from now()), 1001),

(4003, 2002, 'lifestyle_guru', 'lifestyle_guru', 'Lifestyle Guru', 
 300000, 2000, 3000000, 400, 45000, 5.8, 'lifestyle', 'en', 85.0, 
 'medium', 'manual', 1, 0, 1, extract(epoch from now()), extract(epoch from now()), 1001);

-- 5. 插入达人标签关联
INSERT INTO "influencer_tags" (
    "id", "influencerId", "tagId", "confidence", "source", 
    "status", "createdAt", "createdBy"
) VALUES 
(5001, 4001, 3001, 0.95, 'auto', 1, extract(epoch from now()), 1001),  -- Beauty Queen - 美妆
(5002, 4002, 3003, 0.98, 'auto', 1, extract(epoch from now()), 1001),  -- Tech Reviewer - 科技
(5003, 4003, 3002, 0.90, 'manual', 1, extract(epoch from now()), 1001), -- Lifestyle Guru - 生活方式
(5004, 4003, 3004, 0.75, 'manual', 1, extract(epoch from now()), 1001); -- Lifestyle Guru - 时尚

-- 6. 插入合作产品数据
INSERT INTO "cooperation_products" (
    "id", "name", "description", "brand", "category", "price", "currency",
    "budget", "targetAudience", "contentRequirements", "priority", 
    "country", "skuSeries", "status", "createdAt", "updatedAt", "createdBy"
) VALUES 
(6001, 'Premium Face Cream', 'Anti-aging premium face cream for all skin types', 
 'Beauty Co', 'Beauty & Personal Care', 89.99, 'USD', 50000.0,
 'Women aged 25-45', 'Video review with before/after comparison', 'high',
 'US', 'BC-CREAM-001', 1, extract(epoch from now()), extract(epoch from now()), 1001),

(6002, 'Smart Fitness Watch', 'Advanced fitness tracking smartwatch with health monitoring',
 'Tech Innovations', 'Electronics', 299.99, 'USD', 100000.0,
 'Fitness enthusiasts aged 20-40', 'Unboxing and feature demonstration', 'high',
 'US', 'TI-WATCH-001', 1, extract(epoch from now()), extract(epoch from now()), 1001),

(6003, 'Organic Coffee Blend', 'Premium organic coffee beans from sustainable farms',
 'Green Brew', 'Food & Beverages', 24.99, 'USD', 20000.0,
 'Coffee lovers aged 25-50', 'Taste test and brewing tutorial', 'medium',
 'US', 'GB-COFFEE-001', 1, extract(epoch from now()), extract(epoch from now()), 1001);

-- 7. 插入履约方案数据
INSERT INTO "fulfillment_plans" (
    "id", "planCode", "planName", "requiresSample", "contentType", 
    "isInfluencerMade", "initialStatus", "description", 
    "status", "createdAt", "updatedAt"
) VALUES 
(7001, 'SAMPLE_VIDEO', '有寄样视频方案', true, 'video', true, 'pending_sample',
 '需要寄送样品的视频制作方案，适用于实物产品推广', 1, extract(epoch from now()), extract(epoch from now())),

(7002, 'NO_SAMPLE_VIDEO', '无寄样视频方案', false, 'video', true, 'content_creation',
 '无需寄送样品的视频制作方案，适用于数字产品或服务推广', 1, extract(epoch from now()), extract(epoch from now())),

(7003, 'SAMPLE_POST', '有寄样图文方案', true, 'post', true, 'pending_sample',
 '需要寄送样品的图文制作方案', 1, extract(epoch from now()), extract(epoch from now())),

(7004, 'NO_SAMPLE_POST', '无寄样图文方案', false, 'post', true, 'content_creation',
 '无需寄送样品的图文制作方案', 1, extract(epoch from now()), extract(epoch from now()));

-- 8. 插入SLA配置数据（修复字段名）
INSERT INTO "fulfillment_slas" (
    "id", "planId", "fromStatus", "toStatus", "durationHours",
    "description", "status", "createdAt"
) VALUES 
-- 有寄样视频方案 (7001)
(8001, 7001, 'pending_sample', 'sample_sent', 24, '待寄样→已寄样', 1, extract(epoch from now())),
(8002, 7001, 'sample_sent', 'sample_received', 24, '已寄样→已签收', 1, extract(epoch from now())),
(8003, 7001, 'sample_received', 'content_creation', 120, '已签收→内容制作', 1, extract(epoch from now())),
(8004, 7001, 'content_creation', 'content_published', 24, '内容制作→已发布', 1, extract(epoch from now())),
(8005, 7001, 'content_published', 'tracking_started', 168, '已发布→销售转化', 1, extract(epoch from now())),
(8006, 7001, 'tracking_started', 'settlement_completed', 168, '销售转化→完成结算', 1, extract(epoch from now())),

-- 无寄样视频方案 (7002)
(8007, 7002, 'content_creation', 'content_published', 24, '内容制作→已发布', 1, extract(epoch from now())),
(8008, 7002, 'content_published', 'tracking_started', 168, '已发布→销售转化', 1, extract(epoch from now())),
(8009, 7002, 'tracking_started', 'settlement_completed', 168, '销售转化→完成结算', 1, extract(epoch from now())),

-- 有寄样图文方案 (7003)
(8010, 7003, 'pending_sample', 'sample_sent', 24, '待寄样→已寄样', 1, extract(epoch from now())),
(8011, 7003, 'sample_sent', 'sample_received', 24, '已寄样→已签收', 1, extract(epoch from now())),
(8012, 7003, 'sample_received', 'content_creation', 120, '已签收→内容制作', 1, extract(epoch from now())),
(8013, 7003, 'content_creation', 'content_published', 24, '内容制作→已发布', 1, extract(epoch from now())),
(8014, 7003, 'content_published', 'tracking_started', 168, '已发布→销售转化', 1, extract(epoch from now())),
(8015, 7003, 'tracking_started', 'settlement_completed', 168, '销售转化→完成结算', 1, extract(epoch from now())),

-- 无寄样图文方案 (7004)
(8016, 7004, 'content_creation', 'content_published', 24, '内容制作→已发布', 1, extract(epoch from now())),
(8017, 7004, 'content_published', 'tracking_started', 168, '已发布→销售转化', 1, extract(epoch from now())),
(8018, 7004, 'tracking_started', 'settlement_completed', 168, '销售转化→完成结算', 1, extract(epoch from now()));

-- 注意：履约记录表结构与前端不匹配，暂时跳过插入履约记录和状态日志

-- 插入完成提示
SELECT '✅ Supabase 数据插入完成！' as message;
SELECT '📊 已插入数据统计：' as summary;
SELECT '   - 用户: 3条' as users_count;
SELECT '   - 平台: 4条' as platforms_count;  
SELECT '   - 标签: 5条' as tags_count;
SELECT '   - 达人: 3条' as influencers_count;
SELECT '   - 达人标签关联: 4条' as influencer_tags_count;
SELECT '   - 合作产品: 3条' as products_count;
SELECT '   - 履约方案: 4条' as plans_count;
SELECT '   - SLA配置: 18条' as slas_count; 
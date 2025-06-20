-- CreateTable
CREATE TABLE "users" (
    "id" BIGINT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "username" TEXT,
    "displayName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "department" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "preferences" JSONB,
    "timezone" TEXT,
    "language" TEXT NOT NULL DEFAULT 'zh-CN',
    "lastLogin" INTEGER,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" INTEGER,
    "updatedAt" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" BIGINT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "apiEndpoint" TEXT,
    "apiConfig" JSONB,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" INTEGER,
    "updatedAt" INTEGER,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "influencers" (
    "id" BIGINT NOT NULL,
    "platformId" BIGINT NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "whatsappAccount" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "wechat" TEXT,
    "telegram" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "timezone" TEXT,
    "zipCode" TEXT,
    "province" TEXT,
    "street" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "receiverPhone" TEXT,
    "receiveName" TEXT,
    "gender" TEXT,
    "ageRange" TEXT,
    "language" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "totalVideos" INTEGER NOT NULL DEFAULT 0,
    "avgVideoViews" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION,
    "primaryCategory" TEXT,
    "contentStyle" JSONB,
    "contentLanguage" TEXT,
    "tendencyCategory" JSONB,
    "qualityScore" DOUBLE PRECISION,
    "riskLevel" TEXT NOT NULL DEFAULT 'unknown',
    "blacklistReason" TEXT,
    "dataSource" TEXT NOT NULL DEFAULT 'manual',
    "lastDataSync" INTEGER,
    "dataAccuracy" DOUBLE PRECISION,
    "cooperateStatus" INTEGER,
    "hasSign" INTEGER,
    "lastCooperateTime" INTEGER,
    "cooperateProductCount" INTEGER,
    "fulfillCount" INTEGER,
    "cooperateProductName" TEXT,
    "correspondScore" DOUBLE PRECISION,
    "avgFulfillDays" INTEGER,
    "videoStyle" JSONB,
    "videoStyleForUs" JSONB,
    "contentScore" DOUBLE PRECISION,
    "orderScore" DOUBLE PRECISION,
    "adsRoi" DOUBLE PRECISION,
    "gmvTotal" TEXT,
    "gmvCountryRank" INTEGER,
    "gmvVideo" TEXT,
    "gmvLive" TEXT,
    "gpmVideo" TEXT,
    "gpmLive" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" INTEGER,
    "updatedAt" INTEGER,
    "createdBy" BIGINT,
    "updatedBy" BIGINT,
    "platformSpecificData" JSONB,
    "notes" TEXT,

    CONSTRAINT "influencers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "influencer_metrics_history" (
    "id" BIGINT NOT NULL,
    "influencerId" BIGINT NOT NULL,
    "followersCount" INTEGER NOT NULL,
    "followingCount" INTEGER NOT NULL,
    "totalLikes" INTEGER NOT NULL,
    "totalVideos" INTEGER NOT NULL,
    "avgVideoViews" INTEGER NOT NULL,
    "engagementRate" DOUBLE PRECISION,
    "recordDate" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" INTEGER,

    CONSTRAINT "influencer_metrics_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'CONTENT',
    "color" TEXT,
    "icon" TEXT,
    "parentId" BIGINT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" INTEGER,
    "updatedAt" INTEGER,
    "createdBy" BIGINT,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "influencer_tags" (
    "id" BIGINT NOT NULL,
    "influencerId" BIGINT NOT NULL,
    "tagId" BIGINT NOT NULL,
    "confidence" DOUBLE PRECISION DEFAULT 1,
    "source" TEXT DEFAULT 'manual',
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" INTEGER,
    "createdBy" BIGINT,

    CONSTRAINT "influencer_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cooperation_products" (
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "category" TEXT,
    "price" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'USD',
    "budget" DOUBLE PRECISION,
    "targetAudience" TEXT,
    "contentRequirements" TEXT,
    "deliverables" JSONB,
    "kpis" JSONB,
    "startDate" INTEGER,
    "endDate" INTEGER,
    "priority" TEXT DEFAULT 'medium',
    "country" TEXT NOT NULL,
    "skuSeries" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" INTEGER,
    "updatedAt" INTEGER,
    "createdBy" BIGINT,

    CONSTRAINT "cooperation_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fulfillment_plans" (
    "id" BIGINT NOT NULL,
    "planCode" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "requiresSample" BOOLEAN NOT NULL,
    "contentType" TEXT NOT NULL,
    "isInfluencerMade" BOOLEAN NOT NULL,
    "initialStatus" TEXT NOT NULL,
    "description" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" INTEGER,
    "updatedAt" INTEGER,

    CONSTRAINT "fulfillment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fulfillment_slas" (
    "id" BIGINT NOT NULL,
    "planId" BIGINT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "description" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" INTEGER,

    CONSTRAINT "fulfillment_slas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fulfillment_records" (
    "id" BIGINT NOT NULL,
    "influencerId" BIGINT NOT NULL,
    "productId" BIGINT NOT NULL,
    "planId" BIGINT NOT NULL,
    "ownerId" BIGINT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "currentStatus" TEXT NOT NULL,
    "recordStatus" TEXT NOT NULL DEFAULT 'active',
    "currentStageStartTime" INTEGER NOT NULL,
    "currentStageDeadline" INTEGER,
    "isCurrentStageOverdue" BOOLEAN NOT NULL DEFAULT false,
    "trackingNumber" TEXT,
    "sampleDeliveryTime" INTEGER,
    "contentGuidelines" TEXT,
    "videoUrl" TEXT,
    "videoTitle" TEXT,
    "publishTime" INTEGER,
    "adsRoi" DOUBLE PRECISION,
    "conversionTags" JSONB,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" INTEGER,
    "updatedAt" INTEGER,
    "createdBy" BIGINT,
    "updatedBy" BIGINT,

    CONSTRAINT "fulfillment_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fulfillment_status_logs" (
    "id" BIGINT NOT NULL,
    "fulfillmentRecordId" BIGINT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "stageStartTime" INTEGER NOT NULL,
    "stageEndTime" INTEGER NOT NULL,
    "stageDeadline" INTEGER,
    "plannedDurationHours" INTEGER,
    "actualDurationHours" INTEGER,
    "isOverdue" BOOLEAN NOT NULL DEFAULT false,
    "overdueHours" INTEGER,
    "nextStageDeadline" INTEGER,
    "changeReason" TEXT,
    "remarks" TEXT,
    "operatorId" BIGINT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" INTEGER,

    CONSTRAINT "fulfillment_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fulfillment_record_tags" (
    "id" BIGINT NOT NULL,
    "fulfillmentRecordId" BIGINT NOT NULL,
    "tagId" BIGINT NOT NULL,
    "confidence" DOUBLE PRECISION DEFAULT 1,
    "source" TEXT DEFAULT 'manual',
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" INTEGER,
    "createdBy" BIGINT,

    CONSTRAINT "fulfillment_record_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_logs" (
    "id" BIGINT NOT NULL,
    "influencerId" BIGINT NOT NULL,
    "fulfillmentRecordId" BIGINT,
    "type" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "status" INTEGER NOT NULL DEFAULT 1,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "isFollowUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" INTEGER,
    "communicationDate" INTEGER NOT NULL,
    "createdAt" INTEGER,
    "createdBy" BIGINT,

    CONSTRAINT "communication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_records" (
    "id" BIGINT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "importType" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "totalRows" INTEGER DEFAULT 0,
    "successRows" INTEGER DEFAULT 0,
    "errorRows" INTEGER DEFAULT 0,
    "duplicateRows" INTEGER DEFAULT 0,
    "errorLog" TEXT,
    "mapping" TEXT,
    "startTime" INTEGER,
    "endTime" INTEGER,
    "processingTime" INTEGER,
    "createdAt" INTEGER,
    "updatedAt" INTEGER,
    "createdBy" BIGINT,

    CONSTRAINT "import_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" BIGINT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT DEFAULT 'general',
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" INTEGER,
    "updatedAt" INTEGER,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGINT NOT NULL,
    "userId" BIGINT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" BIGINT,
    "oldValues" TEXT,
    "newValues" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" INTEGER,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE INDEX "accounts_status_idx" ON "accounts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_status_idx" ON "sessions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE INDEX "verificationtokens_status_idx" ON "verificationtokens"("status");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_name_key" ON "platforms"("name");

-- CreateIndex
CREATE INDEX "platforms_status_idx" ON "platforms"("status");

-- CreateIndex
CREATE INDEX "influencers_platformId_idx" ON "influencers"("platformId");

-- CreateIndex
CREATE INDEX "influencers_followersCount_idx" ON "influencers"("followersCount");

-- CreateIndex
CREATE INDEX "influencers_primaryCategory_idx" ON "influencers"("primaryCategory");

-- CreateIndex
CREATE INDEX "influencers_status_idx" ON "influencers"("status");

-- CreateIndex
CREATE INDEX "influencers_qualityScore_idx" ON "influencers"("qualityScore");

-- CreateIndex
CREATE INDEX "influencers_country_idx" ON "influencers"("country");

-- CreateIndex
CREATE INDEX "influencers_createdAt_idx" ON "influencers"("createdAt");

-- CreateIndex
CREATE INDEX "influencers_createdBy_idx" ON "influencers"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "influencers_platformId_platformUserId_key" ON "influencers"("platformId", "platformUserId");

-- CreateIndex
CREATE INDEX "influencer_metrics_history_influencerId_idx" ON "influencer_metrics_history"("influencerId");

-- CreateIndex
CREATE INDEX "influencer_metrics_history_recordDate_idx" ON "influencer_metrics_history"("recordDate");

-- CreateIndex
CREATE INDEX "influencer_metrics_history_status_idx" ON "influencer_metrics_history"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_category_idx" ON "tags"("category");

-- CreateIndex
CREATE INDEX "tags_parentId_idx" ON "tags"("parentId");

-- CreateIndex
CREATE INDEX "tags_status_idx" ON "tags"("status");

-- CreateIndex
CREATE INDEX "tags_sortOrder_idx" ON "tags"("sortOrder");

-- CreateIndex
CREATE INDEX "tags_createdBy_idx" ON "tags"("createdBy");

-- CreateIndex
CREATE INDEX "influencer_tags_influencerId_idx" ON "influencer_tags"("influencerId");

-- CreateIndex
CREATE INDEX "influencer_tags_tagId_idx" ON "influencer_tags"("tagId");

-- CreateIndex
CREATE INDEX "influencer_tags_status_idx" ON "influencer_tags"("status");

-- CreateIndex
CREATE UNIQUE INDEX "influencer_tags_influencerId_tagId_key" ON "influencer_tags"("influencerId", "tagId");

-- CreateIndex
CREATE INDEX "cooperation_products_status_idx" ON "cooperation_products"("status");

-- CreateIndex
CREATE INDEX "cooperation_products_startDate_idx" ON "cooperation_products"("startDate");

-- CreateIndex
CREATE INDEX "cooperation_products_category_idx" ON "cooperation_products"("category");

-- CreateIndex
CREATE INDEX "cooperation_products_country_idx" ON "cooperation_products"("country");

-- CreateIndex
CREATE INDEX "cooperation_products_createdBy_idx" ON "cooperation_products"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "cooperation_products_country_skuSeries_key" ON "cooperation_products"("country", "skuSeries");

-- CreateIndex
CREATE UNIQUE INDEX "fulfillment_plans_planCode_key" ON "fulfillment_plans"("planCode");

-- CreateIndex
CREATE INDEX "fulfillment_plans_status_idx" ON "fulfillment_plans"("status");

-- CreateIndex
CREATE INDEX "fulfillment_plans_requiresSample_idx" ON "fulfillment_plans"("requiresSample");

-- CreateIndex
CREATE INDEX "fulfillment_plans_contentType_idx" ON "fulfillment_plans"("contentType");

-- CreateIndex
CREATE INDEX "fulfillment_slas_planId_idx" ON "fulfillment_slas"("planId");

-- CreateIndex
CREATE INDEX "fulfillment_slas_fromStatus_idx" ON "fulfillment_slas"("fromStatus");

-- CreateIndex
CREATE INDEX "fulfillment_slas_status_idx" ON "fulfillment_slas"("status");

-- CreateIndex
CREATE UNIQUE INDEX "fulfillment_slas_planId_fromStatus_toStatus_key" ON "fulfillment_slas"("planId", "fromStatus", "toStatus");

-- CreateIndex
CREATE INDEX "fulfillment_records_influencerId_idx" ON "fulfillment_records"("influencerId");

-- CreateIndex
CREATE INDEX "fulfillment_records_productId_idx" ON "fulfillment_records"("productId");

-- CreateIndex
CREATE INDEX "fulfillment_records_planId_idx" ON "fulfillment_records"("planId");

-- CreateIndex
CREATE INDEX "fulfillment_records_ownerId_idx" ON "fulfillment_records"("ownerId");

-- CreateIndex
CREATE INDEX "fulfillment_records_currentStatus_idx" ON "fulfillment_records"("currentStatus");

-- CreateIndex
CREATE INDEX "fulfillment_records_recordStatus_idx" ON "fulfillment_records"("recordStatus");

-- CreateIndex
CREATE INDEX "fulfillment_records_isCurrentStageOverdue_idx" ON "fulfillment_records"("isCurrentStageOverdue");

-- CreateIndex
CREATE INDEX "fulfillment_records_currentStageDeadline_idx" ON "fulfillment_records"("currentStageDeadline");

-- CreateIndex
CREATE INDEX "fulfillment_records_priority_idx" ON "fulfillment_records"("priority");

-- CreateIndex
CREATE INDEX "fulfillment_records_status_idx" ON "fulfillment_records"("status");

-- CreateIndex
CREATE INDEX "fulfillment_records_createdAt_idx" ON "fulfillment_records"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "fulfillment_records_influencerId_productId_planId_videoTitl_key" ON "fulfillment_records"("influencerId", "productId", "planId", "videoTitle");

-- CreateIndex
CREATE INDEX "fulfillment_status_logs_fulfillmentRecordId_idx" ON "fulfillment_status_logs"("fulfillmentRecordId");

-- CreateIndex
CREATE INDEX "fulfillment_status_logs_fromStatus_idx" ON "fulfillment_status_logs"("fromStatus");

-- CreateIndex
CREATE INDEX "fulfillment_status_logs_toStatus_idx" ON "fulfillment_status_logs"("toStatus");

-- CreateIndex
CREATE INDEX "fulfillment_status_logs_isOverdue_idx" ON "fulfillment_status_logs"("isOverdue");

-- CreateIndex
CREATE INDEX "fulfillment_status_logs_stageStartTime_idx" ON "fulfillment_status_logs"("stageStartTime");

-- CreateIndex
CREATE INDEX "fulfillment_status_logs_operatorId_idx" ON "fulfillment_status_logs"("operatorId");

-- CreateIndex
CREATE INDEX "fulfillment_status_logs_status_idx" ON "fulfillment_status_logs"("status");

-- CreateIndex
CREATE INDEX "fulfillment_record_tags_fulfillmentRecordId_idx" ON "fulfillment_record_tags"("fulfillmentRecordId");

-- CreateIndex
CREATE INDEX "fulfillment_record_tags_tagId_idx" ON "fulfillment_record_tags"("tagId");

-- CreateIndex
CREATE INDEX "fulfillment_record_tags_status_idx" ON "fulfillment_record_tags"("status");

-- CreateIndex
CREATE UNIQUE INDEX "fulfillment_record_tags_fulfillmentRecordId_tagId_key" ON "fulfillment_record_tags"("fulfillmentRecordId", "tagId");

-- CreateIndex
CREATE INDEX "communication_logs_influencerId_idx" ON "communication_logs"("influencerId");

-- CreateIndex
CREATE INDEX "communication_logs_fulfillmentRecordId_idx" ON "communication_logs"("fulfillmentRecordId");

-- CreateIndex
CREATE INDEX "communication_logs_communicationDate_idx" ON "communication_logs"("communicationDate");

-- CreateIndex
CREATE INDEX "communication_logs_type_idx" ON "communication_logs"("type");

-- CreateIndex
CREATE INDEX "communication_logs_status_idx" ON "communication_logs"("status");

-- CreateIndex
CREATE INDEX "communication_logs_createdBy_idx" ON "communication_logs"("createdBy");

-- CreateIndex
CREATE INDEX "import_records_importType_idx" ON "import_records"("importType");

-- CreateIndex
CREATE INDEX "import_records_status_idx" ON "import_records"("status");

-- CreateIndex
CREATE INDEX "import_records_createdAt_idx" ON "import_records"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "system_configs_category_idx" ON "system_configs"("category");

-- CreateIndex
CREATE INDEX "system_configs_status_idx" ON "system_configs"("status");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_status_idx" ON "audit_logs"("status");


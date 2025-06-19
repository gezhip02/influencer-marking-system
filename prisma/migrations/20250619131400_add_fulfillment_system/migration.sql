-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `displayName` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `department` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `preferences` JSON NULL,
    `timezone` VARCHAR(191) NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'zh-CN',
    `lastLogin` INTEGER NULL,
    `loginCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` INTEGER NULL,
    `updatedAt` INTEGER NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` BIGINT NOT NULL,
    `userId` BIGINT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,

    INDEX `accounts_userId_idx`(`userId`),
    INDEX `accounts_status_idx`(`status`),
    UNIQUE INDEX `accounts_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` BIGINT NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` BIGINT NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `sessions_sessionToken_key`(`sessionToken`),
    INDEX `sessions_userId_idx`(`userId`),
    INDEX `sessions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verificationtokens` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `verificationtokens_token_key`(`token`),
    INDEX `verificationtokens_status_idx`(`status`),
    UNIQUE INDEX `verificationtokens_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platforms` (
    `id` BIGINT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `apiEndpoint` VARCHAR(191) NULL,
    `apiConfig` JSON NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` INTEGER NULL,
    `updatedAt` INTEGER NULL,

    UNIQUE INDEX `platforms_name_key`(`name`),
    INDEX `platforms_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `influencers` (
    `id` BIGINT NOT NULL,
    `platformId` BIGINT NOT NULL,
    `platformUserId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL,
    `displayName` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `whatsappAccount` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `wechat` VARCHAR(191) NULL,
    `telegram` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `timezone` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `province` VARCHAR(191) NULL,
    `street` VARCHAR(191) NULL,
    `address1` VARCHAR(191) NULL,
    `address2` VARCHAR(191) NULL,
    `receiverPhone` VARCHAR(191) NULL,
    `receiveName` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `ageRange` VARCHAR(191) NULL,
    `language` VARCHAR(191) NULL,
    `followersCount` INTEGER NOT NULL DEFAULT 0,
    `followingCount` INTEGER NOT NULL DEFAULT 0,
    `totalLikes` INTEGER NOT NULL DEFAULT 0,
    `totalVideos` INTEGER NOT NULL DEFAULT 0,
    `avgVideoViews` INTEGER NOT NULL DEFAULT 0,
    `engagementRate` DOUBLE NULL,
    `primaryCategory` VARCHAR(191) NULL,
    `contentStyle` JSON NULL,
    `contentLanguage` VARCHAR(191) NULL,
    `tendencyCategory` JSON NULL,
    `qualityScore` DOUBLE NULL,
    `riskLevel` VARCHAR(191) NOT NULL DEFAULT 'unknown',
    `blacklistReason` TEXT NULL,
    `dataSource` VARCHAR(191) NOT NULL DEFAULT 'manual',
    `lastDataSync` INTEGER NULL,
    `dataAccuracy` DOUBLE NULL,
    `cooperateStatus` INTEGER NULL,
    `hasSign` INTEGER NULL,
    `lastCooperateTime` INTEGER NULL,
    `cooperateProductCount` INTEGER NULL,
    `fulfillCount` INTEGER NULL,
    `cooperateProductName` VARCHAR(191) NULL,
    `correspondScore` DOUBLE NULL,
    `avgFulfillDays` INTEGER NULL,
    `videoStyle` JSON NULL,
    `videoStyleForUs` JSON NULL,
    `contentScore` DOUBLE NULL,
    `orderScore` DOUBLE NULL,
    `adsRoi` DOUBLE NULL,
    `gmvTotal` VARCHAR(191) NULL,
    `gmvCountryRank` INTEGER NULL,
    `gmvVideo` VARCHAR(191) NULL,
    `gmvLive` VARCHAR(191) NULL,
    `gpmVideo` VARCHAR(191) NULL,
    `gpmLive` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` INTEGER NULL,
    `updatedAt` INTEGER NULL,
    `createdBy` BIGINT NULL,
    `updatedBy` BIGINT NULL,
    `platformSpecificData` JSON NULL,
    `notes` TEXT NULL,

    INDEX `influencers_platformId_idx`(`platformId`),
    INDEX `influencers_followersCount_idx`(`followersCount`),
    INDEX `influencers_primaryCategory_idx`(`primaryCategory`),
    INDEX `influencers_status_idx`(`status`),
    INDEX `influencers_qualityScore_idx`(`qualityScore`),
    INDEX `influencers_country_idx`(`country`),
    INDEX `influencers_createdAt_idx`(`createdAt`),
    INDEX `influencers_createdBy_idx`(`createdBy`),
    UNIQUE INDEX `influencers_platformId_platformUserId_key`(`platformId`, `platformUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `influencer_metrics_history` (
    `id` BIGINT NOT NULL,
    `influencerId` BIGINT NOT NULL,
    `followersCount` INTEGER NOT NULL,
    `followingCount` INTEGER NOT NULL,
    `totalLikes` INTEGER NOT NULL,
    `totalVideos` INTEGER NOT NULL,
    `avgVideoViews` INTEGER NOT NULL,
    `engagementRate` DOUBLE NULL,
    `recordDate` INTEGER NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` INTEGER NULL,

    INDEX `influencer_metrics_history_influencerId_idx`(`influencerId`),
    INDEX `influencer_metrics_history_recordDate_idx`(`recordDate`),
    INDEX `influencer_metrics_history_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` BIGINT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'CONTENT',
    `color` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `parentId` BIGINT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` INTEGER NULL,
    `updatedAt` INTEGER NULL,
    `createdBy` BIGINT NULL,

    UNIQUE INDEX `tags_name_key`(`name`),
    INDEX `tags_category_idx`(`category`),
    INDEX `tags_parentId_idx`(`parentId`),
    INDEX `tags_status_idx`(`status`),
    INDEX `tags_sortOrder_idx`(`sortOrder`),
    INDEX `tags_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `influencer_tags` (
    `id` BIGINT NOT NULL,
    `influencerId` BIGINT NOT NULL,
    `tagId` BIGINT NOT NULL,
    `confidence` DOUBLE NULL DEFAULT 1,
    `source` VARCHAR(191) NULL DEFAULT 'manual',
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` INTEGER NULL,
    `createdBy` BIGINT NULL,

    INDEX `influencer_tags_influencerId_idx`(`influencerId`),
    INDEX `influencer_tags_tagId_idx`(`tagId`),
    INDEX `influencer_tags_status_idx`(`status`),
    UNIQUE INDEX `influencer_tags_influencerId_tagId_key`(`influencerId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cooperation_products` (
    `id` BIGINT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `brand` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `price` DOUBLE NULL,
    `currency` VARCHAR(191) NULL DEFAULT 'USD',
    `budget` DOUBLE NULL,
    `targetAudience` VARCHAR(191) NULL,
    `contentRequirements` VARCHAR(191) NULL,
    `deliverables` JSON NULL,
    `kpis` JSON NULL,
    `startDate` INTEGER NULL,
    `endDate` INTEGER NULL,
    `priority` VARCHAR(191) NULL DEFAULT 'medium',
    `country` VARCHAR(191) NOT NULL,
    `skuSeries` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` INTEGER NULL,
    `updatedAt` INTEGER NULL,
    `createdBy` BIGINT NULL,

    INDEX `cooperation_products_status_idx`(`status`),
    INDEX `cooperation_products_startDate_idx`(`startDate`),
    INDEX `cooperation_products_category_idx`(`category`),
    INDEX `cooperation_products_country_idx`(`country`),
    INDEX `cooperation_products_createdBy_idx`(`createdBy`),
    UNIQUE INDEX `cooperation_products_country_skuSeries_key`(`country`, `skuSeries`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fulfillment_plans` (
    `id` BIGINT NOT NULL,
    `planCode` VARCHAR(191) NOT NULL,
    `planName` VARCHAR(191) NOT NULL,
    `requiresSample` BOOLEAN NOT NULL,
    `contentType` VARCHAR(191) NOT NULL,
    `isInfluencerMade` BOOLEAN NOT NULL,
    `initialStatus` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` INTEGER NULL,
    `updatedAt` INTEGER NULL,

    UNIQUE INDEX `fulfillment_plans_planCode_key`(`planCode`),
    INDEX `fulfillment_plans_status_idx`(`status`),
    INDEX `fulfillment_plans_requiresSample_idx`(`requiresSample`),
    INDEX `fulfillment_plans_contentType_idx`(`contentType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fulfillment_slas` (
    `id` BIGINT NOT NULL,
    `planId` BIGINT NOT NULL,
    `fromStatus` VARCHAR(191) NOT NULL,
    `toStatus` VARCHAR(191) NOT NULL,
    `durationHours` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` INTEGER NULL,

    INDEX `fulfillment_slas_planId_idx`(`planId`),
    INDEX `fulfillment_slas_fromStatus_idx`(`fromStatus`),
    INDEX `fulfillment_slas_status_idx`(`status`),
    UNIQUE INDEX `fulfillment_slas_planId_fromStatus_toStatus_key`(`planId`, `fromStatus`, `toStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fulfillment_records` (
    `id` BIGINT NOT NULL,
    `influencerId` BIGINT NOT NULL,
    `productId` BIGINT NOT NULL,
    `planId` BIGINT NOT NULL,
    `ownerId` BIGINT NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `currentStatus` VARCHAR(191) NOT NULL,
    `recordStatus` VARCHAR(191) NOT NULL DEFAULT 'active',
    `currentStageStartTime` INTEGER NOT NULL,
    `currentStageDeadline` INTEGER NULL,
    `isCurrentStageOverdue` BOOLEAN NOT NULL DEFAULT false,
    `trackingNumber` VARCHAR(191) NULL,
    `sampleDeliveryTime` INTEGER NULL,
    `contentGuidelines` TEXT NULL,
    `videoUrl` VARCHAR(191) NULL,
    `videoTitle` VARCHAR(191) NULL,
    `publishTime` INTEGER NULL,
    `adsRoi` DOUBLE NULL,
    `conversionTags` JSON NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` INTEGER NULL,
    `updatedAt` INTEGER NULL,
    `createdBy` BIGINT NULL,
    `updatedBy` BIGINT NULL,

    INDEX `fulfillment_records_influencerId_idx`(`influencerId`),
    INDEX `fulfillment_records_productId_idx`(`productId`),
    INDEX `fulfillment_records_planId_idx`(`planId`),
    INDEX `fulfillment_records_ownerId_idx`(`ownerId`),
    INDEX `fulfillment_records_currentStatus_idx`(`currentStatus`),
    INDEX `fulfillment_records_recordStatus_idx`(`recordStatus`),
    INDEX `fulfillment_records_isCurrentStageOverdue_idx`(`isCurrentStageOverdue`),
    INDEX `fulfillment_records_currentStageDeadline_idx`(`currentStageDeadline`),
    INDEX `fulfillment_records_priority_idx`(`priority`),
    INDEX `fulfillment_records_status_idx`(`status`),
    INDEX `fulfillment_records_createdAt_idx`(`createdAt`),
    UNIQUE INDEX `fulfillment_records_influencerId_productId_planId_videoTitle_key`(`influencerId`, `productId`, `planId`, `videoTitle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fulfillment_status_logs` (
    `id` BIGINT NOT NULL,
    `fulfillmentRecordId` BIGINT NOT NULL,
    `fromStatus` VARCHAR(191) NULL,
    `toStatus` VARCHAR(191) NOT NULL,
    `stageStartTime` INTEGER NOT NULL,
    `stageEndTime` INTEGER NOT NULL,
    `stageDeadline` INTEGER NULL,
    `plannedDurationHours` INTEGER NULL,
    `actualDurationHours` INTEGER NULL,
    `isOverdue` BOOLEAN NOT NULL DEFAULT false,
    `overdueHours` INTEGER NULL,
    `nextStageDeadline` INTEGER NULL,
    `changeReason` TEXT NULL,
    `remarks` TEXT NULL,
    `operatorId` BIGINT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` INTEGER NULL,

    INDEX `fulfillment_status_logs_fulfillmentRecordId_idx`(`fulfillmentRecordId`),
    INDEX `fulfillment_status_logs_fromStatus_idx`(`fromStatus`),
    INDEX `fulfillment_status_logs_toStatus_idx`(`toStatus`),
    INDEX `fulfillment_status_logs_isOverdue_idx`(`isOverdue`),
    INDEX `fulfillment_status_logs_stageStartTime_idx`(`stageStartTime`),
    INDEX `fulfillment_status_logs_operatorId_idx`(`operatorId`),
    INDEX `fulfillment_status_logs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fulfillment_record_tags` (
    `id` BIGINT NOT NULL,
    `fulfillmentRecordId` BIGINT NOT NULL,
    `tagId` BIGINT NOT NULL,
    `confidence` DOUBLE NULL DEFAULT 1,
    `source` VARCHAR(191) NULL DEFAULT 'manual',
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` INTEGER NULL,
    `createdBy` BIGINT NULL,

    INDEX `fulfillment_record_tags_fulfillmentRecordId_idx`(`fulfillmentRecordId`),
    INDEX `fulfillment_record_tags_tagId_idx`(`tagId`),
    INDEX `fulfillment_record_tags_status_idx`(`status`),
    UNIQUE INDEX `fulfillment_record_tags_fulfillmentRecordId_tagId_key`(`fulfillmentRecordId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `communication_logs` (
    `id` BIGINT NOT NULL,
    `influencerId` BIGINT NOT NULL,
    `fulfillmentRecordId` BIGINT NULL,
    `type` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,
    `content` VARCHAR(191) NOT NULL,
    `attachments` JSON NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `isImportant` BOOLEAN NOT NULL DEFAULT false,
    `isFollowUpRequired` BOOLEAN NOT NULL DEFAULT false,
    `followUpDate` INTEGER NULL,
    `communicationDate` INTEGER NOT NULL,
    `createdAt` INTEGER NULL,
    `createdBy` BIGINT NULL,

    INDEX `communication_logs_influencerId_idx`(`influencerId`),
    INDEX `communication_logs_fulfillmentRecordId_idx`(`fulfillmentRecordId`),
    INDEX `communication_logs_communicationDate_idx`(`communicationDate`),
    INDEX `communication_logs_type_idx`(`type`),
    INDEX `communication_logs_status_idx`(`status`),
    INDEX `communication_logs_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `import_records` (
    `id` BIGINT NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NULL,
    `fileType` VARCHAR(191) NULL,
    `importType` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `totalRows` INTEGER NULL DEFAULT 0,
    `successRows` INTEGER NULL DEFAULT 0,
    `errorRows` INTEGER NULL DEFAULT 0,
    `duplicateRows` INTEGER NULL DEFAULT 0,
    `errorLog` TEXT NULL,
    `mapping` TEXT NULL,
    `startTime` INTEGER NULL,
    `endTime` INTEGER NULL,
    `processingTime` INTEGER NULL,
    `createdAt` INTEGER NULL,
    `updatedAt` INTEGER NULL,
    `createdBy` BIGINT NULL,

    INDEX `import_records_importType_idx`(`importType`),
    INDEX `import_records_status_idx`(`status`),
    INDEX `import_records_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_configs` (
    `id` BIGINT NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL DEFAULT 'general',
    `description` VARCHAR(191) NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` INTEGER NULL,
    `updatedAt` INTEGER NULL,

    UNIQUE INDEX `system_configs_key_key`(`key`),
    INDEX `system_configs_category_idx`(`category`),
    INDEX `system_configs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT NOT NULL,
    `userId` BIGINT NULL,
    `action` VARCHAR(191) NOT NULL,
    `resource` VARCHAR(191) NOT NULL,
    `resourceId` BIGINT NULL,
    `oldValues` TEXT NULL,
    `newValues` TEXT NULL,
    `ip` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` INTEGER NULL,

    INDEX `audit_logs_userId_idx`(`userId`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_resource_idx`(`resource`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    INDEX `audit_logs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

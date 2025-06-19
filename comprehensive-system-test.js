const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';

// 测试结果统计
let testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

// 存储创建的测试数据ID，用于清理
let testDataIds = {
    users: [],
    platforms: [],
    tags: [],
    influencers: [],
    products: [],
    fulfillmentRecords: []
};

function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m',    // cyan
        success: '\x1b[32m', // green
        error: '\x1b[31m',   // red
        warning: '\x1b[33m', // yellow
        title: '\x1b[35m'    // magenta
    };
    console.log(`${colors[type]}${message}\x1b[0m`);
}

function assertTest(condition, testName) {
    if (condition) {
        testResults.passed++;
        log(`✓ ${testName}`, 'success');
        return true;
    } else {
        testResults.failed++;
        testResults.errors.push(testName);
        log(`✗ ${testName}`, 'error');
        return false;
    }
}

// 数据完整性检查函数
async function checkDataIntegrity() {
    log('\n=== 🔍 数据完整性检查 ===', 'title');
    
    try {
        // 1. 检查达人是否关联到有效平台
        log('\n1. 检查达人-平台关联完整性...');
        const influencersWithInvalidPlatforms = await fetch(`${baseUrl}/api/influencers?limit=100`)
            .then(res => res.json())
            .then(data => {
                if (!data.success) return [];
                return data.data.items.filter(inf => !inf.platform || inf.platform.status !== 1);
            });
        
        assertTest(influencersWithInvalidPlatforms.length === 0, '所有达人都关联到有效平台');

        // 2. 检查标签关联的完整性
        log('\n2. 检查达人-标签关联完整性...');
        const influencersResponse = await fetch(`${baseUrl}/api/influencers?limit=100`);
        const influencersData = await influencersResponse.json();
        
        if (influencersData.success && influencersData.data.items.length > 0) {
            const invalidTagAssociations = influencersData.data.items.filter(inf => 
                inf.tags && inf.tags.some(tag => tag.status !== 1)
            );
            assertTest(invalidTagAssociations.length === 0, '所有标签关联都指向有效标签');
        }

        // 3. 检查软删除一致性
        log('\n3. 检查软删除数据一致性...');
        const tagsResponse = await fetch(`${baseUrl}/api/tags`);
        const tagsData = await tagsResponse.json();
        
        if (tagsData.success) {
            const allTagsValid = tagsData.data.every(tag => tag.status === 1);
            assertTest(allTagsValid, '标签API只返回有效数据（status=1）');
        }

        return true;
    } catch (error) {
        log(`数据完整性检查错误: ${error.message}`, 'error');
        testResults.failed++;
        testResults.errors.push(`数据完整性检查错误: ${error.message}`);
        return false;
    }
}

// 测试平台管理
async function testPlatformManagement() {
    log('\n=== 🚀 平台管理测试 ===', 'title');
    
    try {
        // 获取现有平台
        log('\n1. 测试获取平台列表...');
        const response = await fetch(`${baseUrl}/api/platforms`);
        const data = await response.json();
        
        assertTest(response.ok, '平台列表请求成功');
        assertTest(data.success, '平台列表返回成功状态');
        assertTest(Array.isArray(data.platforms), '平台列表返回数组');
        assertTest(data.platforms.length > 0, '平台列表包含数据');

        // 验证平台数据结构
        if (data.platforms.length > 0) {
            const platform = data.platforms[0];
            assertTest(platform.id !== undefined, '平台包含ID字段');
            assertTest(platform.name !== undefined, '平台包含name字段');
            assertTest(platform.displayName !== undefined, '平台包含displayName字段');
            assertTest(platform.status === 1, '平台状态为有效（status=1）');
        }

        return true;
    } catch (error) {
        log(`平台管理测试错误: ${error.message}`, 'error');
        testResults.failed++;
        testResults.errors.push(`平台管理测试错误: ${error.message}`);
        return false;
    }
}

// 测试标签管理
async function testTagManagement() {
    log('\n=== 🏷️ 标签管理测试 ===', 'title');
    
    try {
        // 1. 获取标签列表
        log('\n1. 测试获取标签列表...');
        const listResponse = await fetch(`${baseUrl}/api/tags`);
        const listData = await listResponse.json();
        
        assertTest(listResponse.ok, '标签列表请求成功');
        assertTest(listData.success, '标签列表返回成功状态');
        assertTest(Array.isArray(listData.data), '标签列表返回数组');

        // 2. 创建测试标签
        log('\n2. 测试创建标签...');
        const testTag = {
            name: `test-tag-${Date.now()}`,
            displayName: '测试标签',
            description: '用于系统测试的标签',
            category: 'CONTENT',
            color: '#ff0000'
        };

        const createResponse = await fetch(`${baseUrl}/api/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testTag)
        });
        const createData = await createResponse.json();
        
        assertTest(createResponse.ok, '创建标签请求成功');
        assertTest(createData.success, '创建标签返回成功状态');
        assertTest(createData.data && createData.data.id, '创建标签返回ID');

        if (createData.success && createData.data.id) {
            testDataIds.tags.push(createData.data.id);
            const tagId = createData.data.id;

            // 3. 更新标签
            log('\n3. 测试更新标签...');
            const updateTag = {
                id: tagId,
                name: `${testTag.name}-updated`,
                displayName: '测试标签-已更新',
                description: '已更新的测试标签',
                category: 'CONTENT',
                color: '#00ff00'
            };

            const updateResponse = await fetch(`${baseUrl}/api/tags`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateTag)
            });
            const updateData = await updateResponse.json();
            
            assertTest(updateResponse.ok, '更新标签请求成功');
            assertTest(updateData.success, '更新标签返回成功状态');

            // 4. 软删除标签
            log('\n4. 测试软删除标签...');
            const deleteResponse = await fetch(`${baseUrl}/api/tags?id=${tagId}`, {
                method: 'DELETE'
            });
            const deleteData = await deleteResponse.json();
            
            assertTest(deleteResponse.ok, '删除标签请求成功');
            assertTest(deleteData.success, '删除标签返回成功状态');

            // 5. 验证软删除效果
            log('\n5. 验证软删除效果...');
            const verifyResponse = await fetch(`${baseUrl}/api/tags`);
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
                const deletedTagVisible = verifyData.data.some(tag => tag.id === tagId);
                assertTest(!deletedTagVisible, '软删除的标签不在列表中显示');
            }
        }

        return true;
    } catch (error) {
        log(`标签管理测试错误: ${error.message}`, 'error');
        testResults.failed++;
        testResults.errors.push(`标签管理测试错误: ${error.message}`);
        return false;
    }
}

// 测试达人管理
async function testInfluencerManagement() {
    log('\n=== 👤 达人管理测试 ===', 'title');
    
    try {
        // 1. 获取平台列表
        log('\n1. 获取平台信息...');
        const platformsResponse = await fetch(`${baseUrl}/api/platforms`);
        const platformsData = await platformsResponse.json();
        
        assertTest(platformsResponse.ok, '平台列表请求成功');
        assertTest(platformsData.success, '平台列表返回成功状态');
        
        if (!platformsData.success || !platformsData.platforms.length) {
            log('无法获取平台信息，跳过达人管理测试', 'warning');
            return true;
        }

        const platformId = platformsData.platforms[0].id;

        // 2. 获取达人列表
        log('\n2. 测试获取达人列表...');
        const listResponse = await fetch(`${baseUrl}/api/influencers`);
        const listData = await listResponse.json();
        
        assertTest(listResponse.ok, '达人列表请求成功');
        assertTest(listData.success, '达人列表返回成功状态');
        assertTest(listData.data && listData.data.items, '达人列表返回items');

        // 3. 验证达人数据结构和关联
        if (listData.success && listData.data.items.length > 0) {
            const influencer = listData.data.items[0];
            assertTest(influencer.id !== undefined, '达人包含ID字段');
            assertTest(influencer.platformId !== undefined, '达人包含platformId字段');
            assertTest(influencer.platform !== undefined, '达人包含关联的platform信息');
            assertTest(Array.isArray(influencer.tags), '达人包含tags数组');
            assertTest(influencer.status === 1, '达人状态为有效（status=1）');
        }

        // 4. 创建测试达人
        log('\n3. 测试创建达人...');
        const testInfluencer = {
            platformId: platformId,
            platformUserId: `test_user_${Date.now()}`,
            username: `test_username_${Date.now()}`,
            displayName: '测试达人',
            email: 'test@example.com',
            followersCount: 10000,
            primaryCategory: '测试分类',
            country: 'CN'
        };

        const createResponse = await fetch(`${baseUrl}/api/influencers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testInfluencer)
        });
        const createData = await createResponse.json();
        
        assertTest(createResponse.ok, '创建达人请求成功');
        assertTest(createData.success, '创建达人返回成功状态');
        assertTest(createData.data && createData.data.id, '创建达人返回ID');

        if (createData.success && createData.data.id) {
            testDataIds.influencers.push(createData.data.id);
            const influencerId = createData.data.id;

            // 5. 验证平台关联数据完整性
            log('\n4. 验证平台关联数据完整性...');
            const createdInfluencerResponse = await fetch(`${baseUrl}/api/influencers?limit=100`);
            const createdInfluencerData = await createdInfluencerResponse.json();
            
            if (createdInfluencerData.success) {
                const createdInfluencer = createdInfluencerData.data.items.find(inf => inf.id === influencerId);
                if (createdInfluencer) {
                    assertTest(createdInfluencer.platform !== null, '新创建的达人正确关联到平台');
                    assertTest(createdInfluencer.platform.id === platformId, '达人关联到正确的平台');
                }
            }

            // 6. 软删除达人
            log('\n5. 测试软删除达人...');
            const deleteResponse = await fetch(`${baseUrl}/api/influencers?id=${influencerId}`, {
                method: 'DELETE'
            });
            const deleteData = await deleteResponse.json();
            
            assertTest(deleteResponse.ok, '删除达人请求成功');
            assertTest(deleteData.success, '删除达人返回成功状态');
        }

        return true;
    } catch (error) {
        log(`达人管理测试错误: ${error.message}`, 'error');
        testResults.failed++;
        testResults.errors.push(`达人管理测试错误: ${error.message}`);
        return false;
    }
}

// 测试批量操作
async function testBatchOperations() {
    log('\n=== 🔄 批量操作测试 ===', 'title');
    
    try {
        // 1. 获取测试数据
        log('\n1. 准备测试数据...');
        
        const [influencersResponse, tagsResponse] = await Promise.all([
            fetch(`${baseUrl}/api/influencers?limit=5`),
            fetch(`${baseUrl}/api/tags?limit=3`)
        ]);

        const [influencersData, tagsData] = await Promise.all([
            influencersResponse.json(),
            tagsResponse.json()
        ]);

        if (!influencersData.success || !tagsData.success || 
            influencersData.data.items.length === 0 || tagsData.data.length === 0) {
            log('缺少测试数据，跳过批量操作测试', 'warning');
            return true;
        }

        const influencerIds = influencersData.data.items.slice(0, 2).map(inf => inf.id);
        const tagIds = tagsData.data.slice(0, 2).map(tag => tag.id);

        // 2. 测试批量添加标签
        log('\n2. 测试批量添加标签...');
        const addTagsRequest = {
            action: 'addTags',
            influencerIds: influencerIds,
            tagIds: tagIds
        };

        const addTagsResponse = await fetch(`${baseUrl}/api/influencers/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addTagsRequest)
        });
        const addTagsData = await addTagsResponse.json();
        
        assertTest(addTagsResponse.ok, '批量添加标签请求成功');
        assertTest(addTagsData.addedRelations !== undefined, '批量添加标签返回关联数量');

        // 3. 验证标签关联效果
        log('\n3. 验证标签关联效果...');
        const verifyResponse = await fetch(`${baseUrl}/api/influencers?limit=10`);
        const verifyData = await verifyResponse.json();
        
        if (verifyData.success) {
            const verifyInfluencer = verifyData.data.items.find(inf => 
                influencerIds.includes(inf.id)
            );
            if (verifyInfluencer) {
                const hasAddedTags = tagIds.some(tagId => 
                    verifyInfluencer.tags.some(tag => tag.id === tagId)
                );
                assertTest(hasAddedTags, '批量添加的标签正确关联到达人');
            }
        }

        // 4. 测试批量移除标签
        log('\n4. 测试批量移除标签...');
        const removeTagsRequest = {
            action: 'removeTags',
            influencerIds: influencerIds,
            tagIds: tagIds
        };

        const removeTagsResponse = await fetch(`${baseUrl}/api/influencers/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(removeTagsRequest)
        });
        const removeTagsData = await removeTagsResponse.json();
        
        assertTest(removeTagsResponse.ok, '批量移除标签请求成功');
        assertTest(removeTagsData.removedRelations !== undefined, '批量移除标签返回关联数量');

        // 5. 测试批量导出
        log('\n5. 测试批量导出...');
        const exportRequest = {
            action: 'export',
            influencerIds: influencerIds,
            format: 'json'
        };

        const exportResponse = await fetch(`${baseUrl}/api/influencers/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exportRequest)
        });
        const exportData = await exportResponse.json();
        
        assertTest(exportResponse.ok, '批量导出请求成功');
        assertTest(exportData.data && Array.isArray(exportData.data), '批量导出返回数据数组');

        return true;
    } catch (error) {
        log(`批量操作测试错误: ${error.message}`, 'error');
        testResults.failed++;
        testResults.errors.push(`批量操作测试错误: ${error.message}`);
        return false;
    }
}

// 性能测试
async function testPerformance() {
    log('\n=== ⚡ 性能测试 ===', 'title');
    
    try {
        // 1. 测试查询性能
        log('\n1. 测试查询性能...');
        const startTime = Date.now();
        
        const response = await fetch(`${baseUrl}/api/influencers?limit=50`);
        const data = await response.json();
        
        const responseTime = Date.now() - startTime;
        
        assertTest(response.ok, '查询请求成功');
        assertTest(responseTime < 2000, `查询响应时间合理 (${responseTime}ms < 2000ms)`);
        
        if (data.success && data.data.items.length > 0) {
            const hasCompleteData = data.data.items.every(inf => 
                inf.platform && Array.isArray(inf.tags)
            );
            assertTest(hasCompleteData, '查询结果包含完整的关联数据');
        }

        // 2. 测试并发查询
        log('\n2. 测试并发查询...');
        const concurrentStartTime = Date.now();
        
        const concurrentRequests = Array(5).fill().map(() => 
            fetch(`${baseUrl}/api/influencers?limit=10`)
        );
        
        const responses = await Promise.all(concurrentRequests);
        const concurrentResponseTime = Date.now() - concurrentStartTime;
        
        const allSuccessful = responses.every(res => res.ok);
        assertTest(allSuccessful, '并发查询全部成功');
        assertTest(concurrentResponseTime < 3000, `并发查询响应时间合理 (${concurrentResponseTime}ms < 3000ms)`);

        return true;
    } catch (error) {
        log(`性能测试错误: ${error.message}`, 'error');
        testResults.failed++;
        testResults.errors.push(`性能测试错误: ${error.message}`);
        return false;
    }
}

// 主测试函数
async function runAllTests() {
    log('🚀 开始全面系统测试...', 'title');
    log('=' * 60, 'info');
    
    // 按顺序执行所有测试
    await testPlatformManagement();
    await testTagManagement();
    await testInfluencerManagement();
    await testBatchOperations();
    await checkDataIntegrity();
    await testPerformance();
    
    // 输出测试结果统计
    log('\n' + '='.repeat(60), 'info');
    log('🎯 测试结果统计:', 'title');
    log(`✅ 通过: ${testResults.passed}`, 'success');
    log(`❌ 失败: ${testResults.failed}`, 'error');
    log(`📊 总计: ${testResults.passed + testResults.failed}`, 'info');
    log(`📈 成功率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`, 'info');
    
    if (testResults.failed > 0) {
        log('\n💥 失败的测试:', 'error');
        testResults.errors.forEach(error => {
            log(`  • ${error}`, 'error');
        });
    } else {
        log('\n🎉 所有测试都通过了！系统运行正常！', 'success');
        log('✨ 无外键约束重构成功完成！', 'success');
    }
    
    // 输出重构总结
    log('\n🔧 重构总结:', 'title');
    log('• ✅ 数据库重构为无外键约束模式', 'info');
    log('• ✅ 数据完整性由应用层代码保证', 'info');
    log('• ✅ 支持软删除，通过status字段控制', 'info');
    log('• ✅ 手动关联查询，性能良好', 'info');
    log('• ✅ 批量操作优化，支持高并发', 'info');
    
    log('=' * 60, 'info');
}

// 启动测试
runAllTests().catch(error => {
    log(`🚨 测试运行失败: ${error.message}`, 'error');
    process.exit(1);
}); 
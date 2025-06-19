const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';

// 测试结果统计
let testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m',    // cyan
        success: '\x1b[32m', // green
        error: '\x1b[31m',   // red
        warning: '\x1b[33m'  // yellow
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

async function testTagsAPI() {
    log('\n=== 测试标签管理 API ===', 'info');
    
    try {
        // 1. 获取标签列表
        log('\n1. 测试获取标签列表...');
        const listResponse = await fetch(`${baseUrl}/api/tags`);
        const listData = await listResponse.json();
        
        assertTest(listResponse.ok, '标签列表请求成功');
        assertTest(listData.success, '标签列表返回成功状态');
        assertTest(Array.isArray(listData.data), '标签列表返回数组');
        assertTest(listData.data.length > 0, '标签列表包含数据');

        // 2. 创建标签
        log('\n2. 测试创建标签...');
        const createTag = {
            name: `test-tag-${Date.now()}`,
            displayName: '测试标签',
            description: '用于全面测试的标签',
            category: 'CONTENT',
            color: '#ff0000'
        };

        const createResponse = await fetch(`${baseUrl}/api/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createTag)
        });
        const createData = await createResponse.json();
        
        assertTest(createResponse.ok, '创建标签请求成功');
        assertTest(createData.success, '创建标签返回成功状态');
        assertTest(createData.data && createData.data.id, '创建标签返回ID');

        if (createData.success && createData.data.id) {
            const tagId = createData.data.id;

            // 3. 更新标签
            log('\n3. 测试更新标签...');
            const updateTag = {
                id: tagId,
                name: `${createTag.name}-updated`,
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

            // 4. 删除标签
            log('\n4. 测试删除标签...');
            const deleteResponse = await fetch(`${baseUrl}/api/tags?id=${tagId}`, {
                method: 'DELETE'
            });
            const deleteData = await deleteResponse.json();
            
            assertTest(deleteResponse.ok, '删除标签请求成功');
            assertTest(deleteData.success, '删除标签返回成功状态');
        }

    } catch (error) {
        log(`标签API测试错误: ${error.message}`, 'error');
        testResults.failed++;
        testResults.errors.push(`标签API测试错误: ${error.message}`);
    }
}

async function testInfluencersAPI() {
    log('\n=== 测试达人管理 API ===', 'info');
    
    try {
        // 1. 获取平台列表
        log('\n1. 获取平台信息...');
        const platformsResponse = await fetch(`${baseUrl}/api/platforms`);
        const platformsData = await platformsResponse.json();
        
        assertTest(platformsResponse.ok, '平台列表请求成功');
        assertTest(platformsData.success, '平台列表返回成功状态');
        
        if (!platformsData.success || !platformsData.platforms.length) {
            log('无法获取平台信息，跳过达人测试', 'warning');
            return;
        }

        const platformId = platformsData.platforms[0].id;

        // 2. 获取达人列表
        log('\n2. 测试获取达人列表...');
        const listResponse = await fetch(`${baseUrl}/api/influencers`);
        const listData = await listResponse.json();
        
        assertTest(listResponse.ok, '达人列表请求成功');
        assertTest(listData.success, '达人列表返回成功状态');
        assertTest(listData.data && listData.data.items, '达人列表返回items');

        // 3. 创建达人
        log('\n3. 测试创建达人...');
        const createInfluencer = {
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
            body: JSON.stringify(createInfluencer)
        });
        const createData = await createResponse.json();
        
        assertTest(createResponse.ok, '创建达人请求成功');
        assertTest(createData.success, '创建达人返回成功状态');
        assertTest(createData.data && createData.data.id, '创建达人返回ID');

        if (createData.success && createData.data.id) {
            const influencerId = createData.data.id;

            // 4. 更新达人
            log('\n4. 测试更新达人...');
            const updateInfluencer = {
                id: influencerId,
                displayName: '测试达人-已更新',
                followersCount: 15000,
                primaryCategory: '更新分类'
            };

            const updateResponse = await fetch(`${baseUrl}/api/influencers`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateInfluencer)
            });
            const updateData = await updateResponse.json();
            
            assertTest(updateResponse.ok, '更新达人请求成功');
            assertTest(updateData.success, '更新达人返回成功状态');

            // 5. 删除达人
            log('\n5. 测试删除达人...');
            const deleteResponse = await fetch(`${baseUrl}/api/influencers?id=${influencerId}`, {
                method: 'DELETE'
            });
            const deleteData = await deleteResponse.json();
            
            assertTest(deleteResponse.ok, '删除达人请求成功');
            assertTest(deleteData.success, '删除达人返回成功状态');
        }

    } catch (error) {
        log(`达人API测试错误: ${error.message}`, 'error');
        testResults.failed++;
        testResults.errors.push(`达人API测试错误: ${error.message}`);
    }
}

async function testBatchOperations() {
    log('\n=== 测试批量操作 API ===', 'info');
    
    try {
        // 1. 创建测试标签和达人
        log('\n1. 准备测试数据...');
        
        // 创建测试标签
        const testTag = {
            name: `batch-tag-${Date.now()}`,
            displayName: '批量测试标签',
            description: '用于批量操作测试',
            category: 'CONTENT',
            color: '#0066cc'
        };

        const tagResponse = await fetch(`${baseUrl}/api/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testTag)
        });
        const tagData = await tagResponse.json();
        
        if (!tagData.success) {
            log('无法创建测试标签，跳过批量操作测试', 'warning');
            return;
        }

        const tagId = tagData.data.id;

        // 获取现有达人
        const influencersResponse = await fetch(`${baseUrl}/api/influencers?limit=3`);
        const influencersData = await influencersResponse.json();
        
        if (!influencersData.success || influencersData.data.items.length === 0) {
            log('无法获取达人数据，跳过批量操作测试', 'warning');
            return;
        }

        const influencerIds = influencersData.data.items.map(inf => inf.id);

        // 2. 测试批量添加标签
        log('\n2. 测试批量添加标签...');
        const addTagsRequest = {
            action: 'addTags',
            influencerIds: influencerIds,
            tagIds: [tagId]
        };

        const addTagsResponse = await fetch(`${baseUrl}/api/influencers/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addTagsRequest)
        });
        const addTagsData = await addTagsResponse.json();
        
        assertTest(addTagsResponse.ok, '批量添加标签请求成功');
        assertTest(addTagsData.addedRelations !== undefined, '批量添加标签返回关联数量');

        // 3. 测试批量移除标签
        log('\n3. 测试批量移除标签...');
        const removeTagsRequest = {
            action: 'removeTags',
            influencerIds: influencerIds,
            tagIds: [tagId]
        };

        const removeTagsResponse = await fetch(`${baseUrl}/api/influencers/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(removeTagsRequest)
        });
        const removeTagsData = await removeTagsResponse.json();
        
        assertTest(removeTagsResponse.ok, '批量移除标签请求成功');
        assertTest(removeTagsData.removedRelations !== undefined, '批量移除标签返回关联数量');

        // 4. 测试批量导出
        log('\n4. 测试批量导出...');
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

        // 清理测试标签
        await fetch(`${baseUrl}/api/tags?id=${tagId}`, { method: 'DELETE' });

    } catch (error) {
        log(`批量操作测试错误: ${error.message}`, 'error');
        testResults.failed++;
        testResults.errors.push(`批量操作测试错误: ${error.message}`);
    }
}

async function testPlatformsAPI() {
    log('\n=== 测试平台管理 API ===', 'info');
    
    try {
        const response = await fetch(`${baseUrl}/api/platforms`);
        const data = await response.json();
        
        assertTest(response.ok, '平台列表请求成功');
        assertTest(data.success, '平台列表返回成功状态');
        assertTest(Array.isArray(data.platforms), '平台列表返回数组');
        assertTest(data.platforms.length > 0, '平台列表包含数据');

    } catch (error) {
        log(`平台API测试错误: ${error.message}`, 'error');
        testResults.failed++;
        testResults.errors.push(`平台API测试错误: ${error.message}`);
    }
}

async function testDatabaseIntegrity() {
    log('\n=== 测试数据库完整性 ===', 'info');
    
    try {
        // 测试达人是否有标签数据
        const influencersResponse = await fetch(`${baseUrl}/api/influencers?limit=5`);
        const influencersData = await influencersResponse.json();
        
        if (influencersData.success && influencersData.data.items.length > 0) {
            const hasTaggedInfluencers = influencersData.data.items.some(inf => inf.tags && inf.tags.length > 0);
            assertTest(hasTaggedInfluencers, '部分达人拥有标签数据');
        }

        // 测试数据统计
        const tagsResponse = await fetch(`${baseUrl}/api/tags`);
        const tagsData = await tagsResponse.json();
        
        if (tagsData.success && tagsData.stats) {
            assertTest(tagsData.stats.total > 0, '系统中有标签数据');
        }

    } catch (error) {
        log(`数据库完整性测试错误: ${error.message}`, 'error');
        testResults.failed++;
        testResults.errors.push(`数据库完整性测试错误: ${error.message}`);
    }
}

async function runAllTests() {
    log('开始全面测试 API 功能...', 'info');
    log('=' * 50, 'info');
    
    await testPlatformsAPI();
    await testTagsAPI();
    await testInfluencersAPI();
    await testBatchOperations();
    await testDatabaseIntegrity();
    
    // 输出测试结果统计
    log('\n' + '='.repeat(50), 'info');
    log('测试结果统计:', 'info');
    log(`✓ 通过: ${testResults.passed}`, 'success');
    log(`✗ 失败: ${testResults.failed}`, 'error');
    log(`总计: ${testResults.passed + testResults.failed}`, 'info');
    
    if (testResults.failed > 0) {
        log('\n失败的测试:', 'error');
        testResults.errors.forEach(error => {
            log(`  - ${error}`, 'error');
        });
    } else {
        log('\n🎉 所有测试都通过了！', 'success');
    }
    
    log('=' * 50, 'info');
}

runAllTests().catch(error => {
    log(`测试运行失败: ${error.message}`, 'error');
    process.exit(1);
}); 
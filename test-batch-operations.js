const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';

async function testBatchOperations() {
    console.log('开始测试批量操作...');

    try {
        // 1. 先创建测试标签
        console.log('\n1. 创建测试标签...');
        const testTag1 = {
            name: `batch-test-tag-1-${Date.now()}`,
            displayName: '批量测试标签1',
            description: '用于批量操作测试的标签1',
            category: 'CONTENT',
            color: '#ff0000'
        };

        const testTag2 = {
            name: `batch-test-tag-2-${Date.now()}`,
            displayName: '批量测试标签2',
            description: '用于批量操作测试的标签2',
            category: 'BUSINESS',
            color: '#00ff00'
        };

        const tag1Response = await fetch(`${baseUrl}/api/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testTag1)
        });
        const tag1Data = await tag1Response.json();

        const tag2Response = await fetch(`${baseUrl}/api/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testTag2)
        });
        const tag2Data = await tag2Response.json();

        if (!tag1Data.success || !tag2Data.success) {
            console.log('✗ 创建测试标签失败');
            return;
        }

        console.log('✓ 测试标签创建成功:', tag1Data.data.id, tag2Data.data.id);

        // 2. 获取一些达人ID用于测试
        console.log('\n2. 获取达人数据...');
        const influencersResponse = await fetch(`${baseUrl}/api/influencers?limit=5`);
        const influencersData = await influencersResponse.json();

        if (!influencersData.success || influencersData.data.items.length === 0) {
            console.log('✗ 获取达人数据失败或没有达人数据');
            return;
        }

        const influencerIds = influencersData.data.items.slice(0, 3).map(inf => inf.id);
        console.log('✓ 获取到达人ID:', influencerIds);

        // 3. 测试批量添加标签
        console.log('\n3. 测试批量添加标签...');
        const addTagsRequest = {
            action: 'addTags',
            influencerIds: influencerIds,
            tagIds: [tag1Data.data.id, tag2Data.data.id]
        };

        const addTagsResponse = await fetch(`${baseUrl}/api/influencers/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addTagsRequest)
        });

        const addTagsData = await addTagsResponse.json();
        
        if (addTagsResponse.ok && addTagsData.addedRelations !== undefined) {
            console.log('✓ 批量添加标签成功，添加了', addTagsData.addedRelations, '个关联');
        } else {
            console.log('✗ 批量添加标签失败:', addTagsData.error || '未知错误');
        }

        // 4. 测试批量移除标签
        console.log('\n4. 测试批量移除标签...');
        const removeTagsRequest = {
            action: 'removeTags',
            influencerIds: influencerIds,
            tagIds: [tag1Data.data.id]
        };

        const removeTagsResponse = await fetch(`${baseUrl}/api/influencers/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(removeTagsRequest)
        });

        const removeTagsData = await removeTagsResponse.json();
        
        if (removeTagsResponse.ok && removeTagsData.removedRelations !== undefined) {
            console.log('✓ 批量移除标签成功，移除了', removeTagsData.removedRelations, '个关联');
        } else {
            console.log('✗ 批量移除标签失败:', removeTagsData.error || '未知错误');
        }

        // 5. 测试批量导出
        console.log('\n5. 测试批量导出...');
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
        
        if (exportResponse.ok && exportData.data) {
            console.log('✓ 批量导出成功，导出了', exportData.data.length, '个达人数据');
        } else {
            console.log('✗ 批量导出失败:', exportData.error || '未知错误');
        }

        // 6. 清理测试数据
        console.log('\n6. 清理测试标签...');
        await fetch(`${baseUrl}/api/tags?id=${tag1Data.data.id}`, { method: 'DELETE' });
        await fetch(`${baseUrl}/api/tags?id=${tag2Data.data.id}`, { method: 'DELETE' });
        console.log('✓ 测试标签已清理');

    } catch (error) {
        console.error('测试过程中发生错误:', error.message);
    }

    console.log('\n批量操作测试完成！');
}

// 创建达人测试
async function testCreateInfluencer() {
    console.log('\n开始测试创建达人...');

    try {
        // 先获取平台信息
        const platformsResponse = await fetch(`${baseUrl}/api/platforms`);
        const platformsData = await platformsResponse.json();
        
        if (!platformsData.success || platformsData.platforms.length === 0) {
            console.log('✗ 获取平台信息失败');
            return;
        }

        const platformId = platformsData.platforms[0].id;
        console.log('使用平台:', platformsData.platforms[0].displayName);

        // 创建测试达人
        const testInfluencer = {
            platformId: platformId,
            platformUserId: `test_user_${Date.now()}`,
            username: `test_username_${Date.now()}`,
            displayName: '测试达人',
            email: 'test@example.com',
            followersCount: 10000,
            primaryCategory: '生活方式',
            country: 'CN'
        };

        const createResponse = await fetch(`${baseUrl}/api/influencers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testInfluencer)
        });

        const createData = await createResponse.json();
        
        if (createResponse.ok && createData.success) {
            console.log('✓ 创建达人成功，ID:', createData.data.id);
            
            // 测试更新达人
            const updateInfluencer = {
                id: createData.data.id,
                displayName: '测试达人-已更新',
                followersCount: 15000,
                primaryCategory: '美妆'
            };

            const updateResponse = await fetch(`${baseUrl}/api/influencers`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateInfluencer)
            });

            const updateData = await updateResponse.json();
            
            if (updateResponse.ok && updateData.success) {
                console.log('✓ 更新达人成功');
            } else {
                console.log('✗ 更新达人失败:', updateData.error || '未知错误');
            }

            // 清理测试达人
            const deleteResponse = await fetch(`${baseUrl}/api/influencers?id=${createData.data.id}`, {
                method: 'DELETE'
            });

            const deleteData = await deleteResponse.json();
            
            if (deleteResponse.ok && deleteData.success) {
                console.log('✓ 删除测试达人成功');
            } else {
                console.log('✗ 删除测试达人失败:', deleteData.error || '未知错误');
            }
            
        } else {
            console.log('✗ 创建达人失败:', createData.error || '未知错误');
            console.log('详细信息:', createData);
        }

    } catch (error) {
        console.error('达人操作测试过程中发生错误:', error.message);
    }
}

async function runAllTests() {
    await testBatchOperations();
    await testCreateInfluencer();
    console.log('\n所有测试完成！');
}

runAllTests(); 
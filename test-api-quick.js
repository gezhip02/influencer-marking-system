const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';

async function testAPI() {
    console.log('开始测试 API...');

    try {
        // 1. 测试获取标签列表
        console.log('\n1. 测试标签列表 API...');
        const tagsResponse = await fetch(`${baseUrl}/api/tags`);
        const tagsData = await tagsResponse.json();
        
        if (tagsResponse.ok && tagsData.success) {
            console.log('✓ 标签列表 API 正常，共', tagsData.data.length, '个标签');
        } else {
            console.log('✗ 标签列表 API 失败:', tagsData.error || '未知错误');
            return;
        }

        // 2. 测试创建标签
        console.log('\n2. 测试创建标签 API...');
        const uniqueName = `test-tag-${Date.now()}`;
        const newTag = {
            name: uniqueName,
            displayName: '测试标签',
            description: '这是一个测试标签',
            category: 'CONTENT',
            color: '#ff0000'
        };

        const createResponse = await fetch(`${baseUrl}/api/tags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTag)
        });

        const createData = await createResponse.json();
        
        if (createResponse.ok && createData.success) {
            console.log('✓ 创建标签 API 正常，新标签 ID:', createData.data.id);
            
            // 3. 测试更新标签
            console.log('\n3. 测试更新标签 API...');
            const updateTag = {
                id: createData.data.id,
                name: `${uniqueName}-updated`,
                displayName: '测试标签-已更新',
                description: '这是一个更新的测试标签',
                category: 'CONTENT',
                color: '#00ff00'
            };

            const updateResponse = await fetch(`${baseUrl}/api/tags`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateTag)
            });

            const updateData = await updateResponse.json();
            
            if (updateResponse.ok && updateData.success) {
                console.log('✓ 更新标签 API 正常');
            } else {
                console.log('✗ 更新标签 API 失败:', updateData.error || '未知错误');
            }

            // 4. 测试删除标签
            console.log('\n4. 测试删除标签 API...');
            const deleteResponse = await fetch(`${baseUrl}/api/tags?id=${createData.data.id}`, {
                method: 'DELETE'
            });

            const deleteData = await deleteResponse.json();
            
            if (deleteResponse.ok && deleteData.success) {
                console.log('✓ 删除标签 API 正常');
            } else {
                console.log('✗ 删除标签 API 失败:', deleteData.error || '未知错误');
            }
            
        } else {
            console.log('✗ 创建标签 API 失败:', createData.error || '未知错误');
            console.log('响应详情:', createData);
        }

        // 5. 测试达人列表
        console.log('\n5. 测试达人列表 API...');
        const influencersResponse = await fetch(`${baseUrl}/api/influencers`);
        const influencersData = await influencersResponse.json();
        
        if (influencersResponse.ok && influencersData.success) {
            console.log('✓ 达人列表 API 正常，共', influencersData.data.total, '个达人');
        } else {
            console.log('✗ 达人列表 API 失败:', influencersData.error || '未知错误');
        }

        // 6. 测试平台列表
        console.log('\n6. 测试平台列表 API...');
        const platformsResponse = await fetch(`${baseUrl}/api/platforms`);
        const platformsData = await platformsResponse.json();
        
        if (platformsResponse.ok && platformsData.success) {
            console.log('✓ 平台列表 API 正常，共', platformsData.platforms.length, '个平台');
        } else {
            console.log('✗ 平台列表 API 失败:', platformsData.error || '未知错误');
        }

    } catch (error) {
        console.error('测试过程中发生错误:', error.message);
    }

    console.log('\n测试完成！');
}

testAPI(); 
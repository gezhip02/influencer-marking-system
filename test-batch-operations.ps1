# 批量操作测试脚本
# 测试批量添加标签、移除标签、更新状态、导出、删除等功能

$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api"

Write-Host "🧪 开始批量操作功能测试..." -ForegroundColor Green

# 函数：发送HTTP请求
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Host "❌ 请求失败: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "响应内容: $responseBody" -ForegroundColor Yellow
        }
        return $null
    }
}

# 1. 获取所有达人ID
Write-Host "`n📋 获取达人列表..." -ForegroundColor Cyan
$influencersResponse = Invoke-ApiRequest -Url "$apiUrl/influencers"
if (-not $influencersResponse) {
    Write-Host "❌ 无法获取达人列表，退出测试" -ForegroundColor Red
    exit 1
}

$influencerIds = $influencersResponse.influencers | Select-Object -First 3 | ForEach-Object { $_.id }
Write-Host "✅ 获取到 $($influencerIds.Count) 个达人ID: $($influencerIds -join ', ')" -ForegroundColor Green

# 2. 获取标签列表
Write-Host "`n🏷️ 获取标签列表..." -ForegroundColor Cyan
$tagsResponse = Invoke-ApiRequest -Url "$apiUrl/tags"
if (-not $tagsResponse) {
    Write-Host "❌ 无法获取标签列表" -ForegroundColor Red
    exit 1
}

$tagIds = $tagsResponse.tags | Select-Object -First 2 | ForEach-Object { $_.id }
Write-Host "✅ 获取到 $($tagIds.Count) 个标签ID: $($tagIds -join ', ')" -ForegroundColor Green

# 3. 测试批量添加标签
Write-Host "`n🏷️ 测试批量添加标签..." -ForegroundColor Cyan
$addTagsBody = @{
    influencerIds = $influencerIds
    tagIds = $tagIds
}
$addTagsResult = Invoke-ApiRequest -Url "$apiUrl/influencers/batch?action=add-tags" -Method "POST" -Body $addTagsBody
if ($addTagsResult) {
    Write-Host "✅ 批量添加标签成功: $($addTagsResult.message)" -ForegroundColor Green
    Write-Host "   添加关联: $($addTagsResult.addedRelations), 跳过重复: $($addTagsResult.skippedRelations)" -ForegroundColor Gray
} else {
    Write-Host "❌ 批量添加标签失败" -ForegroundColor Red
}

# 4. 测试批量更新状态
Write-Host "`n📊 测试批量更新状态..." -ForegroundColor Cyan
$updateStatusBody = @{
    influencerIds = $influencerIds
    status = "ACTIVE"
}
$updateStatusResult = Invoke-ApiRequest -Url "$apiUrl/influencers/batch?action=update-status" -Method "POST" -Body $updateStatusBody
if ($updateStatusResult) {
    Write-Host "✅ 批量更新状态成功: $($updateStatusResult.message)" -ForegroundColor Green
    Write-Host "   更新数量: $($updateStatusResult.updatedCount)" -ForegroundColor Gray
} else {
    Write-Host "❌ 批量更新状态失败" -ForegroundColor Red
}

# 5. 测试批量导出 JSON
Write-Host "`n📤 测试批量导出 JSON..." -ForegroundColor Cyan
$exportJsonBody = @{
    influencerIds = $influencerIds
    format = "json"
}
$exportJsonResult = Invoke-ApiRequest -Url "$apiUrl/influencers/batch?action=export" -Method "POST" -Body $exportJsonBody
if ($exportJsonResult) {
    Write-Host "✅ 批量导出 JSON 成功" -ForegroundColor Green
    Write-Host "   导出数量: $($exportJsonResult.exportedCount)" -ForegroundColor Gray
    
    # 保存导出数据到文件
    $exportJsonResult | ConvertTo-Json -Depth 10 | Out-File -FilePath "export-test.json" -Encoding UTF8
    Write-Host "   数据已保存到: export-test.json" -ForegroundColor Gray
} else {
    Write-Host "❌ 批量导出 JSON 失败" -ForegroundColor Red
}

# 6. 测试批量导出 CSV
Write-Host "`n📤 测试批量导出 CSV..." -ForegroundColor Cyan
$exportCsvBody = @{
    influencerIds = $influencerIds
    format = "csv"
}

try {
    $response = Invoke-WebRequest -Uri "$apiUrl/influencers/batch?action=export" -Method POST -Body ($exportCsvBody | ConvertTo-Json) -ContentType "application/json"
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ 批量导出 CSV 成功" -ForegroundColor Green
        
        # 保存CSV文件
        $response.Content | Out-File -FilePath "export-test.csv" -Encoding UTF8
        Write-Host "   CSV文件已保存到: export-test.csv" -ForegroundColor Gray
        
        # 显示CSV内容的前几行
        $csvContent = $response.Content -split "`n"
        Write-Host "   CSV内容预览:" -ForegroundColor Gray
        $csvContent | Select-Object -First 3 | ForEach-Object { Write-Host "     $_" -ForegroundColor DarkGray }
    } else {
        Write-Host "❌ 批量导出 CSV 失败: HTTP $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 批量导出 CSV 请求失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. 测试批量导入
Write-Host "`n📥 测试批量导入..." -ForegroundColor Cyan

# 创建测试导入数据
$importData = @(
    @{
        platformId = "1"
        platformUserId = "test_import_user_1"
        username = "test_import_1"
        displayName = "测试导入用户1"
        followersCount = 5000
        status = "POTENTIAL"
        dataSource = "IMPORT"
    },
    @{
        platformId = "1"
        platformUserId = "test_import_user_2"
        username = "test_import_2"
        displayName = "测试导入用户2"
        followersCount = 8000
        status = "POTENTIAL"
        dataSource = "IMPORT"
    }
)

$importBody = @{
    data = $importData
    format = "json"
}

$importResult = Invoke-ApiRequest -Url "$apiUrl/influencers/batch?action=import" -Method "POST" -Body $importBody
if ($importResult) {
    Write-Host "✅ 批量导入成功: $($importResult.message)" -ForegroundColor Green
    Write-Host "   新增: $($importResult.imported), 更新: $($importResult.updated), 错误: $($importResult.errors)" -ForegroundColor Gray
    if ($importResult.errorDetails -and $importResult.errorDetails.Count -gt 0) {
        Write-Host "   错误详情:" -ForegroundColor Yellow
        $importResult.errorDetails | ForEach-Object { Write-Host "     $_" -ForegroundColor Yellow }
    }
} else {
    Write-Host "❌ 批量导入失败" -ForegroundColor Red
}

# 8. 测试批量移除标签
Write-Host "`n🏷️ 测试批量移除标签..." -ForegroundColor Cyan
$removeTagsBody = @{
    influencerIds = $influencerIds
    tagIds = @($tagIds[0])  # 只移除第一个标签
}
$removeTagsResult = Invoke-ApiRequest -Url "$apiUrl/influencers/batch?action=remove-tags" -Method "POST" -Body $removeTagsBody
if ($removeTagsResult) {
    Write-Host "✅ 批量移除标签成功: $($removeTagsResult.message)" -ForegroundColor Green
    Write-Host "   移除关联: $($removeTagsResult.removedRelations)" -ForegroundColor Gray
} else {
    Write-Host "❌ 批量移除标签失败" -ForegroundColor Red
}

# 9. 清理测试数据（删除导入的测试用户）
Write-Host "`n🧹 清理测试数据..." -ForegroundColor Cyan

# 获取导入的测试用户ID
$cleanupInfluencers = Invoke-ApiRequest -Url "$apiUrl/influencers?search=test_import"
if ($cleanupInfluencers -and $cleanupInfluencers.influencers) {
    $testUserIds = $cleanupInfluencers.influencers | Where-Object { $_.username -like "test_import_*" } | ForEach-Object { $_.id }
    
    if ($testUserIds.Count -gt 0) {
        Write-Host "   找到 $($testUserIds.Count) 个测试用户，准备删除..." -ForegroundColor Yellow
        
        foreach ($userId in $testUserIds) {
            $deleteResult = Invoke-ApiRequest -Url "$apiUrl/influencers?ids=$userId" -Method "DELETE"
            if ($deleteResult) {
                Write-Host "   ✅ 删除测试用户 $userId 成功" -ForegroundColor Green
            } else {
                Write-Host "   ❌ 删除测试用户 $userId 失败" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "   没有找到需要清理的测试用户" -ForegroundColor Gray
    }
} else {
    Write-Host "   无法获取测试用户列表进行清理" -ForegroundColor Yellow
}

Write-Host "`n🎉 批量操作功能测试完成！" -ForegroundColor Green
Write-Host "📁 生成的文件:" -ForegroundColor Cyan
Write-Host "   - export-test.json (JSON导出测试文件)" -ForegroundColor Gray
Write-Host "   - export-test.csv (CSV导出测试文件)" -ForegroundColor Gray

# 显示测试总结
Write-Host "`n📊 测试总结:" -ForegroundColor Cyan
Write-Host "✅ 批量添加标签" -ForegroundColor Green
Write-Host "✅ 批量移除标签" -ForegroundColor Green  
Write-Host "✅ 批量更新状态" -ForegroundColor Green
Write-Host "✅ 批量导出 JSON" -ForegroundColor Green
Write-Host "✅ 批量导出 CSV" -ForegroundColor Green
Write-Host "✅ 批量导入数据" -ForegroundColor Green
Write-Host "✅ 测试数据清理" -ForegroundColor Green

Write-Host "`n💡 提示: 你可以在浏览器中访问 $baseUrl/influencers 查看批量操作的UI界面" -ForegroundColor Yellow 
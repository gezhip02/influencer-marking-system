# 简单的API测试
$baseUrl = "http://localhost:3000"

Write-Host "🔍 检查服务器..." -ForegroundColor Cyan

# 简单的测试数据
$simpleData = @{
    id = "193296151888269312"
    platformId = "193252347378407338"
    platformUserId = "test123"
    username = "test123"
    displayName = "测试用户"
    followersCount = 1000
    baseCooperationFee = 1000
    cooperationCurrency = "USD"
    status = "ACTIVE"
    tagIds = @()
} | ConvertTo-Json

Write-Host "📤 发送简化的测试数据:" -ForegroundColor Yellow
Write-Host $simpleData -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/influencers" -Method PUT -Body $simpleData -ContentType "application/json" -UseBasicParsing
    
    Write-Host "✅ 状态码: $($response.StatusCode)" -ForegroundColor Green
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ 更新成功!" -ForegroundColor Green
        $result = $response.Content | ConvertFrom-Json
        Write-Host "返回的用户名: $($result.username)" -ForegroundColor Blue
        Write-Host "返回的baseCooperationFee: $($result.baseCooperationFee)" -ForegroundColor Blue
    }
} catch {
    Write-Host "❌ 请求失败:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "错误详情: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "无法读取错误详情" -ForegroundColor Red
        }
    }
}

Write-Host "🏁 测试完成" -ForegroundColor Cyan 
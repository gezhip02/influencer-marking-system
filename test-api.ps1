# 测试达人编辑API修复
$baseUrl = "http://localhost:3000"

# 测试数据
$testData = @{
    id = "193296151888269312"
    platformId = "193252347378407338"
    platformUserId = "natanaelpereira028"
    username = "natanaelpereira028"
    displayName = "测试达人名称"
    avatarUrl = ""
    bio = "测试达人简介"
    whatsappAccount = "16994049690"
    email = "test@example.com"
    phone = ""
    wechat = ""
    telegram = ""
    country = "中国"
    region = "广东"
    city = "深圳"
    timezone = ""
    gender = "female"
    ageRange = "25-34"
    language = "中文"
    followersCount = 1000
    followingCount = 500
    totalLikes = 10000
    totalVideos = 100
    avgVideoViews = 5000
    engagementRate = 0.05
    primaryCategory = "美食"
    contentStyle = $null
    contentLanguage = "中文"
    cooperationOpenness = "high"
    baseCooperationFee = 1000
    cooperationCurrency = "CNY"
    cooperationPreferences = $null
    qualityScore = 85
    riskLevel = "low"
    blacklistReason = ""
    dataSource = "manual"
    lastDataSync = $null
    dataAccuracy = 0.9
    platformSpecificData = $null
    notes = "测试备注"
    status = "ACTIVE"
    tagIds = @()
}

Write-Host "🔍 检查服务器连接..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/platforms" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ 服务器连接正常" -ForegroundColor Green
} catch {
    Write-Host "❌ 服务器未运行或无法连接到 $baseUrl" -ForegroundColor Red
    Write-Host "💡 请确保运行了 npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🚀 开始API测试..." -ForegroundColor Cyan

# 测试获取平台列表
Write-Host "`n🧪 测试获取平台列表API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/platforms" -UseBasicParsing
    Write-Host "📊 响应状态: $($response.StatusCode)" -ForegroundColor Blue
    
    if ($response.StatusCode -eq 200) {
        $platforms = $response.Content | ConvertFrom-Json
        Write-Host "✅ 获取成功!" -ForegroundColor Green
        Write-Host "📥 平台数量: $($platforms.Length)" -ForegroundColor Blue
        
        if ($platforms.Length -gt 0) {
            Write-Host "📋 可用平台:" -ForegroundColor Blue
            foreach ($platform in $platforms) {
                Write-Host "  - $($platform.displayName) ($($platform.name)) - ID: $($platform.id)" -ForegroundColor Gray
            }
        }
    }
} catch {
    Write-Host "❌ 测试失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试获取达人列表
Write-Host "`n🧪 测试获取达人列表API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/influencers?page=1&limit=5" -UseBasicParsing
    Write-Host "📊 响应状态: $($response.StatusCode)" -ForegroundColor Blue
    
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "✅ 获取成功!" -ForegroundColor Green
        Write-Host "📥 达人数量: $($result.influencers.Length)" -ForegroundColor Blue
        
        if ($result.influencers.Length -gt 0) {
            $firstInfluencer = $result.influencers[0]
            Write-Host "📋 第一个达人信息:" -ForegroundColor Blue
            Write-Host "  - ID: $($firstInfluencer.id)" -ForegroundColor Gray
            Write-Host "  - 用户名: $($firstInfluencer.username)" -ForegroundColor Gray
            Write-Host "  - 显示名称: $($firstInfluencer.displayName)" -ForegroundColor Gray
            Write-Host "  - 平台: $($firstInfluencer.platform.displayName)" -ForegroundColor Gray
            Write-Host "  - 粉丝数: $($firstInfluencer.followersCount)" -ForegroundColor Gray
            Write-Host "  - 状态: $($firstInfluencer.status)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ 测试失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试更新达人API
Write-Host "`n🧪 开始测试达人更新API..." -ForegroundColor Yellow

$jsonData = $testData | ConvertTo-Json -Depth 10
Write-Host "📤 发送数据:" -ForegroundColor Blue
Write-Host $jsonData -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/influencers" -Method PUT -Body $jsonData -ContentType "application/json" -UseBasicParsing
    Write-Host "📊 响应状态: $($response.StatusCode)" -ForegroundColor Blue
    
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "✅ 更新成功!" -ForegroundColor Green
        Write-Host "📥 返回数据:" -ForegroundColor Blue
        Write-Host ($result | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    } else {
        Write-Host "❌ 请求失败: $($response.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 测试失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "错误详情: $errorContent" -ForegroundColor Red
    }
}

Write-Host "`n🏁 测试完成!" -ForegroundColor Cyan 
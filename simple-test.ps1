# 测试API接口
Write-Host "开始测试API接口..." -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# 测试函数
function Test-API {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null
    )
    
    Write-Host "测试: $Name" -ForegroundColor Cyan
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        
        if ($response.success -eq $true) {
            Write-Host "   成功" -ForegroundColor Green
            if ($response.data -is [array]) {
                Write-Host "   返回 $($response.data.Count) 条记录" -ForegroundColor Yellow
            } elseif ($response.pagination) {
                Write-Host "   第$($response.pagination.page)页，共$($response.pagination.total)条记录" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   失败: $($response.error)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "   请求失败: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# 1. 测试平台接口
Test-API -Name "获取平台列表" -Url "$baseUrl/platforms"

# 2. 测试标签接口
Test-API -Name "获取标签列表" -Url "$baseUrl/tags"
Test-API -Name "获取标签列表(分页)" -Url "$baseUrl/tags?page=1&limit=3"

# 3. 测试达人接口
Test-API -Name "获取达人列表" -Url "$baseUrl/influencers"
Test-API -Name "获取达人列表(分页)" -Url "$baseUrl/influencers?page=1&limit=2"

# 4. 测试履约记录接口
Test-API -Name "获取履约记录列表" -Url "$baseUrl/fulfillment-records"

# 5. 测试履约记录标签接口
Test-API -Name "获取履约记录标签列表" -Url "$baseUrl/fulfillment-record-tags"

Write-Host "API接口测试完成!" -ForegroundColor Green 
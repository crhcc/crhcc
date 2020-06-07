/*
漫威无限解锁订阅

https:\/\/.*\.com\/marvel\/services

hostname=new.marvelunlimitedresources.com,services.mu.163.com

*/

body = $response.body.replace(/vip_forever=\w+/, "vip_forever=true").replace(/free=\w+/, "free=true").replace(/end_at=\d+/, "end_at=2025-03-01 15:29:41").replace(/vip_over_time=\d+/, "vip_over_time=2025-03-01 15:29:41").replace(/vip_type=\w+/, "vip_type=forever").replace(/vip_status_text=\w+/, "vip_status_text=永久会员")
$done({body});

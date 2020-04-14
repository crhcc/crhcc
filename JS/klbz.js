/*
[rewrite_local]
#克拉壁纸一次性解锁内购（by crhcc）
^https:\/\/charitywallpaper\.com\/clarity\/api\/userinfo url script-response-body crhcc/JS/klbz.js

[MITM]
hostname:charitywallpaper.com

*/


var obj = JSON.parse($response.body);
 
obj = {
  "message": "",
  "code": 200,
  "data": {
    "id": "ff808081705b495c01707aa84b29362d",
    "userName": "crh@126.com",
    "nickName": "crh",
    "headImgUrl": null,
    "websiteUrl": null,
    "clarityWebsiteUrl": "https://claritywallpaper.com/x7hlt",
    "local": null,
    "role": 1,
    "level": 5,
    "platform": null,
    "expireTime": 4070965662,
    "favoriteCount": 0
  }
 }

$done({body: JSON.stringify(obj)});

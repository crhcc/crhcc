/*
[rewrite_local]
#now冥想一次性解锁内购（by crhcc）
^https:\/\/nowapi\.navoinfo\.cn\/my_vip url script-response-body crhcc/JS/nowmx.js
^https:\/\/nowapi\.navoinfo\.cn\/user url script-response-body crhcc/JS/nowmx.js
^https:\/\/nowapi\.navoinfo\.cn\/get_sections_list_* url script-response-body crhcc/JS/nowmx.js



[MITM]
hostname:nowapi.navoinfo.cn
*/
//re('"is_vip":\\d@"end_time":\\d+','"is_vip":1@"end_time":1741575902')
//re('"is_vip":\\d@"vip_expires":\\d+@"point_expires_time":\\d','"is_vip":1@"vip_expires":1900839229@"point_expires_time":1900839229@"');
re('"vip_forever":\\w+'@"free":\\w+'@"end_at":""'@"vip_over_days":\\d'@"vip_over_time":""'@"vip_type":""'@"vip_status_text":\\w+','"vip_forever":true'@"free":true'@"end_at":2025-03-01 15:29:41'@"vip_over_days":999'@"vip_over_time":2025-03-01 15:29:41'@"vip_type":forever'@"vip_status_text":永久会员')


function re() {
 var body = $response.body;
 if (arguments[0].includes("@")) {
  var regs = arguments[0].split("@");
  var strs = arguments[1].split("@");
  for (i = 0;i < regs.length;i++) {
   var reg = new RegExp(regs[i],"g");
   body = body.replace(reg, strs[i]);
 }
}
 else {
  var reg = new RegExp(arguments[0],"g");
  body = body.replace(reg, arguments[1]);
}
 $done(body);
} 

/*
[rewrite_local]
#Peak解锁pro（by crhcc）
^https:\/\/billing\.peakcloud\.org\.billing\./d\.user\/me url script-response-body Peak.js

Surge4.0: https://api.meiyan.com/iap/verify.json

[MITM]
hostname:billing.peakcloud.org

*/
var obj = JSON.parse($response.body);
 
obj = {
 "response": {
  "bbuid": "ZPpZvQbStP",
  "usedIntroOfferPeriod": false,
  "class": "UserModuleBillingResponse",
  "is_in_billing_retry": false,
  "modules": [
   {
    "class": "BillingModuleResponse",
    "name": "com.brainbow.module.peak.PeakModule",
    "subscription": {
     "status": 0,
     "statusdate": 0,
     "source": {
      "id": "com.brainbow.peak.arsub_1wtrial_12m4968",
      "cancelable": false,
      "provider": "itunes",
      "type": "trial"
     },
     "bbuid": "ZPpZvQbStP",
     "endTime": 1779061000000,
     "startTime":1531710600000,
     "pro": true
    }
   }
  ]
 },
 "metaResponse": {
  "code": 0
 }
}


$done({body: JSON.stringify(obj)});

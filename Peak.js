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
     "metaResponse": {
    "code": 0
  },

     "response": {
    "bbuid": "NKoKXsjJnw",
    "usedIntroOfferPeriod": false,
    "class": "UserModuleBillingResponse",
    "is_in_billing_retry": false,
    "modules": [{
      "class": "BillingModuleResponse",
      "name": "com.brainbow.module.peak.PeakModule",
      "subscription": {
        "status": 0,
        "statusdate": 0,
        "source": {
          "id": "com.brainbow.peak.arsub_1wtrial_12m3499",
          "cancelable": false,
          "provider": "itunes",
          "type": "trial"
        },
        "bbuid": "NKoKXsjJnw",
        "endTime": 4070956030000,
        "startTime": 1577884030503,
        "pro": true
      }
    }]
 }
}

$done({body: JSON.stringify(obj)});
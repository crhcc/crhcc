const CookieName = "微哨打卡"
const signurlKey ='weishaourl_ws'
const signheaderKey = 'weishaoheader_ws'
const sy = init()
const signheaderVal = sy.getdata(signheaderKey); 

let isGetCookie = typeof $request !== 'undefined'
if (isGetCookie) {
   GetCookie()
} else {
   all()
}

function GetCookie() {
   if ($request && $request.method != `OPTIONS`) {
   const signheaderVal = JSON.stringify($request.headers);
    if (signheaderVal)        sy.setdata(signheaderVal,signheaderKey)
    sy.log(`[${CookieName}] 获取Cookie: 成功,signheaderVal: ${signheaderVal}`)
     sy.msg(CookieName, `获取Cookie: 成功🎉`, ``)
  }
 }
 
async function all() 
{ 
  await signInfo();
}

      
function signInfo() {      
  return new Promise((resolve, reject) =>
   {
    const url = { 
      url: 'https://yq.weishao.com.cn/api/questionnaire/questionnaire/getQuestionDetail', 
      headers: JSON.parse(signheaderVal),
}
   sy.post(url, (error, response, data) =>
 {
     sy.log(`${CookieName}, data: ${data}`)
      signinfo =JSON.parse(data)
      if (signinfo.data.already_answered == false){
      	data.question_list.user_answer_this_question = "true";
      	data.question_list.user_answer_content = "福建省龙岩市新罗区龙腾北路靠近建发上郡"；
      	data.question_list.option_list.user_answer_this_question = "true";
      	           }
       else {
          subTitle = `${signinfo.msg}`
          detail= ``
         }

      sy.msg(CookieName,subTitle,detail)
resolve()
       })
     })
  }



function init() {
  isSurge = () => {
      return undefined === this.$httpClient ? false : true
    }
    isQuanX = () => {
      return undefined === this.$task ? false : true
    }
    getdata = (key) => {
      if (isSurge()) return $persistentStore.read(key)
      if (isQuanX()) return $prefs.valueForKey(key)
    }
    setdata = (key, val) => {
      if (isSurge()) return $persistentStore.write(key, val)
      if (isQuanX()) return $prefs.setValueForKey(key, val)
    }
    msg = (title, subtitle, body) => {
      if (isSurge()) $notification.post(title, subtitle, body)
      if (isQuanX()) $notify(title, subtitle, body)
    }
    log = (message) => console.log(message)
    get = (url, cb) => {
      if (isSurge()) {
        $httpClient.get(url, cb)
      }
      if (isQuanX()) {
        url.method = `GET`
        $task.fetch(url).then((resp) => cb(null, {}, resp.body))
      }
    }
    post = (url, cb) => {
      if (isSurge()) {
        $httpClient.post(url, cb)
      }
      if (isQuanX()) {
        url.method = 'POST'
        $task.fetch(url).then((resp) => cb(null, {}, resp.body))
      }
    }
    done = (value = {}) => {
      $done(value)
    }
    return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
  }


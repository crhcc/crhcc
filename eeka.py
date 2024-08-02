#微信小程序：eeka

#青龙变量eeka格式为  备注#tk
#多账号换行
#小库脚本!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!




import requests
from os import path
import json
import time
import os

def load_send():
    cur_path = path.abspath(path.dirname(__file__))
    notify_file = cur_path + "/notify.py"

    if path.exists(notify_file):
        try:
            from notify import send  # 导入模块的send为notify_send
            print("加载通知服务成功！")
            return send  # 返回导入的函数
        except ImportError:
            print("加载通知服务失败~")
    else:
        print("加载通知服务失败~")

    return False  # 返回False表示未成功加载通知服务

def check_internet():
    try:
        requests.get("https://www.baidu.com", timeout=5)
        return True
    except requests.ConnectionError:
        return False

    if not check_internet():
        print("警告: 无法连接到互联网!")

def sign(tk):
  url = "https://mallapplet.prd.eeka.com.cn/mallApplet/cci/getMemberGiftListCheckIn?activityCode=H20240730000003"
  headers = {
    'Accept-Encoding' : "gzip,compress,br,deflate",
    'content-type' : "application/x-www-form-urlencoded",
    'Connection' : "keep-alive",
    'Referer' : "https://servicewechat.com/wxd4ba34bbd7657253/77/page-frame.html",
    'Host' : "mallapplet.prd.eeka.com.cn",
    'User-Agent' : "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.44(0x18002c10) NetType/WIFI Language/zh_CN",
    'token' : tk
  }
  
  #print(f"发送签到请求: URL={url}, Headers={headers}, Data={data}")
  response = requests.get(url, headers=headers)
  print(f"签到成功: {response.json()['msg']}")
  return response.text

def jifen(tk):
    url = f"https://sbe.tzcul.com/webapi/Api/getSbeUser?token={tk}"
    headers = {
        'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.44(0x18002c10) NetType/WIFI Language/zh_CN",
    }
    try:
        response = requests.get(url, headers=headers)
        xiaoku = json.loads(response.text)
        if xiaoku["code"] == 1 and "data" in xiaoku:
            score = str(xiaoku["data"]["data"]["score"])
            print('目前积分为'+score+'\n\n')
            time.sleep(2)
        else:
            return "积分查询失败"
    except Exception as e:
        return "积分查询错误"



if __name__ == "__main__":
    var_name='eeka' 
    values = os.getenv(var_name)
    values=values.split('\n')
    content=''
    for value in values:
        beizhu=value.split('#')[0];
        tk=value.split('#')[1];
        print('-------开始' + str(beizhu) + '签到------')
        content=content+'\n===='+str(beizhu)+'账号签到情况====\n'
        content=content+str(sign(tk))
        print('-------开始' + str(beizhu) + '查询积分------')
        content=content+str(jifen(tk))
        content=content+'\n----------------------\n'
    # 在load_send中获取导入的send函数
    send = load_send()
    if send:
        send('epoch签到推送', content.strip())
    else:
        print('通知服务不可用')
    
    print('------运行结束-------')

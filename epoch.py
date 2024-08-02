#微信小程序：epoch壹宝玩具

#青龙变量gmrb格式为  备注#tk
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
  url = "https://sbe.tzcul.com/webapi/Api/tosign"
  headers = {
    'Accept-Encoding' : "gzip,compress,br,deflate",
    'content-type' : "application/x-www-form-urlencoded",
    'Connection' : "keep-alive",
    'Referer' : "https://servicewechat.com/wx62db64ee8524c34c/21/page-frame.html",
    'Host' : "sbe.tzcul.com",
    'User-Agent' : "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.44(0x18002c10) NetType/WIFI Language/zh_CN"
  }
  data = {
        'token': tk,
        'day': '1'
    }
  #print(f"发送签到请求: URL={url}, Headers={headers}, Data={data}")
  response = requests.get(url, headers=headers, params=data)
  print(f"签到响应: {response.text}")
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
            score = xiaoku["data"]["data"]["score"]
            return f"当前积分: {score}"
        else:
            return "积分查询失败"
    except Exception as e:
        return "积分查询错误"



if __name__ == "__main__":
    var_name='gmrb' 
    values = os.getenv(var_name)
    values=values.split('\n')
    content=''
    for value in values:
        try:
            beizhu, tk = value.split('#')
            print(f"处理账号: {beizhu}")
            
            # 签到
            sign_result = sign(tk)
            sign_status = "成功" if "今天已签到" in sign_result else "失败"
            
            # 查询积分
            jifen_result = jifen(tk)
            
            # 构建简洁的通知内容
            account_content = f"{beizhu}: 签到{sign_status}, {jifen_result}\n"
            content += account_content
            print(account_content)
        
        except Exception as e:
            error_msg = f"{beizhu}: 处理失败 - {str(e)}\n"
            content += error_msg
            print(error_msg)
    
    # 在load_send中获取导入的send函数
    send = load_send()
    if send:
        send('epoch签到推送', content.strip())
    else:
        print('通知服务不可用')
    
    print('------运行结束-------')

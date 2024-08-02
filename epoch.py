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
  print(f"发送签到请求: URL={url}, Headers={headers}, Data={data}")
  response = requests.get(url, headers=headers, params=data)
  print(f"签到响应: {response.text}")
  return response.text

def jifen(tk):
    url = f"https://sbe.tzcul.com/webapi/Api/getSbeUser?token={tk}"
    print(f"发送积分查询请求: URL={url}")
    headers = {
      'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.44(0x18002c10) NetType/WIFI Language/zh_CN",
    }
    try:
        response = requests.get(url, headers=headers)
        print(f"积分查询响应: {response.text}")
        xiaoku = json.loads(response.text)
        print('签到成功' + str(xiaoku["data"]["msg"]))
        tongzhi = str(xiaoku["data"]["score"])
        return tongzhi
    except Exception as e:
        print(f"积分查询出错: {str(e)}")
        return "积分查询失败"



if __name__ == "__main__":
    var_name='gmrb' 
    values = os.getenv(var_name)
    values=values.split('\n')
    content=''
    for value in values:
        try:
            beizhu = value.split('#')[0]
            tk = value.split('#')[1]
            print(f"处理账号: {beizhu}")
            sign_result = sign(tk)
            jifen_result = jifen(tk)
            content += f"\n==== {beizhu} 账号签到情况 ====\n"
            content += f"签到结果: {sign_result}\n"
            content += f"积分情况: {jifen_result}\n"
            content += "----------------------\n"
        except Exception as e:
            print(f"处理 {beizhu} 账号时出错: {str(e)}")
            content += f"\n==== {beizhu} 账号处理失败 ====\n"
            content += f"错误: {str(e)}\n"
            content += "----------------------\n"
    # 在load_send中获取导入的send函数
    send = load_send()
    print()

    
    print('------运行结束-------')
    #content=content+'\n签到10天送100积分，连续20天送20元券，连续30天送25元券，连续45天送七点五饮用天然泉水高端弱碱饮用天然泉水 表白礼物 整箱520ml*15\n'
    content=content+'\n所有账号运行完毕\n'
    #print('签到10天送100积分，连续20天送20元券，连续30天送25元券，连续45天送七点五饮用天然泉水高端弱碱饮用天然泉水 表白礼物 整箱520ml*15')
     # 判断send是否可用再进行调用
    print()
    if send:
        send('epoch签到推送', content)
    else:
        print('通知服务不可用')

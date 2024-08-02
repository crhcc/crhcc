#微信小程序：七点五饮用天然矿泉水
#签到10天送100积分，连续20天送20元券，连续30天送25元券，连续45天送七点五饮用天然泉水高端弱碱饮用天然泉水 表白礼物 整箱520ml*15
#抓取任意链接请求头中的extra-data中的sid参数填入青龙变量qdwxcxcookie
#不确定参数有效期
#青龙变量qdwxcxcookie格式为备注#sid
#多账号换行
#小库脚本!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
#频道【tl库】：https://pd.qq.com/s/btv4bw7av



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



def sign():
  url = "https://gtj-api.shiseidochina.cn/api/v1/app/user/login"
  headers = {
    'x-ma-c' : ddc266d3ce1e2dde2398bcfdb71f0e78,
    'x-auth-token' : tk,
    'Connection' : keep-alive,
    'content-type' : application/json;charset=UTF-8,
    'x-shop-c' : gtj,
    'Host' : gtj-api.shiseidochina.cn,
    'Accept-Encoding' : gzip,compress,br,deflate,
    'User-Agent' : Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.44(0x18002c10) NetType/WIFI Language/zh_CN,
    'Referer' : https://servicewechat.com/wxbeb52e1c3bd2e11c/79/page-frame.html

  }

  response = requests.get(url, headers=headers)
  time.sleep(2)
  print(response.text)
  time.sleep(2)
  return response.text

def jifen():

    url = "https://gtj-api.shiseidochina.cn/api/v1/mission/accept/reward"

    headers = {
      'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.44(0x18002c10) NetType/WIFI Language/zh_CN",
      'x-auth-token' : tk
    }

    response = requests.get(url, headers=headers)
    xiaoku=json.loads(response.text)
    print('签到成功'+str(xiaoku["data"]["msg"]))
    # print(response.text)
    #tongzhi='\n目前积分为'+jifen1+'\n签到天数为'+str(xiaoku["data"]["continuesDay"])
    #return tongzhi
  except:
    print('积分查询失败，检查变量是否正确')



if __name__ == "__main__":
    var_name='tk' 
    values = os.getenv(var_name)
    values=values.split('\n')
    content=''
    for value in values:
        beizhu=value.split('#')[0];
        tk=value.split('#')[1];
        print('-------开始' + str(beizhu) + '签到------')
        content=content+'\n===='+str(beizhu)+'账号签到情况====\n'
        content=content+str(sign())
        print('-------开始' + str(beizhu) + '查询积分------')
        content=content+str(jifen())
        content=content+'\n----------------------\n'
    # 在load_send中获取导入的send函数
    send = load_send()
    print()

    
    print('------运行结束-------')
    content=content+'\n签到10天送100积分，连续20天送20元券，连续30天送25元券，连续45天送七点五饮用天然泉水高端弱碱饮用天然泉水 表白礼物 整箱520ml*15\n'
    content=content+'\n所有账号运行完毕\n'
    print('签到10天送100积分，连续20天送20元券，连续30天送25元券，连续45天送七点五饮用天然泉水高端弱碱饮用天然泉水 表白礼物 整箱520ml*15')
     # 判断send是否可用再进行调用
    print()
    if send:
        send('七点五饮用天然矿泉水签到推送', content)
    else:
        print('通知服务不可用')

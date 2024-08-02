#微信小程序：所有女生

#青龙变量syns格式为  备注#auth
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

import requests
import json

def sign(auth):
    url = "https://7.wawo.cc/api/operate/wx/rewards/task/all"
    
    headers = {
        'Accept-Encoding': 'gzip,compress,br,deflate',
        'content-type': 'application/json',
        'Connection': 'keep-alive',
        'Referer': 'https://servicewechat.com/wx7d1403fe84339669/1094/page-frame.html',
        'Host': '7.wawo.cc',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.42(0x18002a32) NetType/WIFI Language/zh_CN',
        'Authorization': auth
    }
    
    #print(f"发送签到请求: URL={url}, Headers={headers}")
    response = requests.get(url, headers=headers)
    #print(f"签到响应: {response.text}")
    
    # Parse the JSON response
    response_data = json.loads(response.text)
    
    # Check if the sign-in was successful
    if response_data['success'] and response_data['code'] == "000":
        # Find the "每日签到" task in oldRewardTaskList
        daily_sign_task = next((task for task in response_data['data']['oldRewardTaskList'] if task['name'] == "每日签到"), None)
        
        if daily_sign_task and daily_sign_task['status']:
            print(f"签到成功！获得 {daily_sign_task['num']} 积分")
        else:
            print("签到成功，但未找到积分信息")
    else:
        print(f"签到失败: {response_data['message']}")
    
    return response_data



def jifen(auth):
    url = "https://7.wawo.cc/api/score/wx/score/queryAmount"
    headers = {
        'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.44(0x18002c10) NetType/WIFI Language/zh_CN",
        'Authorization': auth    
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
    var_name='syns' 
    values = os.getenv(var_name)
    values=values.split('\n')
    content=''
    for value in values:
        try:
            beizhu, auth = value.split('#')
            print(f"处理账号: {beizhu}")
            
            # 签到
            #sign_result = sign(auth)
            #sign_status = "成功" if "今天已签到" in sign_result else "失败"
            
            # 查询积分
            jifen_result = jifen(auth)
            
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

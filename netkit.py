import os,sys,socket,subprocess,time,threading,json
from datetime import datetime

def r(c,t=10):
    try:
        x=subprocess.run(c,shell=True,capture_output=True,text=True,timeout=t)
        return x.stdout.strip()
    except:return ""

def cls():os.system("clear")

def hdr(t):
    print("\n"+"="*50)
    print(f"  {t}")
    print("="*50+"\n")

def local_ip():
    try:
        s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
        s.connect(("8.8.8.8",80));i=s.getsockname()[0];s.close();return i
    except:return "Unknown"

def gateway():
    g=r("ip route|grep default|awk '{print $3}'")
    return g or "Unknown"

def ping(host,c=3):
    o=r(f"ping -c {c} -W 2 {host}")
    for line in o.split("\n"):
        if "rtt" in line or "round-trip" in line:
            try:return float(line.split("/")[4])
            except:pass
    return None

def http(url,t=8):
    try:
        import urllib.request
        req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req,timeout=t) as r:
            return r.read().decode("utf-8",errors="ignore")
    except:return None

def jget(url):
    raw=http(url)
    if raw:
        try:return json.loads(raw)
        except:pass
    return None

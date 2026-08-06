import smtplib,ssl,logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask,request,jsonify,Response
from datetime import datetime
logging.basicConfig(level=logging.INFO,format="%(asctime)s [%(levelname)s] %(message)s",datefmt="%H:%M:%S")
log=logging.getLogger("smtp-ai-bot")
app=Flask(__name__)
sent_log=[]
HTML=open("index.html").read()
def cors(r):
    r.headers["Access-Control-Allow-Origin"]="*"
    r.headers["Access-Control-Allow-Headers"]="*"
    r.headers["Access-Control-Allow-Methods"]="GET,POST,OPTIONS"
    return r
@app.after_request
def ar(r): return cors(r)
@app.route("/")
def index(): return Response(HTML,mimetype="text/html")
@app.route("/health")
def health(): return jsonify({"status":"ok"})
@app.route("/send",methods=["POST","OPTIONS"])
def send():
    if request.method=="OPTIONS": return jsonify({}),200
    d=request.get_json(force=True)
    user=d.get("user","").strip()
    pw=d.get("password","").strip()
    to=d.get("to","").strip()
    subj=d.get("subject","").strip()
    body=d.get("body","").strip()
    fn=d.get("from_name",user)
    if not all([user,pw,to,subj,body]): return jsonify({"error":"Missing fields"}),400
    msg=MIMEMultipart("alternative")
    msg["Subject"]=subj
    msg["From"]=f"{fn} <{user}>"
    msg["To"]=to
    msg.attach(MIMEText(body,"plain","utf-8"))
    try:
        with smtplib.SMTP("smtp.gmail.com",587,timeout=20) as s:
            s.ehlo();s.starttls(context=ssl.create_default_context());s.ehlo()
            s.login(user,pw);s.sendmail(user,[to],msg.as_string())
        e={"from":user,"to":to,"subject":subj,"body":body,"ts":datetime.now().strftime("%b %d, %I:%M %p")}
        sent_log.append(e)
        log.info("Sent to %s",to)
        return jsonify({"ok":True,"entry":e})
    except smtplib.SMTPAuthenticationError:
        return jsonify({"error":"Authentication failed. Check Gmail App Password."}),401
    except Exception as e:
        return jsonify({"error":str(e)}),500
if __name__=="__main__":
    log.info("Starting on :5001")
    app.run(host="0.0.0.0",port=5001,debug=False,threaded=True)

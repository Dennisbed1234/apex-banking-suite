import smtplib,ssl,logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask,request,jsonify,Response
from datetime import datetime
logging.basicConfig(level=20,format='%(asctime)s %(message)s')
log=logging.getLogger('smtp')
app=Flask(__name__)
sl=[]

H=open("i.html").read() if __import__("os").path.exists("i.html") else "<h1>No HTML</h1>"
def cors(r):
    r.headers["Access-Control-Allow-Origin"]="*"
    r.headers["Access-Control-Allow-Headers"]="*"
    r.headers["Access-Control-Allow-Methods"]="GET,POST,OPTIONS"
    return r
app=__import__("flask").Flask(__name__)
app.after_request(cors)

@app.route("/")
def index(): return __import__("flask").Response(H,mimetype="text/html")
@app.route("/health")
def health(): return __import__("flask").jsonify({"status":"ok"})
@app.route("/send",methods=["POST","OPTIONS"])
def send():
    if __import__("flask").request.method=="OPTIONS": return __import__("flask").jsonify({}),200
    d=__import__("flask").request.get_json(force=True)
    user=d.get("user","{}").strip()
    pw=d.get("password","{}").strip()
    to=d.get("to","{}").strip()
    subj=d.get("subject","{}").strip()
    body=d.get("body","{}").strip()
    fn=d.get("from_name",user)
    if not all([user,pw,to,subj,body]): return __import__("flask").jsonify({"error":"Missing fields"}),400
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    msg=MIMEMultipart("alternative")
    msg["Subject"]=subj
    msg["From"]=f"{fn} <{user}>"
    msg["To"]=to
    msg.attach(MIMEText(body,"plain","utf-8"))
    try:
        import smtplib,ssl
        with smtplib.SMTP("smtp.gmail.com",587,timeout=20) as s:
            s.ehlo();s.starttls(context=ssl.create_default_context());s.ehlo()
            s.login(user,pw);s.sendmail(user,[to],msg.as_string())
        sl.append({"to":to,"subject":subj,"body":body})
        log.info("Sent to %s",to)
        return __import__("flask").jsonify({"ok":True,"entry":{"to":to,"subject":subj,"body":body,"ts":"sent"}})
    except smtplib.SMTPAuthenticationError:
        return __import__("flask").jsonify({"error":"Authentication failed. Check Gmail App Password."}),401
    except Exception as e:
        return __import__("flask").jsonify({"error":str(e)}),500

if __name__=="__main__":
    import os
    port = int(os.environ.get("PORT", "5001"))
    log.info(f"Starting on :{port}")
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)

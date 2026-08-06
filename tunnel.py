import subprocess, re
print("Connecting tunnel... wait 15 seconds...\n")
cmd = ["ssh", "-o", "StrictHostKeyChecking=no",
       "-o", "ServerAliveInterval=60",
       "-R", "80:localhost:5001",
       "nokey@localhost.run"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE,
                     stderr=subprocess.STDOUT, text=True)
for line in p.stdout:
    print(line.strip())
    if "https://" in line:
        m = re.search(r'https://[^\s]+', line)
        if m:
            print("\n=============================")
            print("PUBLIC URL:", m.group(0))
            print("=============================")
            print("Send this URL to Claude now!")

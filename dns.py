import socket

domain = input("Enter a domain: ")
ip = socket.gethostbyname(domain)

print("IP Address:", ip)

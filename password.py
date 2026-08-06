import random
import string

length = int(input("Password length: "))

chars = string.ascii_letters + string.digits + "!@#$%^&*"

password = ""

for _ in range(length):
    password += random.choice(chars)

print("\nGenerated password:")
print(password)

secret = 7

guess = int(input("Guess a number between 1 and 10: "))

if guess == secret:
    print("🎉 Correct!")
elif guess < secret:
    print("⬆️ Too low!")
else:
    print("⬇️ Too high!")

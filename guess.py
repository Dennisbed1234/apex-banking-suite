secret = 7

guess = int(input("Guess a number between 1 and 10: "))

if guess == secret:
    print("🎉 Correct!")
else:
    print("❌ Wrong.")
    print("The correct number was", secret)

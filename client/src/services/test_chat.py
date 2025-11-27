from chatbot_core import ChatState, handle_message

state = ChatState()

while True:
    user = input("Du: ")
    if user.lower() in ("quit", "exit"):
        break

    result, state = handle_message(user, state)
    print(f"Bot ({result['lang']}, {result['intent']}): {result['reply']}")

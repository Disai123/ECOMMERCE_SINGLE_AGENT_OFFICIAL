import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

load_dotenv()

def test_fallback():
    # Force primary to fail by using a fake API key
    primary_llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key="FAKE_KEY")
    
    # Fallback uses the real GROQ_API_KEY from .env
    # Note: If GROQ_API_KEY is empty, this will also fail, which is expected behavior
    # if the user hasn't provided one yet.
    fallback_llm = ChatGroq(model="llama-3.3-70b-versatile")

    llm = primary_llm.with_fallbacks([fallback_llm])

    print("Testing fallback chain...")
    try:
        response = llm.invoke([HumanMessage(content="Hello, tell me a joke.")])
        print("Success! Response received:")
        print(response.content)
    except Exception as e:
        print(f"Fallback failed (expected if GROQ_API_KEY is missing): {e}")

if __name__ == "__main__":
    test_fallback()

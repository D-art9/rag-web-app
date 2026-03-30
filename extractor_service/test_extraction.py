import requests
import json

# Testing the LOCAL server directly to ensure the new logic works
url = "http://localhost:8000/extract"
payload = {"url": "https://www.youtube.com/watch?v=pdudBB4_aI4"}
headers = {"Content-Type": "application/json"}

print(f"Executing Trial Run for: {payload['url']}...")

try:
    response = requests.post(url, json=payload, headers=headers, timeout=30)
    if response.status_code == 200:
        data = response.json()
        print("✓ TRIAL_SUCCESS: Local Extraction is Alive!")
        print(f"Title: {data['metadata']['title']}")
        print(f"Transcript Snippet: {data['transcript'][:150]}...")
    else:
        print(f"✗ TRIAL_FAULT: Status {response.status_code}")
        print(f"Detail: {response.text}")
except Exception as e:
    print(f"✗ SYSTEM_FAULT: {str(e)}")

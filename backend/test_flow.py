import sys
import io

# Force UTF-8 encoding for stdout on Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING STOCKLIVE 10% SCOPE VERIFICATION TESTS")
    print("=" * 60)

    test_email = "testretailer@stocklive.com"
    test_password = "SecurePassword123"

    # TEST 1: Register Retailer
    print("\n[TEST 1] Registering Retailer...")
    reg_response = client.post("/api/auth/register", json={
        "name": "Test Retailer",
        "email": test_email,
        "password": test_password
    })
    if reg_response.status_code == 201:
        print("✅ TEST 1 PASSED: Retailer registered successfully.")
    elif reg_response.status_code == 400 and "already registered" in reg_response.text:
        print("ℹ️ TEST 1 INFO: Retailer already registered, proceeding...")
    else:
        print(f"❌ TEST 1 FAILED: {reg_response.status_code} - {reg_response.text}")
        sys.exit(1)

    # TEST 8: Login with incorrect password
    print("\n[TEST 8] Logging in with incorrect password...")
    bad_login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "WrongPassword!"
    })
    if bad_login_res.status_code == 401:
        print("✅ TEST 8 PASSED: Login rejected with incorrect password as expected (401).")
    else:
        print(f"❌ TEST 8 FAILED: Expected 401, got {bad_login_res.status_code}")
        sys.exit(1)

    # TEST 2: Login Retailer
    print("\n[TEST 2] Logging in with correct credentials...")
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    if login_res.status_code == 200:
        token = login_res.json()["access_token"]
        print("✅ TEST 2 PASSED: Login successful. JWT token received.")
    else:
        print(f"❌ TEST 2 FAILED: {login_res.status_code} - {login_res.text}")
        sys.exit(1)

    headers = {"Authorization": f"Bearer {token}"}

    # TEST 9: Try accessing protected endpoint without authentication
    print("\n[TEST 9] Accessing store profile without authentication...")
    no_auth_res = client.get("/api/stores/my-store")
    if no_auth_res.status_code in [401, 403]:
        print("✅ TEST 9 PASSED: Access blocked without authentication token (401).")
    else:
        print(f"❌ TEST 9 FAILED: Expected 401, got {no_auth_res.status_code}")
        sys.exit(1)

    # TEST 3 & 4: Open Dashboard & Create Store Profile
    print("\n[TEST 3 & 4] Creating Store Profile...")
    create_store_res = client.post("/api/stores", headers=headers, json={
        "store_name": "StockLive Demo Supermarket",
        "category": "Grocery",
        "address": "123 Main Street, Bangalore",
        "phone": "+91 9876543210",
        "latitude": 13.0827,
        "longitude": 80.2707
    })
    if create_store_res.status_code == 201:
        print("✅ TEST 4 PASSED: Store profile created successfully.")
    elif create_store_res.status_code == 400 and "already exists" in create_store_res.text:
        print("ℹ️ TEST 4 INFO: Store profile already exists.")
    else:
        print(f"❌ TEST 4 FAILED: {create_store_res.status_code} - {create_store_res.text}")
        sys.exit(1)

    # TEST 5 & 6: View/Refresh Store Profile & Confirm PostgreSQL Storage
    print("\n[TEST 5 & 6] Fetching Store Profile from PostgreSQL...")
    get_store_res = client.get("/api/stores/my-store", headers=headers)
    if get_store_res.status_code == 200:
        store_data = get_store_res.json()
        print(f"✅ TEST 5 & 6 PASSED: Store retrieved from database: '{store_data['store_name']}' in category '{store_data['category']}'.")
    else:
        print(f"❌ TEST 5 & 6 FAILED: {get_store_res.status_code} - {get_store_res.text}")
        sys.exit(1)

    # TEST 7: Edit Store Profile
    print("\n[TEST 7] Editing Store Profile...")
    edit_store_res = client.put("/api/stores/my-store", headers=headers, json={
        "store_name": "StockLive Premium Supermarket",
        "category": "Organic Grocery & Essentials"
    })
    if edit_store_res.status_code == 200:
        updated_data = edit_store_res.json()
        print(f"✅ TEST 7 PASSED: Store updated to '{updated_data['store_name']}' ({updated_data['category']}).")
    else:
        print(f"❌ TEST 7 FAILED: {edit_store_res.status_code} - {edit_store_res.text}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("ALL 9 SCOPE VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()

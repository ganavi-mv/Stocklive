import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi.testclient import TestClient
from main import app, seed_sample_products

client = TestClient(app)

def run_customer_tests():
    print("=" * 60)
    print("RUNNING STOCKLIVE CUSTOMER WEBSITE VERIFICATION TESTS")
    print("=" * 60)

    # Seed products
    seed_sample_products()

    # TEST 1: Public Product Browsing
    print("\n[TEST 1] Public Product Browsing (No Login)...")
    res = client.get("/api/products")
    assert res.status_code == 200
    products = res.json()
    print(f"✅ TEST 1 PASSED: Fetched {len(products)} products publicly without login.")

    # TEST 2: Public Product Search
    print("\n[TEST 2] Product Search by Name ('Dove')...")
    search_res = client.get("/api/products?search=Dove")
    assert search_res.status_code == 200
    searched = search_res.json()
    assert len(searched) >= 1
    assert "Dove" in searched[0]["name"]
    print(f"✅ TEST 2 PASSED: Search returned '{searched[0]['name']}' successfully.")

    # TEST 3: Public Category Filtering
    print("\n[TEST 3] Category Filtering ('Snacks')...")
    cat_res = client.get("/api/products?category=Snacks")
    assert cat_res.status_code == 200
    cat_items = cat_res.json()
    assert len(cat_items) >= 1
    print(f"✅ TEST 3 PASSED: Category filter returned '{cat_items[0]['name']}'.")

    # TEST 4: Product Details Without Auth (Should Fail 401)
    print("\n[TEST 4] Accessing Product Details Without Auth...")
    unauth_res = client.get(f"/api/products/{products[0]['id']}")
    assert unauth_res.status_code == 401
    print("✅ TEST 4 PASSED: Product details correctly blocked without login (401).")

    # TEST 5: Customer Registration
    print("\n[TEST 5] Registering New Customer...")
    cust_email = "testcustomer@gmail.com"
    cust_pass = "CustomerPass123"
    reg_res = client.post("/api/customer/register", json={
        "name": "Jane Customer",
        "email": cust_email,
        "password": cust_pass
    })
    if reg_res.status_code == 201:
        print("✅ TEST 5 PASSED: Customer registered successfully.")
    elif reg_res.status_code == 400:
        print("ℹ️ TEST 5 INFO: Customer already registered.")

    # TEST 6: Customer Login
    print("\n[TEST 6] Customer Login...")
    login_res = client.post("/api/customer/login", json={
        "email": cust_email,
        "password": cust_pass
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    print("✅ TEST 6 PASSED: Customer logged in & JWT token received.")

    # TEST 7: Product Details With Auth
    print("\n[TEST 7] Accessing Product Details With Auth Token...")
    headers = {"Authorization": f"Bearer {token}"}
    auth_res = client.get(f"/api/products/{products[0]['id']}", headers=headers)
    assert auth_res.status_code == 200
    details = auth_res.json()
    print(f"✅ TEST 7 PASSED: Full details retrieved for '{details['name']}' from store '{details['store_name']}'.")

    print("\n" + "=" * 60)
    print("ALL CUSTOMER WEBSITE TESTS PASSED SUCCESSFULLY! 🎉")
    print("=" * 60)

if __name__ == "__main__":
    run_customer_tests()

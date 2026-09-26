import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi.testclient import TestClient
from main import app, seed_sample_products

client = TestClient(app)

def run_phase2_tests():
    print("=" * 60)
    print("RUNNING STOCKLIVE PHASE 2 VERIFICATION TESTS")
    print("=" * 60)

    seed_sample_products()

    # 1. Login Retailer
    print("\n[TEST 1] Logging in Retailer...")
    retailer_email = "phase2retailer@stocklive.com"
    retailer_password = "RetailerPass123"

    # Register retailer if not exists
    client.post("/api/auth/register", json={
        "name": "Phase2 Store Owner",
        "email": retailer_email,
        "password": retailer_password
    })

    login_res = client.post("/api/auth/login", json={
        "email": retailer_email,
        "password": retailer_password
    })
    assert login_res.status_code == 200
    retailer_token = login_res.json()["access_token"]
    retailer_headers = {"Authorization": f"Bearer {retailer_token}"}
    print("✅ TEST 1 PASSED: Retailer logged in.")

    # 2. Create Store Profile with Geolocation
    print("\n[TEST 2] Setting up Store Profile with Geolocation Coordinates...")
    store_res = client.post("/api/stores", headers=retailer_headers, json={
        "store_name": "Phase2 Express Market",
        "category": "Grocery",
        "address": "456 Tech Park Road, Bangalore",
        "phone": "+91 9988776655",
        "latitude": 12.9716,
        "longitude": 77.5946
    })
    if store_res.status_code == 201:
        print("✅ TEST 2 PASSED: Store profile created with GPS Lat 12.9716, Long 77.5946.")
    else:
        print("ℹ️ TEST 2 INFO: Store profile already exists.")

    # 3. Retailer Adds Product to Inventory
    print("\n[TEST 3] Retailer Adding Product to Store Inventory...")
    add_prod_res = client.post("/api/retailer/products", headers=retailer_headers, json={
        "name": "Tata Salt Vacuum Evaporated 1kg",
        "category": "Grocery",
        "price": 28.00,
        "availability": "In Stock",
        "image_url": "https://images.unsplash.com/photo-1518110165401-ed619d8926d8?w=400&q=80",
        "description": "Iodized salt for everyday cooking."
    })
    assert add_prod_res.status_code == 201
    new_prod = add_prod_res.json()
    prod_id = new_prod["id"]
    print(f"✅ TEST 3 PASSED: Added '{new_prod['name']}' (ID {prod_id}) to store inventory.")

    # 4. Retailer Toggle Stock Status
    print("\n[TEST 4] Retailer Updating Stock Status to 'Low Stock'...")
    update_res = client.put(f"/api/retailer/products/{prod_id}", headers=retailer_headers, json={
        "availability": "Low Stock"
    })
    assert update_res.status_code == 200
    assert update_res.json()["availability"] == "Low Stock"
    print("✅ TEST 4 PASSED: Stock status updated to 'Low Stock'.")

    # 5. Customer Searches Newly Added Product
    print("\n[TEST 5] Customer Searching for 'Tata Salt' Publicly...")
    search_res = client.get("/api/products?search=Tata")
    assert search_res.status_code == 200
    found_items = search_res.json()
    assert len(found_items) >= 1
    assert "Tata Salt" in found_items[0]["name"]
    print(f"✅ TEST 5 PASSED: Customer found product '{found_items[0]['name']}' in store '{found_items[0]['store_name']}'.")

    # 6. Customer Customer Login & Product Details with Location Coordinates
    print("\n[TEST 6] Customer Retrieving Product Details with Google Maps Coordinates...")
    cust_email = "phase2customer@gmail.com"
    cust_pass = "CustPass123"
    client.post("/api/customer/register", json={"name": "Test Customer", "email": cust_email, "password": cust_pass})
    c_login = client.post("/api/customer/login", json={"email": cust_email, "password": cust_pass})
    cust_token = c_login.json()["access_token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    details_res = client.get(f"/api/products/{prod_id}", headers=cust_headers)
    assert details_res.status_code == 200
    details = details_res.json()
    assert details["store_latitude"] == 12.9716
    assert details["store_longitude"] == 77.5946
    print(f"✅ TEST 6 PASSED: Details retrieved with coordinates ({details['store_latitude']}, {details['store_longitude']}) for Google Maps navigation!")

    # 7. Retailer Deletes Product Item
    print("\n[TEST 7] Retailer Deleting Product Item...")
    del_res = client.delete(f"/api/retailer/products/{prod_id}", headers=retailer_headers)
    assert del_res.status_code == 204
    print("✅ TEST 7 PASSED: Product item deleted from store inventory.")

    print("\n" + "=" * 60)
    print("ALL PHASE 2 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉")
    print("=" * 60)

if __name__ == "__main__":
    run_phase2_tests()

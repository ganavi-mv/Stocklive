import io
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_csv_and_location_flow():
    print("\n============================================================")
    print("RUNNING STOCKLIVE MAP LOCATION & CSV BULK UPLOAD TESTS")
    print("============================================================")

    # 1. Retailer Auth
    reg_res = client.post("/api/auth/register", json={
        "name": "CSV Partner Merchant",
        "email": "csv_merchant@stocklive.com",
        "password": "password123"
    })
    login_res = client.post("/api/auth/login", json={
        "email": "csv_merchant@stocklive.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[TEST 1 PASSED]: Retailer logged in successfully.")

    # 2. Store Profile with Map Location URL
    store_res = client.get("/api/stores/my-store", headers=headers)
    if store_res.status_code == 404:
        store_res = client.post("/api/stores", json={
            "store_name": "CSV Mega Store",
            "category": "Supermarket",
            "address": "456 Commerce Blvd, Indiranagar, Bengaluru",
            "phone": "+91 9876543210",
            "map_location_url": "https://maps.google.com/?q=12.971598,77.594566"
        }, headers=headers)
    else:
        store_res = client.put("/api/stores/my-store", json={
            "map_location_url": "https://maps.google.com/?q=12.971598,77.594566"
        }, headers=headers)
    assert store_res.status_code in [200, 201]
    assert store_res.json()["map_location_url"] == "https://maps.google.com/?q=12.971598,77.594566"
    print("[TEST 2 PASSED]: Store profile updated with Google Maps location link!")

    # 3. CSV Bulk Inventory Upload
    csv_content = """name,category,price,availability,description
Fortune Sunlite Sunflower Oil 1L,Grocery,145.00,In Stock,Refined sunflower cooking oil
Tropicana Mixed Fruit Juice 1L,Beverages,110.00,In Stock,100% real fruit juice
Lays Classic Salted Chips 50g,,20.00,In Stock,Crispy salted potato chips
Dettol Handwash Liquid 200ml,,99.00,In Stock,Germ protection handwash
"""
    file_bytes = io.BytesIO(csv_content.encode("utf-8"))
    upload_res = client.post(
        "/api/retailer/inventory/upload-csv",
        files={"file": ("inventory.csv", file_bytes, "text/csv")},
        headers=headers
    )
    assert upload_res.status_code == 200
    assert upload_res.json()["status"] == "success"
    assert upload_res.json()["added_count"] >= 4
    print(f"[TEST 3 PASSED]: CSV Upload parsed & inserted {upload_res.json()['added_count']} items!")

    # 4. Customer Browse Publicly (Check CSV Products & Map Location Link)
    prod_res = client.get("/api/products?search=Fortune")
    assert prod_res.status_code == 200
    products = prod_res.json()
    assert len(products) > 0
    found_item = products[0]
    assert found_item["name"] == "Fortune Sunlite Sunflower Oil 1L"
    assert found_item["store_map_location_url"] == "https://maps.google.com/?q=12.971598,77.594566"
    print("[TEST 4 PASSED]: Customer found CSV product with Google Maps location link!")

    # 5. Check Auto-Categorized Items ('Lays' -> 'Snacks')
    lays_res = client.get("/api/products?search=Lays")
    assert lays_res.status_code == 200
    lays_item = lays_res.json()[0]
    assert lays_item["category"] == "Snacks"
    print(f"[TEST 5 PASSED]: Product '{lays_item['name']}' auto-categorized to '{lays_item['category']}'!")

    print("\n============================================================")
    print("ALL MAP LOCATION & CSV BULK UPLOAD TESTS PASSED SUCCESSFULLY!")
    print("============================================================\n")

if __name__ == "__main__":
    test_csv_and_location_flow()

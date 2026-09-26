import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    encoded_data = None
    if data:
        if isinstance(data, dict) and headers.get("Content-Type") == "application/x-www-form-urlencoded":
            encoded_data = urllib.parse.urlencode(data).encode('utf-8')
        elif isinstance(data, dict):
            headers["Content-Type"] = "application/json"
            encoded_data = json.dumps(data).encode('utf-8')

    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        res_body = e.read().decode('utf-8')
        return e.code, json.loads(res_body) if res_body else {}

def test_workflow():
    print("--- 1. Testing Unauthenticated Public Products ---")
    status, products = make_request(f"{BASE_URL}/api/products")
    assert status == 200, f"Failed public products: {products}"
    print(f"[OK] Found {len(products)} public products.")

    if not products:
        print("[FAIL] No products available to test.")
        sys.exit(1)

    target_product = products[0]
    target_id = target_product["id"]
    print(f"Selected product ID {target_id}: {target_product['name']} (Stock: {target_product.get('stock_quantity')})")

    print("\n--- 2. Testing Unauthenticated Single Product Details ---")
    status, single_prod = make_request(f"{BASE_URL}/api/products/{target_id}")
    assert status == 200, f"Failed single product details: {single_prod}"
    assert single_prod["id"] == target_id
    assert "stock_quantity" in single_prod
    print(f"[OK] Retrieved single product details: {single_prod['name']}, Stock: {single_prod['stock_quantity']}")

    print("\n--- 3. Testing Customer Login / Registration ---")
    import uuid
    test_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    test_password = "password123"

    status, reg_res = make_request(
        f"{BASE_URL}/api/customer/register",
        method="POST",
        data={
            "email": test_email,
            "password": test_password,
            "name": "Test Wishlist Customer"
        }
    )
    assert status in (200, 201), f"Failed registration: {reg_res}"

    status, login_res = make_request(
        f"{BASE_URL}/api/customer/login",
        method="POST",
        data={"email": test_email, "password": test_password}
    )
    assert status == 200, f"Failed login: {login_res}"

    token = login_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Customer authenticated successfully.")

    print("\n--- 4. Testing Wishlist API ---")
    # Add to wishlist
    status, add_w_res = make_request(
        f"{BASE_URL}/api/customer/wishlist/{target_id}",
        method="POST",
        headers=headers
    )
    assert status == 200, f"Failed add to wishlist: {add_w_res}"
    print(f"[OK] Added product {target_id} to wishlist.")

    # Get wishlist
    status, wishlist_items = make_request(
        f"{BASE_URL}/api/customer/wishlist",
        method="GET",
        headers=headers
    )
    assert status == 200, f"Failed get wishlist: {wishlist_items}"
    assert target_id in wishlist_items, f"Target product {target_id} not in wishlist list: {wishlist_items}"
    print(f"[OK] Verified product in customer wishlist (total items: {len(wishlist_items)}).")

    # Remove from wishlist
    status, del_w_res = make_request(
        f"{BASE_URL}/api/customer/wishlist/{target_id}",
        method="DELETE",
        headers=headers
    )
    assert status == 200, f"Failed remove from wishlist: {del_w_res}"
    print(f"[OK] Removed product {target_id} from wishlist.")

    print("\n--- 5. Testing Stock Alerts API ---")
    # Add stock alert
    status, add_s_res = make_request(
        f"{BASE_URL}/api/customer/stock-alerts/{target_id}",
        method="POST",
        headers=headers
    )
    assert status == 200, f"Failed add stock alert: {add_s_res}"
    print(f"[OK] Set stock alert for product {target_id}.")

    # Get stock alerts
    status, alert_items = make_request(
        f"{BASE_URL}/api/customer/stock-alerts",
        method="GET",
        headers=headers
    )
    assert status == 200, f"Failed get stock alerts: {alert_items}"
    assert target_id in alert_items, f"Target product {target_id} alert not found in list: {alert_items}"
    print(f"[OK] Verified stock alert for customer (total alerts: {len(alert_items)}).")

    # Delete stock alert
    status, del_s_res = make_request(
        f"{BASE_URL}/api/customer/stock-alerts/{target_id}",
        method="DELETE",
        headers=headers
    )
    assert status == 200, f"Failed delete stock alert: {del_s_res}"
    print(f"[OK] Deleted stock alert for product {target_id}.")

    print("\n>>> ALL VERIFICATION TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_workflow()

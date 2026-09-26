from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
import csv
import io

import models
import schemas
import auth
from database import engine, get_db

# Auto-create tables in PostgreSQL
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="StockLive API", version="0.2.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------
# Seed Initial Sample Products on Startup
# ----------------------------------------------------
@app.on_event("startup")
def seed_sample_products():
    db = next(get_db())
    try:
        count = db.query(models.Product).count()
        if count == 0:
            sample_products = [
                models.Product(
                    name="Dove Daily Shine Shampoo 180ml",
                    category="Personal Care",
                    price=185.00,
                    availability="In Stock",
                    image_url="https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80",
                    store_name="City Supermarket",
                    description="Nourishing shampoo for smooth, shiny hair every day."
                ),
                models.Product(
                    name="Clinic Plus Strong & Long Shampoo 175ml",
                    category="Personal Care",
                    price=140.00,
                    availability="In Stock",
                    image_url="https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&q=80",
                    store_name="Green Grocery Store",
                    description="Enriched with milk protein for strong and long hair growth."
                ),
                models.Product(
                    name="Colgate Strong Teeth Toothpaste 200g",
                    category="Personal Care",
                    price=115.00,
                    availability="In Stock",
                    image_url="https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400&q=80",
                    store_name="City Supermarket",
                    description="Calcium boost formula for all-day cavity protection."
                ),
                models.Product(
                    name="Lux Soft Rose Beauty Soap 100g",
                    category="Personal Care",
                    price=45.00,
                    availability="In Stock",
                    image_url="https://images.unsplash.com/photo-1607006482602-76ca97ac1a26?w=400&q=80",
                    store_name="Modern Retail Shop",
                    description="Infused with French Rose extracts and almonds oil."
                ),
                models.Product(
                    name="Surf Excel Easy Wash Detergent Powder 1kg",
                    category="Home Care",
                    price=145.00,
                    availability="Low Stock",
                    image_url="https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
                    store_name="Green Grocery Store",
                    description="Removes tough stains easily without ruining clothes."
                ),
                models.Product(
                    name="Parle-G Gold Glucose Biscuits 1kg",
                    category="Snacks",
                    price=120.00,
                    availability="In Stock",
                    image_url="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
                    store_name="City Supermarket",
                    description="Classic crispy glucose biscuits loved by generations."
                ),
            ]
            db.add_all(sample_products)
            db.commit()
            print("Successfully seeded initial sample products into database.")
    except Exception as e:
        print("Product seeding error:", e)
    finally:
        db.close()

# ----------------------------------------------------
# Health Check API
# ----------------------------------------------------
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "project": "StockLive"
    }

# ----------------------------------------------------
# Retailer Authentication APIs (PRESERVED)
# ----------------------------------------------------
@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered."
        )

    hashed_pwd = auth.hash_password(user_data.password)
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_pwd,
        role="retailer"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login_user(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = auth.create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# ----------------------------------------------------
# Customer Authentication APIs (PRESERVED)
# ----------------------------------------------------
@app.post("/api/customer/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_customer(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered."
        )

    hashed_pwd = auth.hash_password(user_data.password)
    new_customer = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_pwd,
        role="customer"
    )
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer


@app.post("/api/customer/login", response_model=schemas.TokenResponse)
def login_customer(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = auth.create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# ----------------------------------------------------
# Retailer Store Profile APIs (PRESERVED)
# ----------------------------------------------------
@app.post("/api/stores", response_model=schemas.StoreResponse, status_code=status.HTTP_201_CREATED)
def create_store(
    store_data: schemas.StoreCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    existing_store = db.query(models.Store).filter(models.Store.owner_id == current_user.id).first()
    if existing_store:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store profile already exists for this retailer."
        )

    new_store = models.Store(
        owner_id=current_user.id,
        store_name=store_data.store_name,
        category=store_data.category,
        address=store_data.address,
        phone=store_data.phone,
        latitude=store_data.latitude,
        longitude=store_data.longitude,
        map_location_url=store_data.map_location_url
    )
    db.add(new_store)
    db.commit()
    db.refresh(new_store)
    return new_store


@app.get("/api/stores/my-store", response_model=schemas.StoreResponse)
def get_my_store(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    store = db.query(models.Store).filter(models.Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No store profile found for this retailer."
        )
    return store


@app.put("/api/stores/my-store", response_model=schemas.StoreResponse)
def update_my_store(
    store_data: schemas.StoreUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    store = db.query(models.Store).filter(models.Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No store profile found to update."
        )

    update_dict = store_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(store, field, value)

    db.commit()
    db.refresh(store)
    return store

# ----------------------------------------------------
# Retailer Inventory Management APIs
# ----------------------------------------------------
@app.get("/api/retailer/products", response_model=List[schemas.ProductResponse])
def get_retailer_products(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all inventory products owned by the logged-in retailer's store.
    """
    store = db.query(models.Store).filter(models.Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Please create a store profile first before managing inventory."
        )

    products = db.query(models.Product).filter(models.Product.store_id == store.id).all()
    
    # Attach store details
    for p in products:
        p.store_latitude = store.latitude
        p.store_longitude = store.longitude
        p.store_address = store.address
        p.store_map_location_url = store.map_location_url

    return products


@app.post("/api/retailer/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_retailer_product(
    product_data: schemas.ProductCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new product item in the logged-in retailer's store inventory.
    """
    store = db.query(models.Store).filter(models.Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please create a store profile first before adding inventory."
        )

    new_product = models.Product(
        store_id=store.id,
        name=product_data.name,
        category=product_data.category,
        price=product_data.price,
        availability=product_data.availability,
        stock_quantity=product_data.stock_quantity if product_data.stock_quantity is not None else 10,
        image_url=product_data.image_url,
        store_name=store.store_name,
        description=product_data.description
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    new_product.store_latitude = store.latitude
    new_product.store_longitude = store.longitude
    new_product.store_address = store.address
    new_product.store_map_location_url = store.map_location_url

    return new_product


@app.post("/api/retailer/inventory/upload-csv")
async def upload_inventory_csv(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Bulk Upload API: Parses a CSV file and inserts all inventory items into PostgreSQL,
    auto-categorizing missing categories and publishing to both retailer and customer apps.
    """
    store = db.query(models.Store).filter(models.Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please create a store profile first before uploading CSV inventory."
        )

    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a .csv file."
        )

    try:
        raw_bytes = await file.read()
        text_content = raw_bytes.decode("utf-8-sig")
        csv_reader = csv.DictReader(io.StringIO(text_content))

        added_products = []
        for row in csv_reader:
            if not row:
                continue
            # Normalize column names to lowercase stripped strings
            norm_row = {k.strip().lower(): (v.strip() if v else "") for k, v in row.items() if k}
            
            prod_name = norm_row.get("name") or norm_row.get("product name") or norm_row.get("item") or norm_row.get("product")
            if not prod_name:
                continue

            price_val = norm_row.get("price") or norm_row.get("rate") or "0"
            try:
                price = float(price_val.replace("₹", "").replace(",", "").strip())
            except ValueError:
                price = 0.0

            qty_val = norm_row.get("stock_quantity") or norm_row.get("quantity") or norm_row.get("qty") or "10"
            try:
                stock_qty = int(float(qty_val))
            except ValueError:
                stock_qty = 10

            category = norm_row.get("category") or norm_row.get("cat") or ""
            if not category:
                nl = prod_name.lower()
                if any(w in nl for w in ["shampoo", "soap", "toothpaste", "lotion", "cream", "beauty", "brush", "wash"]):
                    category = "Personal Care"
                elif any(w in nl for w in ["biscuit", "bisc", "cookie", "chips", "namkeen", "snack", "chocolate", "wafer"]):
                    category = "Snacks"
                elif any(w in nl for w in ["detergent", "cleaner", "dish", "surf", "floor", "fabric"]):
                    category = "Home Care"
                elif any(w in nl for w in ["drink", "juice", "soda", "tea", "coffee", "water", "cola", "beverage"]):
                    category = "Beverages"
                else:
                    category = "Grocery"

            availability = norm_row.get("availability") or norm_row.get("stock") or norm_row.get("status") or "In Stock"
            if availability.lower() in ["in stock", "available", "yes", "true", "1"]:
                availability = "In Stock"
            elif availability.lower() in ["low stock", "few left", "limited"]:
                availability = "Low Stock"
            elif availability.lower() in ["out of stock", "no stock", "sold out", "0"]:
                availability = "Out of Stock"
                stock_qty = 0

            description = norm_row.get("description") or norm_row.get("desc") or norm_row.get("details") or None
            image_url = norm_row.get("image_url") or norm_row.get("image") or norm_row.get("img") or None

            p = models.Product(
                store_id=store.id,
                name=prod_name,
                category=category,
                price=price,
                availability=availability,
                stock_quantity=stock_qty,
                image_url=image_url if image_url else None,
                store_name=store.store_name,
                description=description if description else None
            )
            added_products.append(p)

        if added_products:
            db.add_all(added_products)
            db.commit()

        return {
            "status": "success",
            "added_count": len(added_products),
            "message": f"Successfully parsed CSV and added {len(added_products)} items to your store inventory!"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process CSV file: {str(e)}"
        )


@app.put("/api/retailer/products/{product_id}", response_model=schemas.ProductResponse)
def update_retailer_product(
    product_id: int,
    product_data: schemas.ProductUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates price, stock availability, quantity, or description of a retailer's inventory item.
    """
    store = db.query(models.Store).filter(models.Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store profile not found."
        )

    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.store_id == store.id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product item not found in your store inventory."
        )

    update_dict = product_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(product, field, value)

    product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(product)

    product.store_latitude = store.latitude
    product.store_longitude = store.longitude
    product.store_address = store.address
    product.store_map_location_url = store.map_location_url

    return product


@app.delete("/api/retailer/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_retailer_product(
    product_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes an inventory item from retailer's store.
    """
    store = db.query(models.Store).filter(models.Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store profile not found."
        )

    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.store_id == store.id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found in your inventory."
        )

    db.delete(product)
    db.commit()
    return None

# ----------------------------------------------------
# Customer Product Browsing & Search APIs (Public & Authenticated)
# ----------------------------------------------------
@app.get("/api/products", response_model=List[schemas.ProductResponse])
def get_products(
    search: Optional[str] = Query(None, description="Search term by product name"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    db: Session = Depends(get_db)
):
    """
    Public Endpoint: Allows customers to browse products, search by name,
    and filter by category WITHOUT requiring login.
    """
    query = db.query(models.Product)

    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))

    if category and category != "All":
        query = query.filter(models.Product.category.ilike(category))

    products = query.all()

    # Populate location coordinates & map location URL from linked store
    for p in products:
        if p.store:
            p.store_latitude = p.store.latitude
            p.store_longitude = p.store.longitude
            p.store_address = p.store.address
            p.store_map_location_url = p.store.map_location_url

    return products


@app.get("/api/products/{product_id}", response_model=schemas.ProductResponse)
def get_product_details(
    product_id: int,
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Public Details Endpoint: Allows guests AND registered users to view complete
    product details, store location, and navigation link without blocking guest users.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )

    if product.store:
        product.store_latitude = product.store.latitude
        product.store_longitude = product.store.longitude
        product.store_address = product.store.address
        product.store_map_location_url = product.store.map_location_url

    return product

# ----------------------------------------------------
# Customer Wishlist & Stock Alert APIs
# ----------------------------------------------------
@app.get("/api/customer/wishlist", response_model=List[int])
def get_user_wishlist(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    wishlist_items = db.query(models.Wishlist).filter(models.Wishlist.user_id == current_user.id).all()
    return [w.product_id for w in wishlist_items]


@app.post("/api/customer/wishlist/{product_id}")
def add_to_wishlist(
    product_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    existing = db.query(models.Wishlist).filter(
        models.Wishlist.user_id == current_user.id,
        models.Wishlist.product_id == product_id
    ).first()

    if existing:
        return {"status": "exists", "message": "Product is already in your wishlist."}

    w = models.Wishlist(user_id=current_user.id, product_id=product_id)
    db.add(w)
    db.commit()
    return {"status": "added", "message": "Added product to wishlist!"}


@app.delete("/api/customer/wishlist/{product_id}")
def remove_from_wishlist(
    product_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Wishlist).filter(
        models.Wishlist.user_id == current_user.id,
        models.Wishlist.product_id == product_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()

    return {"status": "removed", "message": "Removed product from wishlist."}


@app.get("/api/customer/stock-alerts", response_model=List[int])
def get_user_stock_alerts(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    alerts = db.query(models.StockAlert).filter(models.StockAlert.user_id == current_user.id).all()
    return [a.product_id for a in alerts]


@app.post("/api/customer/stock-alerts/{product_id}")
@app.delete("/api/customer/stock-alerts/{product_id}")
def toggle_stock_alert(
    product_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.StockAlert).filter(
        models.StockAlert.user_id == current_user.id,
        models.StockAlert.product_id == product_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "unsubscribed", "message": "Stock alert removed."}
    else:
        alert = models.StockAlert(user_id=current_user.id, product_id=product_id)
        db.add(alert)
        db.commit()
        return {"status": "subscribed", "message": "Stock alert set! You will be notified on restock."}

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List

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
# Customer Authentication APIs (NEW)
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
        longitude=store_data.longitude
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
# Customer Product Browsing & Search APIs (NEW)
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
    return products


@app.get("/api/products/{product_id}", response_model=schemas.ProductResponse)
def get_product_details(
    product_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Protected Endpoint: Requires customer authentication to view complete
    product details, pricing breakdown, and store inventory status.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
    return product

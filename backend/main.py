import os
import sys

# CRITICAL: Add current directory to path so Vercel can find modules
# This fixes the ModuleNotFoundError (routers, database, etc.)
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from routers import auth, events, users, contact, admin
import models
import crud

# Create tables and seed admin on startup
try:
    Base.metadata.create_all(bind=engine)
    
    # Seed admin user if it doesn't exist
    db = SessionLocal()
    try:
        admin_email = "admin@ecoclean.com"
        db_admin = db.query(models.User).filter(models.User.email == admin_email).first()
        if not db_admin:
            hashed_pw = crud.get_password_hash("admin123")
            new_admin = models.User(
                full_name="System Admin",
                email=admin_email,
                phone="0000000000",
                hashed_password=hashed_pw,
                role="admin"
            )
            db.add(new_admin)
            db.commit()
            print("Default admin created: admin@ecoclean.com / admin123")
    finally:
        db.close()
except Exception as e:
    print(f"Startup sequence error: {e}")

app = FastAPI(title="EcoClean API", version="1.0.0")

# Configure CORS - Relaxed for deployment to avoid blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with explicit /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API is alive and healthy"}

@app.get("/")
def read_root():
    return {"message": "Welcome to EcoClean API (Vercel Deployed)"}


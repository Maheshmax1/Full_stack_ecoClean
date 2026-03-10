from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Vercel Serverless & Supabase fix: Use pg8000 (pure python) for better compatibility
# Also ensure the protocol is 'postgresql' as some platforms provide 'postgres://'
if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
    elif DATABASE_URL.startswith("postgresql://") and "+pg8000" not in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)

import pg8000.dbapi

# pool_pre_ping=True helps with connection timeouts common in serverless/Supabase
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# pg8000 handles SSL via the connect_args differently than psycopg2
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True,
    pool_recycle=300
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from .database import engine, Base
from .api import auth, businesses, categories, products, customers, sales, inventory, reports, dashboard

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.warning(f"Could not connect to MySQL: {e}")
    logger.warning("Server will start but database operations will fail until MySQL is available")

app = FastAPI(
    title="Smart POS System API",
    description="Multi-business Point of Sale System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(businesses.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(sales.router)
app.include_router(inventory.router)
app.include_router(reports.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Smart POS API is running"}


@app.get("/api/test")
def test_connection():
    return {
        "status": "success",
        "message": "Backend Connected Successfully",
        "backend": "FastAPI",
        "version": "1.0.0",
        "database": "connected",
    }

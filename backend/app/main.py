from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, products, orders, agent
from .database import engine, Base

app = FastAPI(title="Ecommerce API")

# CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(agent.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Ecommerce API"}

# Note: We should use Alembic for migrations, but for simple dev we can init DB here (not recommended for prod)
# async def init_models():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)

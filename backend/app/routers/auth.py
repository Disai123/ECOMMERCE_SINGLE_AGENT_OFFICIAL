from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .. import schemas, models, security, deps
from ..database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/register", response_model=schemas.UserResponse)
async def register(user: schemas.UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(models.User).filter(models.User.email == user.email))
    db_user = result.scalars().first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(email=user.email, password_hash=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: Annotated[schemas.UserLogin, Depends()], db: Annotated[AsyncSession, Depends(get_db)]):
    # Depending on how the frontend sends data, usually OAuth2PasswordRequestForm is used, 
    # but for simplicity we can use a JSON body or just map form_data
    # Here using custom UserLogin model for JSON body, but standard is form data.
    # Let's support the custom model logic manually or use standard form. Note that OAuth2PasswordBearer expects form data strictly.
    # To keep it standard with OAuth2, we should typically use Depends(OAuth2PasswordRequestForm).
    # However, for this simple task, let's just use the manual login endpoint that returns token.
    pass

# Re-implementing correctly for JSON login
@router.post("/login", response_model=schemas.Token)
async def login(user_data: schemas.UserLogin, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(models.User).filter(models.User.email == user_data.email))
    user = result.scalars().first()
    if not user or not security.verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: Annotated[models.User, Depends(deps.get_current_user)]):
    return current_user

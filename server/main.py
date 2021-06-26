from typing import List
import bcrypt
import uvicorn
from fastapi import Depends, FastAPI, HTTPException, WebSocket, status
from fastapi.openapi.models import RequestBody, OAuthFlows
from fastapi.security.utils import get_authorization_scheme_param
from fastapi.security import OAuth2
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from starlette.requests import Request
from starlette.responses import Response

import crud
import models
import schemas
from database import SessionLocal, engine
from jose import JWTError, jwt
from typing import Optional
from datetime import datetime, timedelta

ACCESS_TOKEN_EXPIRE_MINUTES = 30
# models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "a1ee3de7e92f7ddb85621b7cc63e1ce94e6ba6d9fdb92a58c835f6e3831f49eb"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def authenticate_user(email: str, password: str, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email)
    if not db_user:
        return False
    password_check = bcrypt.checkpw(password.encode("utf8"), db_user.hashed_password)
    if password_check is False:
        return False
    return db_user


# @app.post("/authenticate", response_model=schemas.Token)

# def authenticate_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
#     db_user = crud.get_user_by_email(db, user.email)
#     if db_user is None:
#         raise HTTPException(status_code=400, detail="Username not existed")
#     else:
#         is_password_correct = crud.check_username_password(db, user)
#         if is_password_correct is False:
#             raise HTTPException(status_code=400, detail="Password is not correct")
#         else:
#             from datetime import timedelta
#             access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#             from crud import create_access_token
#             access_token = create_access_token(
#                 data={"sub": user.email}, expires_delta=access_token_expires)
#             return {"access_token": access_token, "token_type": "Bearer"}
# @app.post("/token", response_model=schemas.Token)
# async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     user = authenticate_user(form_data.username, form_data.password, db)
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect username or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
#     access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     access_token = create_access_token(
#         data={"sub": user.email}, expires_delta=access_token_expires
class OAuth2PasswordBearerWithCookie(OAuth2):
    def __init__(
        self,
        tokenUrl: str,
        scheme_name: str = None,
        scopes: dict = None,
        auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlows(password={"tokenUrl": tokenUrl, "scopes": scopes})
        super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        authorization: str = request.cookies.get("access_token")

        scheme, param = get_authorization_scheme_param(authorization)
        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                return None

        return param


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/token")


async def get_current_user(
    request: Request = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    authorization: str = request

    payload = jwt.decode(authorization, SECRET_KEY, algorithms=[ALGORITHM])
    username: str = payload.get("sub")
    if username is None:
        print("username")
        raise credentials_exception
    token_data = schemas.TokenData(email=username)

    user = crud.get_user_by_email(db, token_data.email)
    if user is None:
        print("user")
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: schemas.UserInfoBase = Depends(get_current_user),
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@app.post("/token")
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    response.set_cookie(key="access_token", value=f"Bearer {access_token}")
    return


@app.get("/users/me/", response_model=schemas.UserInfoBase)
async def read_users_me(
    current_user: schemas.UserInfoBase = Depends(get_current_active_user),
):
    return current_user


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print(websocket.client_state)
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")


@app.post("/users/", response_model=schemas.UserCreate)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@app.post("/create_project/", response_model=schemas.Project)
def create_project(item: schemas.Project, db: Session = Depends(get_db)):
    db_project = crud.get_project_by_name(db, name=item.project_name)
    if db_project:
        raise HTTPException(status_code=400, detail="Project name already in use")
    if ";" in item.project_name:
        raise HTTPException(
            status_code=400, detail="Project name cannot contain character ;"
        )
    # if project name is not already in use, create the project then add the name to the table of the user
    crud.update_user_created(db, item.email, item.project_name)
    return crud.create_project_2(db=db, project=item)


@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.get("/users/{user_email}", response_model=schemas.User)
def read_user(
    email: str,
    db: Session = Depends(get_db),
):
    db_user = crud.get_user_by_email(db, email)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.post("/users/{user_id}/items/", response_model=schemas.Item)
def create_item_for_user(
    user_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)
):
    return crud.create_user_item(db=db, item=item, user_id=user_id)


@app.get("/items/", response_model=List[schemas.Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = crud.get_items(db, skip=skip, limit=limit)
    return items


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

from typing import List

import uvicorn
from fastapi import Depends, FastAPI, HTTPException, WebSocket
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

import crud
import models
import schemas
from database import SessionLocal, engine

ACCESS_TOKEN_EXPIRE_MINUTES = 30
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/authenticate", response_model=schemas.Token)
def authenticate_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if db_user is None:
        raise HTTPException(status_code=400, detail="Username not existed")
    else:
        is_password_correct = crud.check_username_password(db, user)
        if is_password_correct is False:
            raise HTTPException(status_code=400, detail="Password is not correct")
        else:
            from datetime import timedelta
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            from crud import create_access_token
            access_token = create_access_token(
                data={"sub": user.email}, expires_delta=access_token_expires)
            return {"access_token": access_token, "token_type": "Bearer"}


def fake_decode_token(token):
    return schemas.UserInfoBase(
        username=token + "fakedecoded", email="john@example.com", full_name="John Doe"
    )


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
    if ';' in item.project_name:
        raise HTTPException(status_code=400, detail="Project name cannot contain character ;")
    # if project name is not already in use, create the project then add the name to the table of the user
    crud.update_user_created(db, item.email, item.project_name)
    return crud.create_project_2(db=db, project=item)


#
# @app.post("/create_project/", response_model=schemas.Project)
# def create_project( item: schemas.Project,db: Session = Depends(get_db)):
#     db_project = crud.get_project_name(db, pr_name = item.project_name)
#     if (db_project == item.project_name):
#         raise HTTPException(status_code=400, detail="project name taken")
#     return crud.create_project(db =db, project =item)




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
def read_user(email: str, db: Session = Depends(get_db), ):
    db_user = crud.get_user_by_email(db, email)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.post("/users/{user_id}/items/", response_model=schemas.Item)
def create_item_for_user(
        user_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)
):
    return crud.create_user_item(db=db, item=item, user_id=user_id)


# fill out the project info, create a table with the name.
# we want to add the current user to the project table

@app.get("/items/", response_model=List[schemas.Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = crud.get_items(db, skip=skip, limit=limit)
    return items


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

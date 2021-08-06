import json
from datetime import datetime, timedelta
from typing import List
from typing import Optional
import bcrypt
import boto3
import uvicorn
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.models import OAuthFlows
from fastapi.security import OAuth2
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.security.utils import get_authorization_scheme_param
from jose import jwt
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.responses import Response
import crud
import schemas
from database import SessionLocal

ACCESS_TOKEN_EXPIRE_MINUTES = 259200

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:3000",
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
    password_check = bcrypt.checkpw(password.encode("utf-8"), db_user.hashed_password)
    if password_check is False:
        return False
    return db_user


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


@app.get("/project/recent")
async def get_project(db: Session = Depends(get_db)):
    uuid_list = crud.get_all_projects_by_date(db, 10)
    projects_list = crud.get_projects_metadata(db, uuid_list)
    lambda_client = boto3.client("lambda", "eu-central-1")
    for project in projects_list:
        project_id = project["project_id"]

        lambda_payload = json.dumps({"project_id": project_id})

        response = lambda_client.invoke(
            FunctionName="getProjectPreviewImage",
            InvocationType="RequestResponse",
            Payload=lambda_payload,
        )
        data = response["Payload"].read()
        data = json.loads(data)
        project["image_url"] = data
    dict_json = json.dumps(projects_list)
    return dict_json


@app.get("/users/project")
async def get_project(mail: str, db: Session = Depends(get_db)):
    uuid_list = crud.get_user_projects_uuid(db, mail)
    projects_list = crud.get_projects_metadata(db, uuid_list)

    lambda_client = boto3.client("lambda", "eu-central-1")
    for project in projects_list:
        project_id = project["project_id"]

        lambda_payload = json.dumps({"project_id": project_id})

        response = lambda_client.invoke(
            FunctionName="getProjectPreviewImage",
            InvocationType="RequestResponse",
            Payload=lambda_payload,
        )

        data = response["Payload"].read()
        data = json.loads(data)
        project["image_url"] = data
    dict_json = json.dumps(projects_list)
    return dict_json


@app.post("/project/delete")
def project_info(project_id: str, db: Session = Depends(get_db)):
    lambda_client = boto3.client("lambda", "eu-central-1")


    lambda_payload = json.dumps(
        {"project_id": project_id}
    )
    response = lambda_client.invoke(
        FunctionName="deleteProject",
        InvocationType="RequestResponse",
        Payload=lambda_payload,
    )
    data = response["Payload"].read()
    data_json = json.loads(data)
    list_string = ' '.join(str(item) for item in data_json)
    if len(list_string) == 0:
        crud.project_delete(db, project_id)
    return list_string

@app.post("/project/delete_files/")
def project_info(project_id: str, files: schemas.FileDeleteList):
    lambda_client = boto3.client("lambda", "eu-central-1")
    files_values = []
    for file in files:

        files_values.append(file[1][0].file_name)

    lambda_payload = json.dumps(
        {"project_id": project_id, "files_to_delete": files_values}
    )
    response = lambda_client.invoke(
        FunctionName="deleteFiles",
        InvocationType="RequestResponse",
        Payload=lambda_payload,
    )
    data = response["Payload"].read()
    data_json = json.loads(data)
    list_string = ' '.join(str(item) for item in data_json)
    if len(data_json) == 0:
        return list_string



@app.post("/users/", response_model=schemas.UserCreate)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@app.post("/project/", response_model=schemas.ProjectOut)
def create_project(item: schemas.Project, db: Session = Depends(get_db)):
    db_project = crud.get_project_by_name(db, name=item.project_name)
    # We want unique project names
    if db_project:
        raise HTTPException(status_code=400, detail="Project name already in use")
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


@app.get("/project/presigned_put_url")
async def get_project_id(
    project_id: str, filename: str, content: str, db: Session = Depends(get_db)
):
    id = project_id

    content_type = content
    file_name = filename
    if content_type == "audio/webm":
        content_type += ";codecs=opus"
    print(filename)
    print(content_type)
    lambda_client = boto3.client("lambda", "eu-central-1")
    lambda_payload = json.dumps(
        {"project_id": id, "filename": file_name, "Content-Type": content_type}
    )

    response = lambda_client.invoke(
        FunctionName="getFolderURLwebm",
        InvocationType="RequestResponse",
        Payload=lambda_payload,
    )
    data = response["Payload"].read()
    print(data)
    data_dict = json.loads(data)
    print(data_dict)
    project = crud.get_project_by_id(db, id)
    crud.project_change_edit(db, project)
    return data_dict


@app.get("/project/presigned_get_url")
async def get_project_id(project_id: str):
    id = project_id
    print(id)
    lambda_client = boto3.client("lambda", "eu-central-1")
    lambda_payload = json.dumps({"project_id": id})

    response = lambda_client.invoke(
        FunctionName="getFolderFiles",
        InvocationType="RequestResponse",
        Payload=lambda_payload,
    )
    data = response["Payload"].read()
    print(data)
    data_dict = json.loads(data)
    return data_dict


@app.get("/tryme")
async def get_projects(db: Session = Depends(get_db)):
    projects = crud.get_all_projects_by_date(db, 10)

    print(projects)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

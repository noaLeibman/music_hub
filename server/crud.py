import bcrypt
import jwt
from pydantic.datetime_parse import timedelta, datetime
from sqlalchemy.orm import Session

import models
import schemas


def get_user(db: Session, user_id: int):
    return db.query(models.UserInfo).filter(models.UserInfo.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.UserInfo).filter(models.UserInfo.email == email).first()


def get_project_name(db: Session, pr_name: str):
    returned_value = models.create_models(pr_name)
    if returned_value == pr_name:
        return returned_value

    name = models.get_class_by_tablename(pr_name)
    if name is None:
        return None
    else:
        return (
            db.query(name[pr_name])
            .filter(name[pr_name].project_name == pr_name)
            .first()
        )


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.UserInfo).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = bcrypt.hashpw(
        user.hashed_password.encode("utf-8"), bcrypt.gensalt()
    )
    db_user = models.UserInfo(
        email=user.email, hashed_password=hashed_password, full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_project_by_name(db: Session, name: str):
    return db.query(models.Project).filter(models.Project.project_name == name).first()


def create_project_2(db: Session, project: schemas.Project):
    db_project_to_add = models.Project(
        email=project.email, project_name=project.project_name
    )
    db.add(db_project_to_add)
    db.commit()
    db.refresh(db_project_to_add)
    return db_project_to_add


def update_user_created(db: Session, email: str, project_name: str):
    user_to_update = get_user_by_email(db, email)
    if user_to_update.created_projects != None:
        string_to_replace = user_to_update.created_projects + ";" + project_name
    else:
        string_to_replace = project_name
    db.query(models.UserInfo).filter(models.UserInfo.email == email).update(
        {"created_projects": string_to_replace}
    )


# def create_project(db: Session, project: schemas.Project):
#     returned_value = models.create_models(project.project_name)
#
#     the_model = models.get_class_by_tablename(project.project_name)
#     model = the_model[project.project_name]
#     print(the_model)
#
#     if the_model is not None:
#         db_add_user = model(project_name = project.project_name, email=project.email, web_socket="hardcoded")
#         db.add(db_add_user)
#         db.commit()
#         db.refresh(db_add_user)
#         return db_add_user
#


def check_username_password(db: Session, user: schemas.UserCreate):
    db_user_info: models.UserInfo = get_user_by_email(db, user.email)
    return bcrypt.checkpw(
        user.hashed_password.encode("utf8"), db_user_info.hashed_password
    )


def create_access_token(*, data: dict, expires_delta: timedelta = None):
    secret_key = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    algorithm = "HS256"
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt


def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).offset(skip).limit(limit).all()


def create_user_item(db: Session, item: schemas.ItemCreate, user_id: int):
    db_item = models.Item(**item.dict(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

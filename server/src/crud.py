import bcrypt
from sqlalchemy.orm import Session

import models
import schemas


def get_user(db: Session, user_id: int):
    return db.query(models.UserInfo).filter(models.UserInfo.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.UserInfo).filter(models.UserInfo.email == email).first()


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

    user_to_add = get_user_by_email(db, project.email)
    db_project_to_add.sign_up(user_to_add)
    db.add(db_project_to_add)
    db.commit()

    db.refresh(db_project_to_add)


    return db_project_to_add





def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).offset(skip).limit(limit).all()


def create_user_item(db: Session, item: schemas.ItemCreate, user_id: int):
    db_item = models.Item(**item.dict(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

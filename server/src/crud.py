import json

import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

import models
import schemas


def get_user(db: Session, user_id: int):
    return db.query(models.UserInfo).filter(models.UserInfo.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.UserInfo).filter(models.UserInfo.email == email).first()


def get_all_projects_by_date(db: Session, limit: int = 10):
    projects = db.query(models.Project).order_by(desc(models.Project.last_edited)).limit(10).all()
    uuid_list = []
    for project in projects:
        uuid_list.append(project.uuid)

    return uuid_list


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


def get_project_by_id(db: Session, id: str):
    return db.query(models.Project).filter(models.Project.uuid == id).first()


def get_projects_metadata(db:Session, uuid_list : List[str]):
    all_projects_dict = dict()

    if len(uuid_list) > 0:
        for count, project in enumerate(uuid_list):
            project_item = get_project_by_id(db, project)
            project_dict = dict()
            project_dict["project_name"] = project_item.project_name
            project_dict["project_id"] = project_item.uuid
            project_dict["description"] = project_item.description
            project_dict["author"] = project_item.author_name
            all_projects_dict[count] = project_dict

    return all_projects_dict

def get_user_projects_uuid(db: Session, user_mail: str):
    user = get_user_by_email(db, user_mail)
    projects_list = user.projects_list_uuid
    return projects_list


def create_project_2(db: Session, project: schemas.Project):
    user_to_add = get_user_by_email(db, project.email)
    author_name = user_to_add.full_name
    db_project_to_add = models.Project(
        email=project.email, project_name=project.project_name, author_name=author_name, description = project.description
    )

    db_project_to_add.sign_up(user_to_add)
    db.add(db_project_to_add)
    db.commit()

    db.refresh(db_project_to_add)

    return db_project_to_add


def project_change_edit(db: Session, project: models.Project):
    project.edited_at()
    db.commit()
    db.refresh(project)

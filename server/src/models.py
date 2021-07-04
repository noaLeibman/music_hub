from datetime import datetime

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
import sqlalchemy as sa
import uuid
from database import Base, engine
import typing as t
import os

def gen_uuid_4() -> str:
    return str(uuid.uuid4())


class UserInfo(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), index=True, default=gen_uuid_4)
    created_at = Column(DateTime, default=datetime.utcnow)
    email = Column(String,unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)
    projects = relationship("Project",  secondary="projects_users", viewonly = True, backref = "projects_users", lazy = "dynamic")

    @property
    def first_name(self) -> str:
        return self.full_name.split()[0]
    @property
    def projects_list_uuid(self) -> t.List[str]:
        return [project.uuid for project in self.projects]

class Project(Base):
    __tablename__ = "project"
    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(String(36), index=True, default=gen_uuid_4)
    created_at = Column(DateTime, default=datetime.utcnow)
    email = Column(String, index=True )
    project_name = Column(String, unique=True)
    # better name
    json_data = Column(String(5000))
    users = relationship("UserInfo", secondary="projects_users", backref = "projects_users", lazy= "dynamic")

    def sign_up(self,user:UserInfo):
        self.users.append(user)

    def remove_user(self,user:UserInfo):
        self.users.remove(user)
    @property
    def users_uuid(self) -> t.List[str]:
        return [user.uuid for user in self.users]


class ProjectsUsers(Base):
    __tablename__ = "projects_users"
    user_id = Column(Integer, ForeignKey('user.email'))
    project_id = Column(Integer, ForeignKey('project.id'), primary_key=True)




if os.getenv("IS_DEBUG"):
    Base.metadata.create_all(bind=engine)
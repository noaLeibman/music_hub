from typing import List, Optional
from pydantic import BaseModel



class MySchema(BaseModel):
    class Conifg:
        orm_mode = True


class TokenData(BaseModel):
    email: Optional[str] = None


class ItemBase(BaseModel):
    title: str
    description: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class Item(ItemBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True


class UserInfoBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    disabled: Optional[bool] = False


    class Config:
        orm_mode = True


class ProjectDataOut(BaseModel):
    project_id: str

    class Config:
        orm_mode = True

class Project(BaseModel):
    project_name: str
    email: str
    description: str

    class Config:
        orm_mode = True


class ProjectEdit(BaseModel):
    project_name: str
    email: str
    uuid: str

    class Config:
        orm_mode = True

class ProjectOut(BaseModel):
    project_name: str
    email: str
    description: str
    uuid: str

    class Config:
        orm_mode = True


class UserCreate(UserInfoBase):
    hashed_password: str


class User(UserInfoBase):
    id: int
    is_active: bool
    items: List[Item] = []

    class Config:
        orm_mode = True

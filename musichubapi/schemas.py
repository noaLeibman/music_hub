from typing import List, Optional

from pydantic import BaseModel


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
    disabled: Optional[bool] = None

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class Project(BaseModel):
    project_name: str
    email: str
    id: Optional[int] = None
    web_socket: Optional[str] = None

    class Config:
        orm_mode= True

class UserCreate(UserInfoBase):
    hashed_password: str


class User(UserInfoBase):
    id: int
    is_active: bool
    items: List[Item] = []

    class Config:
        orm_mode = True

from typing import List, Optional

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


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
    disabled: Optional[bool] = False
    created_projects: Optional[str] = ""
    joined_projects: Optional[str] = ""
    websockets: Optional[str] = ""

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
        orm_mode = True


class UserCreate(UserInfoBase):
    hashed_password: str


class User(UserInfoBase):
    id: int
    is_active: bool
    items: List[Item] = []

    class Config:
        orm_mode = True

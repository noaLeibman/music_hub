from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
import sqlalchemy as sa

from database import Base


class UserInfo(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=True)
    web_socket = Column(String)
    items = relationship("Item", back_populates="owner")


class Item(Base):
    __tablename__ = "items"

    link = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("UserInfo", back_populates="items")


def get_class_by_tablename(tablename):
    # for c in Base._decl_class_registry.values():
    #     if hasattr(c, '__tablename__') and c.__tablename__.fullname == tablename:
    #         return c
    Base.TBLNAME_TO_CLASS = {}
    for mapper in Base.registry.mappers:
        cls = mapper.class_
        classname = cls.__name__
        if not classname.startswith('_'):
            tblname = cls.__tablename__
            if tblname == tablename:

                Base.TBLNAME_TO_CLASS[tblname] = cls
                return  Base.TBLNAME_TO_CLASS


def create_models(tablename):
    engine = sa.create_engine('sqlite:///sql_app.db')
    ins = sa.inspect(engine)
    ret = ins.dialect.has_table(engine.connect(), tablename)
    if ret:
        return tablename
    else:
        class Project(Base):
            __tablename__ = tablename
            project_name = Column(String, unique = True, index=True )
            id = Column(Integer, primary_key = True)
            email = Column(String, unique=True, index=True)
            web_socket = Column(String)

        Base.metadata.create_all(engine)
        return Project

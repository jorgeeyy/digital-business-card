from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    username: str | None = None
    display_name: str | None = None

    model_config = {"from_attributes": True}


class CardCreate(BaseModel):
    config: str
    html: str


class CardUpdate(BaseModel):
    config: str
    html: str


class PublishRequest(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-z0-9][a-z0-9_-]*$")


class CardOut(BaseModel):
    id: int
    config: str
    html: str
    published: bool
    username: str | None = None
    public_url: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UsernameAvailable(BaseModel):
    available: bool


class UsernameRequest(BaseModel):
    username: str


class UploadResponse(BaseModel):
    url: str

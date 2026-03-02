from pydantic import BaseModel

class Portfolio(BaseModel):
    crypto: str
    allocation: float
    
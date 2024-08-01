from pydantic import BaseModel, Field
from typing import Optional, List
import datetime as dt


class ErrorResponse(BaseModel):
    """
    Error response for the API
    """
    error: bool = Field(..., example=True, title='Whether there is error')
    message: str = Field(..., example='', title='Error message')
    traceback: Optional[str] = Field(None, example='', title='Detailed traceback of the error')

class SuccessResponse(BaseModel):
    message: str = Field(..., example='OK')

class Metric(BaseModel):
    metric_name: str = Field(..., example='БВИ', title='Metric name')
    datetime: dt.datetime = Field(..., example='2024-05-05 10:10:10', title='Insert datetime')
    value: float = Field(..., example=100, title='Value of metric')

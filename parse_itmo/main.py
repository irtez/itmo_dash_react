import os
import sys
from typing import List
import logging
from pymongo import MongoClient
import asyncio
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Query, Body
from fastapi.logger import logger
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
import datetime as dt

from config import CONFIG
from exception_handler import validation_exception_handler, python_exception_handler
from schema import Metric

client = MongoClient('mongodb://localhost:27017/')
db = client['Metrics_ITMO']
collection = db['Metrics']

import utils as u

INTERVAL = 30

async def periodic_task():
    while True:
        logger.info("Started collecting metrics")
        res = await u.write_metrics(collection)
        if res:
            logger.info(f"Collected metrics, sleeping {INTERVAL} sec")
        else:
            logger.warning(f"Something wrong with writing metrics")
        await asyncio.sleep(INTERVAL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Запускаем фоновую задачу
    task = asyncio.create_task(periodic_task())
    yield
    # Останавливаем фоновую задачу при завершении работы приложения
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

# Initialize API Server
app = FastAPI(
    title="ITMO prase",
    description="ITMO parsing module.",
    version="0.1.0",
    terms_of_service=None,
    contact=None,
    license_info=None,
    lifespan=lifespan
)

# Allow CORS for local debugging
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# Load custom exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, python_exception_handler)



data_pipeline = [
        # Группировка по имени метрики
        {"$group": {
            "_id": "$metric_name",
            "latest_records": {
                "$topN": {
                    "n": 1000,
                    "output": {
                        "value": "$value",
                        "datetime": "$datetime"
                    },
                    "sortBy": {"datetime": 1}
                }
            }
        }},
        # Преобразование результата
        {"$project": {
            "metric_name": "$_id",
            "records": "$latest_records",
            "_id": 0
        }}
    ]

@app.get(
        '/api/metrics',
        response_description="Sorted documents IDx with scores",
        responses={
            200: {"model": List[Metric]}
        }
)
async def get_metrics():
    """
    Get metrics
    """
    latest_metrics = list(collection.aggregate(data_pipeline))  
    return sorted(latest_metrics, key=lambda x: x['metric_name'])


if __name__ == '__main__':
    uvicorn.run(
        "main:app",
        port=5555,
        reload=True,
        log_config="log.ini"
    )
else:
    # Configure logging if main.py executed from Docker
    gunicorn_error_logger = logging.getLogger("gunicorn.error")
    gunicorn_logger = logging.getLogger("gunicorn")
    uvicorn_access_logger = logging.getLogger("uvicorn.access")
    uvicorn_access_logger.handlers = gunicorn_error_logger.handlers
    logger.handlers = gunicorn_error_logger.handlers
    logger.setLevel(gunicorn_logger.level)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import csv
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data/mock_data.csv")

class StatsResponse(BaseModel):
    users: int
    active_today: int
    conversion_rate: float

def derive_stats():
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=503, detail="Data source unavailable")

    try:
        with open(DATA_PATH) as f:
            reader = csv.DictReader(f)
            rows = list(reader)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read dataset")

    users = len(rows)
    active_today = int(users * 0.3)
    conversion_rate = 4.5

    return StatsResponse(
        users=users,
        active_today=active_today,
        conversion_rate=conversion_rate
    )

@app.get("/stats", response_model=StatsResponse)
def get_stats():
    return derive_stats()

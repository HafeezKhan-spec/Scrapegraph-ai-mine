"""
FastAPI backend for ScrapeGraphAI
"""

import os
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from scrapegraphai.graphs import SmartScraperGraph

app = FastAPI(
    title="ScrapeGraphAI API",
    description="Web scraping powered by LLM",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NVIDIA_API_KEY = os.getenv(
    "NVIDIA_API_KEY",
    "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",
)
NVIDIA_BASE_URL = os.getenv(
    "NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1"
)
NVIDIA_MODEL = os.getenv(
    "NVIDIA_MODEL", "nvidia/nemotron-3-super-120b-a12b"
)


class ScrapeRequest(BaseModel):
    url: str
    prompt: str
    model_tokens: Optional[int] = 8192


class ScrapeResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "ScrapeGraphAI API is running", "status": "healthy"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/scrape", response_model=ScrapeResponse)
async def scrape(request: ScrapeRequest):
    """
    Scrape a website using ScrapeGraphAI with NVIDIA LLM
    """
    try:
        graph_config = {
            "llm": {
                "api_key": NVIDIA_API_KEY,
                "model": f"openai/{NVIDIA_MODEL}",
                "base_url": NVIDIA_BASE_URL,
                "model_tokens": request.model_tokens,
            },
            "verbose": True,
            "headless": True,
        }

        smart_scraper_graph = SmartScraperGraph(
            prompt=request.prompt,
            source=request.url,
            config=graph_config,
        )

        result = smart_scraper_graph.run()

        return ScrapeResponse(success=True, data=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

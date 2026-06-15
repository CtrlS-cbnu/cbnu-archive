from fastapi import FastAPI

from api.metadata import router as metadata_router
from api.search import router as search_router
from api.embed import router as embed_router

app = FastAPI(title="Project Archive AI API")

app.include_router(metadata_router)
app.include_router(search_router)
app.include_router(embed_router)

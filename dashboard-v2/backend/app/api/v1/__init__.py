from fastapi import APIRouter
from app.api.v1 import agents, tasks, logs, chat, omc, system, alerts

router = APIRouter(prefix="/api")
router.include_router(agents.router)
router.include_router(tasks.router)
router.include_router(logs.router)
router.include_router(chat.router)
router.include_router(omc.router)
router.include_router(system.router)
router.include_router(alerts.router)

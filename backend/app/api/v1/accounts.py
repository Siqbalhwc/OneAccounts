from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_accounts():
    return {"message": "Accounts endpoint working"}
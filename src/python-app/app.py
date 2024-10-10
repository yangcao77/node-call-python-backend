from fastapi import FastAPI, APIRouter

# Create the main FastAPI app
app = FastAPI()

# Create a health check router
health_router = APIRouter()

@health_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Create a hello world router
hello_router = APIRouter()

@hello_router.get("/hello")
async def hello_world():
    return {"message": "Hello, World"}


arr = []
# Create a simple post router to calculate square_root
arr_append_router = APIRouter()

@arr_append_router.post("/arr-append")
async def arr_append(value):
    arr.append(value)
    return {"array": arr}


# Include the routers in the main app
app.include_router(health_router)
app.include_router(hello_router)
app.include_router(arr_append_router)

# Main entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, schemas, dependencies, models, os, shutil
from datetime import datetime

router = APIRouter(
    prefix="/events",
    tags=["Events"]
)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), current_user: models.User = Depends(dependencies.get_current_admin)):
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
        
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}{file_extension}"
    file_path = os.path.join("uploads", filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"id": filename, "url": f"/uploads/{filename}"}

@router.get("/", response_model=List[schemas.EventResponse])
def read_events(status: Optional[str] = None, skip: int = 0, limit: int = 100, current_user: Optional[models.User] = Depends(dependencies.get_current_user_optional), db: Session = Depends(dependencies.get_db)):
    db_events = crud.get_events(db, status=status, skip=skip, limit=limit)
    
    user_reg_ids = []
    if current_user:
        user_reg_ids = [reg.event_id for reg in current_user.registrations if reg.event_id is not None]
    
    results = []
    for db_event in db_events:
        # Construct dict explicitly to ensure is_registered is included in output
        event_dict = {
            "id": db_event.id,
            "title": db_event.title,
            "description": db_event.description,
            "location": db_event.location,
            "event_date": db_event.event_date,
            "start_time": db_event.start_time,
            "end_time": db_event.end_time,
            "image_url": db_event.image_url,
            "status": db_event.status,
            "created_at": db_event.created_at,
            "is_registered": db_event.id in user_reg_ids
        }
        results.append(event_dict)
            
    return results




@router.get("/{event_id}", response_model=schemas.EventWithRegistrations)
def read_event(event_id: int, current_user: Optional[models.User] = Depends(dependencies.get_current_user_optional), db: Session = Depends(dependencies.get_db)):
    db_event = crud.get_event(db, event_id=event_id)
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    is_reg = False
    if current_user:
        is_reg = any(reg.event_id == event_id for reg in current_user.registrations)

    return {
        "id": db_event.id,
        "title": db_event.title,
        "description": db_event.description,
        "location": db_event.location,
        "event_date": db_event.event_date,
        "start_time": db_event.start_time,
        "end_time": db_event.end_time,
        "image_url": db_event.image_url,
        "status": db_event.status,
        "created_at": db_event.created_at,
        "is_registered": is_reg,
        "registrations": db_event.registrations
    }



@router.post("/{event_id}/join", response_model=schemas.RegistrationResponse)
def join_event(event_id: int, current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(dependencies.get_db)):
    event = crud.get_event(db, event_id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    registration = crud.register_user_for_event(db, user_id=current_user.id, event_id=event_id)
    return registration

@router.post("/{event_id}/leave")
def leave_event(event_id: int, current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(dependencies.get_db)):
    success = crud.unregister_user_from_event(db, user_id=current_user.id, event_id=event_id)
    if not success:
        raise HTTPException(status_code=400, detail="You are not registered for this event")
    return {"message": "You have left the event"}

# Admin endpoints
@router.post("/", response_model=schemas.EventResponse)
def create_event(event: schemas.EventCreate, current_user: models.User = Depends(dependencies.get_current_admin), db: Session = Depends(dependencies.get_db)):
    return crud.create_event(db=db, event=event)

@router.delete("/{event_id}", response_model=schemas.EventResponse)
def delete_event(event_id: int, current_user: models.User = Depends(dependencies.get_current_admin), db: Session = Depends(dependencies.get_db)):
    db_event = crud.delete_event(db, event_id=event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event

@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event(event_id: int, event: schemas.EventUpdate, current_user: models.User = Depends(dependencies.get_current_admin), db: Session = Depends(dependencies.get_db)):
    db_event = crud.update_event(db, event_id=event_id, event_update=event)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event

  

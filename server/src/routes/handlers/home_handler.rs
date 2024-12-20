use crate::AppState;
use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use sea_orm::{ActiveModelTrait, EntityTrait, ModelTrait};
use sea_orm::ActiveValue::Set;
use serde::{Deserialize, Serialize};
use serde_json::json;
use entity::task;

#[get("/hello/{name}")]
pub async fn greet(name: web::Path<String>) -> impl Responder {

   HttpResponse::Ok().json(json!({
       "message": format!("Hello, {}!", name)
       }))
}

#[derive(Debug, Deserialize, Serialize)]
struct NewTask {
    name: String,
    description: String,
    status: String,
}

#[post("/task")]
pub async fn test(
    task: web::Json<NewTask>,
    app_state: web::Data<AppState>,
) -> impl Responder {

    let new_task = task::ActiveModel {
        name: Set(task.name.clone()),
        description: Set(task.description.clone()),
        status: Set(task.status.clone()),
        ..Default::default()
    };

    // Insert into the database
    match new_task.insert(&app_state.db).await {
        Ok(_) => println!("Task inserted successfully"),
        Err(e) => eprintln!("Error inserting task: {:?}", e),
    }
    HttpResponse::Ok()
}

#[derive(Debug, Serialize, Deserialize)]
struct TaskDTO {
    id: i32,
    name: String,
    description: String,
    status: String,
}

#[get("/tasks")]
pub async fn get_tasks(app_state: web::Data<AppState>) -> impl Responder {

    match task::Entity::find().all(&app_state.db).await {
        Ok(tasks) => {
            let tasks_dto: Vec<TaskDTO> = tasks.into_iter().map(|task| TaskDTO {
                id: task.id,
                name: task.name,
                description: task.description,
                status: task.status,
            }).collect();

            HttpResponse::Ok().json(tasks_dto)
        }
        Err(err) => {
            eprintln!("Error fetching tasks: {:?}", err);

            HttpResponse::InternalServerError().body("Failed to fetch tasks")
        }
    }
}

#[get("/tasks/{id}")]
pub async fn get_task_by_id(
    app_state: web::Data<AppState>,
    path: web::Path<i32>
) -> impl Responder {
    let task_id = path.into_inner();

    match task::Entity::find_by_id(task_id).one(&app_state.db).await {
        Ok(Some(task)) => {
            let task_dto = TaskDTO {
                id: task.id,
                name: task.name,
                description: task.description,
                status: task.status,
            };

            HttpResponse::Ok().json(task_dto)
        }
        Ok(None) => {
            // Task not found
            HttpResponse::NotFound().body("Task not found")
        }
        Err(err) => {
            eprintln!("Error fetching task: {:?}", err);
            HttpResponse::InternalServerError().body("Failed to fetch task")
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct TaskUpdateDTO {
    pub id: Option<i32>,
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
}

#[put("/tasks/{id}")]
pub async fn update_task(
    app_state: web::Data<AppState>,
    path: web::Path<i32>,
    task_update: web::Json<TaskUpdateDTO>,
) -> impl Responder {
    let task_id = path.into_inner();

    // Fetch the task to be updated
    match task::Entity::find_by_id(task_id).one(&app_state.db).await {
        Ok(Some(task)) => {
            // Create an ActiveModel for updating
            let active_model = task::ActiveModel {
                id: Set(task.id),
                name: Set(task_update.name.clone().unwrap_or_else(|| task.name)),
                description: Set(task_update.description.clone().unwrap_or_else(|| task.description)),
                status: Set(task_update.status.clone().unwrap_or_else(|| task.status)),
                ..Default::default()
            };

            // Update the task in the database
            match active_model.update(&app_state.db).await {
                Ok(updated_task) => {

                    HttpResponse::Ok().json(json!({
                        "message": "Task updated successfully",
                    }))
                }
                Err(err) => {
                    eprintln!("Error updating task: {:?}", err);
                    HttpResponse::InternalServerError().body("Failed to update task")
                }
            }
        }
        Ok(None) => {
            // Task not found
            HttpResponse::NotFound().body("Task not found")
        }
        Err(err) => {
            eprintln!("Error fetching task: {:?}", err);
            HttpResponse::InternalServerError().body("Failed to fetch task")
        }
    }
}


#[delete("/tasks/{id}")]
pub async fn delete_task(
    app_state: web::Data<AppState>,
    path: web::Path<i32>
) -> impl Responder {
    let task_id = path.into_inner();

    // Fetch the task to be deleted
    match task::Entity::find_by_id(task_id).one(&app_state.db).await {
        Ok(Some(task)) => {
            // Delete the task
            match task.delete(&app_state.db).await {
                Ok(_) => HttpResponse::NoContent().finish(),
                Err(err) => {
                    eprintln!("Error deleting task: {:?}", err);
                    HttpResponse::InternalServerError().body("Failed to delete task")
                }
            }
        }
        Ok(None) => {
            HttpResponse::NotFound().body("Task not found")
        }
        Err(err) => {
            eprintln!("Error fetching task: {:?}", err);
            HttpResponse::InternalServerError().body("Failed to fetch task")
        }
    }
}
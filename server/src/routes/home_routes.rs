use actix_web::web;
use crate::routes::handlers;

pub fn config(config: &mut web::ServiceConfig) {
    config
        .service(
            web::scope("/api")
            .service(handlers::home_handler::greet)
            .service(handlers::home_handler::test)
            .service(handlers::home_handler::get_tasks)
                .service(handlers::home_handler::get_task_by_id)
                .service(handlers::home_handler::update_task)
                .service(handlers::home_handler::delete_task)
        );

}
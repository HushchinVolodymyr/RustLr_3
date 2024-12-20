use migration::MigratorTrait;
use actix_web::{web, App, HttpServer};
use actix_web::middleware::Logger;
use actix_cors::Cors;

use sea_orm::{Database, DatabaseConnection};
use utils::app_state::AppState;

use migration;

mod utils;
mod routes;


#[actix_web::main]
async fn main() -> std::io::Result<()> {

    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "actix_web=info");
    }

    dotenv::dotenv().ok();
    env_logger::init();

    let port = (*utils::constants::PORT).clone();
    let address = (*utils::constants::ADDRESS).clone();
    let database_url = (*utils::constants::DATABASE_URL).clone();

    let db: DatabaseConnection = Database::connect(database_url).await.unwrap();
    migration::Migrator::up(&db, None).await.unwrap();

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(AppState { db: db.clone() }))
            .wrap(Logger::default())
            .wrap(Cors::default().allow_any_origin().allow_any_method().allow_any_header())
            .configure(routes::home_routes::config)
    })
        .bind((address, port))?
        .run()
        .await
}
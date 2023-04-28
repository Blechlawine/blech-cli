#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use rspc::{Config, Router};

#[tokio::main]
async fn main() {
    let router = <Router>::new()
        .config(Config::new().export_ts_bindings("../src/generated/bindings.ts"))
        .query("version", |t| t(|_ctx, _input: ()| "Hello from rspc Rust"))
        .build()
        .arced();

    tauri::Builder::default()
        .plugin(rspc::integrations::tauri::plugin(router, || ()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

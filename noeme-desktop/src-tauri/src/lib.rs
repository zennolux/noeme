mod commands;
mod hotkey;
mod migration;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let sql_migration = migration::Migration::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .setup(|app| {
            hotkey::register(app)?;

            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_screenshots::init())
        .plugin(tauri_plugin_user_input::init())
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_denylist(&["screenshot"])
                .with_state_flags(tauri_plugin_window_state::StateFlags::all())
                .build(),
        )
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(sql_migration.connection.as_str(), sql_migration.build())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::crop_image,
            commands::get_selected_text,
            commands::get_word_details,
            commands::get_screenshot_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use tauri::Manager;
use tauri_plugin_positioner::{Position, WindowExt};

mod commands;
mod hotkey;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            hotkey::register(app)?;

            if let Some(win) = app.get_webview_window("main") {
                if let Ok(Some(monitor)) = win.current_monitor() {
                    let scale_factor = monitor.scale_factor();
                    let work_area = monitor.work_area();
                    let logical_height = work_area.size.height as f64 / scale_factor;

                    win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                        width: 400 as f64,
                        height: logical_height * 0.9,
                    }))?;

                    win.as_ref().window().move_window(Position::RightCenter)?;

                    win.show()?;
                }
            }

            Ok(())
        })
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_screenshots::init())
        .plugin(tauri_plugin_user_input::init())
        .invoke_handler(tauri::generate_handler![
            commands::crop_image,
            commands::get_selected_text,
            commands::get_word_details
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

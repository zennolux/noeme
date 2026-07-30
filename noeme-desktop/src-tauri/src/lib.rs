mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri::Emitter;
                use tauri_plugin_global_shortcut::{
                    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
                };

                let shortcut_screenshot =
                    Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyJ);

                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |app_handle, shortcut, event| {
                            if shortcut != &shortcut_screenshot {
                                return ();
                            }

                            if event.state() != ShortcutState::Pressed {
                                return ();
                            }

                            app_handle.emit("shortcut-screenshot", ()).expect("")
                        })
                        .build(),
                )?;

                app.global_shortcut().register(shortcut_screenshot)?;
            }

            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_screenshots::init())
        .plugin(tauri_plugin_user_input::init())
        .invoke_handler(tauri::generate_handler![
            commands::crop_image,
            commands::get_selected_text
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

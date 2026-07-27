// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

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
                    //Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::F6);
                    Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::F12);

                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |app_handle, shortcut, event| {
                            println!("You pressed {}", shortcut);
                            if shortcut != &shortcut_screenshot {
                                return ();
                            }

                            if event.state() != ShortcutState::Pressed {
                                return ();
                            }

                            app_handle.emit("shortcut-screenshot", ()).expect("");
                        })
                        .build(),
                )?;

                app.global_shortcut()
                    .register(shortcut_screenshot)
                    .expect("Failed to register shortcut of screenshot");
            }

            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_screenshots::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

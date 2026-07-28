use serde::Deserialize;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

#[derive(Debug, Deserialize)]
struct ImageArea {
    height: f64,
    width: f64,
    x: f64,
    y: f64,
    unit: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(app_handle: AppHandle, image_area: ImageArea) -> String {
    let store = app_handle.store("store.json").unwrap();

    if let Some(path) = store.get("path-screenshot") {
        let safe_path = path
            .to_string()
            .trim()
            .trim_matches('"')
            .trim_matches('\\')
            .trim_matches('"')
            .to_string();

        //println!("{:#?}", safe_path.clone());

        let mut image = image::open(safe_path).unwrap();

        image = image.crop_imm(
            image_area.x.round() as u32,
            image_area.y.round() as u32,
            image_area.width.round() as u32,
            image_area.height.round() as u32,
        );

        image
            .save(format!(
                "{}",
                app_handle
                    .path()
                    .app_data_dir()
                    .unwrap()
                    .join("screenshot-cropped.png")
                    .to_str()
                    .unwrap()
            ))
            .expect("Error while save cropped image");
    }

    format!(
        "Hello, W:{:#?},H:{:#?},X:{:#?},Y:{:#?},U:{:#?}! You've been greeted from Rust!",
        image_area.width, image_area.height, image_area.x, image_area.y, image_area.unit
    )
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

                app.global_shortcut().register(shortcut_screenshot)?
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

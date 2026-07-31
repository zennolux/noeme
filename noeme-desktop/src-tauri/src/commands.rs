use serde::Deserialize;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

#[derive(Debug, Deserialize)]
pub struct ImageArea {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[tauri::command]
pub fn crop_image(app_handle: AppHandle, image_area: ImageArea) -> String {
    let store = app_handle.store("store.json").unwrap();

    if let Some(path) = store.get("path-screenshot") {
        let safe_path = path
            .to_string()
            .trim()
            .trim_matches('"')
            .trim_matches('\\')
            .trim_matches('"')
            .to_string();

        let mut image = image::open(safe_path).unwrap();

        image = image.crop_imm(
            image_area.x.round() as u32,
            image_area.y.round() as u32,
            image_area.width.round() as u32,
            image_area.height.round() as u32,
        );

        let path_cropped = app_handle
            .path()
            .app_data_dir()
            .unwrap()
            .join("screenshot-cropped.png")
            .to_str()
            .unwrap()
            .to_owned();

        image
            .save(format!("{}", path_cropped))
            .expect("Error while save cropped image");

        path_cropped
    } else {
        "".to_string()
    }
}

#[tauri::command]
pub fn get_selected_text() -> String {
    match selectic::get_text() {
        Ok(text) => text,
        Err(_) => "".to_string(),
    }
}

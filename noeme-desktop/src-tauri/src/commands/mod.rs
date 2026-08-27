use anyhow::Result;
use noeme::Noeme;
use serde::Deserialize;
use tauri::{AppHandle, Manager};

mod error;
use error::CommandError;

#[derive(Debug, Deserialize)]
pub struct ImageArea {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[tauri::command]
pub async fn get_screenshot_path(app_handle: AppHandle) -> Result<String, CommandError> {
    match tauri_plugin_screenshots::get_screenshotable_monitors().await {
        Err(err) => Err(CommandError(err)),
        Ok(monitors) => {
            let path = app_handle
                .path()
                .app_data_dir()?
                .join("tauri-plugin-screenshots")
                .join(format!("monitor-{}.png", monitors[0].id));

            Ok(path.to_str().unwrap_or(&"").to_string())
        }
    }
}

#[tauri::command]
pub async fn crop_image(
    app_handle: AppHandle,
    image_area: ImageArea,
) -> Result<String, CommandError> {
    let path = self::get_screenshot_path(app_handle.clone()).await?;

    let mut image = image::open(path)?;

    image = image.crop_imm(
        image_area.x.round() as u32,
        image_area.y.round() as u32,
        image_area.width.round() as u32,
        image_area.height.round() as u32,
    );

    let path_cropped = app_handle
        .path()
        .app_data_dir()?
        .join("screenshot-cropped.png");

    image.save(path_cropped.clone())?;

    Ok(path_cropped.to_str().unwrap_or(&"").to_string())
}

#[tauri::command]
pub fn get_selected_text() -> String {
    match selectic::get_text() {
        Ok(text) => text,
        Err(_) => "".to_string(),
    }
}

#[tauri::command]
pub async fn get_word_details(word: String) -> Result<Noeme, CommandError> {
    match Noeme::from(&word.to_lowercase().as_str().trim()).await {
        Ok(result) => {
            println!("{:#?}", result);

            Ok(result)
        }
        Err(err) => Err(CommandError(err.message)),
    }
}

use anyhow::Result;
use tauri::{App, Emitter};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

pub fn register(app: &mut App) -> Result<()> {
    let shortcut_screenshot = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyJ);

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

    Ok(())
}

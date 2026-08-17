use anyhow::Result;
use serde::Serialize;
use strum_macros::{AsRefStr, Display, EnumString};
use tauri::{App, Emitter};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[derive(Debug, PartialEq, EnumString, Display, AsRefStr, Serialize, Clone)]
enum HotkeyKind {
    Screenshot,
    ToggleWindowVisibleState,
}

pub fn register(app: &mut App) -> Result<()> {
    let shortcut_screenshot = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyJ);
    let shortcut_toggle_window =
        Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyH);

    app.handle().plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_handler(move |app_handle, shortcut, event| {
                let mut hotkey_kind = HotkeyKind::Screenshot;

                if shortcut == &shortcut_toggle_window {
                    hotkey_kind = HotkeyKind::ToggleWindowVisibleState;
                }

                if event.state() != ShortcutState::Pressed {
                    return ();
                }

                app_handle
                    .emit("hotkey-pressed", hotkey_kind)
                    .expect("Unable to emit event for `hotkey-pressed`")
            })
            .build(),
    )?;

    app.global_shortcut().register(shortcut_screenshot)?;
    app.global_shortcut().register(shortcut_toggle_window)?;

    Ok(())
}

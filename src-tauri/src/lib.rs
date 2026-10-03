use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::Manager;

#[derive(Serialize, Deserialize, Debug)]
pub struct GpuInfo {
    pub device_name: String,
    pub backend: String,
    pub vram_mb: u32,
    pub webgpu_supported: bool,
}

#[tauri::command]
fn get_system_gpu_info() -> Result<GpuInfo, String> {
    Ok(GpuInfo {
        device_name: "Hardware Accelerated Local GPU".to_string(),
        backend: "Vulkan / DirectX 12".to_string(),
        vram_mb: 4096,
        webgpu_supported: true,
    })
}

#[tauri::command]
fn export_native_dxf(filepath: String, dxf_data: String) -> Result<String, String> {
    fs::write(&filepath, dxf_data).map_err(|e| e.to_string())?;
    Ok(format!("Successfully exported DXF to: {}", filepath))
}

#[tauri::command]
fn save_rachna_project(filepath: String, project_json: String) -> Result<String, String> {
    fs::write(&filepath, project_json).map_err(|e| e.to_string())?;
    Ok(format!("Project saved to: {}", filepath))
}

#[tauri::command]
fn open_rachna_project(filepath: String) -> Result<String, String> {
    if !Path::new(&filepath).exists() {
        return Err("Project file not found".to_string());
    }
    fs::read_to_string(&filepath).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_system_gpu_info,
            export_native_dxf,
            save_rachna_project,
            open_rachna_project
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                println!("RachnaCAD Desktop Window initialized successfully.");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running RachnaCAD desktop application");
}

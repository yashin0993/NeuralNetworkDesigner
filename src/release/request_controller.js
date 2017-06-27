
const {ipcRenderer, remote} = require('electron');
var main_proc = remote.require("./index");
var iframe = document.getElementById("main_view");

// ---- 共通関数 ---- //
// ダイアログ表示
function open_dialog(option){
    main_proc.openDialog(option);
}

ipcRenderer.on("dialog_selected", (sender, path) => {
    iframe.contentWindow.dialog_path(path);
});

ipcRenderer.on("read_file", (sender, path, data) => {
    iframe.contentWindow.read_file(path, data);
});
ipcRenderer.on("select_dir", (sender, path) => {
    iframe.contentWindow.select_dir(path);
});

// エラー通知
ipcRenderer.on("error", (sender, msg) => {
    alert(msg);
});

// initialize
ipcRenderer.on("init", sender => {
    window.sessionStorage.clear();
});

// project表示
function load_project(){
    main_proc.load_project();
}

ipcRenderer.on("project", (sender, data) => {
    iframe.contentWindow.show_project(data);
});

// 新規プロジェクト登録
function create_project(project_name){
    main_proc.create_project(project_name);
}

// layer編集画面
function save_layer_data(data, filename){
    main_proc.save_layer_data(data, filename);
}

// 学習画面
function select_dataset(){
    main_proc.select_dataset();
}

function training_start(dataset, disp){
    main_proc.training_start(dataset, disp);
}

// 推定画面
function show_file_dialog(){
    main_proc.show_file_dialog();
}

ipcRenderer.on("open_file", (sender, filename) => {
    iframe.contentWindow.set_file_name(filename);
});

function predict_start(filename){
    main_proc.predict_start(filename);
}

ipcRenderer.on("predict_result", (sender, data) => {
    iframe.contentWindow.show_predict_redult(data);
});

function up_python(){
    main_proc.up_python();
}

// データセット作成画面
function load_font(){
    main_proc.load_font();
}

ipcRenderer.on("font_list", (sender, files) => {
    iframe.contentWindow.loaded_font_list(files);
});

function create_train_data(data){
    main_proc.create_train_data(data);
}


// webcam
function cam_up_python(){
    main_proc.cam_up_python();
}

function webcam_end(){
    main_proc.webcam_end();
}

ipcRenderer.on("webcam_result", (sender, data) => {
    iframe.contentWindow.set_webcam_result(data);
});

function camera_predict(base64_str){
    main_proc.camera_predict(base64_str);
}

function check_webcam_py(){
    main_proc.check_webcam_py();
}
const electron = require('electron'),
      fs       = require('fs'),
      mkdirp   = require('mkdirp'),
      path     = require('path'),
      async    = require('async'),
      exec     = require('child_process').exec,
      spawn    = require('child_process').spawn;


const {app, BrowserWindow, Menu, dialog} = electron;

// アプリのルートパス
const app_root  = path.dirname(__dirname);
const proj_path = path.join(app_root, "project", "projectManagement.json");

/**mimeタイプ*/
let mime = {
    ".txt" : "text/plain",
    ".html": "text/html",
    ".css" : "text/css",
    ".js"  : "application/javascript",
    ".png" : "image/png",
    ".jpg" : "image/jpeg",
    ".gif" : "image/gif"
};

/**エラーメッセージ*/
let message = {
    200: "OK",
    404: "Not Found",
    500: "Internal Server Error",
    501: "Note Implemented"
};

let MainWindow = null;
let menu       = null;

let project_data = null;
let target_id    = null;

let debug = true;

function createWindow(){
    // electron windowを生成
    MainWindow = new BrowserWindow({
        width     : 1280,
        height    : 1024,
        minWidth  : 640,
        minHeight : 480
    });

    // 表示するhtmlを指定
    MainWindow.loadURL(`file://${__dirname}/index.html`);
    MainWindow.webContents.openDevTools();
    // 終了イベントの登録
    MainWindow.on('closed', () => {
        MainWindow = null;
    });

    // メニューバーを追加
    menu = Menu.buildFromTemplate([
        {
            label: 'View',
            submenu: [
                {
                label      : 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click      : (item, focusedWindow) => { if(focusedWindow) focusedWindow.reload(); }
                },
                {
                    label      : 'Toggle Developer Tools',
                    accelerator: 'Alt+CmdOrCtrl+I',
                    click      : () => { MainWindow.toggleDevTools(); }
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);

    // ストレージを初期化
    MainWindow.webContents.send("init");
}

/* ---------- Electronアプリイベント登録 ---------- */
// window生成関数呼び出しイベント登録
app.on('ready', createWindow)
// windows出なければアプリケーションを強制終了する
app.on('window-all-closed', () => {
    if(process.platform != 'darwin') app.quit();
});
// Active時にwindowが無ければ生成
app.on('activate', () => {
    if(MainWindow == null) createWindow();
});

// 共通関数
exports.openDialog = option => {
    let default_path = path.join(app_root, "project", project_data.project[proj_idx(target_id)].name);
    let type = option.type === "file" ? "openFile" : "openDirectory";
    dialog.showOpenDialog(MainWindow,{
        "title"       : "選択ダイアログ",
        "filters"     : option.filter,
        "defaultPath" : default_path,
        "properties"  : [type]
    }, filename => {
        if(option.type === "file"){
            let load_callback = (err, data, opt) => {
                if(err) throw err;
                MainWindow.webContents.send("read_file", filename[0], data); 
            };
            _read_file(filename[0], "utf-8", null, load_callback);
        }
        else{
            MainWindow.webContents.send("select_dir", filename[0]);
        }
    });
};


function print(message){
    if(debug) console.log(message);
}

function open_file_dialog(opt){
    dialog.showOpenDialog(MainWindow,{
        "title"   : "ファイル選択",
        "filters" : opt
    }, filename => {
        MainWindow.webContents.send("open_file", filename[0]);
    });
}




var _read_file = (file, encoding, option, callback) => {
    // 拡張子を取得
    var ext = path.extname(file).replace(".", "");
    
    fs.readFile(file, encoding, (err, data) => {
        var ret = null;
        // 拡張子によって変換する
        if(!err){
            if(ext=="json") ret = JSON.parse(data);
        }

        callback(null, ret, option);
        // MainWindow.webContents.send("layer_data", ret);
    });
};

// ------- 各ページの関数一覧 -----------
// プロジェクト関連
exports.load_project = () => {
    fs.readFile(proj_path, "utf-8", (err, data) => {
        // 必要最小限のデータのみ返す
        var ret = [];
        project_data = JSON.parse(data); 
        var data = project_data.project;
        for(var i=0; i<data.length; ++i){
            ret.push({"id": data[i].id, "name":data[i].name});
        }
        MainWindow.webContents.send("project", ret);
    });
}

function proj_idx(id){
    var idx = 0;
    for(var i=0; i<project_data.project.length; ++i){
        if(project_data.project[i].id == id){
            idx = i;
            break;
        }
    }
    return idx;
}

var create_new_project_file = proj_name => {

    var proj_dir   = path.join(app_root, "project", proj_name);
    fs.mkdir(proj_dir, err => {
        if(err) throw err;
        fs.mkdir(path.join(proj_dir, "layer"), err => {
            if(err) throw err;
            exports.load_project();
        });
    });

};

exports.create_project = project_name => {
    var new_id = 0;
    if(0 < project_data.project.length){
        var search = -1;
        for(var i=0; i<project_data.project.length; ++i){
            if(project_data.project[i].name == project_name){
                search = i;
                break;
            }
        }

        if(search != -1){
            MainWindow.webContents.send("error", '"' + project_name + '" has already used.');
            return;
        }

        new_id = project_data.project[project_data.project.length-1].id + 1; 
    }
    print("-------- new project ---------")
    print("new id       : " + new_id);
    print("project name : " + project_name + "\n");
    project_data.project.push({
        "id"          : new_id,
        "name"        : project_name,
        "Auther"      : "Anonymous",
        "createDate"  : new Date(),
        "lastModified": new Date()
    });

    fs.writeFile(proj_path, JSON.stringify(project_data, null, "    "), err => {
        if(err) MainWindow.webContents.send("error", err.message);
        else{
            create_new_project_file(project_name);
            // exports.load_project();
        }
    });
};


// レイヤー編集画面
exports.save_layer_data = (data, file_name) => {
    let layer_dir = path.join(
        path.parse(__dirname).dir,
        "project",
        project_data.project[proj_idx(target_id)].name,
        "layer"
    );
    // layerフォルダがない場合は作成
    mkdirp(layer_dir, err => {
        if(err) print("err");
        var save_path = path.join(layer_dir, file_name);
        print("save layer path : " + save_path);
        fs.writeFile(save_path, JSON.stringify(data, null, "    "), err => {
           if(err) MainWindow.webContents.send("error", "layer save error!");
        });
    });
};

// 学習画面
exports.select_dataset = () => {
    var opt = [
        {name:"pickle", extensions:['pkl']},
        {name:"All Files", extensions:['*']}
    ];
    open_file_dialog(opt);
};

exports.training_start = (dataset, disp) => {
    var train_script = path.join(path.parse(__dirname).dir, "src", "app", "OCR", "train", "trainCNN.py");
    var cmd = "";
    if(disp){
        cmd += "start python " + train_script + " " + dataset;
    }
    else{
        cmd += "python " + train_script + " " + dataset;
    }
    print("training command : " + cmd);
    exec(cmd, (err, stdout, stderr) => {
        if(err) throw err;
    });
};

// 推定画面
exports.show_file_dialog = () => {
    var opt = [
        {name:"Images", extensions:['jpg', 'png']},
        {name:"All Files", extensions:['*']}
    ];
    open_file_dialog(opt);
};

exports.predict_start = filename => {

    if(py_up != null){
        print("start_predict");
        print(filename);
        py_up.stdin.write(filename + "\r\n");
    }
};

var py_up = null;
exports.up_python = () => {
    var py_name = path.join(path.parse(__dirname).dir, "src", "app", "OCR", "predict", "predictCNN.py");
    // var py_name = path.join(path.parse(__dirname).dir, "src", "app", "OCR", "predict", "test.py");
    print(py_name);
    if(py_up == null){
        print("up_python");
        py_up = spawn("python", [py_name], {encoding: "utf8", stdio: "pipe"}, err => { print("error"); });
        var str = "";
        var chunk_flg = false;
        py_up.stdout.on("data", chunk => {
            var data = chunk.toString('UTF-8');
            
            if(0 <= data.indexOf("==chunk start==")) {
                data = data.split("==chunk start==")[1];
                chunk_flg = true;
            }
            
            if(chunk_flg){
                if(0 <= data.indexOf("==chunk end==")){
                    str += data.split("==chunk end==")[0];
                    chunk_flg = false;
                    print("predict_end");
                    MainWindow.webContents.send("predict_result", JSON.parse(str));
                    str = "";
                }
                else{
                    str += data;
                }
            }
        });
    }
};

// dataset作成画面
exports.load_font = () => {
    var os_name = process.platform;
    var font_dir = "";
    if(os_name == "win32") font_dir = "C:\\Windows\\Fonts";
    else if(os_name == "linux") font_dir = "/usr/share/fonts";
    else if(os_name == "darwin") font_dir = "/System/Library/Fonts/";
    else return;
    fs.readdir(font_dir, (err, files) => {
        if(err) throw err;
        var ret = files.filter(d => 0 <= d.indexOf(".ttf"))
                       .map(d => { 
                            return {
                               "name": path.basename(d, path.extname(d)),
                               "value": path.join(font_dir, d)
                            };
                        });
        MainWindow.webContents.send("font_list", ret);
    });
};

exports.create_train_data = data => {
    var create_root = path.join(path.parse(__dirname).dir, "src", "app", "train_data_maker");
    var settings = path.join(create_root, "create_info.json");

    fs.writeFile(settings, JSON.stringify(data, null, '    '), err => {
        if(err) throw err;

        var py_path = path.join(create_root, "train_data.py");
        var cmd = "start python " + py_path;
        exec(cmd, (err, stdout, stderr) => {
            if(err) throw err;
            print("train data created");
        });
    });
};

var webcam_py = null;
exports.cam_up_python = () => {
    var py_name = path.join(path.parse(__dirname).dir, "src", "app", "OCR", "predict", "webcam_predictCNN_v2.py");
    console.log("debug");
    if(webcam_py == null){
        webcam_py = spawn("python", [py_name], {encoding: "utf8", stdio: "pipe"}, err => { if(err) throw err; });
        print("webcam_up_python");
        var str = "";
        var chunk_flg = false;
        webcam_py.stdout.on("data", chunk => {
            var data = chunk.toString('UTF-8');
            // print(data);
            if(0 <= data.indexOf("==chunk start==")) {
                data = data.split("==chunk start==")[1];
                chunk_flg = true;
            }
            
            if(chunk_flg){
                if(0 <= data.indexOf("==chunk end==")){
                    str += data.split("==chunk end==")[0];
                    chunk_flg = false;
                    // print("predict_end");
                    MainWindow.webContents.send("predict_result", JSON.parse(str));
                    // webcam_py.stdin.write("continue" + "\r\n");
                    str = "";
                }
                else{
                    str += data;
                }
            }
        });
        // webcam_py.stdin.write("continue\r\n");
    }
};

exports.check_webcam_py = () => {
    print(webcam_py);
}

exports.camera_predict = b64img => {

    if(webcam_py != null){
        print("send");
        webcam_py.stdin.write(b64img + "\r\n");
    }
};

exports.stop_webcam = () => {

    if(webcam_py != null){
        webcam.kill();
        webcam = null;
    }
};
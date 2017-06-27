'use strict';
// liverload用の設定
const path        = require('path');
const fs          = require('fs');
const lrSnippet   = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
const folderMount = function folderMount(connect, dir){
    return connect.static(path.resolve(dir));
};

// rootpath取得
let dev_root = path.join(path.dirname(__filename), "develop");
let rls_root = path.join(path.dirname(__filename), "release");
// 各プロジェクトのフォルダパスを取得
let proj_list = [
    {"name":"neural_net_design",  "concat": true},
    {"name":"neural_net_combine", "concat": true},
    {"name":"neural_net_train",   "concat": true},
    {"name":"train_data_maker",   "concat": true},
    {"name":"camera_prediction",  "concat": true},
    {"name":"neural_net_predict", "concat": true},
    {"name":"project",            "concat": true},
    {"name":"design",             "concat": true}
];

function get_ext_file(list, ext){
    return list.filter(d => d.split(".").length === 2 && d.split(".")[1] === ext);
}

let init_grunt = (root, js_block, file_list, grunt) => {
    let js_list   = get_ext_file(file_list, "js");
    let css_list  = get_ext_file(file_list, "css");
    let html_list = get_ext_file(file_list, "html");

    let rls_path  = path.join(path.dirname(path.dirname(root)), "release", path.basename(root));
    print(rls_path);

    let pkg = grunt.file.readJSON('package.json');

    let d = js_list[0];

    // js_list.forEach(d => {

        let output_name = d.split(".")[0] + "-min.js";
        let org_path    = path.join(root, d);
        let output_path = path.join(rls_path, output_name);
        grunt.initConfig({
            uglify : {
                options:{
                    mangle  : true,
                    compress: true
                },
                build: {
                    src : output_path,
                    dest: org_path
                }
            }
        });

        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.registerTask('default', ["uglify"]);
    // });
};


let Task_process = (root, file_list, grunt) => {

    // ファイルリストから.htmlを取得する
    let html_file = file_list.filter(d => d.split(".").length === 2 && d.split(".")[1] === "html");
    if(0 === html_file.length) return;
    
    fs.readFile(path.join(root, html_file[0]), "utf-8", (err, text) => {
        
        let text_rows     = text.split("\r\n");
        let last_script   = false;
        let script_block  = [];
        
        text_rows.forEach(row => {
            
            if(-1 === row.indexOf("<script")){
                last_script = false;
                return;
            }

            if(-1 !== row.indexOf(".min.js")) return;
            
            if(last_script){
                script_block[script_block.length - 1].push(row);
            }
            else{
                script_block.push([row]);
            }
            last_script = true;
        });

        init_grunt(root, script_block, file_list, grunt);
    });

};


module.exports = grunt => {

    grunt.initConfig({
        uglify : {
            options:{
                mangle  : true,
                compress: true
            },
            build: {
                src : "./develop/",
                dest: org_path
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ["uglify"]);
    
    
    // // minify対象のプロジェクトごとのループ処理を行う
    // proj_list.forEach(d => {

    //     // proj_pathを作成
    //     let proj_path = path.join(dev_root, d.name);
    //     print( "project name : " + proj_path );
    //     fs.readdir(proj_path, (err, list) => {
    //         if(err) throw err;
    //         // Task_process(proj_path, list, grunt);
    //         init_grunt(proj_path, "", list, grunt);
    //     });
    // });
};


function print(message){
    console.log(message);
}
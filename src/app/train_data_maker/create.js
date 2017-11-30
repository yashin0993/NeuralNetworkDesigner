var FF     = d3.select("#menu").select(".font-family");
var CHAR   = d3.select("#menu").select(".charactor");
var ROTATE = d3.select("#menu").select(".rotate");

function add_child(){

    var head_doms = ["font-family", "charactor", "rotate"];
    
    head_doms.forEach(class_name => {
        var dom = d3.select("#header").select("." + class_name);
        dom.append("div").attr("class", "head-name").html(class_name);
        var btn_wrap = dom.append("div").attr("class", "btn-wrap");
        btn_wrap.append("label").html("全選択").attr("class", "select-all").on("click", select_all);
        btn_wrap.append("label").html("全解除").attr("class", "select-none").on("click", select_none);
    });

    // 選択項目の追加
    var main_doms = [FF, CHAR, ROTATE];

    main_doms.forEach((dom, i) => {
        var target = dom.selectAll(".list-block");
        
        target.append("input")
            .attr({
                "type": "checkbox",
                "class": "selector"
            })
            .on("click", () => calc_create_data_num());

        target.append("div").html(d => d.name)
        .attr({
            "class": "select-name",
            "style": d => {
                var font = (i==0) ? d.name : "arial";
                return "font-family:" + font;
            }
        });
    });

    // フッターの描画
    d3.select("#footer").append("div").html("生成データ数：").attr("id", "log");
    var ft_btn_wrap = d3.select("#footer").append("div").attr("id", "ft_btn_wrap");
    ft_btn_wrap.append("label").html("データ生成").attr("id", "create_btn").on("click", create_data);
    calc_create_data_num();
}

function data_bind(){
    FF.selectAll(".list-block")
        .data(FONT_LIST)
        .enter()
        .append("div")
        .attr({
            "class": "list-block"
        });

    CHAR.selectAll(".list-block")
        .data(CHAR_LIST)
        .enter()
        .append("div")
        .attr({
            "class": "list-block"
        });

    ROTATE.selectAll(".list-block")
        .data(ROTATE_LIST)
        .enter()
        .append("div")
        .attr({
            "class": "list-block"
        });

    add_child();
}

function loaded_font_list(list){
    FONT_LIST = list;
    data_bind();
}

function entry_point(){
    window.parent.load_font();
}

entry_point();












// var log = document.getElementById("log_area");

// // canvasの準備
// var square_size = 100;
// var canvas      = document.getElementById("draw_canvas");
// canvas.width    = square_size;
// canvas.height   = square_size;
// var ctx         = canvas.getContext('2d');
        
// var save_cnt = 0;
// var max_size = FONT_LIST.length * TEXT_LIST.length * ROTATE.length;
// function create_data(){
//     save_cnt = 0;
//     AddLog("create start");
//     AddLog("list[0/" + max_size + "]");
//     FONT_LIST.forEach((font, i) => {
//         TEXT_LIST.forEach((text, j) =>{
//             ROTATE.forEach(deg_d => {
//                 // 初期化
//                 ctx.setTransform(1, 0, 0, 1, 0, 0);
//                 ctx.clearRect(0, 0, square_size, square_size);
                
//                 // 背景を黒で塗りつぶす
//                 ctx.fillStyle = "rgb(0, 0, 0)";
//                 ctx.fillRect(0, 0, square_size, square_size);
//                 ctx.rotate(deg_d.val);
//                 // テキストの追加
//                 ctx.font = "24px " + font;
//                 ctx.fillStyle = 'rgb(255, 255, 255)';
//                 ctx.textAlign = 'center';
//                 ctx.textBaseline = 'middle';
//                 ctx.fillText(text.char, canvas.width/2, canvas.height/2);
                
//                 var base64str = canvas.toDataURL("image/png").split(',')[1];
//                 // メインプロセス側でファイルを出力してもらう
//                 SendImage(base64str, font + "_" + j + "_" + deg_d.deg);
//             });
//         });
//     });
// }

// function AddLog(str){ log.textContent += "\n" + str; }
// function UpdateLog(str){
//     var idx = log.textContent.lastIndexOf("\n");
//     log.textContent = log.textContent.substr(0, idx) + "\n" + str;
// }
// function CheckChange(e){ UpdateSaveType(e.checked ? 1 : 0); }
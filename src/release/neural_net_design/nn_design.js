const LAYER_W = 50;
const LAYER_H = 150;

let TARGET_NODE = null;
let NODES = [];
let EDGES = [];
let nodes_dictionary = {};
let DEBUG = false;
let FILE_TYPE = 0; // 0:新規,     1:既存
let EDIT_MODE = 0; // 0:編集なし, 1:編集中
let READ_TYPE = "";
let TARGET_LAYER = "Untitled.json";

let svg = d3.select("#canvas").on("mouseup", reset_up);
svg.html(
        '<filter id="drop-shadow" width="150%" height="150%">' +
            '<feGaussianBlur in="SourceAlpha" result="blur" stdDeviation="2" />' +
            '<feOffset result="offsetBlur" dx="2" dy="2" />' +
            '<feBlend in="SourceGraphic" in2="offsetBlur" mode="normal" />' +
        '</filter>'
    );
let svg_w   = svg[0][0].clientWidth;
let svg_h   = svg[0][0].clientHeight;


svg.append("rect").attr("id", "drag_screen").call(all_zoom);

let disp_ctrl = svg.append("g")
    .attr({
        "id": "disp_controller",
        "transform": "translate(0,0)scale(1.0)"
    });

disp_ctrl.append("g").attr("id", "edge_g");
disp_ctrl.append("g").attr("id", "layer_g");


document.getElementById("drag_screen").style.width  = svg_w + "px";
document.getElementById("drag_screen").style.height = svg_h + "px";



function update_layers(){
    // 所属するlayerグループを取得
    let layer_g = d3.select("#layer_g");
    // layerの対象外ノードを削除
    layer_g.selectAll(".layer")
        .data(NODES, d => d.id)
        .exit()
        .remove();
    // layerの対象ノードを更新
    layers = layer_g.selectAll(".layer")
        .data(NODES, d => d.id)
        .enter()
        .append("g")
        .attr({
            "class"    : "layer",
            "transform": d => "translate(" + d.pos.x + "," + d.pos.y + ")"
        });

    // 枠を追加
    layers.append("rect")
    .attr({
        "class"    : "node-rect",
        "width"    : LAYER_W,
        "height"   : LAYER_H,
        "rx"       : "8px",
        "ry"       : "8px",
        "stroke"   : "#555555",
        "fill"     : "#DDDDDD",
        "transform": "translate(" + (-LAYER_W/2) + "," + (-LAYER_H/2) + ")",
        "filter"   : "url(#drop-shadow)",
    })
    .on("mousedown", () => node_mousedown(d3.event.target))
    .on("mouseup", () => node_mouseup(d3.event.target))
    .on('contextmenu', show_layer_setting)
    .call(node_dragger);
    // レイヤー名テキストを追加
    layers.append("text")
    .text(d => d.name)
    .attr({
        "font-size"        : 12,
        "font-family"      : "arial",
        "pointer-events"   : "none",
        "text-anchor"      : "middle",
        "dominant-baseline": "central"
    });

    if(DEBUG){
        layers.append("text")
            .text(d => d.id)
            .attr({
                "font-size"        : 12,
                "font-family"      : "arial",
                "pointer-events"   : "none",
                "text-anchor"      : "middle",
                "dominant-baseline": "central",
                "transform"        : "translate(0,30)"
            });
    }

    // layerの接続専用のサークルを追加
    layers.append("circle")
    .attr({
        "class"    : "joint-in",
        "r"        : d => d.type !== "input" ? 6 : 0,
        "stroke"   : "#000",
        "cursor"   : "pointer",
        "opacity"  : 0.7,
        "transform": "translate(" + (-LAYER_W/2) + ",0)"
    })
    .on("mouseup", edge_drag_ended);
    // .call(edge_drag);
    layers.append("circle")
    .attr({
        "class"    : "joint-out",
        "r"        : d => d.type !== "output" ? 6 : 0,
        "stroke"   : "#000",
        "cursor"   : "pointer",
        "opacity"  : 0.7,
        "transform": "translate(" + LAYER_W/2 + ",0)"
    })
    .on("mousedown", edge_drag_started)
    .call(edge_dragger);

    d3.selectAll(".layer").select("text").text(d => d.name);
    d3.selectAll(".layer").attr("transform", d => "translate(" + d.pos.x + "," + d.pos.y + ")");
}

function update_edges(){
    // 所属するlayerグループを取得
    let edge_g = d3.select("#edge_g");
    // layerの対象外ノードを削除
    edge_g.selectAll(".edge").data(EDGES, d => d.id).exit().remove();
    edge_g.selectAll(".edge2").data(EDGES, d => d.id).exit().remove();
    // layerの対象ノードを更新
    edge_g.selectAll(".edge")
        .data(EDGES, d => d.id)
        .enter()
        .append("path")
        .attr({
            "class"          : "edge",
            "stroke"         : "#555555",
            "stroke-width"   : 5,
            "fill"           : "none",
            "pointer-events" : "none",
        });
    edge_g.selectAll(".edge2")
        .data(EDGES, d => d.id)
        .enter()
        .append("path")
        .attr({
            "class"          : "edge2",
            "stroke"         : "#EEEEEE",
            "stroke-width"   : 3,
            "fill"           : "none",
            "pointer-events" : "none",
        });
    
    d3.selectAll(".edge")
    .attr({
        "d"        : d => calc_path_coordinate(d),
        "transform": d => calc_edge_pos(d)
    });
    d3.selectAll(".edge2")
    .attr({
        "d"        : d => calc_path_coordinate(d),
        "transform": d => calc_edge_pos(d)
    });
}

// function set_top_menu(){
//     <label class="top-menu" onClick="data_save()">save</label>
// }

function set_icons(){

    icons = d3.select("#icon");
    icons.append("img")
        .attr({
            "id" : "setting_icon",
            "src": "../design/setting.png"
        })
        .on("click", edit_settings);
}

function set_side_menu(){
    let menu = d3.select("#menu");

    html_str = "";
    layer_type
        .filter(d => d !== "input" && d !== "output")
        .forEach((d, i)=> {
            html_str += '<input class="side-radio" type="checkbox" name="layer_menu" id="layer' + (i+1) + '"/>';
            html_str += '<label class="menu-label" for="layer' + (i+1) + '" onClick=add_layer("' + d + '")>' + d + '</label>';
        });

    menu.html(html_str);
}

function set_load_data(data){
    // zoomの初期値を更新
    all_zoom.translate([data.transform.x, data.transform.y])
            .scale([data.transform.scale]);
    // groupの初期位置を更新
    d3.select("#disp_controller")
        .attr("transform", "translate(" + data.transform.x + "," + data.transform.y + ")scale(" + data.transform.scale + ")")
    // データをバインド
    NODES = data.nodes;
    EDGES = data.edges;
    update_layers();
    update_edges();
}

function initial_draw(data){
    window.parent.title_update(TARGET_LAYER);

    set_top_menu();
    set_side_menu();
    set_icons();

    NODES = [
        {"id": 0, "type": layer_type[0], "name": "input", "pos": {"x":svg_w/2-LAYER_W, "y":svg_h/2}, "settings": ini_setting[layer_type[0]]},
        {"id": 1, "type": layer_type[7], "name": "output", "pos": {"x":svg_w/2+LAYER_W, "y":svg_h/2}, "settings": ini_setting[layer_type[7]]}
    ];
    EDGES = [
        {"id": 0, "from": 0, "to": 1}
    ];
    // 入力層、出力層を追加
    update_layers();
    update_edges();
}

function entry_point(){
    initial_draw();
}

entry_point();
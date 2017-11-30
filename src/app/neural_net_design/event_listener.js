
var all_zoom     = d3.behavior.zoom().on("zoom", zoom_pan);
var node_dragger = d3.behavior.drag().on("drag", dragging);
var edge_dragger = d3.behavior.drag().on("drag", edge_dragging);

var node_drag = false;
var edge_drag = false;

function zoom_pan(){
    // nodeをドラッグしていたら終了
    if(node_drag) return false;
    if(edge_drag) return false;
    
    // console.log("zoom pan");
    
    var target = d3.select("#disp_controller");
    target.attr({
        "transform": "translate(" + d3.event.translate[0] + "," + 
                                    d3.event.translate[1] +
                      ")scale(" + d3.event.scale + ")"
    });
}

window.onresize = ()=>{
    // console.log("resize");
    svg_w = d3.select("#canvas")[0][0].clientWidth;
    svg_h = d3.select("#canvas")[0][0].clientHeight;
    document.getElementById("drag_screen").style.width  = svg_w + "px";
    document.getElementById("drag_screen").style.height = svg_h + "px";
}

// var delete_timer = null;
function node_mousedown(_dom){
    // console.log("node mouse down");
    // d3.selectAll(".del-icon").remove();
    d3.selectAll(".layer")
        .select("rect")
        .attr({
            "stroke"       : "#555555",
            "stroke-width" : "1"
        });
    d3.select(_dom)
        .attr({
            "stroke"       : "orange",
            "stroke-width" : "3"
        });
    TARGET_NODE = _dom.__data__.id;
}

function node_mouseup(_dom){
    // console.log("node mouseup");
    var target = _dom.parentNode;
    var d = target.__data__;
    var pos = get_transform_value(d3.select(target).attr("transform"));
    var idx = -1;
    for(var i=0; i<NODES.length; ++i){
        if(d.id == NODES[i].id){
            idx = i;
            break;
        }
    }

    if(idx == -1) return;

    NODES[idx].pos.x = pos.x;
    NODES[idx].pos.y = pos.y;
}

function dragging(){
    // console.log("node drag");

    target = d3.select(this.parentNode);
    pos = get_transform_value(target.attr("transform"))
    target.attr("transform", "translate(" + (pos.x + d3.event.x) + "," + (pos.y + d3.event.y) + ")");
    update_edges();
}

var from_id = null;
function edge_drag_started(){
    // console.log("edge mousedown");
    edge_drag = true;
    from_id = this.parentNode.__data__.id;
    d3.select("#edge_g")
        .append("path")
        .attr({
            "id"          : "temp_path",
            "stroke"      : "#555555",
            "stroke-width": 5,
            "fill"        : "none"
        });
    d3.select("#edge_g")
        .append("path")
        .attr({
            "id"          : "temp_path2",
            "stroke"      : "#EEEEEE",
            "stroke-width": 3,
            "fill"        : "none"
        });
    cursor_pos = get_transform_value(d3.select(this.parentNode).attr("transform"));
    cursor_pos.x += LAYER_W;
}

var cursor_pos = null;
function edge_dragging(){
    // console.log("edge drag");
    cursor_pos = {x: cursor_pos.x + d3.event.dx, y: cursor_pos.y + d3.event.dy};
    d3.select("#temp_path")
        .attr({
            "d"        : d => calc_temp_path_coordinate(from_id, cursor_pos),
            "transform": d => calc_temp_edge_pos(from_id, cursor_pos)
        });
    d3.select("#temp_path2")
        .attr({
            "d"        : d => calc_temp_path_coordinate(from_id, cursor_pos),
            "transform": d => calc_temp_edge_pos(from_id, cursor_pos)
        });
}

function edge_drag_ended(){
    // console.log("edge mouseup");
    node_edge = true;
    edge_drag = false;
    EDGES = EDGES.filter(d => d.from !== from_id);
    var new_id = EDGES.length == 0 ? 0 : EDGES[EDGES.length - 1].id + 1;
    EDGES.push({"id": new_id, "from": from_id, "to": this.parentNode.__data__.id });
    d3.select("#temp_path").remove();
    d3.select("#temp_path2").remove();
    from_id = null;
    cursor_pos = null;
    NODES[get_node_idx(this.__data__.id)].settings.in_channels = get_input_size(this.__data__.id);
    update_layers();
    update_edges(); 
}

function reset_up(){
    d3.select("#temp_path").remove();
    d3.select("#temp_path").remove();
    from_id = null;
    cursor_pos = null;
}

function add_layer(layer_name){
    nodes_len = NODES.length;
    next_id = NODES[NODES.length - 1].id + 1;

    if(layer_name === layer_type[1]){
        NODES.push({
            "id"      : next_id,
            "type"    : layer_type[1],
            "name"    : "conv",
            "pos"     : {"x":svg_w/2, "y":svg_h/2},
            "settings": ini_setting[layer_type[1]]
        });
    }
    else if(layer_name === layer_type[2]){
        NODES.push({
            "id"      : next_id,
            "type"    : layer_type[2],
            "name"    : "pool",
            "pos"     : {"x":svg_w/2, "y":svg_h/2},
            "settings": ini_setting[layer_type[2]]
        });
    }
    else if(layer_name === layer_type[3]){
        NODES.push({
            "id"      : next_id,
            "type"    : layer_type[3],
            "name"    : "Affine",
            "pos"     : {"x":svg_w/2, "y":svg_h/2},
            "settings": ini_setting[layer_type[3]]
        });
    }
    else if(layer_name === layer_type[4]){
        NODES.push({
            "id"      : next_id,
            "type"    : layer_type[4],
            "name"    : "active",
            "pos"     : {"x":svg_w/2, "y":svg_h/2},
            "settings": ini_setting[layer_type[4]]
        });
    }
    else if(layer_name === layer_type[5]){
        NODES.push({
            "id"      : next_id,
            "type"    : layer_type[5],
            "name"    : "dropout",
            "pos"     : {"x":svg_w/2, "y":svg_h/2},
            "settings": ini_setting[layer_type[5]]
        });
    }
    else if(layer_name === layer_type[6]){
        NODES.push({
            "id"      : next_id,
            "type"    : layer_type[6],
            "name"    : "LRN",
            "pos"     : {"x":svg_w/2, "y":svg_h/2},
            "settings": ini_setting[layer_type[6]]
        });
    }

    update_layers();
}

function show_layer_setting(_d){
    if(_d.type == layer_type[0]){
        show_setting_dialg({
            "name"     : _d.name,
            "dimension": _d.settings.dimension,
            "width"    : _d.settings.width,
            "height"   : _d.settings.height,
            "channel"  : _d.settings.channel
        }, false);
    }
    else if(_d.type == layer_type[1]){
        show_setting_dialg({
            "name"        : _d.name,
            "in_channels" : get_input_size(_d.id),
            "out_channels": _d.settings.out_channels,
            "filter_size" : _d.settings.filter_size,
            "stride"      : _d.settings.stride,
            "padding"     : _d.settings.padding
        }, false);
    }
    else if(_d.type == layer_type[2]){
        show_setting_dialg({
            "name"  : _d.name,
            "width" : _d.settings.width,
            "height": _d.settings.height,
            "stride": _d.settings.stride
        }, false);
    }
    else if(_d.type == layer_type[3]){
        show_setting_dialg({
            "name"        : _d.name,
            "in_channels" : get_input_size(_d.id),
            "out_channels": _d.settings.out_channels
        }, false);
    }
    else if(_d.type == layer_type[4]){
        show_setting_dialg({
            "name": _d.name,
            "type": _d.settings.type
        }, true);
    }
    else if(_d.type == layer_type[5]){
        show_setting_dialg({
            "name": _d.name,
            "rate": _d.settings.rate
        }, false);
    }
    else if(_d.type == layer_type[6]){
        show_setting_dialg({
            "name": _d.name
        }, false);
    }
    else if(_d.type == layer_type[7]){
        show_setting_dialg({
            "name"        : _d.name,
            "output_size" : get_input_size(_d.id)//__d.settings.output_size
        }, false);
    }
}

function show_setting_dialg(settings, select){
    var setting_g = svg.append("g").attr("id", "setting");
    setting_g.append("rect")
        .attr({
            "width"  : "100%",
            "height" : "100%",
            "stroke" : "#333333",
            "fill"   : "#333333",
            "opacity": 0.3
        });

    fo_g = setting_g.append("g")
        .attr({
            "transform": "translate(" + svg[0][0].clientWidth/2 + "," + svg[0][0].clientHeight/2 + ")"
        });

    fo = fo_g.append("foreignObject")
        .attr({
            "width"    : 400,
            "height"   : 300,
            "stroke"   : "#AAAAAA",
            "fill"     : "#EEEEEE",
            "transform": "translate(" + (-200) + "," + (-150) + ")"
        });
    
    var wrap_div = fo.append("xhtml:div").attr("id", "setting_wrap");
    var set_str = "";
    if(select){
        var selected = settings.type == "relu" ? [" selected", ""] : ["", " selected"];

        set_str += '<div class="setting-row"><label class="setting-key">name</label><input type="text" value="' + settings.name + '"/></div>';
        set_str += '<div class="setting-row">' + 
                        '<label class="setting-key">type</label>' + 
                        '<select>' + 
                            '<option value="relu"' + selected[0] + '>ReLU</option>' + 
                            '<option value="sigmoid"' + selected[1] + '>Sigmoid</option>' +
                        '</select>' +
                    '</div>';
    }else{
        for(var key in settings){
            set_str += '<div class="setting-row"><label class="setting-key">' + key + '</label><input type="text" value="' + settings[key] + '"/></div>';
        }
    }
    wrap_div.html(
        '<div id="setting_header">' + 
            set_str + 
        '</div>' + 
        '<div id="setting_footer">' +
            '<label class="setting-btn" onClick="setting_close(true)">save</label>' + 
            '<label class="setting-btn" onClick="setting_close(false)">cancel</label>' + 
        '</div>'
    );
}

function setting_close(save){
    if(save){
        // 保存処理
        var node_idx = 0;
        for(var i=0; i<NODES.length; ++i){
            if(NODES[i].id == TARGET_NODE){
                node_idx = i;
                break;
            }
        }

        var divs = d3.selectAll(".setting-row")[0];
        divs.forEach(dom => {
            var key = d3.select(dom).select("label")[0][0].textContent;
            var value_dom = d3.select(dom).select("input");
            value = value_dom[0][0] != null ? value_dom[0][0].value : d3.select(dom).select("select")[0][0].value;
            
            if(key != "in_channels"){
                if(key == "name") NODES[node_idx][key] = value;
                if(key == "type") NODES[node_idx]["settings"][key] = value;
                else              NODES[node_idx]["settings"][key] = Number(value);
            }
            
        });
    }

    d3.select("#setting").remove();
    update_layers();
}

function data_save(){

    NODES.filter(d=>d.id != 0)
    .forEach(d=>{
        // エッジのつながりからin_channelsを更新する
        NODES[get_node_idx(d.id)].settings.in_channels = get_input_size(d.id);
    });

    //全体移動分を取得
    var transform = get_transform_value(
        d3.select("#disp_controller").attr("transform")
    );

    var save_data = {
        "transform" : transform,
        "nodes"     : NODES,
        "edges"     : EDGES,
        "layer_info": get_layer_info(),
        "config"    : CONFIG_DATA
    };
    console.log("save layer info.")
    window.parent.save_layer_data(save_data, TARGET_LAYER);
    show_save_pop();
}

function get_node_idx(target_idx){
    var idx = -1;
    for(var i=0; i<NODES.length; ++i){
        if(target_idx == NODES[i].id){
            idx = i;
            break;
        }
    }
    return idx;
}

function save_setting(save){
    if(save){
        CONFIG_DATA.epoch     = document.getElementById("epoch").valueAsNumber;
        CONFIG_DATA.batch     = document.getElementById("batch").valueAsNumber;
        CONFIG_DATA.optimizer = document.getElementById("optimizer").value;
        CONFIG_DATA.lr        = document.getElementById("lr").valueAsNumber;
    }
    d3.select("#config_bg").remove();
}

function edit_settings(){
    var option_str = "";
    optimizer_list.forEach(d => {
        var selected = (CONFIG_DATA.optimizer == d) ? "selected" : "";
        option_str+= '<option ' + selected + '>' + d + '</option>';
    });


    var bg = d3.select("body").append("div").attr("id", "config_bg");
    bg.html(
        '<div id="setting_board">' + 
            '<div id="setting_header">' +
                '<div class="setting-row"><label class="setting-key">epochs</label><input type="number" id="epoch" value="' + CONFIG_DATA.epoch + '"/></div>' +
                '<div class="setting-row"><label class="setting-key">batch_size</label><input type="number" id="batch"  value="' + CONFIG_DATA.batch + '"/></div>' +
                '<div class="setting-row">' +
                    '<label class="setting-key">optimizer</label>' +
                    '<select id="optimizer">' + option_str + '</select>' +
                '</div>' +
                '<div class="setting-row"><label class="setting-key">learning_ratio</label><input type="number" id="lr"  value="' + CONFIG_DATA.lr + '"/></div>' +
            '</div>' + 
            '<div id="setting_footer">' +
                '<label class="setting-btn" onClick="save_setting(true)">OK</label>' +
                '<label class="setting-btn" onClick="save_setting(false)">cancel</label>' + 
            '</div>' + 
        '</div>'
    );
}

function read_file(path, data){
    if(READ_TYPE == "layer"){
        set_load_data(data);
    }
}
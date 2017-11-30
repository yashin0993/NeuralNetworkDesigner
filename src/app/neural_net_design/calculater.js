// transform文字列から座標値を返す
function get_transform_value(transform){
    var transform = transform.split("scale");
    var translate = transform[0];
    var scale = null;
    if(2 == transform.length){
        scale = transform[1];
        scale = Number(scale.replace("(", "").replace(")", ""));
    }
    var splt = translate.replace("translate(", "").replace(")", "").split(",");
    return {x:Number(splt[0]), y:Number(splt[1]), scale:scale}; 
}

function calc_d(from_pos, to_pos){
    if(from_pos.x < to_pos.x){
        var x = Math.abs(from_pos.x - to_pos.x) - LAYER_W;
        var y = Math.abs(from_pos.y - to_pos.y);
        if(to_pos.y < from_pos.y){
            return "M" + (-x/2) + "," + y/2 + " " +
                   "Q0," + y/2 + " " + "0,0" + " " + 
                   "Q0," + (-y/2) + " " + x/2 + "," + (-y/2);
        }
        else{
            return "M" + (-x/2) + "," + (-y/2) + " " +
                   "Q0," + (-y/2) + " " + "0,0" + " " + 
                   "Q0," + y/2 + " " + x/2 + "," + y/2;
        }
    }
    else{
        var x = Math.abs(from_pos.x - to_pos.x) + LAYER_W;
        var y = Math.abs(from_pos.y - to_pos.y);
        if(to_pos.y < from_pos.y){ // LAYER_W/2
            return "M" + x/2 + "," + y/2 + " " +
                   "Q" + (x/2 + y/4) + "," + y/2 + " " + (x/2 + y/4) + "," + y/4 + 
                   "Q" + (x/2 + y/4) + ",0" + " " + x/2 + ",0" + " " + 
                   "L" + (-x/2) + ",0" + 
                   "Q" + (-x/2 - y/4) + ",0" + " " + (-x/2 - y/4) + "," + (-y/4) + " " + (-x/2 - y/4) + "," + (-y/2) + " " + 
                    (-x/2) + "," + (-y/2);
        }
        else{
            return "M" + x/2 + "," + (-y/2) + " " +
                   "Q" + (x/2 + y/4) + "," + (-y/2) + " " + (x/2 + y/4) + "," + (-y/4) + 
                   "Q" + (x/2 + y/4) + ",0" + " " + x/2 + ",0" + " " + 
                   "L" + (-x/2) + ",0" + 
                   "Q" + (-x/2 - y/4) + ",0" + " " + (-x/2 - y/4) + "," + y/4 + " " + (-x/2 - y/4) + "," + y/2 + " " + 
                    (-x/2) + "," + y/2;
        }
    }
}

function calc_temp_path_coordinate(from_id, to_pos){
    var from = d3.selectAll(".layer")[0].filter(dom => dom.__data__.id == from_id);
    var from_pos = get_transform_value(d3.select(from[0]).attr("transform"));
    return calc_d(from_pos, to_pos);
}

function calc_path_coordinate(_d){
    ret = get_edge_pos(_d);
    return calc_d(ret.from, ret.to);
}

function get_edge_pos(_d){
    var from = d3.selectAll(".layer")[0].filter(dom => dom.__data__.id == _d.from);
    var to = d3.selectAll(".layer")[0].filter(dom => dom.__data__.id == _d.to);
    
    if(from.length == 0 || to.length == 0){
        return "translate(0,0)";
    }

    var from_pos = get_transform_value(d3.select(from[0]).attr("transform"));
    var to_pos   = get_transform_value(d3.select(to[0]).attr("transform"));

    return {"from": from_pos, "to": to_pos};
}
function calc_temp_edge_pos(from_id, to_pos){
    var from = d3.selectAll(".layer")[0].filter(dom => dom.__data__.id == from_id);
    var from_pos = get_transform_value(d3.select(from[0]).attr("transform"));
    return "translate(" + ((from_pos.x + to_pos.x) / 2) + "," + ((from_pos.y + to_pos.y) / 2) + ")";
}

function calc_edge_pos(_d){
    ret = get_edge_pos(_d);
    return "translate(" + ((ret.from.x + ret.to.x) / 2) + "," + ((ret.from.y + ret.to.y) / 2) + ")";
}

function get_input_size(_node_id){
    var ret = "";
    var node_id = _node_id;
    var pre_node_id = -1;
    while(pre_node_id != 0){
        var target_edge = EDGES.filter(d => d.to == node_id);
        // ノードがつながっていない場合は空文字を返す
        if(target_edge.length == 0) break;

        // pre_nodeの情報を取得
        pre_node_id = target_edge[0].from;
        var pre_node = NODES[get_node_idx(pre_node_id)];
        // pre_nodeがconvまたはaffineの場合はそのoutputの値を取得
        if(pre_node.type == layer_type[1] || pre_node.type == layer_type[3]){
            ret = pre_node.settings.out_channels;
            break;
        }
        else if(pre_node.type == layer_type[0]){
            ret = pre_node.settings.channel;
            break;
        }

        node_id = pre_node_id;
    }
    return ret;
}

function get_layer_info(){

    // EDGESからノードの連結順を取得
    var node_ids = [];
    var t_from = 0; 
    while(1){
        var t_edge = EDGES.filter(d => d.from == t_from);
        
        if(t_edge.length == 0) break;

        to_node_id = t_edge[0].to;

        node_ids.push(to_node_id);
        t_from = to_node_id;
    }

    // 最後のfromが出力層でなければnullを返す
    if(t_from != 1) return null;

    var ret = [];
    node_ids.filter(d => d != 0 && d != 1)
            .forEach(d => {
                var node = NODES[get_node_idx(d)];
                ret.push(node);
            });
    return ret;
}

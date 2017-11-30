function show_save_pop(){
    var pop_area = d3.select("body")
        .append("div")
        .attr("class", "save-pop")
        .html("Layer data saved!");

    pop_area.attr("class", "save-pop on");

    window.setTimeout(hidden_save_pop, 2000);
}

function hidden_save_pop(){
    d3.selectAll(".save-pop").remove();
}

document.onkeydown = e => {

    // キーコード
	var key_code = e.keyCode;
	// Shiftキーの押下状態
	var shift_key = e.shiftKey;
	// Ctrlキーの押下状態
	var ctrl_key = e.ctrlKey;
	// Altキーの押下状態
	var alt_key = e.altKey;   

    // left
    if(key_code == 37) move_node(-1, 0);
    // up
    else if(key_code == 38) move_node(0, -1);
    // right
    else if(key_code == 39) move_node(1, 0);
    // down
    else if(key_code == 40) move_node(0, 1);
    // save(ctrl + s)
    else if(ctrl_key && key_code == 83) data_save();
    // delete(ctrl + x)
    else if(ctrl_key && key_code == 88) delete_node();
};

function move_node(x_move, y_move){
    if(TARGET_NODE == null) return;

    NODES[get_node_idx(TARGET_NODE)].pos.x += x_move;
    NODES[get_node_idx(TARGET_NODE)].pos.y += y_move;
    update_layers();
    update_edges();
}

function delete_node(){
    if(TARGET_NODE == null || TARGET_NODE == 0 || TARGET_NODE == 1) return;
    
    // ノードを削除
    NODES.splice(get_node_idx(TARGET_NODE), 1);
    // エッジを削除
    EDGES = EDGES.filter(d => d.from != TARGET_NODE && d.to != TARGET_NODE);
    update_layers();
    update_edges(); 
}
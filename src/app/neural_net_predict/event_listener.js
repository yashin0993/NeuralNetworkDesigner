
function show_file_dialog(){
    window.parent.show_file_dialog();
}


function set_file_name(filename){
    document.getElementById("filename").value = filename;
    var img = new Image();
    img.src = filename;
    img.onload = ()=>{
        info_area.selectAll(".info-row").remove();
        d3.selectAll(".bbox").remove();

        d3.select("#image_area")
        .attr({
            "width" : img.width,
            "height": img.height
        });
        img_svg.attr({
            "width" : img.width,
            "height": img.height
        });
        svg_img.attr({
                "xlink:href": filename,
                "width"     : img.width,
                "height"    : img.height
            });

        window.parent.predict_start(filename);
    }
}

function predict_start(){
    var filename = document.getElementById("filename").value;
    console.log(filename);
    window.parent.predict_start(filename);
}

function show_predict_redult(data){
    res_data = data.result;
    draw_result_image(data);
    draw_result_info(data);
}

function draw_result_image(data){
    bboxes = bbox_g.selectAll(".bbox")
        .data(data.result)
        .enter()
        .append("g")
        .attr({
            "class": "bbox",
            "transform": d => "translate(" + (d.bbox.min_x + d.bbox.max_x)/2 + "," + (d.bbox.min_y + d.bbox.max_y)/2 + ")"
        });

    bboxes.append("rect")
        .attr({
            "width"       : d => d.bbox.max_x - d.bbox.min_x,
            "height"      : d => d.bbox.max_y - d.bbox.min_y,
            "fill"        : "white",
            "opacity"     : 0,
            "cursor"      : "pointer",
            "transform"   : d => "translate(" + (-(d.bbox.max_x - d.bbox.min_x)/2) + "," + (-(d.bbox.max_y - d.bbox.min_y)/2) + ")"
        })
        .on("mouseover", () => {
            d3.select(d3.event.target.parentNode).select(".rect-edge").attr("stroke", "#EE00EE");
            d3.select(d3.event.target.parentNode).select(".rect-head").attr({"stroke": "#EE00EE", "fill": "#EE00EE"});
        })
        .on("mouseout", () => {
            d3.select(d3.event.target.parentNode).select(".rect-edge").attr("stroke", "#1E90FF");
            d3.select(d3.event.target.parentNode).select(".rect-head").attr({"stroke": "#1E90FF", "fill": "#1E90FF"});
        })
        .on("click", bbox_clicked);
    bboxes.append("rect")
        .attr({
            "class"       : "rect-edge",
            "width"       : d => d.bbox.max_x - d.bbox.min_x,
            "height"      : d => d.bbox.max_y - d.bbox.min_y,
            "stroke"      : "#1E90FF",
            "stroke-width": 3,
            "fill"        : "none",
            "transform"   : d => "translate(" + (-(d.bbox.max_x - d.bbox.min_x)/2) + "," + (-(d.bbox.max_y - d.bbox.min_y)/2) + ")"
        });
    bboxes.append("rect")
        .attr({
            "class"       : "rect-head",
            "width"       : d => d.bbox.max_x - d.bbox.min_x,
            "height"      : d => 20,
            "stroke"      : "#1E90FF",
            "stroke-width": 3,
            "fill"        : "#1E90FF",
            "transform"   : d => "translate(" + (-(d.bbox.max_x - d.bbox.min_x)/2) + "," + ((-(d.bbox.max_y - d.bbox.min_y)/2)-20) + ")"
        });
    bboxes.append("text")
        .text(d => get_char_from_idx(d.number))
        .attr({
            "font-size"        : 18,
            "stroke"           : "#FFFFFF",
            "stroke-width"     : 1,
            "fill"             : "#FFFFFF",
            "text-anchor"      : "middle",
            "dominant-baseline": "central",
            "transform"        : d => "translate(0," + (-(d.bbox.max_y - d.bbox.min_y)/2 - 10) + ")"
        });
}

var res_data;
function draw_result_info(data){
    ini_data = [];
    for(var i=0; i<res_data[0].rate.length; ++i){
        ini_data.push(1/res_data[0].rate.length);
    }

    update_info_bar(ini_data);
}

function update_info_bar(rate_data){
    var bar_height = 20;
    var bar_max_width = 300;

    var bind_data = rate_data.map(function(d, i){ return {"label": i, "value": d}; });
    
    var row = d3.select("#info_area").selectAll(".info-row")
        .data(bind_data, d => d.label);
        
        
    var append_row = row.enter()
        .append("div")
        .attr("class", "info-row");

    append_row.append("div").attr("class", "info-label").html(d => get_char_from_idx(d.label));
    append_row.append("div").attr("class", "info-rate-bar");
    append_row.append("div").attr("class", "info-value").html(d => d.value);

    row.select(".info-rate-bar").attr({
        "style": d => "width:" + (300 * d.value) + "px;background: rgb(64,64," + (Math.round(d.value * 128) + 128) + ")"
    });

    row.select(".info-value").html(d => d.value);
}

function bbox_clicked(){
    update_info_bar(this.__data__.rate);
}

function get_char_from_idx(idx){
    var target = CHAR_LIST.filter(d => d.value == idx);
    if(target.length == 0){
        return idx;
    }
    return target[0].name;
}
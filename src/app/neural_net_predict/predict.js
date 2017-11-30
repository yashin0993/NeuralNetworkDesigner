
// function show_file_dialog(){
//     window.parent.show_file_dialog();
// }

// function set_file_name(filename){
//     document.getElementById("filename").value = filename;
// }

// function predict_start(){
//     var filename = document.getElementById("filename").value;
//     console.log(filename);
//     window.parent.predict_start(filename);
// }

// function show_predict_redult(data){

// }

window.parent.up_python();

var img_svg = d3.select("#image_area").append("svg").attr("id", "img_canvas");
var svg_img = img_svg.append("svg:image").attr("id", "target_image");
var bbox_g = img_svg.append("g").attr("id", "bbox_g");

// var info_svg = d3.select("#info_area").append("svg").attr("id", "info_canvas");
var info_area = d3.select("#info_area");
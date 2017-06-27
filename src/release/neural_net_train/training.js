
function select_dataset(){
    window.parent.select_dataset();
}

function set_file_name(filename){
    document.getElementById("dataset").value = filename;
}

function training_start(){
    var dataset = document.getElementById("dataset").value;
    var checked = document.getElementById("disp").checked;
    console.log(checked);
    window.parent.training_start(dataset, checked);
}

function select_all(){
    set_select(this.parentNode.parentNode.className, true);
    calc_create_data_num();
}

function select_none(){
    set_select(this.parentNode.parentNode.className, null);
    calc_create_data_num();
}

function set_select(area, check){
    var selector = d3.select("#menu").select("." + area).selectAll(".selector").attr("checked", check);
}

function create_data(){
    var ff     = get_checked_list(".font-family");
    var char   = get_checked_list(".charactor");
    var rotate = get_checked_list(".rotate");
    window.parent.create_train_data({
        "font-family": ff,
        "charactor"  : char,
        "rotate"     : rotate
    });
}

function get_checked_list(class_name){
    var doms = d3.select("#menu")
        .select(class_name)
        .selectAll(".selector")[0];

    var ret = []
    doms.forEach(dom => {
        if(dom.checked == true) ret.push(dom.__data__);
    });
    return ret;
}

function calc_create_data_num(){
    var ff     = get_checked_list(".font-family");
    var char   = get_checked_list(".charactor");
    var rotate = get_checked_list(".rotate");
    var num = ff.length * char.length * rotate.length;
    d3.select("#log").html("生成データ数： " + num);
}


function create_new_layers(){
    console.log("new");
};

function open_layers(){
    READ_TYPE = "layer";
    window.parent.open_dialog({
        "type"   : "file",
        "filters": [
            {"name": "layer", "extension": ['json']}
        ]
    });
};

function save_layers(){
    data_save();
};

var menu_data = [
    {
        name     : "File", 
        event    : null,
        children : [
            {
                name     : "new",
                event    : create_new_layers,
                children : null
            },
            {
                name     : "open",
                event    : open_layers,
                children : null
            },
            {
                name     : "save",
                event    : save_layers,
                children : null
            }
        ]
    },
    {
        name     : "Edit",
        event    : null,
        children : [
            {
                name     : "Undo",
                event    : null,
                children : null
            },
            {
                name     : "Redo",
                event    : null,
                children : null
            }
        ]
    }
];

var flg = false;
var timeout_ev = null;
function set_top_menu(){

    function uncheck_input(){
        var ipt = document.getElementsByClassName("root-ipt");
        for(var i=0; i<ipt.length; ++i){
            ipt[i].checked = false;
        }
    }

    var root = d3.select("#top_bar").selectAll(".root-menu")
        .data(menu_data)
        .enter()
        .append("div")
        .attr("class", "root-menu");
    root.append("input")
        .attr({
            "type" : "checkbox",
            "class": "root-ipt",
            "id"   : (d, i) => "root_" + i,
            "name" : "root_menu"
        })
        .on("mouseout", () => {
            var s = 1;
        });
    root.append("label")
        .attr({
            "class" : "root-label",
            "for"   : (d,i) => "root_" + i
        })
        .html(d => d.name)
        .on("mouseout", () => {
            // メニューにmouseoverしなければ100ms後にcheckをはずす
            timeout_ev = window.setTimeout(()=>{
                uncheck_input();
            }, 50);
        });

    var child = root.append("div")
        .attr("class", "child")
        .on("mouseover", () => {
            // checkをはずすmouseoutイベントのtimeoutを削除する
            if(timeout_ev != null){
                clearTimeout(timeout_ev);
                timeout_ev = null;
            }
        })
        .on("mouseout", () => {
            timeout_ev = window.setTimeout(()=>{
                uncheck_input();
            }, 50);
        });

    child.selectAll(".child-menu")
        .data(d => d.children)
        .enter()
        .append("div")
        .attr("class", "child-menu")
        .html(d => d.name)
        .on("click", d => {
            if(d.event != null) d.event();
            uncheck_input();
        });
}
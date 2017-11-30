// プロジェクトデータ読込み要求
function load_project(){
    window.parent.load_project();
}

// プロジェクトリストDOM新規追加関数
function add_projects(projects){
    var new_projects = projects.enter()
        .append("div")
        .attr("class", "project-div");
    
    new_projects.append("label")
        .attr("class", "project-name")
        .html(d => d.name);
    new_projects.append("label")
        .attr("class", "common-btn project-btn")
        .html("選択")
        .on("click", select_project);
}

// プロジェクトリストDOM更新関数
function update_projects(){
    var list = d3.selectAll(".project-div");
    list.select(".project-name").html(d => d.name);
}

// プロジェクトデータ読込み時呼び出される
function show_project(data){
    var pl = d3.select("#project_list");
    var projects = pl.selectAll(".project-div")
        .data(data, d => d.id);
    
    projects.exit().remove();
    add_projects(projects);
    update_projects();
}

// プロジェクトを選択イベントリスナ
function select_project(d){
    window.parent.open_project(d);
    window.parent.SideClick(0);
}

function form_close(flg){
    if(flg){
        var project_name = document.getElementById("project_name").value;
        window.parent.create_project(project_name);
    }
    else{
        document.getElementById("create_check").checked = false;
    }
}
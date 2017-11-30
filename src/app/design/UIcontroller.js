function OpenSideMenu(){
    menu = document.getElementById('side_menu');
    cls  = menu.getAttribute('class');
    menu.setAttribute('class', cls === "side-menu-close" ? "side-menu-open" : "side-menu-close");
}

[].forEach.call(document.getElementsByClassName('side-label'), x => {
    x.addEventListener('click', SelectMenu);
});

function SelectMenu(){
    OpenSideMenu();
}

function SideClick(idx){
    iframe = document.getElementById('main_view')
    if(idx === 0) iframe.src = './app/neural_net_design/nn_design.html';
    else if(idx===1) iframe.src = './app/train_data_maker/create.html';
    else if(idx===2) iframe.src = './app/neural_net_train/training.html';
    else if(idx===3) iframe.src = './app/neural_net_predict/predict.html';
    else if(idx===4) iframe.src = './app/neural_net_combine/nn_combine.html';
    else if(idx===5) iframe.src = './app/camera_prediction/camera.html';
    else if(idx===-1){
        iframe.src = './app/project/project.html';
        document.getElementById("main_menu").className = "off";
        document.getElementById('side_menu').className = "side-menu-close";
    }
}

function open_project(data){
    // sessionstorageに保存
    window.sessionStorage.setItem("project_id", data.id);
    // menuボタンを表示
    document.getElementById("main_menu").className = "on";
    SideClick(0);
}

function title_update(title){
    document.getElementById("app_title").innerHTML = "Neural Network Designer[*" + title.split(".")[0] + "]";
}

var interval = null;
var video = document.getElementById("camera");
var canvas = document.getElementById("screen");
canvas.width = 640;
canvas.height = 480;
var context = canvas.getContext("2d");
var box_canvas = document.getElementById("box_screen");
box_canvas.width = 640;
box_canvas.height = 480;
var box_context = box_canvas.getContext("2d");


window.parent.cam_up_python();


var constraints = {audio : true, video : {width : 1280, height : 720} };
navigator.mediaDevices = navigator.mediaDevices || ((navigator.webkitGetUserMedia || navigator.mozGetUserMedia) ? {
    getUserMedia: function(c){
        return new Promise(function(y, n){
            (navigator.webkitGetUserMedia || 
            navigator.mozGetUserMedia).call(navigator, c, y, n);
        });
    }
} : null);



function webcam_connect(){
    if(!navigator.mediaDevices){
        console.log("getUserMedia() not supported");
        return;
    }
    connect = true;
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream){
            // canvas_draw(stream);
            video.src = window.URL.createObjectURL(stream);
            video.onloadedmetadata = function(e){
                video.play();
                canvas_play();
            };
        })
        .catch(function(err){
            alert(err.name);
        });
}

var connect = false;
function webcam_disconnect(){
    video.pause();
    if(connect){
        connect = false;
    }
    // window.parent.stop_webcam();
    // if(interval != null){
    //     clearInterval(interval);
    //     interval = null;
    // }
}



// function canvas_play(){
//     interval = setInterval(function(){
//         context.drawImage(video, 0, 0, 640, 480);
//         var base64_str = canvas.toDataURL('image/jpg').split(",")[1]
//         // console.log(base64_str)
//         window.parent.camera_predict(base64_str);
//     }, 1000/30);
// }

function canvas_play(){
    context.drawImage(video, 0, 0, 640, 480);
    var base64_str = canvas.toDataURL('image/jpg').split(",")[1]
    // console.log(base64_str)
    window.parent.camera_predict(base64_str);
}


function send_webcam(){
    var base64_str = canvas.toDataURL('image/jpg').split(",")[1]
    // console.log(base64_str)
    window.parent.camera_predict(base64_str);
    // window.parent.send_webcam();
}

function show_predict_redult(data){
    box_context.clearRect(0, 0, box_canvas.width, box_canvas.height);
    box_context.beginPath();
    
    data.result.forEach(d => {

        // Rect
        box_context.strokeStyle = 'rgb(255, 0, 255)'; // 赤
        box_context.rect(
            d.bbox.min_x,
            d.bbox.min_y,
            d.bbox.max_x - d.bbox.min_x,
            d.bbox.max_y - d.bbox.min_y
        );
        box_context.stroke();

        // 文字背景
        var x = d.bbox.min_x - 1,
            y = d.bbox.min_y - 15,
            w = d.bbox.max_x - d.bbox.min_x + 2,
            h = 15,
            cx = d.bbox.max_x - ((d.bbox.max_x - d.bbox.min_x)/2) - 4,
            cy = d.bbox.min_y - 3;
        if(d.bbox.min_y - 15 < 0){
            y = d.bbox.max_y;
            cy = d.bbox.max_y + 12;
        }
        box_context.beginPath();
        box_context.fillStyle = 'rgb(255, 0, 255)'; // 赤
        box_context.fillRect(x, y, w, h);
        box_context.fill();

        // 文字
        box_context.fillStyle = 'rgb(255, 255, 255)'; // 赤
        box_context.font = "14px 'Arial'";
        box_context.fillText(get_char_from_idx(d.number), cx, cy);
        box_context.fill();
    });

    if(connect) canvas_play();
}

function get_char_from_idx(idx){
    var target = CHAR_LIST.filter(d => d.value == idx);
    if(target.length == 0){
        return idx;
    }
    return target[0].name;
}
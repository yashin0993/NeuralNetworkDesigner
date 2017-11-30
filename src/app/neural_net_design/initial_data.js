
/** 
 * 0: input  
 * 1: convolution  
 * 2: pooling  
 * 3: Affine  
 * 4: Activation  
 * 5: Dropout  
 * 6: LRN(LocalResponseNormalization)  
 * 7: output  
 */ 
let layer_type = [
    "input",
    "convolution",
    "pooling",
    "Affine",
    "Activation",
    "Dropout",
    "LRN",
    "output"
];

let  ini_setting = {
    "input":{
        "dimension": 3,
        "width"    : 28,
        "height"   : 28,
        "channel"  : 3
    },
    "convolution":{
        "in_channels"    : -1,
        "out_channels"   : 64,
        "filter_size"    : 3,
        "stride"         : 1,
        "padding"        : 1
    },
    "pooling":{
        "width" : 2,
        "height": 2,
        "stride": 2
    },
    "Affine":{
        "in_channels" : -1,
        "out_channels": 50,
    },
    "Activation":{
        "type": "ReLU",
    },
    "Dropout":{
        "rate": 0.5
    },
    "LRN":{
    },
    "output":{
    }
};

let CONFIG_DATA = {
    "epoch"    : 10,
    "batch"    : 100,
    "optimizer": "Adagrad",
    "lr"       : 0.01
};

let optimizer_list = [
    "Adagrad",
    "Adam",
    "MonmentumSGD",
    "Adadelta"
];
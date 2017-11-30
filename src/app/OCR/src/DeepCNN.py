# coding: utf-8
import os
import pickle
import json
import math
import numpy as np

import chainer
import chainer.functions as F
import chainer.links as L
import six

root_path = os.path.dirname(os.path.dirname(__file__))


class DeepCNN(chainer.Chain):
    '''
    多層たたみ込みニューラルネットワーククラス
    ## Note
    ネットワーク構成
        conv - relu - conv - relu - pool -
        conv - relu - conv - relu - pool -
        conv - relu - conv - relu - pool -
        affine - relu - dropout - affine - dropout - softmax

    ## Parameters
    * ***input_dim***                 : 入力データの次元情報
    * ***conv_param_1~conv_param_6*** : 各畳み込み層におけるパラメータ情報
    * ***hidden_size***               : 隠れ層における次元数
    * ***output_size***               : 出力層における次元数
    '''

    def __init__(self, settings):
        '''
        DeepCNNコンストラクタ
        ## Parameters

        ## Return
        void

        '''

        self.layer_list = []
        self.super_layers = {}
        self.local_layers = {}
        m_layer_id = 0
        layer_name = ""
        layer_type = 0  # 0:super_layer, 1: local_layer
        # layer情報からchainerの畳み込み層、全結合層をメンバ変数に追加する

        for i in range(len(settings)):
            setting = settings[i]
            param = setting["settings"]
            print("layer[" + str(i+1) + "]: " + setting["name"])
            m_layer_id += 1
            # 畳み込み層をメンバに追加
            if setting["type"] == "convolution":
                layer_name = "conv" + str(m_layer_id)
                layer_type = 0
                self.super_layers[layer_name] = \
                    L.Convolution2D(in_channels=param["in_channels"],
                                    out_channels=param["out_channels"],
                                    ksize=param["filter_size"],
                                    stride=param["stride"],
                                    pad=param["padding"])

            # 全結合層をメンバに追加
            elif setting["type"] == "Affine":
                layer_name = "fc" + str(m_layer_id)
                layer_type = 0
                self.super_layers[layer_name] = \
                    L.Linear(in_size=None,#in_size=param["in_channels"],
                             out_size=param["out_channels"])

            # 活性化層をメンバに追加
            elif setting["type"] == "Activation":
                layer_name = "act" + str(m_layer_id)
                layer_type = 1
                self.local_layers[layer_name] = (self.active_wrap_func, param)

            # プーリング層をメンバに追加
            elif setting["type"] == "pooling":
                layer_name = "pool" + str(m_layer_id)
                layer_type = 1
                self.local_layers[layer_name] = (self.pooling_wrap_func, param)

            # ドロップアウト層をメンバに追加
            elif setting["type"] == "Dropout":
                layer_name = "drop" + str(m_layer_id)
                layer_type = 1
                self.local_layers[layer_name] = (self.dropout_wrap_func, param)

            # LRN層をメンバに追加
            elif setting["type"] == "LRN":
                layer_name = "LRN" + str(m_layer_id)
                layer_type = 1
                self.local_layers[layer_name] = (self.lrn_wrap_func, param)

            # layer名を追加(layerの順番を覚えておくため)
            self.layer_list.append((layer_name, layer_type))

        super(DeepCNN, self).__init__(**self.super_layers)



    def load_layer_settings(self):
        setting_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(root_path))),
                                    "data",
                                    "layer_settings.json")

        with open(setting_path, "r") as f:
            jsonData = json.load(f)
        return jsonData

    def clear(self):
        self.loss = None
        self.accuracy = None

    def active_wrap_func(self, _tuple):
        value, param, _ = _tuple
        if param["type"] == "relu":
            return F.relu(value)
        elif param["type"] == "sigmoid":
            return F.sigmoid(value)

    def pooling_wrap_func(self, _tuple):
        value, param, _ = _tuple
        return F.max_pooling_2d(x=value, ksize=param["width"], stride=param["stride"])

    def dropout_wrap_func(self, _tuple):
        value, param, train = _tuple
        return F.dropout(x=value, ratio=param["rate"], train=train)

    def lrn_wrap_func(self, _tuple):
        value, _, _ = _tuple
        return F.local_response_normalization(x=value)

    def forward(self, x, t, train=False):
        self.clear()

        h = x
        for layer_name, layer_type in self.layer_list:
            out = None
            # タプル型でなければそのまま実行
            if layer_type == 0:
                out = self[layer_name](h)
            elif layer_type == 1:
                func, settings = self["local_layers"][layer_name]
                out = func((h, settings, train))

            h = out

        self.loss = F.softmax_cross_entropy(h, t)
        self.accuracy = F.accuracy(h, t)

        if train:
            return self.loss
        else:
            self.pred = F.softmax(h)
            return self.pred

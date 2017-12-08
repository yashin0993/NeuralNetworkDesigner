# coding: utf-8

import os, sys
root_path = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(root_path, "src"))
sys.path.append(os.path.join(root_path, "memory"))

import numpy as np
import json
from tqdm import tqdm
import time
import chainer
# from chainer import cuda
import chainer.functions as F
import chainer.links as L
from chainer import optimizers
from chainer import serializers
try:
    import cPickle as pickle
except:
    import pickle
# from sklearn.cross_validation import train_test_split
import cv2
import gc

# from mnist import load_mnist
from dataset import load_data
from DeepCNN import DeepCNN as CNN
# from DeepCNN_v2 import DeepCNN as CNN

ADAGRAD = 0
ADAM = 1
MONMENTUM = 2
ADADELTA = 3

def main():
    print("\n---------------- argument check ------------------")
    if len(sys.argv) != 2:
        print("Invalid argument.################################" + str(len(sys.argv)))
        exit(1)

    dataset_path = sys.argv[1]

    print("\n------------------ preprocess --------------------")
    proj_root = os.path.dirname(os.path.dirname(os.path.dirname(root_path)))
    config_path = os.path.join(proj_root, "data", "config.json")
    layer_path = os.path.join(proj_root, "data", "layer_settings.json")

    # configファイル読込み
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
            print("loaded config file")
    except IOError:
        print("config.json load error.")
        sys.exit(1)

    # layerファイル読込み
    try:
        with open(layer_path, "r") as f:
            layer_data = json.load(f)
            print("loaded layer info file")
    except IOError:
        print("layer_settings.json load error.")
        sys.exit(1)


    in_w = layer_data["nodes"][0]["settings"]["width"]
    in_h = layer_data["nodes"][0]["settings"]["height"]
    in_c = layer_data["nodes"][0]["settings"]["channel"]


    # 学習・テストデータの読込み
    (x_train, t_train), (x_test, t_test) = \
        load_data(dataset_path,
                  input_width=in_w, input_height=in_h, input_channel=in_c,
                  test_size=0.1, flatten=False)
    # (x_train, t_train), (x_test, t_test) = load_mnist(flatten=False)
    print("loaded training data")

    print("\n---------------- hyper parameter -----------------")
    train_size     = len(t_train)
    test_size      = len(t_test)
    batch_size     = config["batch"]
    epoch          = config["epoch"]
    iter_per_epoch = int(train_size / batch_size)
    max_iter       = epoch * iter_per_epoch
    opt_name = config["optimizer"]
    lr = config["lr"]
    if opt_name == "Adagrad":
        optimizer = optimizers.AdaGrad(lr=lr)
    elif opt_name == "Adam":
        optimizer = optimizers.Adam()
    elif opt_name == "MonmentumSGD":
        optimizer = optimizers.MomentumSGD(lr=lr, momentum=0.9) #default lr = 0.01
    elif opt_name == "Adadelta":
        optimizer = optimizers.AdaDelta()
    else:
        print("unsupported optimizer type:" + opt_name)
        sys.exit(2)



    print("training size : " + str(train_size))
    print("test size     : " + str(test_size))
    print("batch size    : " + str(batch_size))
    print("epoch size    : " + str(epoch))
    print("optimizer type: " + opt_name)
    print("learning rate : " + str(lr))
    print("input width   : " + str(in_w))
    print("input height  : " + str(in_h))


    print("\n------------ CNN layer Consituation --------------")
    model = CNN(layer_data["layer_info"])

    optimizer.use_cleargrads()
    optimizer.setup(model)



    print("\n------------ training start --------------")
    for e in range(0, epoch):
        print("epoch[" + str(e) + "/" + str(epoch) + "]")
        # interval_start = time.clock()
        sum_loss = 0
        sum_accuracy = 0

        # ------------ 学習データによる学習とその結果を取得 ---------
        train_stroke_size = int(train_size / batch_size)
        for i in tqdm(range(0, train_stroke_size)):
        # for i in tqdm(range(max_iter)):
            # バッチサイズ分のデータを取得
            batch_mask = np.random.choice(train_size, batch_size)
            X = x_train[batch_mask]
            # 畳み込みように3次元にしておく(width,height,channel)
            X = np.array(X).astype(np.float32).reshape(len(X), in_c, in_w, in_h)
            # 実数はnp.float32, 正数はinp.int32に固定する(しなければならない)
            x_batch = chainer.Variable(np.array(X).astype(np.float32))
            t_batch = np.array(t_train[batch_mask]).astype(np.int32)
            # 前のバッチで取得した勾配をクリアする
            model.cleargrads()
            # 順伝播で初期パラメータを学習させる
            loss = model.forward(x_batch, t_batch, True)
            # 逆伝播で初期パラメータから最適な(損失率が少ない)パラメータを取得する
            loss.backward()
            optimizer.update()

            accuracy = float(model.accuracy.data) * len(t_batch.data)
            sum_loss += float(model.loss.data) * len(t_batch.data)
            sum_accuracy += accuracy
            del X
            gc.collect()
            # print("epoch : " + str(epoch) + " / " + str(n_epoch))
        print("train loss: %f", sum_loss / train_stroke_size)
        print("train accuracy: %f", sum_accuracy / train_stroke_size)

        # log = "accuracy:" + str(sum_accuracy/iter_per_epoch) + "  loss:" + str(sum_loss/iter_per_epoch)

        sum_loss = 0
        sum_accuracy = 0

        # --------- テストデータによる結果を取得 -----------
        test_stroke_size = int(test_size / batch_size)
        for i in tqdm(range(test_stroke_size)):

            batch_mask = np.random.choice(test_size, batch_size)
            X = x_test[batch_mask]
            X = np.array(X).astype(np.float32).reshape(len(X), in_c, in_w, in_h)
            x_batch = chainer.Variable(np.array(X).astype(np.float32))
            t_batch = np.array(t_test[batch_mask]).astype(np.int32)

            # model.cleargrads()
            loss = model.forward(x_batch, t_batch, False)
            # loss.backward()
            # optimizer.update()

            # accuracy = float(model.accuracy.data) * len(t_batch.data)
            sum_loss += float(model.loss.data) * len(t_batch.data)
            sum_accuracy += float(model.accuracy.data) * len(t_batch.data)
            # print("accuracy:" + str(accuracy) + "  loss:" + str(sum_loss))
            del X
            gc.collect()

        print("train loss: %f", sum_loss / test_stroke_size)
        print("train accuracy: %f", sum_accuracy / test_stroke_size)


    # with open(os.path.join(root_path, "memory","train.txt"), "w") as f:
    #     f.write(log)


    model_path = os.path.join(root_path, "memory", "model.pkl")
    pickle.dump(model, open(model_path, "wb"), -1)











    # # # パラメータの保存
    # param_path = os.path.join(root_path, "memory", "params.pkl")
    # network.save_params(param_path)

if __name__ == "__main__":
    main()

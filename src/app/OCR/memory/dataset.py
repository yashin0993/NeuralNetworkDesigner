# coding: utf-8
import gzip
import pickle
import os
import numpy as np
import random

dataset_dir = os.path.dirname(__file__)
file_name = os.path.join(dataset_dir, "training_data.pkl")
print(file_name)
file_name2 = os.path.join(os.path.dirname(os.path.dirname(dataset_dir)), "DataMaker", "data", "bin", "training_data.pkl")
print(file_name2)
train_test_ratio = 6
train_num = 60000
test_num = 10000
img_dim = (1, 28, 28)
img_size = 784
dim_size = 71

def _change_ont_hot_label(X):
    T = np.zeros((X.size, dim_size))
    for idx, row in enumerate(T):
        row[X[idx]] = 1

    return T

def get_train_split(dataset, test_size=0.1):
    # テストデータが学習データより多くならないようにする
    if test_size > 0.5:
        test_size = 0.5

    data_size = len(dataset['img'])
    # テストデータ数
    test_size = int(data_size * test_size)
    # 学習データ数
    train_size = data_size - test_size

    # perm = np.random.permutation(data_size)
    # train_idcs = perm[0:train_size]
    # test_size = perm[train_size+1:data_size]


    

    test_idcs = random.sample(range(data_size), test_size)
    train_idcs = np.ones(data_size, dtype=np.bool)
    train_idcs[test_idcs] = False
    test_idcs2 = np.zeros(data_size, dtype=np.bool)
    test_idcs2[test_idcs] = True

    test_img = dataset["img"][test_idcs2]
    test_label = dataset["label"][test_idcs2]
    train_img = dataset["img"][train_idcs]
    train_label = dataset["label"][train_idcs]

    return (train_img, train_label), (test_img, test_label) 




def load_data(data_path="mnist.pkl", 
              input_width=28, input_height=28, input_channel=1, 
              normalize=True, flatten=True, one_hot_label=False, test_size=0.1):
    """学習データセットの読み込み

    Parameters
    ----------
    normalize : 画像のピクセル値を0.0~1.0に正規化する
    one_hot_label :
        one_hot_labelがTrueの場合、ラベルはone-hot配列として返す
        one-hot配列とは、たとえば[0,0,1,0,0,0,0,0,0,0]のような配列
    flatten : 画像を一次元配列に平にするかどうか 

    Returns
    -------
    (訓練画像, 訓練ラベル), (テスト画像, テストラベル)
    """
    pkl_data = data_path
    if not os.path.exists(data_path):
        print("training data not exist")
        return

    with open(pkl_data, 'rb') as f:
        dataset = pickle.load(f)
        # print(dataset)
    
    if type(dataset['img']) == "list":
        dataset['img'] = np.array(dataset['img'])
        dataset['label'] = np.array(dataset['label'])

    if normalize:
        dataset['img'] = dataset['img'].astype(np.float32)
        dataset['img'] /= 255.0

    if one_hot_label:
        dataset['label'] = _change_ont_hot_label(dataset['label'])

    if not flatten:
        dataset['img'] = dataset['img'].reshape(-1, input_channel, input_width, input_height)

    return get_train_split(dataset, test_size)
    # return (dataset['train_img'], dataset['train_label']), (dataset['test_img'], dataset['test_label']) 
import os
import sys
import numpy as np
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
import glob
import pickle
import json

from tqdm import tqdm
import cv2

root_path = os.path.dirname(__file__)

def show_img(img):
    cv2.imshow("test", img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def binary_search(lst, target):
    min_t = 0
    max_t = len(lst) - 1
    avg = (min_t + max_t)/2

    while min_t < max_t:
        if lst[avg] == target:
            return avg
        elif lst[avg] < target:
            return avg + 1 + binary_search(lst[avg+1:], target)
        else:
            return binary_search(lst[:avg], target)

    return avg

def trimming(img):
    img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    _, img = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY)
    c_in, r_in, c_out, r_out = getBBox(img)
    sq_img = squareization(img[r_in:r_out, c_in:c_out])
    return np.array(sq_img).reshape(28*28).tolist()

def getBBox(img):
    # 行の和を取得
    row_sum = np.sum(img, axis=1)

    row_in = []
    row_out = []
    for i in range(len(row_sum)-1):
        if row_sum[i] == 0 and not row_sum[i+1] == 0:
            row_in.append(i)
        if not row_sum[i] == 0 and row_sum[i+1] == 0:
            row_out.append(i+1)

    if len(row_in) == 0:
        row_in.append(0)
    if len(row_out) == 0:
        row_out.append(len(row_sum-1))

    r_in = min(row_in)
    r_out = max(row_out)

    trim1 = img[r_in:r_out, :]

    col_sum = np.sum(trim1, axis=0)

    col_in = []
    col_out = []

    for i in range(len(col_sum)-1):
        if col_sum[i] == 0 and not col_sum[i+1] == 0:
            col_in.append(i)
        if not col_sum[i] == 0 and col_sum[i+1] == 0:
            col_out.append(i+1)

    if len(col_in) == 0:col_in.append(0)
    if len(col_out) == 0:col_out.append(len(col_sum-1))

    c_in = min(col_in)
    c_out = max(col_out)

    return (c_in, r_in, c_out, r_out)
    # return (c_in, r_in, c_out, r_out)
    # return (c_in, r_in, c_out-c_in, r_out-r_in)

def squareization(img):
    '''
    [note]   : 検出されたboundingbox領域の画像を正方化する
    [input]  : img -> 検出されたboundingbox領域の画像
    [return] : 正方化された画像
    '''
    # 読み込み画像の行、列
    row = img.shape[0]
    col = img.shape[1]

    # 読み込み画像を正方にするマージン
    margin = abs(row - col)//2

    # 画像を正方化
    sq_img = np.pad(img, [(margin, margin), (0, 0)], 'constant') if row < col else \
             np.pad(img, [(0, 0), (margin, margin)], 'constant') if col < row else \
             img

    # print("(" + str(sq_img.shape[0]) + "," + str(sq_img.shape[0]) + ")")
    # 余白をつけて拡大
    pad = (sq_img.shape[0] * 6)//28
    sq_img = np.pad(img, [(pad, pad), (pad, pad)], 'constant')
    # square_sizeに合わせたものを返す
    return cv2.resize(sq_img, (28, 28))

def draw_text_at_center(info):
    # font_list = glob.glob("C:\\Windows\\Fonts\\*.ttf")
    font_list = info["font-family"]
    char_list = info["charactor"]
    rotate_list = info["rotate"]

    dataset = []
    print("start to create training data")
    for i in tqdm(range(0, len(font_list))):
        font_path = font_list[i]["value"]
        font_name = font_list[i]["name"]

        for char in char_list:
            char_name = char["name"]
            char_label = char["value"]

            img = Image.new("RGB", (100, 100))
            draw = ImageDraw.Draw(img)
            draw.font = ImageFont.truetype(font_path, 50)
            img_size = np.array(img.size)
            txt_size = np.array(draw.font.getsize(char["name"]))
            pos = (img_size - txt_size) / 2
            draw.text(pos, char["name"], (255, 255, 255))
            org_img = img.copy()
            for r in rotate_list:
                r_img = org_img.rotate(r["name"])
                np_img = np.array(r_img)
                np_img.flags.writeable = True
                ret = trimming(np_img)
                dataset.append({
                    "img": ret,
                    "label":np.array(np.uint8(char_label))
                })
                del r_img
            del img

    np.random.shuffle(dataset)

    img = []
    label = []
    for i in range(0, len(dataset)):
        img.append(dataset[i]["img"])
        label.append(dataset[i]["label"])

    savedata = {"img": np.array(img, dtype=np.float32), "label": np.array(label)};

    with open(os.path.join(root_path, "dataset.pkl"), "wb") as f:
        pickle.dump(savedata, f)


# info_json = json.loads(info)
info_path = os.path.join(root_path, "create_info.json")
with open(info_path, "r") as f:
    info_json = json.load(f)


draw_text_at_center(info_json)



# coding: utf-8
import os
import sys
import time
import numpy as np
import cv2
import json
import base64

root_path = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(root_path, "src"))
sys.path.append(os.path.join(root_path, "memory"))

import ImageProcessing as ip
from OCR import OCR as ocr

CHAR_LIST = [
    {"value": "0" , "name":"a"},
    {"value": "1" , "name":"b"},
    {"value": "2" , "name":"c"},
    {"value": "3" , "name":"d"},
    {"value": "4" , "name":"e"},
    {"value": "5" , "name":"f"},
    {"value": "6" , "name":"g"},
    {"value": "7" , "name":"h"},
    {"value": "8" , "name":"i"},
    {"value": "9" , "name":"j"},
    {"value": "10", "name":"k"},
    {"value": "11", "name":"l"},
    {"value": "12", "name":"m"},
    {"value": "13", "name":"n"},
    {"value": "14", "name":"o"},
    {"value": "15", "name":"p"},
    {"value": "16", "name":"q"},
    {"value": "17", "name":"r"},
    {"value": "18", "name":"s"},
    {"value": "19", "name":"t"},
    {"value": "20", "name":"u"},
    {"value": "21", "name":"v"},
    {"value": "22", "name":"w"},
    {"value": "23", "name":"x"},
    {"value": "24", "name":"y"},
    {"value": "25", "name":"z"},
    {"value": "26", "name":"A"},
    {"value": "27", "name":"B"},
    {"value": "28", "name":"C"},
    {"value": "29", "name":"D"},
    {"value": "30", "name":"E"},
    {"value": "31", "name":"F"},
    {"value": "32", "name":"G"},
    {"value": "33", "name":"H"},
    {"value": "34", "name":"I"},
    {"value": "35", "name":"J"},
    {"value": "36", "name":"K"},
    {"value": "37", "name":"L"},
    {"value": "38", "name":"M"},
    {"value": "39", "name":"N"},
    {"value": "40", "name":"O"},
    {"value": "41", "name":"P"},
    {"value": "42", "name":"Q"},
    {"value": "43", "name":"R"},
    {"value": "44", "name":"S"},
    {"value": "45", "name":"T"},
    {"value": "46", "name":"U"},
    {"value": "47", "name":"V"},
    {"value": "48", "name":"W"},
    {"value": "49", "name":"X"},
    {"value": "50", "name":"Y"},
    {"value": "51", "name":"Z"},
    {"value": "52", "name":"0"},
    {"value": "53", "name":"1"},
    {"value": "54", "name":"2"},
    {"value": "55", "name":"3"},
    {"value": "56", "name":"4"},
    {"value": "57", "name":"5"},
    {"value": "58", "name":"6"},
    {"value": "59", "name":"7"},
    {"value": "60", "name":"8"},
    {"value": "61", "name":"9"},
    {"value": "62", "name":"."},
    {"value": "63", "name":","},
    {"value": "64", "name":"_"},
    {"value": "65", "name":"-"},
    {"value": "66", "name":"@"},
    {"value": "67", "name":"<"},
    {"value": "68", "name":">"},
    {"value": "69", "name":"?"},
    {"value": "70", "name":"!"}   
];

# インスタンス生成
m_ocr = ocr()
# 初期化
ret = m_ocr.initialize()

if not ret:
    print("OCR Initialize error")
    sys.exit()


def main(base64_str):
    # -------------------- 入力画像の読込み -------------------
    img_str = base64.b64decode(base64_str)
    img_bin = np.fromstring(img_str, dtype=np.uint8)
    img = cv2.imdecode(img_bin, 1)

    height = img.shape[0]
    width = img.shape[1]
    dim = img.shape[2]
    # バッファ列に成形
    buff = img.reshape(1, width*height*dim)

    # -------------------------- OCR -------------------------
    try:
        res = m_ocr.predict_text(buff, width*height*dim, width, height)
    except Exception as e:
        print(e.message)


    test = {}
    test["result"] = res
    # test["image"] = buff
    print(test)
    print("==chunk start==")
    sys.stdout.write(json.dumps(test))
    print("==chunk end==")
    sys.stdout.flush()


# 呼び出しでは実行しない
if __name__ == "__main__":

    # メイン処理
    while 1:
        print("wait for base64_str")
        sys.stdout.flush()
        line = sys.stdin.readline()
        line = line.replace("\r\n", "")

        print("do predict: " + line)
        sys.stdout.flush()
        main(line)

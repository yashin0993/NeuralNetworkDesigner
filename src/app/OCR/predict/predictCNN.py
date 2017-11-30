# coding: utf-8

import os
import sys
import time
import numpy as np

TEXT_LIST = [
    {"char":"a", "name": "0"},
    {"char":"b", "name": "1"},
    {"char":"c", "name": "2"},
    {"char":"d", "name": "3"},
    {"char":"e", "name": "4"},
    {"char":"f", "name": "5"},
    {"char":"g", "name": "6"},
    {"char":"h", "name": "7"},
    {"char":"i", "name": "8"},
    {"char":"j", "name": "9"},
    {"char":"k", "name": "10"},
    {"char":"l", "name": "11"},
    {"char":"m", "name": "12"},
    {"char":"n", "name": "13"},
    {"char":"o", "name": "14"},
    {"char":"p", "name": "15"},
    {"char":"q", "name": "16"},
    {"char":"r", "name": "17"},
    {"char":"s", "name": "18"},
    {"char":"t", "name": "19"},
    {"char":"u", "name": "20"},
    {"char":"v", "name": "21"},
    {"char":"w", "name": "22"},
    {"char":"x", "name": "23"},
    {"char":"y", "name": "24"},
    {"char":"z", "name": "25"},
    {"char":"A", "name": "26"},
    {"char":"B", "name": "27"},
    {"char":"C", "name": "28"},
    {"char":"D", "name": "29"},
    {"char":"E", "name": "30"},
    {"char":"F", "name": "31"},
    {"char":"G", "name": "32"},
    {"char":"H", "name": "33"},
    {"char":"I", "name": "34"},
    {"char":"J", "name": "35"},
    {"char":"K", "name": "36"},
    {"char":"L", "name": "37"},
    {"char":"M", "name": "38"},
    {"char":"N", "name": "39"},
    {"char":"O", "name": "40"},
    {"char":"P", "name": "41"},
    {"char":"Q", "name": "42"},
    {"char":"R", "name": "43"},
    {"char":"S", "name": "44"},
    {"char":"T", "name": "45"},
    {"char":"U", "name": "46"},
    {"char":"V", "name": "47"},
    {"char":"W", "name": "48"},
    {"char":"X", "name": "49"},
    {"char":"Y", "name": "50"},
    {"char":"Z", "name": "51"},
    {"char":"0", "name": "52"},
    {"char":"1", "name": "53"},
    {"char":"2", "name": "54"},
    {"char":"3", "name": "55"},
    {"char":"4", "name": "56"},
    {"char":"5", "name": "57"},
    {"char":"6", "name": "58"},
    {"char":"7", "name": "59"},
    {"char":"8", "name": "60"},
    {"char":"9", "name": "61"},
    {"char":".", "name": "62"},
    {"char":",", "name": "63"},
    {"char":"_", "name": "64"},
    {"char":"-", "name": "65"},
    {"char":"@", "name": "66"},
    {"char":"<", "name": "67"},
    {"char":">", "name": "68"},
    {"char":"?", "name": "69"},
    {"char":"!", "name": "70"}   
]



root_path = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(os.path.join(root_path, "src"))
sys.path.append(os.path.join(root_path, "memory"))
import cv2
import json
import ImageProcessing as ip
from OCR import OCR as ocr
from Log import Log

log = Log()
log.Open()
log.WriteTitle("predictCNN.py")

debug = False

def main(file_path):
    # ------------------ ファイル存在チェック -----------------
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        print("Invalid argument error!")
        return

    # -------------------- 入力画像の読込み -------------------
    img = np.array(ip.read_full_image(file_path), dtype=np.uint8)
    height = img.shape[0]
    width = img.shape[1]
    dim = img.shape[2]
    log.WriteLog("width     : " + str(width))
    log.WriteLog("height    : " + str(height))
    log.WriteLog("dimension : " + str(dim))

    # バッファ列に成形
    buff = img.reshape(1, width*height*dim)

    # -------------------------- OCR -------------------------
    # インスタンス生成
    m_ocr = ocr()
    # 初期化
    ret = m_ocr.initialize()

    # ret = False
    if not ret:
        print("OCR Initialize error")
        sys.exit()

    # 推定開始
    start = time.clock()
    try:
        res = m_ocr.predict_text(buff, width*height*dim, width, height)
        end = time.clock()
        print("OCR time: " + str(end - start) + "[sec]")
        log.WriteLog("OCR time: " + str(end - start) + "[sec]")

    except Exception as e:
        print(e.message)

    if debug:
        log.WriteLog("------ predict result --------")
        for d in res:
            ans = d["number"]
            b = d["bbox"]
            label_miny = b["min_y"] - 30
            label_maxy = b["min_y"]
            if label_miny < 0 : 
                label_miny = b["max_y"]
                label_maxy = b["max_y"] + 30

            font_x = b["max_x"] - int((b["max_x"] - b["min_x"])/2) - 9
            font_y = label_maxy - int((label_maxy - label_miny)/2) + 9

            cv2.rectangle(img, (b["min_x"], b["min_y"]), (b["max_x"], b["max_y"]), (0, 0, 255), 2)
            cv2.rectangle(img, (b["min_x"]-1, label_miny), (b["max_x"]+1, label_maxy), (0, 0, 255), -1)
            print((font_x, font_y))
            log.WriteLog("(" + str(font_x) + "," + str(font_y) + ")")
            cv2.putText(img, TEXT_LIST[d["number"]]["char"], (font_x, font_y), cv2.FONT_HERSHEY_COMPLEX_SMALL, 1.5, (255,255,255), 2)


        cv2.imshow("result", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    else:
        result = {}
        result["result"] = res
        print("==chunk start==")
        sys.stdout.write(json.dumps(result))
        print("==chunk end==")
        sys.stdout.flush()


# 呼び出しでは実行しない
if __name__ == "__main__":
    if debug:
        # --------------------- 引数チェック ---------------------
        if len(sys.argv) < 2:
            print("No argument!")
            sys.exit(1)

        log.WriteLog("-------- predict start --------")
        main(sys.argv[1])
    else:
        # メイン処理
        while 1:
            print("wait for file_path")
            sys.stdout.flush()
            line = sys.stdin.readline()

            line = line.replace("\r\n", "").replace("\r", "").replace("\n", "")
            print("do predict: " + line)
            sys.stdout.flush()
            main(line)

    log.Close()



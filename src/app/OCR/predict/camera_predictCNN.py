# coding: utf-8
import os
import sys
import time
import numpy as np
import cv2
import json

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



# debug = False
cap = cv2.VideoCapture(0)

def main():
    # --------------------- 引数チェック ---------------------
    # if len(sys.argv) < 2:
    #     print("No argument!")
    #     # sys.stdout.flush()
    #     return

    # argvs = sys.argv
    # ------------------ ファイル存在チェック -----------------
    # file_path = sys.stdin.read()
    # if not os.path.exists(file_path) or not os.path.isfile(file_path):
    #     print("Invalid argument error!")
    #     return

    # -------------------- 入力画像の読込み -------------------
    # img = np.array(ip.read_full_image(file_path), dtype=np.uint8)

    ret, img = cap.read()
    # print(type(img))
    # if img == None:
    #     return False

    img = np.array(img, dtype=np.uint8)
    # print(img.shape)
    height = img.shape[0]
    width = img.shape[1]
    dim = img.shape[2]
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
        # print("OCR time: " + str(time.clock() - start) + "[sec]")

        if len(res) == 0:
            ip.show_video(img)
            return True

        for bbox in res:
            # print(bbox)
            # bboxを描画
            cv2.rectangle(
                img,
                (bbox["bbox"]["min_x"], bbox["bbox"]["min_y"]),
                (bbox["bbox"]["max_x"], bbox["bbox"]["max_y"]),
                (255, 0, 255),
                2   #stroke
            )
            # 数値描画の背景を描画
            cv2.rectangle(
                img,
                (bbox["bbox"]["min_x"]-1, bbox["bbox"]["min_y"] - 15),
                (bbox["bbox"]["max_x"]+1, bbox["bbox"]["min_y"]),
                (255, 0, 255),
                -1  # stroke=-1で塗りつぶし
            )
            # 数値テキスト
            font_size = int((bbox["bbox"]["max_y"] - bbox["bbox"]["min_y"]) / 3)
            start_x = int((bbox["bbox"]["min_x"] + bbox["bbox"]["max_x"])/2) - 5
            start_y = bbox["bbox"]["min_y"] - 1
            cv2.putText(
                img,
                str(CHAR_LIST[bbox["number"]]["name"]),
                (start_x, start_y),
                cv2.FONT_HERSHEY_DUPLEX,
                0.5,
                (255, 255, 255)
            )

        ip.show_video(img)

    except Exception as e:
        print(e.message)

    # # print(res)
    # test = {}
    # test["result"] = res
    # test["image"] = buff
    # print("==chunk start==")
    # sys.stdout.write(json.dumps(test))
    # print("==chunk end==")
    # sys.stdout.flush()

    return True
    # print(test)
    # path = os.path.join(os.path.dirname(os.path.dirname(root_path)), "data", "result.json")
    # with open(path, 'w') as f:
    #     json.dump(test, f, indent=4, separators=(',', ': '))
    # ip.show_image(img)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()




# 呼び出しでは実行しない
if __name__ == "__main__":

    # メイン処理
    while 1:
        # print("wait for file_path")
        # sys.stdout.flush()
        # line = sys.stdin.readline()

        # line = line.replace("\r\n", "").replace("\r", "").replace("\n", "")

        # if line == "end":
        #     break

        # print("do predict: " + line)
        # line = "C:\\Users\\70584360\\Desktop\\testimage\\hand1.png"
        # print(line == "C:\\Users\\70584360\\Desktop\\testimage\\hand1.png")
        # sys.stdout.flush()
        if not main():
            break




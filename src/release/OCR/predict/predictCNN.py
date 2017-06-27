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

debug = False

def main(file_path):
    # --------------------- 引数チェック ---------------------
    # if len(sys.argv) < 2:
    #     print("No argument!")
    #     # sys.stdout.flush()
    #     return

    # argvs = sys.argv
    # ------------------ ファイル存在チェック -----------------
    # file_path = sys.stdin.read()
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        print("Invalid argument error!")
        return

    # -------------------- 入力画像の読込み -------------------
    img = np.array(ip.read_full_image(file_path), dtype=np.uint8)
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
        print("OCR time: " + str(time.clock() - start) + "[sec]")

    except Exception as e:
        print(e.message)

    # print(res)
    if debug:
        pass
    else:
        test = {}
        test["result"] = res
        print("==chunk start==")
        sys.stdout.write(json.dumps(test))
        print("==chunk end==")
        sys.stdout.flush()
    # print(test)
    # path = os.path.join(os.path.dirname(os.path.dirname(root_path)), "data", "result.json")
    # with open(path, 'w') as f:
    #     json.dump(test, f, indent=4, separators=(',', ': '))
    # ip.show_image(img)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()




# 呼び出しでは実行しない
if __name__ == "__main__":
    if debug:
        main(sys.argv[1])
    else:
        # メイン処理
        while 1:
            print("wait for file_path")
            sys.stdout.flush()
            line = sys.stdin.readline()

            line = line.replace("\r\n", "").replace("\r", "").replace("\n", "")
            print("do predict: " + line)
            # line = "C:\\Users\\70584360\\Desktop\\testimage\\hand1.png"
            print(line == "C:\\Users\\70584360\\Desktop\\testimage\\hand1.png")
            sys.stdout.flush()
            main(line)



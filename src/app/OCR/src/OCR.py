import os
import numpy as np
import chainer
try:
    import cPickle as pickle
except:
    import pickle
import itertools as it
import multiprocessing as mp

from DeepCNN import DeepCNN as CNN
import ImageProcessing as ip
import time

root_path = os.path.dirname(os.path.dirname(__file__))

class OCR:
    '''
    ## Notes
    OCRクラスコンストラクタ

    ## Parameters
    * ***square_size*** : 推定画像拡縮サイズ(default=28)
    '''

    def __init__(self, square_size=28):
        '''
        ## Notes
        OCRクラスコンストラクタ

        ## Parameters
        * ***square_size*** : 推定画像拡縮サイズ(default=28)

        ## Returns
        \---
        '''
        self.last_draw_len = 0
        self.bbox = {}
        self.square_size = square_size
        self.width = None
        self.height = None
        self.cnn = None

    def initialize(self):
        '''
        ## Notes
        推定用パラメータなど外部ファイル読込み

        ## Parameters
        \---

        ## Returns
        メンバ変数セット成功/失敗
        '''
        try:
            model_path = os.path.join(root_path, "memory", "model.pkl")
            with open(model_path, 'rb') as f:
                self.cnn = pickle.load(f)
        except IOError:
            print("load params error!")
            return False

        return True

    def predict_text(self, buff, buff_size, width, height):
        '''
        ## Notes
        推定用パラメータの読込み

        ## Parameters
        * ***buff***      : 読み込む画像のbuffer
        * ***buff_size*** : 読み込む画像のバッファサイズ
        * ***width***     : 入力画像の幅
        * ***height***    : 入力画像の高さ

        ## Returns
        パラメータセット成功/失敗
        '''

        self.width = width
        self.height = height

        # RGBAbuffer列をRGB3次元配列に変換
        img = ip.buff_2_array(buff, buff_size, width, height)

        # 推定用特徴量を取得
        # グレースケール
        img_gray = ip.gray_scale(img)
        # 反転処理
        if ip.check_light_shade(img_gray):
            ip.reverse(img_gray)
        # 0～255を0～1に正規化
        trim_img = ip.normalize(img_gray)

        # bboxを取得
        bboxes = self.detect_bbox(img)

        # サイズが0だったら終了
        if len(bboxes) == 0:
            print("No text")
            return []

        # res = [self.get_charactor(trim_img, bbox) for bbox in bboxes]
        res = [self.get_charactor(trim_img)(bbox) for bbox in bboxes]
        # res = []
        # 並列実行する
        # p = mp.Pool(1) # 最大プロセス数

        # # 推定関数, 推定画像, bboxのタプル配列を作成
        # data = [(self.get_charactor, trim_img, bbox) for bbox in bboxes]

        # # 推定を並列実行で推定・結果をmap
        # res = p.map(self.predict_wrapper, data)

        return res

    def detect_bbox(self, img):
        '''
        [note]   : 文字におけるboundingboxを検出する
        [input]  : img -> boundingboxを検出する画像
        [return] : boundingbox配列
        '''
        # ケニー手法にてエッジ抽出
        img_canny = ip.canny(img, min_threshold=180, max_threshold=255)
        # # 膨張縮小用カーネルを取得(とりあえず3x3)
        kernel = ip.get_kernel((3, 3), molphology="cross")
        # ケニーエッジを膨張
        # 膨張させすぎると周りと結合し認識精度が下がる。
        # あまりさせないとfindContoursのRETR_EXTERNALで文字のエリアがうまく囲めない
        dilate_canny = ip.dilate(img_canny, kernel, iterations=3)
        _, contours, _ = ip.find_contours(dilate_canny, retr="external", chain="simple")

        bboxes = []
        cnt = 0

        for contour in contours:
            [x, y, w, h] = ip.get_bounding_rect(contour)

            if w < 10 or h < 10:
                continue

            if w > self.width//2 or h > self.height//2:
                continue

            if w > h * 2:
                continue

            bboxes.append({
                "id"    : cnt,
                "min_x" : x,
                "min_y" : y,
                "max_x" : x+w,
                "max_y" : y+h
            })
            cnt += 1

        return np.array(bboxes)

    def squareization(self, img):
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
        return ip.resize_image(sq_img, self.square_size, self.square_size)

    def get_charactor(self, gray_img):
        '''
        [note]   : 文字を検出する
        [input]  : img  -> グレースケール化+正規化した画像
                 : bbox -> boundingbox
        [return] : 文字認識情報
        '''
        def inner_get_charactor(bbox):
        # バウンディングボックスの領域のピクセル配列を取得する
            # start = time.clock()
            img = gray_img[bbox["min_y"]:bbox["max_y"], bbox["min_x"]:bbox["max_x"]]
            # print("trim : " + str(time.clock() - start) + "[sec]")

            # start = time.clock()
            # 28*28の正方化
            img2 = self.squareization(img)
            # print("square : " + str(time.clock() - start) + "[sec]")
            # ip.show_image(img2)
            # 特徴量を1次元に変換
            # img_reshape = img2.reshape(1, self.square_size*self.square_size)
            img_reshape = np.array([[img2.tolist()]])

            # start = time.clock()
            # 推定
            number = self.predict(img_reshape)
            # print("predict : " + str(time.clock() - start) + "[sec]")
            # return None
            return {"number": int(np.argmax(number)), "rate": number.tolist(), "bbox": bbox}

        return inner_get_charactor
    # def get_charactor(self, gray_img, bbox):
    #     '''
    #     [note]   : 文字を検出する
    #     [input]  : img  -> グレースケール化+正規化した画像
    #              : bbox -> boundingbox
    #     [return] : 文字認識情報
    #     '''
    #     # バウンディングボックスの領域のピクセル配列を取得する
    #     start = time.clock()
    #     img = gray_img[bbox["min_y"]:bbox["max_y"], bbox["min_x"]:bbox["max_x"]]
    #     print("trim : " + str(time.clock() - start) + "[sec]")

    #     start = time.clock()
    #     # 28*28の正方化
    #     img2 = self.squareization(img)
    #     print("square : " + str(time.clock() - start) + "[sec]")
    #     # ip.show_image(img2)
    #     # 特徴量を1次元に変換
    #     # img_reshape = img2.reshape(1, self.square_size*self.square_size)
    #     img_reshape = np.array([[img2.tolist()]])

    #     start = time.clock()
    #     # 推定
    #     number = self.predict(img_reshape)
    #     print("predict : " + str(time.clock() - start) + "[sec]")

    #     return {"number": int(np.argmax(number)), "rate": number.tolist(), "bbox": bbox}

    # def predict_wrapper(self, tupple):
    #     '''
    #     [note]   : 並列実行用推定ラッパー関数
    #     [input]  : tupple  -> タプル化されたデータ(get_charactor関数, グレースケール画像, boundingbox)
    #     [return] : 文字認識情報
    #     '''
    #     return tupple[0](tupple[1], tupple[2])

    def predict(self, x):
        '''
        [note]   : 2層ニューラルネットワークを利用して文字を推定する
        [input]  : x -> 推定対象画像の特徴量
        [return] : 推定情報
        '''
        # pre = self.two_layer_net.predict(x)
        X = np.array(x).astype(np.float32).reshape(len(x), 1, self.square_size, self.square_size)
        X = np.array(X).astype(np.float32)

        x_batch = chainer.Variable(X)
        y_batch = chainer.Variable(np.array([0]).astype(np.int32))

        pred = self.cnn.forward(x_batch, y_batch, False)
        return pred.data[0]

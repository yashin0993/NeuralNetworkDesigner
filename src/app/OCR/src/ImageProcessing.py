import numpy as np
import cv2

def read_image(path):
    '''
    [note]   : 画像読込み(RGB)
    [input]  : path -> 読み込む画像のパス
    [return] : 読み込んだ画像の配列
    '''
    return cv2.imread(path)

def read_full_image(path):
    '''
    [note]   : 画像読込み(RGBA)
    [input]  : path -> 読み込む画像のパス
    [return] : 読み込んだ画像の配列
    '''
    return cv2.imread(path, cv2.IMREAD_UNCHANGED)

def buff_2_array(buff, buff_size, width, height):
    '''
    [note]   : 画像バッファ列を2次元配列に変換
    [input]  : buff      -> 読み込む画像のbuffer
             : buff_size -> 読み込む画像のバッファサイズ
             : width     -> 入力画像の幅
             : height    -> 入力画像の高さ
    [return] : 変換した画像の配列
    '''
    dim3 = buff_size / (width * height)
    ret = np.array(buff)
    if dim3 == 4:
        ret = np.delete(ret, np.arange(3, width*height*4, 4).tolist())

    return ret.reshape(height, width, 3)

def show_image(img, title="NoTitle"):
    '''
    [note]   : 入力画像を表示する
    [input]  : img   -> 表示する画像
             : title -> 表示するウィンドウの名前
    [return] : void
    '''
    cv2.imshow(title, img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def show_video(img, title="NoTitle"):
    '''
    [note]   : 入力画像を表示する
    [input]  : img   -> 表示する画像
             : title -> 表示するウィンドウの名前
    [return] : void
    '''
    cv2.imshow(title, img)
    cv2.waitKey(1)
    # cv2.destroyAllWindows()

def gray_scale(img):
    '''
    [note]   : グレイスケール関数
    [input]  : img -> グレイスケールをかける画像
    [return] : グレイスケール化した画像
    '''
    return cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

def reverse(img):
    '''
    [note]   : 色調反転関数
    [input]  : img -> 色調反転させる画像
    [return] : void(参照先を更新するため)
    '''
    rev = np.empty_like(img)
    rev.fill(255)
    img -= rev
    rev.fill(-1)
    img *= rev

def binalize(img, threshold=128, thres_type=0):
    '''
    [note]   : 二値化関数
    [input]  : img       -> 二値化する画像
             : threshold -> 二値化の閾値
    [return] : 二値化した画像
    '''
    return cv2.threshold(img, threshold, 255, cv2.THRESH_BINARY if thres_type == 0 else cv2.THRESH_BINARY_INV)[1]

def normalize(img):
    '''
    [note]   : 正規化関数。0～255の値を0～1に正規化する。
    [input]  : img -> 正規化する画像
    [return] : 正規化した画像
    '''
    norm = np.empty_like(img)
    norm.fill(255)
    return img / norm

def resize_image(img, width, height):
    '''
    [note]   : 画像のリサイズを行う
    [input]  : img    -> リサイズを行う画像
             : width  -> リサイズ後の幅
             : height -> リサイズ後の高さ
    [return] : リサイズした画像
    '''
    return cv2.resize(img, (width, height))

def canny(img, min_threshold=100, max_threshold=200):
    '''
    [note]   : ケニー法でエッジの抽出を行う
    [input]  : img -> エッジ抽出を行う画像
             : min_threshold -> 最小ヒステリシス閾値(default=100)
             : max_threshold -> 最大ヒステリシス閾値(default=200)
    [return] : エッジ抽出した画像
    '''
    return cv2.Canny(img, min_threshold, max_threshold)

def check_light_shade(gray_img):
    '''
    [note]   : 画像の濃淡のどちらが多いか判定
    [input]  : gray_image -> 判定するグレースケール化した画像
    [return] : 判定(True:濃, False:淡)
    '''
    size = gray_img.shape[0]*gray_img.shape[1]
    dim1 = gray_img.reshape(1, size)
    shade_num = len(dim1[np.where(dim1 < 128)])
    if shade_num * 2 < size:
        return True
    else:
        return False

def get_kernel(size, molphology="cross"):
    '''
    [note]   : モルフォロジー変換カーネルを取得
    [input]  : size       -> カーネルのサイズ
             : molphology -> カーネルのタイプ
    [return] : カーネル
    '''
    if molphology=="cross":
        return cv2.getStructuringElement(cv2.MORPH_CROSS, size)

def dilate(img, kernel, iterations):
    '''
    [note]   : 膨張処理
    [input]  : img        -> 膨張させる画像
             : kernel     -> 使用するカーネル
             : iterations -> 実行回数(何回膨張させるか)
    [return] : 膨張させた画像
    '''
    return cv2.dilate(img, kernel, iterations)

def find_contours(img, retr="external", chain="simple"):
    '''
    [note]   : 輪郭検出処理
    [input]  : img   -> 輪郭抽出する画像
             : retr  -> 抽出方法
             : chain -> 輪郭点取得方法
    [return] : 輪郭抽出した点の集合
    '''
    retr_type = cv2.RETR_EXTERNAL
    if retr == "external":
        retr_type = cv2.RETR_EXTERNAL
    elif retr == "list":
        retr_type = cv2.RETR_LIST
    elif retr == "ccomp":
        retr_type = cv2.RETR_CCOMP
    elif retr == "tree":
        retr_type = cv2.RETR_TREE

    chain_type = cv2.CHAIN_APPROX_SIMPLE
    if chain == "simple":
        chain_type = cv2.CHAIN_APPROX_SIMPLE
    elif chain == "none":
        chain_type = cv2.CHAIN_APPROX_NONE

    return cv2.findContours(img, retr_type, chain_type)

def get_bounding_rect(contour):
    '''
    [note]   : 輪郭点の集合からbouding boxを取得する
    [input]  : contour -> 輪郭点の集合
    [return] : bounding box情報(start x, start y, width, height)
    '''
    return cv2.boundingRect(contour)

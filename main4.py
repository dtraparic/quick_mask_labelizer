import os
# from app import app
import urllib.request
from flask import Flask, flash, request, redirect, url_for, render_template, jsonify
from werkzeug.utils import secure_filename
import sys
from urllib.request import urlopen
import io
import binascii
from PIL import Image
import numpy as np
import cv2 as cv
import json

# Fonctionne qu'avec des images jamais uploadées

app = Flask(__name__)
UPLOAD_FOLDER = './static/images_edit'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = 'the random string'
viewname = 'view4.html'
current_displayed_image = None


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def upload_form():
    return render_template(viewname)


@app.route('/', methods=['POST'])
def image_uploaded():
    global current_displayed_image
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    file = request.files['file']
    if file.filename == '':
        flash('No image selected for uploading')
        return redirect(request.url)
    if file and allowed_file(file.filename):
        img_name = secure_filename(file.filename)
        current_displayed_image = img_name
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], img_name))
        # print('upload_image filename: ' + filename)
        flash('Image successfully uploaded and displayed below')
        return render_template(viewname, filename=img_name)
    else:
        flash('Allowed image types are -> png, jpg, jpeg')
        return redirect(request.url)


# Ca c'est une route /display/ uniquement appelée dans le template
@app.route('/display/<arg_filename>')
def display_image(arg_filename):
    print('display_image filename: ' + arg_filename, file=sys.stderr)
    return redirect(url_for('static', filename='images_edit/' + arg_filename), code=301)


@app.route('/next', methods=['POST'])
def validate_img_then_next():
    pass


@app.route('/raw_cut_hints', methods=['POST'])
def process_raw_cut_hints():
    print("request", request)
    data_URI = request.json
    # with urlopen(data_URI) as response:
    data = urlopen(data_URI).read()
    print(type(data))
    stream = io.BytesIO(data)
    hints = Image.open(stream).convert('LA')
    hints_np = np.array(hints)
    print(hints_np.shape, "MEMORY", hints_np.size * hints_np.itemsize)
    hints_np = (hints_np > 127).astype(np.uint8)
    # hints_np[:,:,0][hints_np[:,:,1]==0]
    print("type of mask : ", type(hints_np), hints_np.dtype)

    mask_hints = hints_np[:,:,0] * 2 + hints_np[:,:,1]
    mask_hints[mask_hints==0] = 2
    mask_hints[mask_hints==1] = 0
    mask_hints[mask_hints==3] = 1
    print(mask_hints)

    bgdModel = np.zeros((1, 65), np.float64)  # internal memory space needed for the function
    fgdModel = np.zeros((1, 65), np.float64)
    # np.float32(

    img_np = cv.imread(os.path.join(app.config['UPLOAD_FOLDER'], current_displayed_image), 1)
    # mask = np.zeros(img_np.shape[:2], dtype=np.uint8)
    print("img_np", type(img_np), img_np.shape, img_np.dtype)
    print("mask_hints", type(mask_hints), mask_hints.shape, mask_hints.dtype, np.unique(mask_hints))

    rect = (1, 1, img_np.shape[1] - 1, img_np.shape[0] - 1)

    mask, bgdModel, fgdModel = cv.grabCut(img_np, mask_hints, rect, bgdModel, fgdModel, 5, cv.GC_INIT_WITH_MASK)
    # Image.fromarray(mask).show()
    # Image.fromarray(bgdModel).show()
    # Image.fromarray(fgdModel).show()
    # print(img_np.shape, "MEMORY", img_np.size * img_np.itemsize)
    # img_np =
    # print("data", data)
    # return jsonify(mask.tolist())
    visible_mask = np.zeros((mask.shape))
    print("mask", mask.shape, np.unique(mask))
    print("visible mask", visible_mask.shape, np.unique(visible_mask))
    visible_mask[mask == 1] = 255
    visible_mask = np.stack( (visible_mask, visible_mask, visible_mask, np.zeros((mask.shape))+255 ), axis=None)

    jso = json.dumps(visible_mask.flatten().tolist())
    print(f"AYAYA", type(jso))
    return jso

if __name__ == '__main__':
    app.run()

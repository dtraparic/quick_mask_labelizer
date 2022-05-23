from flask import Flask, render_template
import os
from flask import Flask, flash, request, redirect, url_for
from werkzeug.utils import secure_filename
from flask import send_from_directory
import sys

app = Flask(__name__)
UPLOAD_FOLDER = '.'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        print(request.files, file=sys.stderr)
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect(url_for('edit_images_folder', imagename=filename))
            # return render_template('upload.html', filename=filename)
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''


@app.route('/uploads/<name>')
def download_file(name):
    return send_from_directory(app.config["UPLOAD_FOLDER"], name)


@app.route('/edit/<imagename>')
def edit_images_folder(imagename):
    internal_path = send_from_directory(app.config["UPLOAD_FOLDER"], imagename)
    print(internal_path, file=sys.stderr)
    print(app.config["UPLOAD_FOLDER"], file=sys.stderr)
    return render_template('editor.html', my_path=imagename)


@app.route('/button/')
def print_in_console():
    print('Hello world!', file=sys.stderr)
    return redirect('/')
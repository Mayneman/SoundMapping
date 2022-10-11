from flask import Flask, render_template, request
import py.makeProject as mp
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route("/")
def home_page():
    return render_template('index.html')

@app.route("/import", methods=['GET', 'POST'])
def import_page():
    if request.method == 'GET':
        return render_template('import.html')
    if request.method == 'POST':
        mp.make_proj(request)
        print(request.files.getlist('file'))
        print(request.files)
        print(request.form)
        # Call project maker with these settings.
        # Satelitte images.
        # Run script and check ArcGIS License.
        return "Successful POST of import data."

@app.route("/create", methods=['POST'])
def create_proj():
    print(request.form['name'])
    return mp.make_folder(request.form['name'])

@app.route("/files", methods=['POST'])
def create_file():
    return mp.make_file(request.form['name'])
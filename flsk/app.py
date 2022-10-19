from flask import Flask, render_template, request, jsonify, send_file
from py_scripts import makeProject as mp
from py_scripts import map_image_from_extent as satellite
from py_scripts import phstl as mesh
from py_scripts import D_nmsimgis as sound_modeller
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
        return "DONE"

@app.route("/viewer")
def view_page():
    if request.method =='GET':
        return render_template('viewer.html')

@app.route("/create", methods=['POST'])
def create_proj():
    print(request.form['name'])
    return mp.make_folder(request.form['name'])

@app.route("/files", methods=['POST'])
def create_file():
    return mp.make_file(request.form['name'])

@app.route("/projects", methods=['POST'])
def project_list():
    folder_list = mp.list_folders();
    return jsonify(folder_list)

@app.route("/sources")
def sources_dict():
    source_list = mp.list_sources();
    return jsonify(source_list)

@app.route("/satellite", methods=['POST'])
def create_satellite():
    return satellite.doSatellite(request.form['project'])

@app.route("/mesh", methods=['POST'])
def create_mesh():
    elevation_location = "./projects/" + request.form['project'] + "/elevation.tif "
    stl_out = "./projects/" + request.form['project'] + "/mesh.stl"
    return mesh.make_mesh(elevation_location, stl_out)

@app.route("/run_model", methods=['POST'])
def run_model():
    print(request.form)
    in_dict = {'tbx_root': '/'}
    project_name = request.form['project']
    # REQUIRES THE sp.getExtent
    in_dict['project'] = project_name
    in_dict['sound_src'] = request.form['vehicle'] + "\\" + request.form['sound_src'] # Full path to the source file
    in_dict['temp'] = request.form['temp']
    in_dict['humidity'] = request.form['humidity']
    in_dict['receiver_offset'] = 1
    in_dict['allow_defaults'] = 'YES'
    in_dict['summarize_string'] = 'frequencies only'
    in_dict['ambient_vol'] = request.form['ambient_vol']
    in_dict['keep_intermediates'] = 0
    in_dict['out_weighting'] = request.form['out_weighting']
    sound_modeller.main_nmsimgis(in_dict)
    return ""
import json
import os
from pathlib import Path
import requests
from flask import request

base_proj_dir = "./projects/"

def make_proj(data):
    project_dir = base_proj_dir + data.form['project']
    print(data.form['project'])
    # CONFIG
    with open(project_dir + "/data.json", 'w', encoding='utf-8') as f:
        json.dump(data.form['config'], f, ensure_ascii=False, indent=4)
    # ELEVATION
    if data.files['elevation'].filename != '':
        data.files['elevation'].save(project_dir + "/elevation.tif")
    # EXTENT
    if data.files['extent'].filename != '':
        data.files['extent'].save(project_dir + "/extent.shp")
    # COVER
    if data.files['land_cover'].filename != '':
        data.files['land_cover'].save(project_dir + "/land_cover.tif")
    return "OK"

def make_folder(name):
    Path(base_proj_dir).mkdir(parents=True, exist_ok=True)
    return "Folder " + name +  " created successfully."

def make_file(name):
    base_proj_dir = "./projects/" + name

def list_folders():
    folder_list = []
    for file in os.listdir("./projects"):
        if os.path.isdir("./projects/" + file):
            folder_list.append(file)
    return folder_list 

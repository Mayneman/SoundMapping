import json
import os
from pathlib import Path
import requests
from flask import request

base_proj_dir = "./projects/"

def make_proj(data):
    print(base_proj_dir)
    print(data.files['elevation'])
    # CONFIG
    with open("./projects/data.json", 'w', encoding='utf-8') as f:
        json.dump(data.form['config'], f, ensure_ascii=False, indent=4)
    # ELEVATION
    if data.files['elevation'].filename != '':
        data.files['elevation'].save(base_proj_dir + "/elevation.tif")
    # EXTENT
    if data.files['extent'].filename != '':
        data.files['extent'].save(base_proj_dir + "/extent.shp")
    # COVER
    if data.files['land_cover'].filename != '':
        data.files['land_cover'].save(base_proj_dir + "/land_cover.tif")

def make_folder(name):
    global base_proj_dir
    base_proj_dir = "./projects/" + name
   
    Path(base_proj_dir).mkdir(parents=True, exist_ok=True)
    return "Folder " + name +  " created successfully."

def make_file(name):
    base_proj_dir = "./projects/" + name
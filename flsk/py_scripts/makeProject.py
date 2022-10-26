import json
import os
from pathlib import Path
import requests
from flask import request

base_proj_dir = "./static/projects/"

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
    data.files['extent.shp'].save(project_dir + "/extent.shp")
    data.files['extent.shx'].save(project_dir + "/extent.shx")
    data.files['extent.dbf'].save(project_dir + "/extent.dbf")
    data.files['extent.prj'].save(project_dir + "/extent.prj")
    # COVER
    if data.files['land_cover'].filename != '':
        data.files['land_cover'].save(project_dir + "/land_cover.tif")
    # POINT SOURCES
    data.files['point_src.shp'].save(project_dir + "/point_src.shp")
    data.files['point_src.shx'].save(project_dir + "/point_src.shx")
    data.files['point_src.dbf'].save(project_dir + "/point_src.dbf")
    data.files['point_src.prj'].save(project_dir + "/point_src.prj")
    return "OK"

def make_folder(name):
    Path(base_proj_dir + "/" + name).mkdir(parents=True, exist_ok=True)
    return "Folder " + name +  " created successfully."

def list_folders():
    folder_list = []
    for file in os.listdir(base_proj_dir):
        if os.path.isdir(base_proj_dir + file):
            folder_list.append(file)
    return folder_list 

def list_sources():
    source_dict = {}
    base = "./static/resources/sound_source/"
    for folder in os.listdir(base):
        if os.path.isdir(base + folder):
            source_dict[folder] = []
            for source in os.listdir(base + folder):
                if source.endswith('.src'):
                    source_dict[folder].append(source)
    print(source_dict)     
    return source_dict 
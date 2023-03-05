import os
from pathlib import Path
base_proj_dir = "./static/projects/"

def make_proj(data):
    project_dir = base_proj_dir + data.form['project']
    print(data.form['project'])
    # ELEVATION
    if 'elevation' in data.files:
        try:
            os.remove(project_dir + "/elevation.tif.aux.xml")
        except OSError:
            pass
        data.files['elevation'].save(project_dir + "/elevation.tif")
    # EXTENT
    if 'extent.shp' in data.files:
        data.files['extent.shp'].save(project_dir + "/extent.shp")
        data.files['extent.shx'].save(project_dir + "/extent.shx")
        data.files['extent.dbf'].save(project_dir + "/extent.dbf")
        data.files['extent.prj'].save(project_dir + "/extent.prj")
    # COVER
    if 'land_cover' in data.files:
        try:
            os.remove(project_dir + "/land_cover.tif.aux.xml")
        except OSError:
            pass
        data.files['land_cover'].save(project_dir + "/land_cover.tif")
        data.files['land_cover_dbf'].save(project_dir + "/land_cover.tif.vat.dbf")
    # POINT SOURCES
    if 'point_src.shp' in data.files:
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

def list_prop_images(project):
    prop_list = []
    base = "./static/projects/" + project + "/out/"
    for i in os.listdir(base):
            if i.endswith('.png'):
                prop_list.append(base + i)
    print(prop_list)     
    return prop_list 

def dbFromCoords(request):
    file_name = "./static/projects/" + request.form['project'] + "/out/point_src_A_pt0.tif"
    latitude = float(request.form['lat'])
    longitude = float(request.form['lon'])
    result = os.popen('gdallocationinfo -b 1 -valonly -wgs84 %s %s %s' % (file_name, latitude, longitude))
    read_result = result.read()
    try:
        float(read_result)
        return read_result
    except ValueError:
        return "No Data"

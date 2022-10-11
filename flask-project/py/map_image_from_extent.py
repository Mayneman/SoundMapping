# Open Street Map API
import json
import requests
import numpy
from osgeo import gdal
from osgeo.gdalconst import GA_ReadOnly
from osgeo import ogr, osr
import logging

token = "pk.eyJ1IjoibGV3aXNkdyIsImEiOiJjbDU2ODlhcm0xYmZ5M2NxeDJsdzAwNmd0In0.zc-jmuRlOe4UYiOZx_7YAg"

user = 'lewisdw'
style_id = 'cl568hnk0006v15sb6fnwux7m'


def getImage(min_lon, min_lat, max_lon, max_lat):
    url = f"https://api.mapbox.com/styles/v1/{user}/{style_id}/static/[{min_lon},{min_lat},{max_lon},{max_lat}]/1280x1280"
    url_auth = f"?access_token={token}"
    result = requests.request("get", url + url_auth)
    print(url + url_auth)
    print(result)
    return result


def getExtentAndCoordniateSystem(file):
    data = gdal.Open(file, GA_ReadOnly)
    old_cs = osr.SpatialReference()
    old_cs.ImportFromWkt(data.GetProjectionRef())

    info = gdal.Info(file, deserialize=True, format='json', showMetadata=False)

    print(json.dumps(info, sort_keys=True, indent=4))
    coords_list = info['wgs84Extent']['coordinates'][0]
    print(coords_list)
    bottom_left = coords_list[1]
    top_right = coords_list[3]

    return bottom_left, top_right


def doSatellite(project):
    tif_raster = "./projects/" + project + "/elevation.tif"
    print(tif_raster)
    bl, tr = getExtentAndCoordniateSystem(tif_raster)
    im = getImage(bl[0], bl[1], tr[0], tr[1])
    f = open("./projects/" + project + "/satelitte.jpeg", 'wb')
    f.write(im.content)
    f.close()
    return("Satellite content saved successfully.")

# Open Street Map API
from PIL import Image
from osgeo import gdal
from osgeo import ogr, osr
from osgeo.gdalconst import GA_ReadOnly

import urllib.request


token = "pk.eyJ1IjoibGV3aXNkdyIsImEiOiJjbDU2ODlhcm0xYmZ5M2NxeDJsdzAwNmd0In0.zc-jmuRlOe4UYiOZx_7YAg"
user = 'lewisdw'
style_id = 'cl568hnk0006v15sb6fnwux7m'


def getImage(min_lon, min_lat, max_lon, max_lat):
    # Make square for image.
    lat_diff = max_lat - min_lat;
    lon_diff = max_lon - min_lon;
    if (lat_diff > lon_diff):
        url = f"https://api.mapbox.com/styles/v1/{user}/{style_id}/static/[{min_lon},{min_lat},{min_lon + lat_diff},{max_lat}]/1280x1280"
        crop_var = ["lat", lon_diff/lat_diff]
        print("Extending lon to be square")
    else:
        url = f"https://api.mapbox.com/styles/v1/{user}/{style_id}/static/[{min_lon},{min_lat},{max_lon},{min_lat + lon_diff}]/1280x1280"
        crop_var = ["lon", lat_diff/lon_diff]
        print("Extending lat to be square")



    url_auth = f"?access_token={token}"
    urllib.request.urlretrieve(url + url_auth, "img.jpeg")
    im = Image.open("img.jpeg");
    print(crop_var)
    if(crop_var[0] == "lon"):
        im1 = im.crop((0, 1280 - round(crop_var[1]*1280), 1280, 1280))
    else:
        im1 = im.crop((0, 0, 1280 - round(crop_var[1]*1280), 1280))
    return im1


def getExtentAndCoordniateSystem(file):
    data = gdal.Open(file, GA_ReadOnly)
    old_cs = osr.SpatialReference()
    old_cs.ImportFromWkt(data.GetProjectionRef())

    info = gdal.Info(file, deserialize=True, format='json', showMetadata=False)
    print(info['wgs84Extent'])
    coords_list = info['wgs84Extent']['coordinates'][0]
    bottom_left = coords_list[1]
    top_right = coords_list[3]

    return bottom_left, top_right



def doSatellite(project):
    tif_raster = "./static/projects/" + project + "/elevation.tif"
    bl, tr = getExtentAndCoordniateSystem(tif_raster)
    print(bl[0], bl[1], tr[0], tr[1])
    im = getImage(bl[0], bl[1], tr[0], tr[1])
    im_rotated = im.rotate(180)
    im_rotated.save("./static/projects/" + project + "/satelitte.jpeg")
    return("Satellite content saved successfully.")

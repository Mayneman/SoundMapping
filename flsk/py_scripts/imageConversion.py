import os, sys
from PIL import Image, ImageOps
import json
from osgeo import gdal
from osgeo.gdalconst import GA_ReadOnly
from osgeo import ogr, osr
import glob
from pathlib import Path

def tiffToPNG(in_dir):
    count = 0
    for infile in os.listdir(in_dir):
        if infile[-3:] == "tif" or infile[-3:] == "bmp" :
            count += 1
            outfile = infile[:-3] + "png"
            im = Image.open(in_dir + "/" + infile).convert("L")
            im.putdata(stretchRange(list(im.getdata())))
            im.save(in_dir + "/" + outfile, "PNG", quality=90)
    return count

def stretchRange(image_data):
    max_gs = max(image_data)
    scale_factor = 255/max_gs;
    new_data = []
    for i in image_data:
        new_data.append(round(i*scale_factor))
    return new_data

def getExtentAndCoordniateSystem(file):
    data = gdal.Open(file, GA_ReadOnly)
    old_cs = osr.SpatialReference()
    old_cs.ImportFromWkt(data.GetProjectionRef())

    info = gdal.Info(file, deserialize=True, format='json', showMetadata=False)

    coords_list = info['wgs84Extent']['coordinates'][0]
    bottom_left = coords_list[1]
    top_right = coords_list[3]

    return bottom_left, top_right

# 
def applyTransparentBorders(image, background, image_extent, main_extent, out_folder):
    im = Image.open(image)
    im.putalpha(255)
    width, height = im.size
    im_bg = Image.open(background)

    main_extent = getExtentAndCoordniateSystem(main_extent)
    img_extent = getExtentAndCoordniateSystem(image_extent)
    x_len = main_extent[1][0] - main_extent[0][0]
    x_len_img = img_extent[1][0] - img_extent[0][0]

    # LEFT
    x_diff_left = img_extent[0][0] - main_extent[0][0]
    x_left_percent = x_diff_left/x_len_img
    added_pixels_left = int(x_left_percent * width)

    # RIGHT
    x_diff_right = main_extent[1][0] - img_extent[1][0]
    x_right_percentage = x_diff_right/x_len_img;
    added_pixels_right = int(x_right_percentage * width)
    y_len = main_extent[1][1] - main_extent[0][1]
    y_len_img = img_extent[1][1] - img_extent[0][1]
    
    # TOP
    y_diff_top = main_extent[1][1] - img_extent[1][1]
    y_top_percentage = y_diff_top/y_len_img
    added_pixels_top = int(y_top_percentage * height)

    # BOTTOM
    y_diff_bot = img_extent[0][1] - main_extent[0][1]
    y_bot_percentage = y_diff_bot/y_len_img
    added_pixels_bot = int(y_bot_percentage * height)

    total_X = added_pixels_left + added_pixels_right + width
    total_Y = added_pixels_top + added_pixels_bot + height

    # Create new image with correct sizing place old image at particular x,y value.
    new_im = Image.new('RGBA', (total_X, total_Y))
    new_im.paste(im, (added_pixels_left, added_pixels_top), im)
    out = new_im.rotate(180)
    out.save(out_folder)


# Takes all .png files in a folder and gives transparent background the same size as a reference img (background) saves to local 'processed' folder. 
def batchTransform(folder_in, background, background_extent):
    images = glob.glob(folder_in + "\*.png")
    Path(folder_in + "/out").mkdir(parents=True, exist_ok=True)
    for image in images:
        try:
            image_extent = image[0:-4] + ".tif"
            applyTransparentBorders(image, background, image_extent, background_extent, folder_in + os.path.basename(image))
        except Exception as e:
            print(e)
        
def convertAll(in_dir, satelitte, elevation):
    count = tiffToPNG(in_dir)
    batchTransform(in_dir, satelitte, elevation)
    return count

def colorize_test():
    in_img = Image.open("G:\\_PROJECTS\\_University\\_SMP\\flsk\\static\\projects\\first\\out\\point_src_A_pt0.tif").convert("L")
    img1 = ImageOps.colorize(in_img, black="green", white ="red")
    img1.show()

# colorize_test()
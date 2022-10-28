import numpy
from PIL import Image
from osgeo import gdal
import pandas as pd
import os

def show_tif(file):
    im = Image.open(file)
    im.show()

def tif_to_numpy(file):
    im = Image.open(file)
    im_array = numpy.array(im)
    print("Shape of file: " + str(im_array.shape))
    print("Size of file: " + str(im_array.size))
    print(im_array)

def tif_to_csv(file):
    tif = gdal.Open(file)  # Read in GeoTIFF file

    df = pd.read_csv("samples/dem.xyz", sep=" ", header=None)
    df.columns = ["x", "y", "value"]
    df.to_csv("samples/dem.csv", index=False)

# tif_to_csv("resources/TIF/IJ.tif")
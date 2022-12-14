# -*- coding: utf-8 -*-
'''
Description: Interface that can be used to run the NMSIMGIS sound propagation
             model
             
Dependencies: ArcGIS Pro 3.0, Python 3.7 or greater, soundprophlpr.py, nmsimhlpr.py
              nmsimgis_analysis.py, NumPy

@author Alexander "Sasha" Keyel <skeyel@gmail.com>

Copyright Information For D_nmsimgis.py:
Copyright (C) 2016, A.C. Keyel <skeyel@gmail.com>

Alexander "Sasha" Keyel
Postdoctoral Researcher
1474 Campus Delivery
Colorado State University
Fort Collins, CO 80523-1474
  

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License 2.0 as published by the Free
Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 51 Franklin
Street, Fifth Floor, Boston, MA 02110-1301 USA.

'''

#import multiprocessing
#http://stackoverflow.com/questions/18204782/runtimeerror-on-windows-trying-
#python-multiprocessing
# If re-enabling multiprocessing you need if __name__== '__main__':

# Import system module
import sys, ntpath
import arcpy
import os
try:
    import soundprophlpr as sp
except ImportError:
    import py_scripts.soundprophlpr as sp


def main_nmsimgis(in_dict):
    root_folder = os.path.abspath(os.getcwd()) + "\\static\\projects\\" + in_dict['project']
    tbx_root = os.path.abspath(os.getcwd())
    # Input parameters (optional parameters will come in as '#' if left blank)
    model = "nmsimgis"
    # Files
    point_source_file = root_folder + "\\point_src.shp"
    model_extent = sp.get_extent(root_folder + "\\extent.shp")
    elevation = root_folder + "\\elevation.tif"
    land_cover = root_folder + "\\land_cover.tif"
    src_file =  os.getcwd() + "\\static\\resources\\sound_source\\" + in_dict['sound_src']

    results_label = ntpath.basename(point_source_file)[:-4]
    # Basic Variables
    source_id_field = "FID"
    temp = in_dict['temp']
    rh = in_dict['humidity']
    ambient = 'NA'
    drop_down_weight = in_dict['out_weighting']
    receiver_offset = 1
    allow_defaults = 'YES'
    summarize_string = 'frequencies only'
    summarize = sp.unpack_summary(summarize_string)
    keep_intermediates = 0
    # Correct for ArcGIS's path import practices
    root_folder = root_folder + '\\'
    model_dir = root_folder
    results_dir = root_folder + 'nmsimgis\\'

    # Add extra variable that does not apply
    timelog = "none"

    # Add variable that controls how GUI works
    is_GUI = "YES"

    # DEBUG HERE

    # Set a point to truncate the results
    truncate = 0  # default truncate at 0 dB

    # Convert weighting to appropriate code for SoundPropagation
    weighting = sp.convert_to_weighting(drop_down_weight)

    # Add unused spreadgis parameters to make function-call happy
    wind_dir = wind_sp = seas_cond = "NA"

    # Now this is read in from the shapefile
    #source_info = [head, roll, pitch, vel, engpow, srcfile]
    n_points = "all" # Option to run for fewer points. Only an option in the script

    # Frequency values must be taken from .src file
    #multiprocessing.freeze_support()

    # If a single value is given for temperature, just run the main analysis
    arcpy.AddMessage("Running normal nmsimgis analysis")
    sp.SoundPropagation(model, point_source_file, source_id_field,
                        model_extent, ambient, elevation, land_cover, temp, rh,
                        wind_dir, wind_sp, seas_cond, model_dir, results_dir,
                        results_label, src_file,
                        receiver_offset, n_points, tbx_root, timelog,
                        summarize=summarize,
                        keep_intermediates=keep_intermediates,
                        weighting=weighting, truncate=truncate,
                        landcover_type="nlcd", is_GUI=is_GUI,
                        allow_defaults=allow_defaults)

#  FOR TESTING
if __name__ == "__main__":
    print("I AM SUBPROCESS")
    print(sys.argv)
    in_dict = {'tbx_root': '\\', 'project': sys.argv[1], 'sound_src': sys.argv[2], 'temp': sys.argv[3], 'humidity': sys.argv[4], 'out_weighting': sys.argv[5]}
    main_nmsimgis(in_dict)

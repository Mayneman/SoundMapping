import { log } from './logging';

let elevation_tmp = "";
let extent_tmp = "";
let land_cover_tmp = "";

$("#elevation_input").change(function(e) {
    elevation_tmp = URL.createObjectURL(e.target.files[0]);
    log("Selected Elevation File: " + elevation_tmp);
  });

$("#extent_input").change(function(e) {
  extent_tmp = URL.createObjectURL(e.target.files[0]);
  log("Selected Extent File: " + extent_tmp);
});

$("#land_cover_input").change(function(e) {
  land_cover_tmp = URL.createObjectURL(e.target.files[0]);
  log("Selected Land Cover File: " + land_cover_tmp);
});

// Get all import information and send it to a json in temp folder.
$("#submit_imports").click(function () {
  let config_json = {}
  config_json["temp"] = $("#temperature")[0].value;
  config_json["humidity"] = $("#humidity")[0].value;
  config_json["ambient_vol"] = $("#ambient")[0].value;
  config_json["out_weighting"] = $("#out_weighting")[0].value;
  config_json["elevation_file"] = elevation_tmp;
  config_json["extent_file"] = extent_tmp;
  config_json["land_cover_file"] = land_cover_tmp;
  config_json["sound_src"] = $("#vehicle_model")[0].value;
  console.log(config_json)
  });

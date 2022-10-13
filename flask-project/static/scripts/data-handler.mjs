import { log } from './logging.mjs';

let elevation_tmp = "";
let extent_tmp = "";
let land_cover_tmp = "";

$("#lock_name").click(function() {
  $.post("/create",{name: $("#project_name")[0].value},function(result){
    log(result);
    get_project_list();
  });

});

$("#create_sat").click(function() {
  console.log($("#project_list")[0].value)
  $.post("/satellite",{project: $("#project_list")[0].value},function(result){
    log(result);
  });
});

$("#create_mesh").click(function() {
  console.log($("#project_list")[0].value)
  $.post("/mesh",{project: $("#project_list")[0].value},function(result){
    log(result);
  });
});


$("#elevation_input").change(function(e) {
    console.log(e);
    if(e.currentTarget.files.length == 1){
      $("#elevation_confirm")[0].innerHTML = "✔️";
      log("Elevation file selected.");
    } else {
      $("#elevation_confirm")[0].innerHTML = "❌";
      log("Incorrect input for elevation file.");
    }
  });

$("#extent_input").change(function(e) {
  if(e.currentTarget.files.length == 1){
    $("#extent_confirm")[0].innerHTML = "✔️";
    log("Extent file selected.");
  } else {
    $("#extent_confirm")[0].innerHTML = "❌";
    log("Incorrect input for extent file.");
  }
});

$("#land_cover_input").change(function(e) {
  if(e.currentTarget.files.length == 1){
    $("#land_cover_confirm")[0].innerHTML = "✔️";
    log("Land cover file selected.");
  } else {
    $("#land_cover_confirm")[0].innerHTML = "❌";
    log("Incorrect input for land cover file.");
  }
  check_three();
});

function check_three(){
  if($("#land_cover_confirm")[0].innerHTML == "✔️" & $("#extent_confirm")[0].innerHTML == "✔️" & $("#elevation_confirm")[0].innerHTML == "✔️"){
    $('#submit_imports').prop('disabled',false);
  } else {
    $('#submit_imports').prop('disabled',true);
  }
}

// Get all import information and send it to a json in temp folder.
$("#submit_imports").click(function () {
  let config_json = {}
  config_json["temp"] = $("#temperature")[0].value;
  config_json["humidity"] = $("#humidity")[0].value;
  config_json["ambient_vol"] = $("#ambient")[0].value;
  config_json["out_weighting"] = $("#out_weighting")[0].value;
  config_json["sound_src"] = $("#vehicle_model")[0].value;

  let formData = new FormData();
  formData.append('elevation', $("#elevation_input")[0].files[0]);
  formData.append('extent', $("#extent_input")[0].files[0]);
  formData.append('land_cover', $("#land_cover_input")[0].files[0]);
  formData.append('config', config_json);
  formData.append('project', $("#project_list")[0].value);
  console.log($("#project_list")[0].value);

  $.ajax({
    type: 'POST',
    url: '/import',
    data : formData,
    processData: false,
    contentType: false,
    success: function(data) {
      log(data);
      $("#import_success")[0].hidden = false;
    }
}, );
  console.log("Posted");
  });

function get_project_list(){
  $.post('/projects',function(data) {
    $('#project_list')[0].innerHTML = "";
    for (var i = 0; i < data.length; i++) {
      $('#project_list').append($('<option>', { 
        value: data[i],
        text : data[i]
    }));
    }
  });
}



$( document ).ready(function() {
    get_project_list();
});


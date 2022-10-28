import { log } from './logging.mjs';

let elevation_tmp = "";
let extent_tmp = "";
let land_cover_tmp = "";
let source_dict;


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

$("#run_model").click(function() {
  let formData = new FormData();
  formData.append('temp', $("#temperature")[0].value);
  formData.append('humidity', $("#humidity")[0].value);
  formData.append("out_weighting",$("#out_weighting")[0].value);
  formData.append("vehicle",$("#vehicle_type")[0].value);
  formData.append("sound_src",$("#vehicle_model")[0].value);
  formData.append('project', $("#project_list")[0].value);
  console.log(formData);
  $.ajax({
    type: 'POST',
    url: '/run_model',
    data : formData,
    processData: false,
    contentType: false,
    success: function(data) {
      log(data);
    }
});
latest_info();
});

function latest_info(){
  $(function() {
    var latest_info_interval = setInterval(function() {
        $.get('latest_info',function(result){
          if(result.length != 0){
            for (var i in result) {
              log(result[i]);
              console.log(result)
            }
            if(result[0] == ""){
              clearInterval(latest_info_interval);
              log("Simulation Complete.");
            }
          }
        })
    }, 3000);
});
}

$("#elevation_input").change(function(e) {
    if(e.currentTarget.files.length == 1){
      $("#elevation_confirm")[0].innerHTML = "✔️";
      log("Elevation files selected.");
    } else {
      $("#elevation_confirm")[0].innerHTML = "❌";
      log("Incorrect input for elevation file.");
    }
  });

$("#extent_input").change(function(e) {
  if(e.currentTarget.files.length == 4){
    $("#extent_confirm")[0].innerHTML = "✔️";
    log("Extent file selected.");
  } else {
    $("#extent_confirm")[0].innerHTML = "❌";
    log("4 files required for extent shape information.");
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
});

$("#point_src_input").change(function(e) {
  if(e.currentTarget.files.length == 4){
    $("#point_src_confirm")[0].innerHTML = "✔️";
    log("Point source files are selected.");
    console.log(e.currentTarget.files);
  } else {
    $("#point_src_confirm")[0].innerHTML = "❌";
    log("4 files required for point sources shape information.");
  }
});

// Get all import information and send it to a json in temp folder.
$("#submit_imports").click(function () {

  let formData = new FormData();
  if($("#elevation_input")[0].files.length == 1){
    formData.append('elevation', $("#elevation_input")[0].files[0]);
  }
  if($("#land_cover_input")[0].files.length == 1){
    formData.append('land_cover', $("#land_cover_input")[0].files[0]);
  }
  if($("#extent_input")[0].files.length == 4){
    formData.append("extent" + $("#extent_input")[0].files[0].name.slice(-4), $("#extent_input")[0].files[0]);
    formData.append("extent" + $("#extent_input")[0].files[1].name.slice(-4), $("#extent_input")[0].files[1]);
    formData.append("extent" + $("#extent_input")[0].files[2].name.slice(-4), $("#extent_input")[0].files[2]);
    formData.append("extent" + $("#extent_input")[0].files[3].name.slice(-4), $("#extent_input")[0].files[3]);
  }

  if($("#point_src_input")[0].files.length == 4){
    formData.append("point_src" + $("#point_src_input")[0].files[0].name.slice(-4), $("#point_src_input")[0].files[0]);
    formData.append("point_src" + $("#point_src_input")[0].files[1].name.slice(-4), $("#point_src_input")[0].files[1]);
    formData.append("point_src" + $("#point_src_input")[0].files[2].name.slice(-4), $("#point_src_input")[0].files[2]);
    formData.append("point_src" + $("#point_src_input")[0].files[3].name.slice(-4), $("#point_src_input")[0].files[3]);
  }
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
});
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

function set_sound_models(){
  $('#vehicle_model')[0].innerHTML = "";
  for(var i in source_dict[$('#vehicle_type')[0].value]){
    $('#vehicle_model').append($('<option>', { 
      value: source_dict[$('#vehicle_type')[0].value][i],
      text : source_dict[$('#vehicle_type')[0].value][i].slice(0, -4)
    }));
  }
}
$("#vehicle_type").change(function() {
  set_sound_models();
});


function get_sound_sources(){
$.get('/sources',function(data) {
  source_dict = data;
  for (var i = 0; i < Object.keys(source_dict).length; i++) {
    $('#vehicle_type').append($('<option>', { 
      value: Object.keys(source_dict)[i],
      text : Object.keys(source_dict)[i]
    }));
  }
  set_sound_models();
});
}



$( document ).ready(function() {
    get_project_list();
    get_sound_sources();
});


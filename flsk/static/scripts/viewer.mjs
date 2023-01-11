//THREE JS VARIOUS REMOTE IMPORTS
import * as THREE from './three.module.mjs';
import { STLLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/STLLoader'
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/OBJLoader'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls'
import Stats from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/libs/stats.module.js'
import { Vector3 } from 'https://cdn.skypack.dev/three@0.129.0/';
// import * as fs from 'fs';
//GET Names of all images in folder.

let scene;
let camera;
let renderer;
let stats;
let prop_images = [];
let prop_mat_array;
let running_animation = false;
function objSceneAndCamera(sat_image, project_mesh, bg_image, prop_images){
  // SCENE, OBJECT AND CAMERA
  scene = new THREE.Scene();
  scene.add(new THREE.AxesHelper(20))
  camera = new THREE.PerspectiveCamera(75, (window.innerWidth) / window.innerHeight, 0.1, 1000);

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.75 );
  scene.add( directionalLight );

  prop_mat_array = [];
  for ( let i in prop_images ){
    console.log(prop_images[i])
    let propagation = new THREE.TextureLoader().load(prop_images[i]);
    propagation.rotation = Math.PI;
    prop_mat_array.push(new THREE.MeshBasicMaterial( { map: propagation, transparent: true} )); 
  }

  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
  });
  renderer.outputEncoding = THREE.sRGBEncoding

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.setZ(300);

  const texture = new THREE.TextureLoader().load( sat_image );
  texture.rotation = Math.PI;
  const material = new THREE.MeshBasicMaterial( { map: texture } );
  //Set initial materials.
  let material_array = new Array(material, prop_mat_array[0]);
  // let material_array = new Array(material);
  console.log(material_array)
  // SkyBox
  const bg = new THREE.TextureLoader().load(bg_image);
  scene.background = bg;
  const buffer_geometry = new THREE.BufferGeometry();

  const loader = new STLLoader();
  // Load STL and modify for initial display
  loader.load(
      project_mesh,
      function (geometry) {
        // Center in world
        geometry.center();

        let position_array = geometry.attributes.position.array;
        let uv = [];
        let min_x = geometry.boundingBox.min.x;
        let min_y = geometry.boundingBox.min.y;
        let max_x = geometry.boundingBox.max.x;
        let max_y = geometry.boundingBox.max.y;
        let min_max_x = max_x - min_x;
        let min_max_y = max_y - min_y;
        for ( var i = 0; i < geometry.attributes.position.array.length; i ++ ) {
          if(i%3==0){
            //X Value
            uv.push((position_array[i]-max_x)/min_max_x);
          }
          if(i%3==1){
            //Z Value
            uv.push((position_array[i]-max_y)/min_max_y);
          }
        }
        let float_uv = new Float32Array(uv);
        geometry.setAttribute('uv', new THREE.BufferAttribute(float_uv, 2));
        geometry.clearGroups();
        geometry.addGroup( 0, Infinity, 0 );
        geometry.addGroup( 0, Infinity, 1 );


        var mesh = new THREE.Mesh(geometry, material_array);
        mesh.rotation.x = -Math.PI / 2;
        mesh.scale.set(0.01, 0.01, 0.01);
        // mesh.scale.set(10, 10, 10);
        scene.add(mesh)
        
      },
      (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
      },
      (error) => {
          console.log(error)
      }
  )

  stats = Stats()
  document.body.appendChild(stats.dom)
  stats.domElement.style.cssText = 'position:absolute;top:14px;left:95%;';
  window.addEventListener('resize', onWindowResize, false)
  //Mouse Move Event
  let items = getMouseIntersect(scene, camera);
  console.log(items);
  if(items != null){
    
  }
  animate();
}


function onWindowResize() {
    camera.aspect = (window.innerWidth) / window.innerHeight;
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight);
    $('#bg').width = window.innerWidth;
    $('#bg').height = window.innerHeight;
    render()
}

function animate() {
  //Property changes checked per frame.
  let mesh = getMeshFromScene(scene);
  if(mesh != undefined){
    mesh.material[1].opacity = $("#propagationTransparency")[0].value;
  }
  let current_img_value = document.getElementById("imageNo").value;
  //TODO
  if(prop_images.length > 0 & mesh != undefined){
    mesh.material[1] = prop_mat_array[$("#imageNo")[0].value - 1];
  }
  requestAnimationFrame(animate);
  render();

  stats.update()
}

function render() {
  renderer.render(scene, camera)
}

function getPropImages(project){
  let formData = new FormData();
  formData.append('project', project);
  $.ajax({
    type: 'POST',
    url: '/prop_images',
    data : formData,
    processData: false,
    contentType: false,
    async: false,
    success: function(data) {
      console.log(data);
      prop_images = data;
      $("#imageNo")[0].max = data.length;
      return data;
    }
});
}

function getMouseIntersect(scene, camera, width_offset){
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const onMouseClick = (event) => {
      pointer.x = ((event.clientX) / window.innerWidth) * 2 - 1;
      pointer.y = - ((event.clientY) / window.innerHeight) * 2 + 1;
      let mesh = getMeshFromScene(scene);
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObject(mesh);
      if(intersects.length > 0){
          uvToLatLon(intersects[0].uv.x, intersects[0].uv.y);
          console.log($('#lat_input'))
      }
  }

  addEventListener('click', onMouseClick)
}

//TODO: Make this more efficient. Currently looks for mesh every frame.
function getMeshFromScene(scene){
  for(let object in scene.children){
      if(scene.children[object].type == 'Mesh'){
          return scene.children[object];
      }
  }
}
$('#latLonToDB').click(function() {
  let formData = new FormData();
  formData.append('lat', $('#lat_input')[0].value);
  formData.append('lon', $('#lon_input')[0].value);
  $.ajax({
    type: 'POST',
    url: '/db_value',
    data : formData,
    processData: false,
    contentType: false,
    success: function(data) {
      console.log(data);
      $('#decibel_value')[0].innerHTML = data
    }
});
});

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

$('#runAnimation').click(async function() {
  running_animation = !running_animation;
  while(running_animation){
    let image_num = document.getElementById("imageNo");
    await delay(1000);
    if(image_num.max <= image_num.value){
      image_num.value = 1;
    } else {
      console.log(image_num.value + 1);
      //Increment string number by 1
      image_num.value = +image_num.value + 1;
    }
  }
});

function uvToLatLon(u, v){
  // u is lat, v is lon
  //max-min * (1 + u) + min
  //TODO: REPLACE THESE WITH ACTUAL VALUES
  let lat = [173.9252829,  174.1873358]
  let lon = [-39.3977755, -39.1703491]
  let point_lat = (lat[1]-lat[0])*(1+u) + lat[0]
  let point_lon = (lon[1]-lon[0])*(1+v) + lon[0]
  let formData = new FormData();
  formData.append('lat', point_lat);
  formData.append('lon', point_lon);
  $('#lat_input')[0].value = point_lat;
  $('#lon_input')[0].value = point_lon;
  $.ajax({
    type: 'POST',
    url: '/db_value',
    data : formData,
    processData: false,
    contentType: false,
    success: function(data) {
      console.log(data);
      $('#decibel_value')[0].innerHTML = data
    }
});
}

window.onload = function() {
  let project = window.location.search.substring(1).split('=')[1];
  if(project){
    let sat_image = "./static/projects/" + project + "/satelitte.jpeg"
    let mesh = "./static/projects/" + project + "/mesh.stl"
    let bg_image = "./static/resources/img/bg.jpg"
    let formData = new FormData();
    formData.append('project', project);
    $.ajax({
      type: 'POST',
      url: '/prop_images',
      data : formData,
      processData: false,
      contentType: false,
      async: false,
      success: function(data) {
        console.log(data);
        getPropImages(project);
        objSceneAndCamera(sat_image, mesh, bg_image, data);
      }
  });
  console.log(THREE.REVISION);
  }
}

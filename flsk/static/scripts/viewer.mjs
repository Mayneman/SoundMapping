//THREE JS VARIOUS REMOTE IMPORTS
import * as THREE from './three.module.mjs';
import { STLLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/STLLoader'
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/OBJLoader'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls'
import Stats from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/libs/stats.module.js'
import { Vector3 } from 'https://cdn.skypack.dev/three@0.129.0/';
// import * as fs from 'fs';
import { getMouseIntersect } from './raycaster.mjs'
//GET Names of all images in folder.

let scene;
let camera;
let renderer;
let stats;

function objSceneAndCamera(sat_image, project_mesh, bg_image, prop_images){
  // SCENE, OBJECT AND CAMERA
  scene = new THREE.Scene();
  scene.add(new THREE.AxesHelper(20))
  camera = new THREE.PerspectiveCamera(75, window.innerHeight / window.innerHeight, 0.1, 1000);

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.75 );
  const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.75 );
  directionalLight2.position.set(0,-1,0);
  scene.add( directionalLight );
  scene.add( directionalLight2 );

  let prop_mat_array = [];
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
  stats.domElement.style.cssText = 'position:absolute;top:0px;left:96%;';
  window.addEventListener('resize', onWindowResize, false)
  //Mouse Move Event
  getMouseIntersect(scene, camera);
  animate();
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight);
    $('#bg').width = window.innerWidth;
    $('#bg').height = window.innerHeight;
    render()
}

function animate() {
  //Property changes checked per frame.
  // if (scene.children[3]) {
  //   scene.children[3].material[1].opacity = document.getElementById("propagationTransparency").value;
  //   // If different material.
  //   let current_img_value = document.getElementById("imageNo").value;
  //   if(scene.children[3].material[1].map.source.uuid != prop_mat_array[current_img_value-1].map.source.uuid){
  //     console.log(prop_mat_array[current_img_value-1].map.source.uuid)
  //     scene.children[3].material[1] = prop_mat_array[current_img_value-1];

  //   }
  // }
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
    success: function(data) {
      console.log(data);
      return data;
    }
});

}

window.onload = function() {
  let project = window.location.search.substring(1).split('=')[1];
  if(project){
    let sat_image = "./static/projects/" + project + "/satelitte.jpeg"
    let mesh = "./static/projects/" + project + "/mesh.stl"
    let bg_image = "./static/resources/img/bg.jpg"
    let prop_image = getPropImages(project);
    let formData = new FormData();
    formData.append('project', project);
    $.ajax({
      type: 'POST',
      url: '/prop_images',
      data : formData,
      processData: false,
      contentType: false,
      success: function(data) {
        console.log(data);
        objSceneAndCamera(sat_image, mesh, bg_image, data);
      }
  });
  console.log(THREE.REVISION);
  }
}

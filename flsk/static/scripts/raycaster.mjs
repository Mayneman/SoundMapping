import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';


export function getMouseIntersect(scene, camera){
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const onMouseClick = (event) => {
        pointer.x = ((event.clientX) / window.innerWidth) * 2 - 1;
        pointer.y = - ((event.clientY) / window.innerHeight) * 2 + 1;
        let mesh = getMeshFromScene(scene);
       console.log(mesh)
        raycaster.setFromCamera(pointer, camera)
        console.log(mesh.material);
        const intersects = raycaster.intersectObject(mesh);
        console.log(intersects);
        if(intersects.length > 0){
            uvToLatLon(intersects[0].uv.x, intersects[0].uv.y);
        }


    }

    addEventListener('click', onMouseClick)
}

//TODO: Make this more efficient. Currently looks for mesh every frame.
function getMeshFromScene(scene){
    for(let object in scene.children){
        console.log(scene.children[object])
        if(scene.children[object].type == 'Mesh'){
            return scene.children[object];
        }
    }
}



export function uvToLatLon(u, v){
    // u is lat, v is lon
    //max-min * (1 + u) + min
    //TODO: REPLACE THESE WITH ACTUAL VALUES
    let lat = [173.9252829,  174.1873358]
    let lon = [-39.3977755, -39.1703491]
    let point_lat = (lat[1]-lat[0])*(1+u) + lat[0]
    let point_lon = (lon[1]-lon[0])*(1+v) + lon[0]
    console.log(point_lat, point_lon)
    let formData = new FormData();
    formData.append('lat', point_lat);
    formData.append('lon', point_lon);
    $.ajax({
      type: 'POST',
      url: '/db_value',
      data : formData,
      processData: false,
      contentType: false,
      success: function(data) {
        console.log(data);
        return data;
      }
  });
}
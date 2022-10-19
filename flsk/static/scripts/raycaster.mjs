// import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';


function getMouseIntersect(scene, camera){
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const onMouseMove = (event) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
        let mesh = getMeshFromScene(scene);
    
        raycaster.setFromCamera(pointer, camera)
        const intersects = raycaster.intersectObject(mesh);
        console.log(intersects);


    }

    addEventListener('click', onMouseMove)
}

//TODO: Make this more efficient. Currently looks for mesh every frame.
function getMeshFromScene(scene){
    for(let object in scene.children){
        if(scene.children[object].type == 'Mesh'){
            return scene.children[object];
        }
    }
}
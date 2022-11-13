import './App.css';
import * as THREE from 'three';
import { useEffect } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Cube from './lib/Cube.js';
import { SpotLightHelper } from 'three';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

function App() {

  useEffect( () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.position.z = 20;

    const cube = new Cube(scene, 3);
    // console.log(scene);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1.2);
    spotLight.castShadow = true;
    spotLight.position.set(0, 0, 1);
    camera.add(spotLight);
    // const lightHelper = new THREE.SpotLightHelper(spotLight);
    // scene.add(lightHelper);
    scene.add(camera);

    const controls = new OrbitControls(camera, canvas);
    controls.mouseButtons = {
      RIGHT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY
    };
    controls.keys = {}
    // controls.touches = {}
    controls.enableDamping = true;
    // console.log(controls);

    const group = new THREE.Group();
    scene.add(group);

    const clearGroup = () => {
      while(group.children.length > 0) {
        let position = new THREE.Vector3();
        group.children[0].getWorldPosition(position);
        group.children[0].position.copy(position);

        let quaternion = new THREE.Quaternion();
        group.children[0].getWorldQuaternion(quaternion);
        group.children[0].quaternion.copy(quaternion);
        group.children[0].updateMatrix();

        // group.children[0].matrixWorldAutoUpdate = true;

        scene.add(group.children[0]);
      }
      group.rotation.x = 0;
      group.rotation.y = 0;
      group.rotation.z = 0;
    };

    const onKeyDown = (event) => {
      if(event.key === 'q') {

        for(let ray of cube.rays.zRays) {
          // console.log(scene.children.filter((obj) => obj.type === "Mesh"));
          let intersect = ray.intersectObjects(scene.children.filter((obj) => obj.name === "piece"))[0];
          let color = intersect.object.material[intersect.face.materialIndex].color;
          // console.log(color.getHexString());
          // console.log(ray.intersectObjects(scene.children.filter((obj) => obj.name === "piece")));
        }

      }
      if(event.key === 'a') {
        let list = cube.pieces.map((item) => item.mesh);
        let y0 = list.filter((obj) => obj.position['y'] === 0);
        group.add(...y0);
        group.rotation.y = Math.PI / 2;

        clearGroup();
        // console.log(cube.pieces);
        // console.log(scene.children.filter((obj) => obj.type === "Mesh"));
      }
    }

    window.addEventListener('keydown', onKeyDown);

    const pointerCaster = new THREE.Raycaster();
    const pointerClickedCubePosition = new THREE.Vector3();
    const pointerCurrentCubePosition = new THREE.Vector3();
    const pointerClickedPosition = new THREE.Vector3();
    const pointerPosition = new THREE.Vector3();
    let rotationFlag = false;
    let axisDirection = '';
    let clickedAxis = '';
    let axisOfRotation = '';
    const faceToAxis = {
      0: 'x',
      1: 'x',
      2: 'y',
      3: 'y',
      4: 'z',
      5: 'z',
    };

    const getPointerCubePosition = () => {
      pointerCaster.setFromCamera(
        pointerPosition,
        camera
      )

      const intersects = pointerCaster.intersectObjects(scene.children.filter((obj) => obj.name === "faceDetection"));

      if (intersects.length > 0) {
        Object.assign(pointerCurrentCubePosition, intersects[0].point);
        clickedAxis = faceToAxis[intersects[0].face.materialIndex];
      } else {
        Object.assign(pointerCurrentCubePosition, {x: null, y: null, z: null});
      }
    };

    const getClickedPiecePosition = () => {
      pointerCaster.setFromCamera(
        pointerClickedPosition,
        camera
      )

      const intersects = pointerCaster.intersectObjects(scene.children.filter((obj) => obj.name === "piece"));
      // console.log(intersects);
      
      return intersects[0].object.position;
    }

    const scaleDetectionCube = (scaleFlag) => {
      if (scaleFlag) {
        for (let key of ['x', 'y', 'z']) {
          if (pointerCurrentCubePosition[key] < 4.999 && pointerCurrentCubePosition[key] > -4.999) {
            cube.faceDetection.scale[key] = 10;
          }
        }
      } else {
        for (let key of ['x', 'y', 'z']) {
          cube.faceDetection.scale[key] = 1;
        }
      }
    };

    const manipulateCube = () => {
      pointerCaster.setFromCamera(
        pointerPosition,
        camera
      )

      const intersects = pointerCaster.intersectObjects(scene.children.filter((obj) => obj.name === "piece"));

      if (intersects.length > 0) {
        // console.log(intersects);
        intersects[0].object.material = new THREE.MeshStandardMaterial({color: 'purple'});
      }
    };

    const translateMousePosition = (event) => {
      pointerPosition.x = event.clientX / sizes.width * 2 - 1;
      pointerPosition.y = -event.clientY / sizes.height * 2 + 1;
    };

    const onMouseMove = (event) => {

      translateMousePosition(event);
      getPointerCubePosition();

      if (!rotationFlag) {
        for (let key of ['x', 'y', 'z']) {
          if (Math.abs(pointerCurrentCubePosition[key] - pointerClickedCubePosition[key]) > cube.cubeDimension / cube.cubeSize / 8) {
            rotationFlag = true;
            axisDirection = key;
            // console.log(axisDirection);
            // console.log(clickedAxis);
            let position = getClickedPiecePosition();
            let axisArray = ['x', 'y', 'z'];
            axisOfRotation = axisArray.filter(a => a !== axisDirection && a !== clickedAxis)[0];
            // console.log(axisOfRotation);
            // console.log(position[axisOfRotation]);
            let pieces = scene.children.filter((obj) => ((obj.name === "piece") && ((obj.position[axisOfRotation] > (position[axisOfRotation] - 0.00002)) && (obj.position[axisOfRotation] < (position[axisOfRotation] + 0.00002)))));
            // console.log(pieces);
            group.add(...pieces);
          }
        }
      } else {
        let modifier = 1;
        if (axisDirection === 'x') {
          modifier = 1;
        } else {
          modifier = -1;
        }
        // console.log("Rotation Axis: " + axisOfRotation)
        // console.log("Direction Axis: " + axisDirection)
        // console.log("Clicked: " + pointerClickedCubePosition[clickedAxis]);
        if (pointerClickedCubePosition[clickedAxis] < 0) {
          modifier = -modifier;
        }
        if ((axisOfRotation === 'x') && (clickedAxis === 'y')) {
          modifier = -modifier;
        }
        if ((axisOfRotation === 'z')) {
          modifier = -modifier;
        }
        group.rotation[axisOfRotation] = modifier * Math.PI / 20 * (pointerCurrentCubePosition[axisDirection] - pointerClickedCubePosition[axisDirection]);
        if (group.rotation[axisOfRotation] >= Math.PI / 2) {
          group.rotation[axisOfRotation] = Math.PI / 2;
        } else if (group.rotation[axisOfRotation] <= -Math.PI / 2) {
          group.rotation[axisOfRotation] = -Math.PI / 2;
        }
        // console.log("Rotating");
      }
      
      // manipulateCube();

    };

    const onMouseDown = (event) => {
      if(event.button === 0) {
        translateMousePosition(event);
        getPointerCubePosition();
        Object.assign(pointerClickedPosition, pointerPosition);
        Object.assign(pointerClickedCubePosition, pointerCurrentCubePosition);
        // console.log(pointerClickedCubePosition);
        if(pointerClickedCubePosition.x !== null) {
          controls.enableRotate = false;
          getClickedPiecePosition();
          scaleDetectionCube(true);
          window.addEventListener('pointermove', onMouseMove);
        }
      }
    };

    const onMouseUp = (event) => {
      if(event.button === 0) {
        controls.enableRotate = true;
        // controls.update();
        scaleDetectionCube(false);
        rotationFlag = false;
        if (group.children.length > 0) {
          if (group.rotation[axisOfRotation] < -Math.PI / 4) {
            group.rotation[axisOfRotation] = -Math.PI / 2;
          } else if (group.rotation[axisOfRotation] > Math.PI / 4) {
            group.rotation[axisOfRotation] = Math.PI / 2;
          } else {
            group.rotation[axisOfRotation] = 0;
          }
          clearGroup();
        }
        window.removeEventListener('pointermove', onMouseMove);
      }
    };

    window.addEventListener('pointerdown', onMouseDown);
    window.addEventListener('pointerup', onMouseUp);

    window.addEventListener('resize', () => {
      // Update sizes
      sizes.width = window.innerWidth
      sizes.height = window.innerHeight

      // Update camera
      camera.aspect = sizes.width / sizes.height
      camera.updateProjectionMatrix()

      // Update renderer
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    });

    function animate() {
      requestAnimationFrame( animate );
      // controls.update();
      renderer.render( scene, camera );
    }

    animate();
  });

  return (
    <div>
      <canvas id="c"></canvas>
    </div>
  );
}

export default App;

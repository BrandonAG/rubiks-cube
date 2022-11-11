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
    console.log(scene);

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
    controls.enableDamping = true;

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

        group.children[0].matrixWorldAutoUpdate = true;

        scene.add(group.children[0]);
      }
    };

    const onKeyDown = (event) => {
      if(event.key === 'q') {

        for(let ray of cube.rays.zRays) {
          console.log(scene.children.filter((obj) => obj.type === "Mesh").slice(-8));
          console.log(ray.intersectObjects(scene.children.filter((obj) => obj.type === "Mesh")).slice(-8));
        }

      }
      if(event.key === 'a') {
        let list = cube.pieces.map((item) => item.mesh);
        let y0 = list.filter((obj) => obj.position['y'] === 0);
        group.add(...y0);
        group.rotation.y = Math.PI / 2;

        clearGroup();
        console.log(scene.children.filter((obj) => obj.type === "Mesh"));
      }
    }

    window.addEventListener('keydown', onKeyDown);

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

      // lightPivot.rotation.y = controls.getAzimuthalAngle();
      // lightPivot.rotation.x = controls.getPolarAngle();
      // lightPivot.rotation.y = camera.rotation.y;
      // lightPivot.rotation.x = camera.rotation.x;
      // console.log(controls.getAzimuthalAngle());
      // console.log(controls.getPolarAngle());
      // console.log(camera);
      // console.log(spotLight);
      // console.log(controls);

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

import './App.css';
import * as THREE from 'three';
import { useEffect, useState } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Cube from './lib/Cube.js';
import UI from './components/UI.js';
import { SpotLightHelper } from 'three';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);

let controls;
let cube;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);

const spotLight = new THREE.SpotLight(0xffffff, 1.2);
spotLight.castShadow = true;

// const lightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(lightHelper);

const group = new THREE.Group();

const pointerCaster = new THREE.Raycaster();
const pointerClickedCubePosition = new THREE.Vector3();
const pointerCurrentCubePosition = new THREE.Vector3();
const pointerClickedPosition = new THREE.Vector3();
const pointerPosition = new THREE.Vector3();
let rotationFlag = false;
let directionAxis = '';
let clickedFace = '';
let clickedPlane = ''
let axisOfRotation = '';
const faceInfo = {
  0: { plane: 'yz', name: "right" }, // 0: Right Face
  1: { plane: 'yz', name: "left" }, // 1: Left Face
  2: { plane: 'xz', name: "top" }, // 2: Top Face
  3: { plane: 'xz', name: "bottom" }, // 3: Bottom Face
  4: { plane: 'xy', name: "front" }, // 4: Front Face
  5: { plane: 'xy', name: "back" }, // 5: Back Face
}

function App() {

  const [gameDifficulty, setGameDifficulty] = useState(3);

  const [gameState, setGameState] = useState('menu');

  function changeGameState(state) {
    setGameState(state);
  }

  function changeGameDifficulty(difficulty) {
    setGameDifficulty(difficulty);
    setGameState('start')
  }

  const createScene = () => {
    scene.remove.apply(scene, scene.children);

    camera.position.z = 20;
    scene.add(camera);
    scene.add(ambientLight);
    spotLight.position.set(0, 0, 1);
    camera.add(spotLight);

    scene.add(group);

    cube = new Cube(scene, gameDifficulty);
  }
  
  const randomizeCube = async () => {
    // Randomize how many scrambles
    let minScrambles = 2;
    let maxScrambles = 15;
    let scrambles = Math.round(Math.random() * (maxScrambles - minScrambles) + minScrambles);
    
    for (let i = 0; i < scrambles; i ++) {
      // Randomly select piece from scene
      let pieceCount = Math.pow(cube.cubeSize, 3)  - Math.pow(cube.cubeSize -2, 3);
      let pieceNum = Math.round(Math.random() * (pieceCount - 1));
      let randomPiece = scene.children.filter((obj) => obj.name === "piece")[pieceNum];

      // Randomize axis of rotation
      let axisOptions = ["x", "y", "z"];
      let axis = axisOptions[Math.round(Math.random() * 2)];

      // Select pieces on axis of rotation
      let pieces = scene.children.filter((obj) => {
        return ((obj.name === "piece")
        && ((obj.position[axis] > (randomPiece.position[axis] - 0.00002))
        && (obj.position[axis] < (randomPiece.position[axis] + 0.00002))))
      });
      group.add(...pieces);

      // Randomize rotation direction
      let rotateModifier = 1;
      if (Math.round(Math.random())) {
        rotateModifier = -1;
      }

      let iterations = 10;
      for (let i = (Math.PI / 2) / iterations; i <= Math.PI / 2; i = i + (Math.PI / 2) / iterations) {
        await new Promise((resolve) => {
          setTimeout(() => {
            group.rotation[axis] = rotateModifier * i;
            resolve();
          }, 20);
        });
      }
      // group.rotation[axis] = rotateModifier * Math.PI / 2;
      clearGroup();

    }
    setGameState('play');
  }

  const checkForVictory = () => {
    // Check all cube faces for color match
    scene.updateMatrixWorld();
    for (let key in cube.rays) {
      let colorFrontPrev = null;
      let colorBackPrev = null;
      for (let ray of cube.rays[key]) {
        let intersects = ray.intersectObjects(scene.children.filter((obj) => obj.name === "piece"));
        let intersectFront = intersects[0];
        let intersectBack = intersects[intersects.length - 1];
        let colorFront = intersectFront.object.material[intersectFront.face.materialIndex].color;
        let colorBack = intersectBack.object.material[intersectBack.face.materialIndex].color;
        if (colorFrontPrev !== null) {
          if ((colorFrontPrev !== colorFront) || (colorBackPrev !== colorBack)) {
            return false;
          }
        }
        colorFrontPrev = colorFront;
        colorBackPrev = colorBack;
      }
    }

    setGameState('victory');
    return true;
  }

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
    return 1;
  };

  // const onKeyDown = (event) => {
  //   if(event.key === 'q') {
  //     console.log(checkForVictory());
  //   }
  //   if(event.key === 'a') {
  //     console.log(scene);
  //   }
  //   if(event.key === 'z') {
  //     console.log(gameState);
  //     console.log(gameDifficulty);
  //   }
  // }

  const getPointerCubePosition = () => {
    pointerCaster.setFromCamera(
      pointerPosition,
      camera
    )

    const intersects = pointerCaster.intersectObjects(scene.children.filter((obj) => obj.name === "faceDetection"));

    if (intersects.length > 0) {
      Object.assign(pointerCurrentCubePosition, intersects[0].point);
      clickedFace = faceInfo[intersects[0].face.materialIndex].name;
      clickedPlane = faceInfo[intersects[0].face.materialIndex].plane;
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
    
    return intersects[0].object.position;
  }

  const scaleDetectionCube = (scaleFlag) => {
    if (scaleFlag) {
      for (let key of ['x', 'y', 'z']) {
        // Increase Face Dectection Surface Area of Clicked Face
        if (pointerCurrentCubePosition[key] < 4.999 && pointerCurrentCubePosition[key] > -4.999) {
          cube.faceDetection.scale[key] = 100;
        }
      }
    } else {
      for (let key of ['x', 'y', 'z']) {
        cube.faceDetection.scale[key] = 1;
      }
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
          directionAxis = key;
          let position = getClickedPiecePosition();
          axisOfRotation = clickedPlane.replace(directionAxis, '');
          let pieces = scene.children.filter((obj) => {
            return ((obj.name === "piece")
            && ((obj.position[axisOfRotation] > (position[axisOfRotation] - 0.00002))
            && (obj.position[axisOfRotation] < (position[axisOfRotation] + 0.00002))))
          });
          group.add(...pieces);
          break;
        }
      }
    } else {
      let modifier = 1;
      if (clickedPlane === 'xy' && axisOfRotation === 'x') {
        modifier = -modifier;
      } else if (clickedPlane === 'yz' && axisOfRotation === 'y') {
        modifier = -modifier;
      } else if (clickedPlane === 'xz' && axisOfRotation === 'z') {
        modifier = -modifier;
      }

      if (clickedFace === "back" || clickedFace === "bottom" || clickedFace === "left") {
        modifier = -modifier;
      }

      group.rotation[axisOfRotation] = modifier * Math.PI / 20 * (pointerCurrentCubePosition[directionAxis] - pointerClickedCubePosition[directionAxis]);
      if (group.rotation[axisOfRotation] >= Math.PI / 2) {
        group.rotation[axisOfRotation] = Math.PI / 2;
      } else if (group.rotation[axisOfRotation] <= -Math.PI / 2) {
        group.rotation[axisOfRotation] = -Math.PI / 2;
      }
    }
    
  };

  const onMouseDown = (event) => {
    if(event.button === 0 && gameState === "play") {
      translateMousePosition(event);
      getPointerCubePosition();
      Object.assign(pointerClickedPosition, pointerPosition);
      Object.assign(pointerClickedCubePosition, pointerCurrentCubePosition);
      if(pointerClickedCubePosition.x !== null) {
        // Disable cube rotation when rotating selected pieces
        controls.enableRotate = false;
        controls.update();
        getClickedPiecePosition();
        scaleDetectionCube(true);
        window.addEventListener('pointermove', onMouseMove);
      }
    }
  };

  const onMouseUp = (event) => {
    if(event.button === 0 && gameState === "play")  {
      // Enable cube rotation
      controls.enableRotate = true;
      controls.update();
      scaleDetectionCube(false);
      rotationFlag = false;
      // Rotation Snapping After Click Released
      if (group.children.length > 0) {
        if (group.rotation[axisOfRotation] < -Math.PI / 4) {
          group.rotation[axisOfRotation] = -Math.PI / 2;
        } else if (group.rotation[axisOfRotation] > Math.PI / 4) {
          group.rotation[axisOfRotation] = Math.PI / 2;
        } else {
          group.rotation[axisOfRotation] = 0;
        }
        clearGroup();
        checkForVictory();
      }
      window.removeEventListener('pointermove', onMouseMove);
    }
  };

  useEffect( () => {

    if (scene.children.length < 8) {
      createScene();
    }
    if (gameState === 'start') {
      createScene();
      randomizeCube();
      // setGameState('play');
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onMouseDown);
    window.addEventListener('pointerup', onMouseUp);

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (controls?.enabled === undefined) {
      controls = new OrbitControls(camera, canvas);
    }
    
    controls.mouseButtons = {
      RIGHT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY
    };
    controls.keys = {}
    controls.enableDamping = true;
  
    window.addEventListener('resize', () => {
      // Update page size
      sizes.width = window.innerWidth
      sizes.height = window.innerHeight
  
      // Update camera
      camera.aspect = sizes.width / sizes.height
      camera.updateProjectionMatrix()
  
      // Update renderer
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    });

    let animateID;
    
    function animate() {
      animateID = requestAnimationFrame( animate );
      controls.update();
      renderer.render( scene, camera );
    }

    animate();

    return function cleanup() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onMouseDown);
      window.removeEventListener('pointerup', onMouseUp);
      window.removeEventListener('resize', () => {
        // Update page size
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight
    
        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()
    
        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      });
      clearGroup();
      cancelAnimationFrame(animateID);
    }
  }, [gameState, gameDifficulty]);

  return (
    <div>
      <canvas id="c"></canvas>
      <UI changeGameState = { changeGameState } changeGameDifficulty = { changeGameDifficulty } gameState = { gameState }/>
    </div>
  );
}

export default App;

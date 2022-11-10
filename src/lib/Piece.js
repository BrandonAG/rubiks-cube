import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';

const cubeDimension = 10;

const bulkMat = new THREE.MeshStandardMaterial({
  color: 'black',
  metalness: 0.2,
  roughness: 0.2
});

const blueMat = new THREE.MeshStandardMaterial({
  color: 'blue',
  metalness: 0.2,
  roughness: 0.2
});

const greenMat = new THREE.MeshStandardMaterial({
  color: 'green',
  metalness: 0.2,
  roughness: 0.2
});

const whiteMat = new THREE.MeshStandardMaterial({
  color: 'white',
  metalness: 0.2,
  roughness: 0.2
});

const yellowMat = new THREE.MeshStandardMaterial({
  color: 'yellow',
  metalness: 0.2,
  roughness: 0.2
});

const redMat = new THREE.MeshStandardMaterial({
  color: 'red',
  metalness: 0.2,
  roughness: 0.2
});

const orangeMat = new THREE.MeshStandardMaterial({
  color: 'orange',
  metalness: 0.2,
  roughness: 0.2
});

// const materials = [
//   // Right
//   new THREE.MeshStandardMaterial({
//     color: 'blue',
//   }),
//   // Left
//   new THREE.MeshStandardMaterial({
//     color: 'green',
//   }),
//   // Top
//   new THREE.MeshStandardMaterial({
//     color: 'white',
//   }),
//   // Bottom
//   new THREE.MeshStandardMaterial({
//     color: 'yellow',
//   }),
//   // Front
//   new THREE.MeshStandardMaterial({
//     color: 'red',
//   }),
//   // Back
//   new THREE.MeshStandardMaterial({
//     color: 'orange',
//   })
// ];
const material = new THREE.MeshStandardMaterial({
  color: 'purple',
});

export default class Piece {
  constructor(scene, cubeSize, layer, row, column) {
    this.layer = layer;
    this.row = row;
    this.column = column;

    const midPiece = Math.ceil(cubeSize / 2);
    let centeroffset = 0;
    if(!(cubeSize % 2)) {
      centeroffset = (cubeDimension / cubeSize) / 2;
    }
    const xOffset = (column - midPiece) * cubeDimension / cubeSize - centeroffset;
    const yOffset = (midPiece - row) * cubeDimension / cubeSize + centeroffset;
    const zOffset = (midPiece - layer) * cubeDimension / cubeSize + centeroffset;

    const materials = [
      bulkMat, // Right
      bulkMat, // Left
      bulkMat, // Top
      bulkMat, // Bottom
      bulkMat, // Front
      bulkMat // Back
    ];
    if(layer === 1) {
      // Front Face
      materials[4] = redMat;
    } else if(layer === cubeSize) {
      // Back Face
      materials[5] = orangeMat;
    }
    if(row === 1) {
      // Top Face
      materials[2] = whiteMat;
    } else if(row === cubeSize) {
      // Bottom Face
      materials[3] = yellowMat;
    }
    if(column === 1) {
      // Left Face
      materials[1] = greenMat;
    } else if(column === cubeSize) {
      // Right Face
      materials[0] = blueMat;
    }

    const geometry = new RoundedBoxGeometry(cubeDimension / cubeSize, cubeDimension / cubeSize, cubeDimension / cubeSize, 8, 0.6 / cubeSize);
    this.mesh = new THREE.Mesh(geometry, materials);
    
    this.mesh.position.set(xOffset, yOffset, zOffset);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
  };
};
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';

const cubeDimension = 10;

const commonProperties = {
  metalness: 0.0,
  roughness: 0.5,
  side: THREE.DoubleSide
}

// Colors from https://homes.luddy.indiana.edu/stsher/files/Rubiks_Cube.pdf
const bulkMat = new THREE.MeshStandardMaterial({
  color: 0x2c2c2c,
  metalness: 0.2,
  roughness: 0.2,
});

const blueMat = new THREE.MeshStandardMaterial({
  color: 0x0d48ac,
  ...commonProperties
});

const greenMat = new THREE.MeshStandardMaterial({
  color: 0x199b4c,
  ...commonProperties
});

const whiteMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  ...commonProperties
});

const yellowMat = new THREE.MeshStandardMaterial({
  color: 0xfed52f,
  ...commonProperties
});

const redMat = new THREE.MeshStandardMaterial({
  color: 0x891214,
  ...commonProperties
});

const orangeMat = new THREE.MeshStandardMaterial({
  color: 0xff5525,
  ...commonProperties
});

const material = new THREE.MeshStandardMaterial({
  color: 'purple',
});

export default class Piece {
  constructor(scene, cubeSize, layer, row, column, rays) {
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
    const raycasters = [];// = new THREE.Raycaster(new THREE.Vector3(xOffset, yOffset, zOffset - 4), new THREE.Vector3(0, 0, 1), 0, 20);;
    if(layer === 1) {
      // Front Face
      materials[4] = redMat;

      raycasters.push(new THREE.Raycaster(new THREE.Vector3(xOffset, yOffset, zOffset + 2), new THREE.Vector3(0, 0, -1)));
      rays.zRays.push(new THREE.Raycaster(new THREE.Vector3(xOffset, yOffset, zOffset + 2), new THREE.Vector3(0, 0, -1)));
      // const frontRay = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -10), new THREE.Vector3(xOffset, yOffset, zOffset + 2));
      // scene.add(frontRay);
    } else if(layer === cubeSize) {
      // Back Face
      materials[5] = orangeMat;

      // const backRay = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 10), new THREE.Vector3(xOffset, yOffset, zOffset - 2));
      // scene.add(backRay);
    }
    if(row === 1) {
      // Top Face
      materials[2] = whiteMat;

      raycasters.push(new THREE.Raycaster(new THREE.Vector3(xOffset, yOffset + 2, zOffset), new THREE.Vector3(0, -1, 0)));
      rays.yRays.push(new THREE.Raycaster(new THREE.Vector3(xOffset, yOffset + 2, zOffset), new THREE.Vector3(0, -1, 0)));
      // const topRay = new THREE.ArrowHelper(new THREE.Vector3(0, -10, 0), new THREE.Vector3(xOffset, yOffset + 2, zOffset));
      // scene.add(topRay);
    } else if(row === cubeSize) {
      // Bottom Face
      materials[3] = yellowMat;

      // const bottomRay = new THREE.ArrowHelper(new THREE.Vector3(0, 10, 0), new THREE.Vector3(xOffset, yOffset - 2, zOffset));
      // scene.add(bottomRay);
    }
    if(column === 1) {
      // Left Face
      materials[1] = greenMat;

      raycasters.push(new THREE.Raycaster(new THREE.Vector3(xOffset - 2, yOffset, zOffset), new THREE.Vector3(1, 0, 0)));
      rays.xRays.push(new THREE.Raycaster(new THREE.Vector3(xOffset - 2, yOffset, zOffset), new THREE.Vector3(1, 0, 0)));
      // const leftRay = new THREE.ArrowHelper(new THREE.Vector3(10, 0, 0), new THREE.Vector3(xOffset - 2, yOffset, zOffset));
      // scene.add(leftRay);
    } else if(column === cubeSize) {
      // Right Face
      materials[0] = blueMat;

      // const rightRay = new THREE.ArrowHelper(new THREE.Vector3(-10, 0, 0), new THREE.Vector3(xOffset + 2, yOffset, zOffset));
      // scene.add(rightRay);
    }

    const geometry = new RoundedBoxGeometry(cubeDimension / cubeSize, cubeDimension / cubeSize, cubeDimension / cubeSize, 2, 0.6 / cubeSize);
    this.mesh = new THREE.Mesh(geometry, materials);
    
    this.mesh.position.set(xOffset, yOffset, zOffset);
    this.mesh.castShadow = true;
    this.mesh.name = "piece";

    this.mesh.matrixWorldAutoUpdate = true;

    scene.add(this.mesh);
  };
};
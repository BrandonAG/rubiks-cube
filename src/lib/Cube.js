import * as THREE from 'three';
import Piece from './Piece.js';

const material = new THREE.MeshStandardMaterial({color: 'purple'});

export default class Cube {
  constructor(scene, cubeSize) {
    this.cubeDimension = 10;
    this.cubeSize = cubeSize;
    this.pieces = [];
    
    this.rays = {
      zRays: [],
      yRays: [],
      xRays: []
    };

    this.faceDetection = new THREE.Mesh(new THREE.BoxGeometry(this.cubeDimension, this.cubeDimension, this.cubeDimension), Array(6).fill(material));
    this.faceDetection.name = "faceDetection";
    this.faceDetection.visible = false;
    scene.add(this.faceDetection);

    for (let layer = 1; layer <= cubeSize; layer++) {
      for (let row = 1; row <= cubeSize; row++) {
        for (let column = 1; column <= cubeSize; column++) {
          if (layer === 1 || layer === cubeSize) {
            this.pieces.push(new Piece(scene, this.cubeSize, layer, row, column, this.rays));
          } else if (row === 1 || row === cubeSize || column === 1 || column === cubeSize) {
            this.pieces.push(new Piece(scene, this.cubeSize, layer, row, column, this.rays));
          }
        }
      }
    }
  };
};
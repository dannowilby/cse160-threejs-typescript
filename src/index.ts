import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';


const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

const loader = new THREE.TextureLoader();

let cube: THREE.Mesh;
function createAnimatedObject() {
  const geometry = new THREE.TetrahedronGeometry(0.5);
  const material = new THREE.MeshBasicMaterial({
    map: loader.load('block.png')
  });
  cube = new THREE.Mesh(geometry, material)
  cube.position.y = 4.25;
  scene.add(cube);
}

// Obj taken from:
// https://maxparata.itch.io/voxel-ancient-environment
function createObj() {
  const objLoader = new OBJLoader();
  objLoader.load('AncientTemple.obj', (root) => {
    const material = new THREE.MeshPhongMaterial({
      map: loader.load('AncientTemple.png'),
    });
    root.traverse(node => {
       if (node instanceof THREE.Mesh) {
        node.material = material;
        node.castShadow = true;
        node.receiveShadow = true;
       }
     })
      
    root.position.y -= 0.5;

    root.castShadow = true;
    root.receiveShadow = true;
    scene.add(root);
   });
}

function createPrimitiveObjects() {

  const shapeCount = 21;
  
  for(let i = 0; i < shapeCount; i++) {

    const shapeType = i % 3;
    let shape;

    const radius = 5.0;
    const angle = (2 * Math.PI * i) / shapeCount;

    // add cube
    if(shapeType == 0) {
      const geometry = new THREE.BoxGeometry()
      const material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
      shape = new THREE.Mesh( geometry, material );
    }

    // add cylinder
    if(shapeType == 1) {
      const geometry = new THREE.CylinderGeometry( 0.25, 0.25, 1, 32 );
      const material = new THREE.MeshPhongMaterial( { color: 0x00ffff } );
      shape = new THREE.Mesh( geometry, material );
    }

    // add other shape
    if(shapeType == 2) {
      const geometry = new THREE.IcosahedronGeometry( 0.5 );
      const material = new THREE.MeshPhongMaterial( { color: 0xff00ff } );
      shape = new THREE.Mesh( geometry, material );
    }

    if(!shape)
      continue;

    shape.position.x = radius * Math.sin(angle);
    shape.position.z = radius * Math.cos(angle);
    shape.castShadow = true;
    shape.receiveShadow = true;

    scene.add( shape );
  }

}

// skybox from
// https://opengameart.org/content/skiingpenguins-skybox-pack
function createSkybox() {
  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load( 'skybox/gloom_ft.jpg');
  let texture_bk = new THREE.TextureLoader().load( 'skybox/gloom_bk.jpg');
  let texture_up = new THREE.TextureLoader().load( 'skybox/gloom_up.jpg');
  let texture_dn = new THREE.TextureLoader().load( 'skybox/gloom_dn.jpg');
  let texture_rt = new THREE.TextureLoader().load( 'skybox/gloom_rt.jpg');
  let texture_lf = new THREE.TextureLoader().load( 'skybox/gloom_lf.jpg');
    
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));

  for (let i = 0; i < 6; i++)
     materialArray[i].side = THREE.BackSide;
  let skyboxGeo = new THREE.BoxGeometry( 500, 500, 500);
  let skybox = new THREE.Mesh( skyboxGeo, materialArray );
  scene.add( skybox ); 
}

function createLighting() {

  // point light
  const light = new THREE.PointLight( 0xffffff, 2, 100 );
  light.position.set( 3, 3, 3 );
  scene.add( light );
  light.castShadow = true;
  const helper = new THREE.CameraHelper( light.shadow.camera );
  scene.add( helper );

  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true
  });
  const lightBox = new THREE.Mesh(geometry, material)
  lightBox.position.set( 3, 3, 3 );
  scene.add(lightBox);


  // ambient light
  const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( ambientLight );

  // spot light
  const spotLight = new THREE.SpotLight( 0xffffff );
  spotLight.position.set( -4, 3, -4 );

  spotLight.castShadow = true;

  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;

  spotLight.shadow.camera.near = 500;
  spotLight.shadow.camera.far = 4000;
  spotLight.shadow.camera.fov = 30;

  const lightTarget = new THREE.Object3D();
  lightTarget.position.set( -5, 0, -5 );
  scene.add( lightTarget );
  spotLight.target = lightTarget;

  const helper1 = new THREE.CameraHelper( spotLight.shadow.camera );
  scene.add( helper1 );
  scene.add( spotLight );

  const lightBox1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), material)
  lightBox1.position.set( -4, 3, -4 );
  scene.add(lightBox1);
}

function createGroundPlane() {
  const geometry = new THREE.PlaneGeometry( 100, 100 );
  geometry.rotateX(- Math.PI / 2);
  geometry.translate( 0, -0.5, 0 );
  const material = new THREE.MeshPhongMaterial( {color: 0xffffff, } );
  const plane = new THREE.Mesh( geometry, material );
  plane.receiveShadow = true;
  scene.add( plane );
}

function createScene() {

  createPrimitiveObjects();
  createAnimatedObject();
  createObj();
  createSkybox();
  createLighting();
  createGroundPlane();

}

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if(cube) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }

    controls.update();

    renderer.render(scene, camera)
}

createScene();
animate();

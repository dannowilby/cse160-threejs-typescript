import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';


const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

const loader = new THREE.TextureLoader();

const geometry = new THREE.TetrahedronGeometry(0.5);
const material = new THREE.MeshBasicMaterial({
  map: loader.load('block.png')
});
const cube = new THREE.Mesh(geometry, material)
cube.position.y = 4.25;
scene.add(cube)

// Obj taken from:
// https://maxparata.itch.io/voxel-ancient-environment
const objLoader = new OBJLoader();
objLoader.load('AncientTemple.obj', (root) => {
  const material = new THREE.MeshBasicMaterial({
    map: loader.load('AncientTemple.png'),
  });
  root.traverse(node => {
     if (node instanceof THREE.Mesh) {
       node.material = material;
     }
   })
    
  root.position.y -= 0.5;

  scene.add(root);
 });

function createScene() {

  const shapeCount = 21;
  
  for(let i = 0; i < shapeCount; i++) {

    const shapeType = i % 3;
    let shape;

    const radius = 5.0;
    const angle = (2 * Math.PI * i) / shapeCount;

    // add cube
    if(shapeType == 0) {
      const geometry = new THREE.BoxGeometry()
      const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
      shape = new THREE.Mesh( geometry, material );
    }

    // add cylinder
    if(shapeType == 1) {
      const geometry = new THREE.CylinderGeometry( 0.25, 0.25, 1, 32 );
      const material = new THREE.MeshBasicMaterial( { color: 0x00ffff } );
      shape = new THREE.Mesh( geometry, material );
    }

    // add other shape
    if(shapeType == 2) {
      const geometry = new THREE.IcosahedronGeometry( 0.5 );
      const material = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
      shape = new THREE.Mesh( geometry, material );
    }

    if(!shape)
      continue;

    shape.position.x = radius * Math.sin(angle);
    shape.position.z = radius * Math.cos(angle);

    scene.add( shape );
  }

}
createScene();

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
createSkybox();

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function animate() {
    requestAnimationFrame(animate)

    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    controls.update()

    render()
}

function render() {
    renderer.render(scene, camera)
}
animate()

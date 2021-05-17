import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Game Variables
 */
let car, speed = 0, rotationSpeed = 0, keysDown = [];

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xb2f8ec, 1, 100);

/**
 * Objects
 */
const gltfLoader = new GLTFLoader();
gltfLoader.load("./models/car.gltf", gltf => {
    car = gltf.scene;
    car.scale.set(0.7, 0.7, 0.7);
    car.position.y = -2;
    car.castShadow = true; 
    car.receiveShadow = false;
    const carParts = car.children[0].children[0].children[0].children[0].children[0].children;
    for(let i in carParts) {
        carParts[i].children[0].castShadow = true; 
        carParts[i].children[0].receiveShadow = false;
    }
    scene.add(car);
    document.querySelector(".loading").style.display = "none";
},  snap => {
        const loadedPercent = snap.loaded/snap.total * 100;
        document.querySelector(".loading-percent").innerHTML = Math.floor(loadedPercent);        
    }
);

const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( 500, 500 ),
    new THREE.MeshBasicMaterial( {color: 0x5cc75e, } )
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -2;
floor.receiveShadow = true;

scene.add(floor);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Fullscreen
 */
window.addEventListener('dblclick', () =>
{
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        else if(document.webkitExitFullscreen)
        {
            document.webkitExitFullscreen()
        }
    }
});

/**
 * Lights
 */
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 4, 100);
directionalLight1.castShadow = true;
directionalLight1.position.set(3, 5, 0);

scene.add(
    directionalLight1, 
    new THREE.AmbientLight(0xffffff, 4)
);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 1, 5);

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enabled = false

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0xb2f8ec);

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();
    moveCar();

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

const moveCoordinates = () => {
    let carMoveX = Math.abs(Math.sin(car.rotation.y < Math.PI ? car.rotation.y : ((Math.PI * 2) - car.rotation.y)) * 2),
        carMoveZ = Math.abs(Math.cos(car.rotation.y < Math.PI ? car.rotation.y : ((Math.PI * 2) - car.rotation.y)) * 2);
    
    carMoveX = car.rotation.y < Math.PI ? carMoveX : -carMoveX;
    carMoveZ = car.rotation.y > Math.PI * 0.5 && car.rotation.y < Math.PI * 1.5 ? -carMoveZ : carMoveZ;
    
    return {
        x: carMoveX * 0.1,
        z: carMoveZ * 0.1
    }
}

const isMovingForward = () => {
    if(speed > 0 || speed < 0) return speed/0.7;
    else return 0;
}

function moveCar() {
    if(car){
        car.rotation.y += (0.05 * rotationSpeed) * isMovingForward();
        car.position.x += moveCoordinates().x * speed;
        car.position.z += moveCoordinates().z * speed;
        if(car.rotation.y > Math.PI * 2) car.rotation.y = 0;
        if(car.rotation.y < 0) car.rotation.y = Math.PI * 2;
        
        const carParts = car.children[0].children[0].children[0].children[0].children[0];
        carParts.children[0].children[0].rotation.x = 
        carParts.children[1].children[0].rotation.x = 
        carParts.children[2].children[0].rotation.x = 
        carParts.children[3].children[0].rotation.x += 0.2 * (speed/0.7);

        carParts.children[2].rotation.y = 
        carParts.children[3].rotation.y = rotationSpeed * Math.PI / 10;
    }
    if(speed > 0.00) speed -= 0.005;
    if(speed < 0.00) speed += 0.005;
    if(Math.abs(speed) < 0.01) speed = 0;
    
    if(rotationSpeed >= 0.00) rotationSpeed -= 0.05;
    if(rotationSpeed <= 0.00) rotationSpeed += 0.05;
    if(Math.abs(rotationSpeed) < 0.05) rotationSpeed = 0;

    if(keysDown.includes("ArrowLeft") || keysDown.includes("a")) {
        rotationSpeed += (rotationSpeed < 1) ? 0.1 : 0;
    }
    if(keysDown.includes("ArrowRight") || keysDown.includes("d")) {
        rotationSpeed -= (rotationSpeed > -1) ? 0.1 : 0;
    }
    if(keysDown.includes("ArrowUp") || keysDown.includes("w")) {
        speed += (speed < 0.7) ? 0.02 : 0;
    }
    if(keysDown.includes("ArrowDown") || keysDown.includes("s")) {
        speed -= (speed > -0.7) ? 0.02 : 0;
    }
}

const arrowUpOSBtn = document.querySelector('.arrow-up'),
    arrowDownOSBtn = document.querySelector('.arrow-down'),
    arrowLeftOSBtn = document.querySelector('.arrow-left'),
    arrowRightOSBtn = document.querySelector('.arrow-right');

const moveCarWithOSBtns = (e) => {
    const key = e.target.getAttribute('move');
    if(e.type === 'touchstart' || e.type === 'mousedown') {
        if(!keysDown.includes(key))
            keysDown.push(key);
    }
    if(e.type === 'touchend' || e.type === 'mouseup') {
        keysDown.splice(keysDown.indexOf(key), 1);
    }
}

arrowUpOSBtn.addEventListener('mousedown', moveCarWithOSBtns);
arrowDownOSBtn.addEventListener('mousedown', moveCarWithOSBtns);
arrowLeftOSBtn.addEventListener('mousedown', moveCarWithOSBtns);
arrowRightOSBtn.addEventListener('mousedown', moveCarWithOSBtns);

arrowUpOSBtn.addEventListener('mouseup', moveCarWithOSBtns);
arrowDownOSBtn.addEventListener('mouseup', moveCarWithOSBtns);
arrowLeftOSBtn.addEventListener('mouseup', moveCarWithOSBtns);
arrowRightOSBtn.addEventListener('mouseup', moveCarWithOSBtns);

arrowUpOSBtn.addEventListener('touchstart', moveCarWithOSBtns);
arrowDownOSBtn.addEventListener('touchstart', moveCarWithOSBtns);
arrowLeftOSBtn.addEventListener('touchstart', moveCarWithOSBtns);
arrowRightOSBtn.addEventListener('touchstart', moveCarWithOSBtns);

arrowUpOSBtn.addEventListener('touchend', moveCarWithOSBtns);
arrowDownOSBtn.addEventListener('touchend', moveCarWithOSBtns);
arrowLeftOSBtn.addEventListener('touchend', moveCarWithOSBtns);
arrowRightOSBtn.addEventListener('touchend', moveCarWithOSBtns);

window.addEventListener('keydown', (e) => {
    if(!keysDown.includes(e.key))
    keysDown.push(e.key);
})

window.addEventListener('keyup', (e) => {
    keysDown.splice(keysDown.indexOf(e.key), 1);
})
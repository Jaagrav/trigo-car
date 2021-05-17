import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import gsap from 'gsap'
import { MathUtils } from 'three';

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
const scene = new THREE.Scene()

/**
 * Object
 */
const gltfLoader = new GLTFLoader();
gltfLoader.load("./models/car.gltf", gltf => {
    car = gltf.scene;
    car.scale.set(0.4, 0.4, 0.4);
    car.position.y = -2;
    scene.add(car);
    console.log(car);
});

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
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1),
    directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight1.position.set(6, 6, 0);
directionalLight2.position.set(-6, -6, 0);

scene.add(directionalLight1, directionalLight2, new THREE.AmbientLight(0xffffff, 5));

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
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0xabffb0);

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
    if(speed > 0) return 1;
    else if(speed < 0) return -1;
    else return 0;
}

function moveCar() {
    if(car){
        car.rotation.y += 0.05 * rotationSpeed * isMovingForward();
        car.position.x += moveCoordinates().x * speed;
        car.position.z += moveCoordinates().z * speed;
        if(car.rotation.y > Math.PI * 2) car.rotation.y = 0;
        if(car.rotation.y < 0) car.rotation.y = Math.PI * 2;
        
        const carParts = car.children[0].children[0].children[0].children[0].children[0];
        carParts.children[0].children[0].rotation.x = 
        carParts.children[1].children[0].rotation.x = 
        carParts.children[2].children[0].rotation.x = 
        carParts.children[3].children[0].rotation.x += 0.1 * (speed/0.3);

        carParts.children[2].rotation.y = 
        carParts.children[3].rotation.y = rotationSpeed * Math.PI / 8;
    }
    if(speed > 0.00) speed -= 0.005;
    if(speed < 0.00) speed += 0.005;
    if(Math.abs(speed) < 0.01) speed = 0;
    
    if(rotationSpeed >= 0.00) rotationSpeed -= 0.05;
    if(rotationSpeed <= 0.00) rotationSpeed += 0.05;
    if(Math.abs(rotationSpeed) < 0.05) rotationSpeed = 0;

    if(keysDown.includes("ArrowLeft")) {
        rotationSpeed += (rotationSpeed < 1) ? 0.1 : 0;
    }
    if(keysDown.includes("ArrowRight")) {
        rotationSpeed -= (rotationSpeed > -1) ? 0.1 : 0;
    }
    if(keysDown.includes("ArrowUp")) {
        speed += (speed < 0.3) ? 0.02 : 0;
    }
    if(keysDown.includes("ArrowDown")) {
        speed -= (speed > -0.3) ? 0.02 : 0;
    }
}

window.addEventListener('keydown', (e) => {
    if(!keysDown.includes(e.key))
    keysDown.push(e.key);
})

window.addEventListener('keyup', (e) => {
    keysDown.splice(keysDown.indexOf(e.key), 1);
})
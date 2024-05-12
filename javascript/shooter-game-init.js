import * as THREE from 'three'; // Import the three.js API 
import { GLTFLoader } from 'https://unpkg.com/three@0.151.3/examples/jsm/loaders/GLTFLoader.js'; // Import Model Loader

// Adding Sounds
const soundShoot = new Audio("sounds/shoot.wav");

// Scene setup
const scene = new THREE.Scene(); // Boot up the scene

const renderer = new THREE.WebGLRenderer(); // Basically a <canvas> element in HTML
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const sceneContainer = document.getElementById('game-scene');
sceneContainer.appendChild(renderer.domElement); // Stuffs the three.js scene into a div

window.addEventListener('resize', onResize); // Make the responsiveness work 
function onResize() {
    camera.aspect = sceneContainer.offsetWidth / sceneContainer.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneContainer.offsetWidth, sceneContainer.offsetHeight);
}


// Game Logic

let score = 0; // Score container
const visualScore = document.getElementById('score-points'); // DOM to find the score icon

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Camera settings consisting out of FOV = 75 Aspect ratio = Width divided by Height. Then the Near and Far clipping planes.
// The Far and Near clipping planes allow the camera to "clip" into the model like in Blender
camera.position.set(0, 1.5, 2);

const modelLoader = new GLTFLoader(); // Store the model loader in one variable to keep calling it

// Load the scene mesh
modelLoader.load('../objects/environment.gltf', function (gltf) {
    const environment = gltf.scene;
    scene.add(environment);
});

// Load the player mesh
modelLoader.load('../objects/pistol.gltf', function (gltf) {
    const playerGun = gltf.scene;

    playerGun.position.set(0, 1.3, 1.7); // Spawn the playergun at the base of the camera
    playerGun.rotation.y = Math.PI; // Rotate 180 degrees around the Y-axis.PI/0,1,0);
    scene.add(playerGun);

    // Now that playerGun is added, make it aim towards the cursor
    document.addEventListener('mousemove', function (event) {
        // Calculate mouse position in normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Use the raycaster to determine the intersection with objects, excluding playerGun
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children.filter(obj => obj !== playerGun), true); // Filters out and detects the playergun using a function

        if (intersects.length > 0) {
            // Update the pistol's rotation to point towards the mouse cursor
            const intersection = intersects[0];
            const target = new THREE.Vector3().copy(intersection.point);
            playerGun.lookAt(target); // Three.js code to track towards the target
        }
    });
});

// Cursor tracking and flashlight effect (purely cosmetic)
document.addEventListener('mousemove', function (event) {
    var x = event.clientX; // Get the Horizontal mouse position
    var y = event.clientY; // Get the Vertical mouse position
    cursor.style.left = x + "px"; // Offset the crosshair Horizontally so it tracks
    cursor.style.top = y + "px"; // Offset the crosshair Vertically so it tracks

    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Use the raycaster to determine the intersection with an object
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        // Update the light's position to follow the mouse cursor
        const intersection = intersects[0];
        light2.position.copy(intersection.point);
    }
});


let shootingTarget; // main variable to store the targets in 

// Load the target mesh
modelLoader.load('../objects/target.gltf', function (gltf) {

    shootingTarget = gltf.scene;

    spawnInstance(1, 1.5, -1);
    spawnInstance(0, 1.5, -1);
    spawnInstance(-1, 1.5, -1);
});

const instances = [] // An array to store the instances in

// This will be used in the future to make the targets pop up
function spawnInstance(x, y, z) {
    const instance = shootingTarget.clone(); // Create a new instance
    instance.position.set(x, y, z); // Set the position of the instance
    scene.add(instance); // Add the instance to the scene
    instances.push(instance)
}

// Add a basic light that illuminates everything for that ps1 look
const environmentLight = new THREE.AmbientLight(0xF5F5F5); // Hexadecimal light code
scene.add(environmentLight);

// This gives the flashlight effect to really define where you are pointing the gun
const light2 = new THREE.PointLight(0xFAFAFF, 1.5, 5); // Color , Intensity , Distance
light2.position.set(-0, 0, 0.5); // x(Left-Right) , y(Front-Back) , z(Up)
scene.add(light2); // Add the second lamp

function animate() { // Renders the scene every time the browser is refreshed. Default is 60 HZ for average screens
    requestAnimationFrame(animate); // Saves resources once the window is minimized

    renderer.render(scene, camera);
}

const cursor = document.getElementById('game-crosshair'); // DOM to find the element named #light-up-cursor

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// Shooting mechanic
document.addEventListener('click', function (event) {

    soundShoot.play(); // Play the shooting sound

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(instances);

    if (intersects.length > 0) {
        // Check if the clicked object is part of the shootingTarget
        const clickedObject = intersects[0].object;
        clickedObject.scale.set(0.9, 0.9, 0.9); // Debug to enable visual feedback
        score++; // Increase the score
    } else { // Decrease the score once you miss.
        if (score > 0) { // Stop the code from going below zero
            score--;
        }
    }

    visualScore.textContent = `${score}`; // This string assimilates all the changed variables
    console.log('Score: ' + score); //Log your current score in case the visual feedback is not working
});

animate();

// Reference: https://threejs.org/examples/
// Source: https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene
// Commented based on source by me
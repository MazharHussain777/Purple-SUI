import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ========== MOBILE DRAWER MENU FUNCTIONALITY ==========
(function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const closeBtn = document.getElementById('drawerCloseBtn');
    
    if (!menuBtn || !drawer || !overlay) return;
    
    function openDrawer() {
        drawer.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeDrawer() {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    menuBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            closeDrawer();
        }
    });
})();

// ========== THREE.JS 3D CRYSTAL VISUALIZATION ==========
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = null;
scene.fog = new THREE.FogExp2(0x050011, 0.0035);

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(2.4, 1.5, 5.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

const coreCenter = { x: 0.0, y: 0.0, z: 0.0 };

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(navigator.userAgent) || window.innerWidth <= 997;
}

let controls;
function initControls() {
    const mobile = isMobileDevice();
    if (controls) controls.dispose();
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.rotateSpeed = mobile ? 0.9 : 1.5;
    
    controls.enableZoom = false;
    controls.zoomSpeed = 0;
    controls.enablePan = false;
    controls.panSpeed = 0;
    
    if (mobile) {
        controls.enableTouchRotate = true;
    }
    
    controls.target.set(coreCenter.x, coreCenter.y, coreCenter.z);
    renderer.domElement.style.cursor = mobile ? 'default' : 'grab';
    
    if (!mobile) {
        renderer.domElement.onmousedown = () => { renderer.domElement.style.cursor = 'grabbing'; };
        renderer.domElement.onmouseup = () => { renderer.domElement.style.cursor = 'grab'; };
    } else {
        renderer.domElement.onmousedown = null;
        renderer.domElement.onmouseup = null;
    }
    return mobile;
}

let isMobile = initControls();

if (isMobile) {
    document.addEventListener('touchmove', (e) => { 
        if(e.touches.length === 2) e.preventDefault(); 
    }, { passive: false });
    container.addEventListener('contextmenu', (e) => e.preventDefault());
}

container.addEventListener('wheel', (e) => {
    e.preventDefault();
}, { passive: false });

const purpleGroup = new THREE.Group();
purpleGroup.position.set(coreCenter.x, coreCenter.y, coreCenter.z);
scene.add(purpleGroup);

const icoGeometry = new THREE.IcosahedronGeometry(1.48, 0);
const edgesGeo = new THREE.EdgesGeometry(icoGeometry);
const crystalWire = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: 0xB87CFF }));
purpleGroup.add(crystalWire);

const innerIcoGeo = new THREE.IcosahedronGeometry(1.05, 0);
const innerEdges = new THREE.EdgesGeometry(innerIcoGeo);
const innerWire = new THREE.LineSegments(innerEdges, new THREE.LineBasicMaterial({ color: 0xDD99FF, transparent: true, opacity: 0.7 }));
purpleGroup.add(innerWire);

const dodeGeo = new THREE.DodecahedronGeometry(1.85, 0);
const dodeEdges = new THREE.EdgesGeometry(dodeGeo);
const dodeWire = new THREE.LineSegments(dodeEdges, new THREE.LineBasicMaterial({ color: 0x9B59B6, transparent: true, opacity: 0.4 }));
purpleGroup.add(dodeWire);

const octaGeo = new THREE.OctahedronGeometry(1.32);
const octaEdges = new THREE.EdgesGeometry(octaGeo);
const octaWire = new THREE.LineSegments(octaEdges, new THREE.LineBasicMaterial({ color: 0xC084FC, transparent: true, opacity: 0.55 }));
purpleGroup.add(octaWire);

const vertexSet = [];
const posAttr = icoGeometry.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
    vertexSet.push(new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)));
}
const dodePosAttr = dodeGeo.attributes.position;
for (let i = 0; i < dodePosAttr.count; i++) {
    vertexSet.push(new THREE.Vector3(dodePosAttr.getX(i), dodePosAttr.getY(i), dodePosAttr.getZ(i)));
}
const octaPosAttr = octaGeo.attributes.position;
for (let i = 0; i < octaPosAttr.count; i++) {
    vertexSet.push(new THREE.Vector3(octaPosAttr.getX(i), octaPosAttr.getY(i), octaPosAttr.getZ(i)));
}

// REDUCED PARTICLE COUNT - Less spread, more concentrated around crystal
const particleCount = vertexSet.length * 2 + 2800;
const particleGeo = new THREE.BufferGeometry();
const positionsArray = new Float32Array(particleCount * 3);
const colorsArray = new Float32Array(particleCount * 3);

let idx = 0;
vertexSet.forEach(v => {
    positionsArray[idx*3] = v.x;
    positionsArray[idx*3+1] = v.y;
    positionsArray[idx*3+2] = v.z;
    colorsArray[idx*3] = 0.8 + Math.random()*0.2;
    colorsArray[idx*3+1] = 0.3 + Math.random()*0.5;
    colorsArray[idx*3+2] = 1.0;
    idx++;
});
vertexSet.forEach(v => {
    const scaleF = 1.1;
    positionsArray[idx*3] = v.x * scaleF;
    positionsArray[idx*3+1] = v.y * scaleF;
    positionsArray[idx*3+2] = v.z * scaleF;
    colorsArray[idx*3] = 0.95;
    colorsArray[idx*3+1] = 0.4 + Math.random()*0.45;
    colorsArray[idx*3+2] = 1.0;
    idx++;
});
// Reduced floating particles - tighter radius around crystal
for (let i = 0; i < 2800; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const rad = 1.5 + Math.random() * 0.6;
    const x = Math.sin(phi) * Math.cos(theta) * rad;
    const y = Math.sin(phi) * Math.sin(theta) * rad * 0.95;
    const z = Math.cos(phi) * rad;
    positionsArray[idx*3] = x;
    positionsArray[idx*3+1] = y;
    positionsArray[idx*3+2] = z;
    if (Math.random() > 0.6) {
        colorsArray[idx*3] = 0.95;
        colorsArray[idx*3+1] = 0.45 + Math.random()*0.4;
        colorsArray[idx*3+2] = 1.0;
    } else {
        colorsArray[idx*3] = 0.7 + Math.random()*0.3;
        colorsArray[idx*3+1] = 0.2 + Math.random()*0.45;
        colorsArray[idx*3+2] = 0.85 + Math.random()*0.2;
    }
    idx++;
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
const crystalParticles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ size: 0.02, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true }));
purpleGroup.add(crystalParticles);

// Reduced sparkle count - more contained
const sparkleCount = 2400;
const sparkleGeo = new THREE.BufferGeometry();
const sparklePos = new Float32Array(sparkleCount * 3);
const sparkleCol = new Float32Array(sparkleCount * 3);
for (let i = 0; i < sparkleCount; i++) {
    const rad = 1.6 + Math.random() * 0.7;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    sparklePos[i*3] = Math.sin(phi) * Math.cos(theta) * rad;
    sparklePos[i*3+1] = Math.sin(phi) * Math.sin(theta) * rad * 0.9;
    sparklePos[i*3+2] = Math.cos(phi) * rad;
    sparkleCol[i*3] = 0.85 + Math.random()*0.15;
    sparkleCol[i*3+1] = 0.3 + Math.random()*0.5;
    sparkleCol[i*3+2] = 1.0;
}
sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
sparkleGeo.setAttribute('color', new THREE.BufferAttribute(sparkleCol, 3));
const sparkles = new THREE.Points(sparkleGeo, new THREE.PointsMaterial({ size: 0.012, vertexColors: true, blending: THREE.AdditiveBlending }));
purpleGroup.add(sparkles);

// Background stars - reduced and softer
const bgStarCount = 4500;
const bgStarGeo = new THREE.BufferGeometry();
const bgStarPos = new Float32Array(bgStarCount * 3);
const bgStarCol = new Float32Array(bgStarCount * 3);
for (let i = 0; i < bgStarCount; i++) {
    bgStarPos[i*3] = (Math.random() - 0.5) * 200;
    bgStarPos[i*3+1] = (Math.random() - 0.5) * 120;
    bgStarPos[i*3+2] = (Math.random() - 0.5) * 150 - 60;
    bgStarCol[i*3] = 0.55 + Math.random() * 0.45;
    bgStarCol[i*3+1] = 0.2 + Math.random() * 0.4;
    bgStarCol[i*3+2] = 0.7 + Math.random() * 0.3;
}
bgStarGeo.setAttribute('position', new THREE.BufferAttribute(bgStarPos, 3));
bgStarGeo.setAttribute('color', new THREE.BufferAttribute(bgStarCol, 3));
const bgStars = new THREE.Points(bgStarGeo, new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
scene.add(bgStars);

// Reduced orbit particles
const orbitCount = 1800;
const orbitGeo = new THREE.BufferGeometry();
const orbitPos = new Float32Array(orbitCount * 3);
for (let i = 0; i < orbitCount; i++) {
    const radius = 2.1 + Math.random() * 0.6;
    const angle = Math.random() * Math.PI * 2;
    const yOff = (Math.random() - 0.5) * 1.2;
    orbitPos[i*3] = Math.cos(angle) * radius;
    orbitPos[i*3+1] = yOff;
    orbitPos[i*3+2] = Math.sin(angle) * radius;
}
orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));
const orbitPoints = new THREE.Points(orbitGeo, new THREE.PointsMaterial({ color: 0xA96BFF, size: 0.016, blending: THREE.AdditiveBlending }));
purpleGroup.add(orbitPoints);

const ambientLight = new THREE.AmbientLight(0x2D1B4E, 0.6);
scene.add(ambientLight);
const keyLight = new THREE.DirectionalLight(0xBF7AF0, 1.4);
keyLight.position.set(2.4, 2.2, 2.8);
scene.add(keyLight);
const fillLight = new THREE.PointLight(0x8B5CF6, 1.2);
fillLight.position.set(-1.8, 1.4, 2.2);
scene.add(fillLight);
const rimLight = new THREE.PointLight(0xC084FC, 1.3);
rimLight.position.set(1.9, 1.1, -3.3);
scene.add(rimLight);
const backGlow = new THREE.PointLight(0x9B59B6, 1.0);
backGlow.position.set(-0.9, 0.3, -3.8);
scene.add(backGlow);
const coreGlow = new THREE.PointLight(0xDD99FF, 1.1);
coreGlow.position.set(0, 0, 0);
purpleGroup.add(coreGlow);

function animate() {
    const elapsed = performance.now() / 1000;
    
    purpleGroup.rotation.y += 0.0022;
    purpleGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.02;
    purpleGroup.rotation.z = Math.cos(elapsed * 0.18) * 0.018;
    
    crystalWire.rotation.y += 0.0008;
    innerWire.rotation.x -= 0.0007;
    dodeWire.rotation.y += 0.0005;
    octaWire.rotation.z += 0.0009;
    sparkles.rotation.y -= 0.0006;
    orbitPoints.rotation.y += 0.0012;
    
    rimLight.intensity = 1.0 + Math.sin(elapsed * 2.2) * 0.55;
    backGlow.intensity = 0.7 + Math.sin(elapsed * 1.9) * 0.4;
    fillLight.intensity = 0.75 + Math.sin(elapsed * 2.0) * 0.35;
    coreGlow.intensity = 0.9 + Math.sin(elapsed * 2.7) * 0.65;
    
    bgStars.rotation.y += 0.0002;
    controls.update();
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width !== renderer.domElement.width || height !== renderer.domElement.height) {
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    const wasMobile = isMobile;
    isMobile = isMobileDevice();
    if (wasMobile !== isMobile) {
        controls.rotateSpeed = isMobile ? 0.9 : 1.5;
        renderer.domElement.style.cursor = isMobile ? 'default' : 'grab';
    }
    controls.enableZoom = false;
    controls.enablePan = false;
});

console.log('💜 PURPLE SUI | Optimized Particle Density | Crystal Core Elegant');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


camera.position.z = 50;

class Firework {
    constructor() {
        this.particles = new THREE.BufferGeometry();
        this.particleCount = 100;
        this.positions = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount * 3);
        this.isExploded = false;
        
        const startX = (Math.random() - 0.5) * 20;
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            this.positions[i3] = startX;
            this.positions[i3 + 1] = -30; 
            this.positions[i3 + 2] = 0;
            
            if (!this.isExploded) {
                this.velocities[i3] = 0;
                this.velocities[i3 + 1] = 0.7; 
                this.velocities[i3 + 2] = 0;
            }
        }
        
        this.particles.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`), 
            size: 1,
            map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png'),
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.8 
        });
        
        this.system = new THREE.Points(this.particles, particleMaterial);
        this.explosionSound = document.getElementById('explosionSound');
    }
    
    update() {
        const positions = this.particles.attributes.position.array;
        
        if (!this.isExploded) {
            if (positions[1] > 20) {
                this.explode();
            }
            
            for (let i = 0; i < this.particleCount; i++) {
                const i3 = i * 3;
                positions[i3] += this.velocities[i3];
                positions[i3 + 1] += this.velocities[i3 + 1];
                positions[i3 + 2] += this.velocities[i3 + 2];
            }
        } else {
            for (let i = 0; i < this.particleCount; i++) {
                const i3 = i * 3;
                positions[i3] += this.velocities[i3];
                positions[i3 + 1] += this.velocities[i3 + 1];
                positions[i3 + 2] += this.velocities[i3 + 2];
                
                this.velocities[i3 + 1] -= 0.02;
            }
        }
        
        this.particles.attributes.position.needsUpdate = true;
    }
    
    explode() {
        this.isExploded = true;
        const positions = this.particles.attributes.position.array;
        
        const sound = this.explosionSound.cloneNode();
        sound.volume = 0.3;
        sound.play();
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 2;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 0.5;
            
            this.velocities[i3] = Math.cos(angle) * velocity;
            this.velocities[i3 + 1] = Math.sin(angle) * velocity;
            this.velocities[i3 + 2] = (Math.random() - 0.5) * velocity;
        }
    }
}

const fireworks = [];

function animate() {
    requestAnimationFrame(animate);
    
    if (Math.random() < 0.05) {
        const firework = new Firework();
        scene.add(firework.system);
        fireworks.push(firework);
    }
    
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        
        if (fireworks[i].particles.attributes.position.array[1] < -30) {
            scene.remove(fireworks[i].system);
            fireworks.splice(i, 1);
        }
    }
    
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
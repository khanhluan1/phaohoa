// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera position
camera.position.z = 50;

// Tạo class Firework để quản lý từng quả pháo hoa
class Firework {
    constructor() {
        this.particles = new THREE.BufferGeometry();
        this.particleCount = 100;
        this.positions = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount * 3);
        this.isExploded = false;
        
        // Vị trí bắt đầu ở dưới màn hình
        const startX = (Math.random() - 0.5) * 20;
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            this.positions[i3] = startX;
            this.positions[i3 + 1] = -30; // Bắt đầu từ dưới
            this.positions[i3 + 2] = 0;
            
            if (!this.isExploded) {
                this.velocities[i3] = 0;
                this.velocities[i3 + 1] = 0.7; // Tốc độ chậm hơn
                this.velocities[i3 + 2] = 0;
            }
        }
        
        this.particles.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`), // Tăng lightness từ 70% lên 85%
            size: 1,
            map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png'),
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.8 // Thêm độ trong suốt để màu sáng không quá chói
        });
        
        this.system = new THREE.Points(this.particles, particleMaterial);
        this.explosionSound = document.getElementById('explosionSound');
    }
    
    update() {
        const positions = this.particles.attributes.position.array;
        
        if (!this.isExploded) {
            // Giảm độ cao nổ để phù hợp với tốc độ chậm hơn
            if (positions[1] > 20) { // Giảm từ 20 xuống 15
                this.explode();
            }
            
            // Di chuyển pháo hoa lên trên
            for (let i = 0; i < this.particleCount; i++) {
                const i3 = i * 3;
                positions[i3] += this.velocities[i3];
                positions[i3 + 1] += this.velocities[i3 + 1];
                positions[i3 + 2] += this.velocities[i3 + 2];
            }
        } else {
            // Sau khi nổ, các hạt bay ra các hướng
            for (let i = 0; i < this.particleCount; i++) {
                const i3 = i * 3;
                positions[i3] += this.velocities[i3];
                positions[i3 + 1] += this.velocities[i3 + 1];
                positions[i3 + 2] += this.velocities[i3 + 2];
                
                // Thêm trọng lực
                this.velocities[i3 + 1] -= 0.02;
            }
        }
        
        this.particles.attributes.position.needsUpdate = true;
    }
    
    explode() {
        this.isExploded = true;
        const positions = this.particles.attributes.position.array;
        
        // Phát âm thanh nổ
        const sound = this.explosionSound.cloneNode();
        sound.volume = 0.3; // Điều chỉnh âm lượng
        sound.play();
        
        // Tăng tốc độ nổ
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 2;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 0.5; // Tăng từ 0.5 lên 0.7
            
            this.velocities[i3] = Math.cos(angle) * velocity;
            this.velocities[i3 + 1] = Math.sin(angle) * velocity;
            this.velocities[i3 + 2] = (Math.random() - 0.5) * velocity;
        }
    }
}

// Mảng chứa các quả pháo hoa
const fireworks = [];

// Animation loop mới
function animate() {
    requestAnimationFrame(animate);
    
    // Tăng tần suất xuất hiện pháo hoa (từ 0.03 lên 0.05)
    if (Math.random() < 0.05) {
        const firework = new Firework();
        scene.add(firework.system);
        fireworks.push(firework);
    }
    
    // Cập nhật vị trí các quả pháo hoa
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        
        // Xóa pháo hoa đã tắt
        if (fireworks[i].particles.attributes.position.array[1] < -30) {
            scene.remove(fireworks[i].system);
            fireworks.splice(i, 1);
        }
    }
    
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
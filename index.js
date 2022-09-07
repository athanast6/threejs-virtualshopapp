import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.144.0/three.module.js'
import { OrbitControls } from '/OrbitControls.js'
import MouseMeshInteraction from '/three_mmi.js'
import { GLTFLoader } from '/GLTFLoader.js'
import { FontLoader } from '/FontLoader.js'




//const canvas = document.querySelector('.webgl');
//const username=document.getElementById('username').textContent;
//const username = prompt("Enter depop username");
//console.log(username);
//const username = document.getElementById('depopshop');
//const shopurl = 'https://webapi.depop.com/api/v1/shop/'+username;
//console.log(shopurl);


/*
var data = await fetch(shopurl)
    .then(response => response.json());
var depopid = data.id;

var productsurl = ("https://webapi.depop.com/api/v1/shop/"+depopid+"/products/?limit=200");
var productsdata = await fetch(productsurl)
    .then(response => response.json());
*/



function random(min,max){
return (min + Math.random() * (max-min))
}






//scene,cam,renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );


const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild( renderer.domElement );

var stego;
const gltfloader = new GLTFLoader();
gltfloader.load(
	// resource URL
	'stego.gltf',
	// called when the resource is loaded
	function ( gltf ) {

		scene.add( gltf.scene );

		gltf.animations; // Array<THREE.AnimationClip>
		gltf.scene; // THREE.Group
		gltf.scenes; // Array<THREE.Group>
		gltf.cameras; // Array<THREE.Camera>
		gltf.asset; // Object
        stego=gltf.scene;
        

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);



//make ground and grid
const groundGeo = new THREE.PlaneGeometry(105,105);
const groundMat = new THREE.MeshLambertMaterial();
groundMat.color.setHSL(0.7, 0.3, 0.2);
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = (-3.14159265/2);
scene.add(ground);

const gridHelper = new THREE.GridHelper( 100, 20 );
scene.add( gridHelper );



const mmi = new MouseMeshInteraction(scene, camera);



//Load the product
const loader = new THREE.TextureLoader();

function addImage(imageURL, number, productsdata){
    const texture = loader.load(imageURL);
    const geometry = new THREE.BoxGeometry( 5, 5, 0.5 );
    const material = new THREE.MeshLambertMaterial( { color: 0xe7e7e7, map:texture } );
    const shirt = new THREE.Mesh( geometry, material );
    shirt.name = ('shirt');

    //get shirt URL
    var slug = productsdata.products[number]['slug'];
    const url = ("https://depop.com/products/"+slug);
    console.log(url);


    shirt.url = url;
    scene.add(shirt);
    shirt.position.setFromCylindricalCoords(random(10,40), random(-Math.PI * 2, Math.PI * 2), 2.5);
    shirt.lookAt(0,2,0);
    // add an event listener for this callback
    //domEvents.addEventListener(shirt, 'click', callback, false);
    //var url	= 'http://depop.com/vintagetejas';
    mmi.addHandler('shirt', 'dblclick', function(mesh) {
		window.open(mesh.url,'_blank');
	});
    mmi.addHandler('shirt', 'mouseenter', function(mesh) {
        document.body.style.cursor = "pointer";
	});
    mmi.addHandler('shirt', 'mouseleave', function(mesh) {
        document.body.style.cursor = "default";
	});
    
    
	


    //console.log(number);
}


async function addImages(username){
    scene.remove(scene.children);
    const shopurl = 'https://webapi.depop.com/api/v1/shop/'+username;
    var data = await fetch(shopurl)
    .then(response => response.json());
    var depopid = data.id;

    var productsurl = ("https://webapi.depop.com/api/v1/shop/"+depopid+"/products/?limit=200");
    const productsdata = await fetch(productsurl)
    .then(response => response.json());

    //load 50 products
    for(let i = 0; i<50;i++){
        var url=productsdata.products[i]['preview']['640'];
        addImage(url, i, productsdata);
    }
}





//lighting
const light = new THREE.AmbientLight( 0x202020 ); // soft white light
scene.add( light );

const light2 = new THREE.HemisphereLight( 0xe2e2d4, 0x080820, 0.5 );
scene.add( light2 );

const light3 = new THREE.PointLight( 0xafafa1, 1, 100 );
light.position.set( 0, 25, 15 );
scene.add( light3 );




//orbit controls to look around
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.target.y = 2;

camera.position.y = 5;
camera.position.z = 15;

controls.update();





function animate() {
    requestAnimationFrame( animate );

    controls.update();

    mmi.update();

    

    renderer.render( scene, camera );
};

document.getElementById('depopshop').addEventListener("keyup", function(event) {
    if (event.key === 'Enter') {
        addImages(event.currentTarget.value);
    }
});

animate();
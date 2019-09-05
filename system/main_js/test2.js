let renderer, camera, scene;
//hugosmoon


let gui=new dat.GUI();

let mesh,mesh2;

// let num=0;

// let vertices=[];//对象顶点
// let faces=[];//对象面



//主函数
function threeStart() {
    initThree();
    initObject();
    loadAutoScreen(camera, renderer);
    render();
}



//初始化渲染器
function initThree() {
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });//定义渲染器
    renderer.setSize(window.innerWidth, window.innerHeight);//设置渲染的宽度和高度
    document.getElementById('render').appendChild(renderer.domElement);//将渲染器加在html中的div里面

    renderer.setClearColor(0x444444, 1.0);//渲染的颜色设置
    renderer.shadowMapEnabled = true;//开启阴影，默认是关闭的，太影响性能
    renderer.shadowMapType = THREE.PCFSoftShadowMap;//阴影的一个类型


    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);//perspective是透视摄像机，这种摄像机看上去画面有3D效果

    //摄像机的位置
    camera.position.x = -150;
    camera.position.y = -150;
    camera.position.z = 50;
    camera.up.x = 0;
    camera.up.y = 0;
    camera.up.z = 1;//摄像机的上方向是Z轴
    camera.lookAt(0, -50, 0);//摄像机对焦的位置
    //这三个参数共同作用才能决定画面

    scene = new THREE.Scene();

    let light = new THREE.SpotLight(0xffffff, 1.2, 0);//点光源
    light.position.set(4000, 2000, 8000);
    light.castShadow = true;//开启阴影
    light.shadowMapWidth = 8192;//阴影的分辨率，可以不设置对比看效果
    light.shadowMapHeight = 8192;
    scene.add(light);

    let light2 = new THREE.SpotLight(0xffffff, 0.6, 0);//点光源
    light2.position.set(-3000, -3000, 2500);
    scene.add(light2);

    let light3 = new THREE.AmbientLight(0xaaaaaa, 0.6);//环境光，如果不加，点光源照不到的地方就完全是黑色的
    scene.add(light3);

    controller = new THREE.OrbitControls(camera, renderer.domElement);
    controller.target = new THREE.Vector3(0, 0, 0);

}

function initObject() {

    let materials = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x545454,
            transparent: false,
            specular: 0x545454,
            metal: true
        }),
    ];

    let yuanzhu=create_vertices(10,2,50);
    let vertices=yuanzhu.vertices;
    mesh=create_cylinder(vertices,materials);
    mesh2=create_cylinder(vertices,materials);
    scene.add(mesh);  
    scene.add(mesh2);    

}
function render() {
    try {
       
    }
    catch (e) {

    }

    let vertices = [];
    vertices=create_vertices(20,20,15).vertices;
    mesh.children.forEach(function (e) {
        e.geometry.vertices = vertices;
        e.geometry.verticesNeedUpdate = true;//通知顶点更新
        e.geometry.elementsNeedUpdate = true;//特别重要，通知线条连接方式更新
        e.geometry.computeFaceNormals();
    });

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

// let abc=create_points(10,10)

// //创建顶点
// function create_vertices(r1,r2,h,num=720){
//     let degree=(Math.PI/180)*360/num;
//     let points=[]
//     let vertices=[];
//     for(let i=0;i<num;i++){

//         points[i]=[];
//         points[i][0]=[];
//         points[i][1]=[];

//         points[i][0]['x']=r1*Math.sin(i*degree);
//         points[i][0]['y']=r1*Math.cos(i*degree);
//         points[i][0]['z']=0;

//         points[i][1]['x']=r2*Math.sin(i*degree);
//         points[i][1]['y']=r2*Math.cos(i*degree);
//         points[i][1]['z']=h;

//     }

//     for(let j=0;j<2;j++){
//         for(let i=0;i<points.length;i++){
//             vertices.push(new THREE.Vector3(points[i][j]['x'], points[i][j]['y'], points[i][j]['z']))
//         }
//     }

//     let obj=new function(){
//         this.vertices=vertices;
//         this.num=num;   
//     }
//     return obj;
// }

// //创建圆柱
// function create_cylinder(vertices,num,materials){

//     let faces=[],geom,mesh;
//     for(let i=0;i<num-2;i++){
//         faces.push(new THREE.Face3(0, i+1, i+2))
//     }

//     for(let i=0;i<num-2;i++){
//         faces.push(new THREE.Face3(num, num+i+2, num+i+1))
//     }

//     for(let i=0;i<num-1;i++){
//         faces.push(new THREE.Face3(i, i+num, i+num+1))
//         faces.push(new THREE.Face3(i, i+num+1, i+1))

//     }
//     faces.push(new THREE.Face3(0, num-1, 2*num-1));
//     faces.push(new THREE.Face3(0, 2*num-1, num));

//     geom = new THREE.Geometry();
//     geom.vertices = vertices;
//     geom.faces = faces;
//     geom.computeFaceNormals();//计算法向量，会对光照产生影响

//     //两个材质放在一起使用

//     //创建多材质对象，要引入SceneUtils.js文件，如果只有一个材质就不需要这个函数
//     mesh = THREE.SceneUtils.createMultiMaterialObject(geom, materials);
//     mesh.children.forEach(function (e) {
//         e.castShadow = true
//     });
//     mesh.receiveShadow = true;

//     return mesh;

// }
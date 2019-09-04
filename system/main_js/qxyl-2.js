let renderer, camera, scene;


let main_angle=60,tool_minor_cutting_edge_angle=15,edge_inclination_angle=0,rake_angle=30,back_angle=10,secondary_edge_back_angl=10;
let bcdl=0.2,jjl=1;
let duidaobuchang=10;//对刀完成后后退的距离
let machine_speed=0;
let szjp_distance=15;//三爪夹盘爪子距离中心的高度


let szjp_pan,szjp_zhua1,szjp_zhua2,szjp_zhua3;

let count=0;//计数器

let bangliao1,bangliao2,bangliao3,bagnliao4;
let bangliao_r1=80,bangliao_r2=bangliao_r1-bcdl,bangliao2_r2=40;//未加工和已经加工的棒料半径
let bangliao_length=600,cut_length=0,bangliao2_length=0.0001;
let bangliao1_Geometry,bangliao2_Geometry,bangliao3_Geometry,bangliao4_Geometry;

let daojujiaodubuchang=0;

let rot_angle=0;

let materials_bangliao;
let plane;

let weizuo;
let weizuodingjian;
let daojia1,daojia2;
let jichuang;
let tool;
let sigang;
let load_status=false;

let model_number=0;//记录加载模型的数量

let last_frame_time=Date.now();//上一帧时间戳
let frame_time=20;//当前时间戳

let cut_start=false;//切削是否开始，与bangliao3的半径确定有关
let cut_corner_end=false;//切削棒料角是否结束，与棒料2的长度及两端半径确定有关

bangliao_r1=parseFloat(GetQueryString('bangliao_r'));
bangliao_length=parseFloat(GetQueryString('bangliao_length'));
main_angle=parseFloat(GetQueryString('main_angle'));
tool_minor_cutting_edge_angle=parseFloat(GetQueryString('tool_minor_cutting_edge_angle'));
edge_inclination_angle=parseFloat(GetQueryString('edge_inclination_angle'));
rake_angle=parseFloat(GetQueryString('rake_angle'));
back_angle=parseFloat(GetQueryString('back_angle'));
secondary_edge_back_angl=parseFloat(GetQueryString('secondary_edge_back_angl'));
daojujiaodubuchang=parseFloat(GetQueryString('daojujiaodubuchang'));


//
// let controls = new function () {
//
//     this.x=0;
//     this.y=0;
//     this.z=0
// };
//
// let gui=new dat.GUI();
// gui.add(controls,"x",-100,100);
// gui.add(controls,"y",-100,100);
// gui.add(controls,"z",-100,100);



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
    camera.position.x = -1500;
    camera.position.y = -1500;
    camera.position.z = 500;
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

    let controller = new THREE.OrbitControls(camera, renderer.domElement);
    controller.target = new THREE.Vector3(0, 0, 0);

}



//初始化场景中的所有物体
function initObject() {

    //地面
    let planeGeometry = new THREE.PlaneGeometry(5000, 5000, 20, 20);
    let planeMaterial =
        new THREE.MeshLambertMaterial({color: 0x333300})
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.z = -950;
    plane.receiveShadow = true;//开启地面的接收阴影
    scene.add(plane);//添加到场景中

    //夹盘盘的材质
    let materials_szjp_pan = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x212121,
            transparent: false,
            specular: 0x545454,
            metal: true
        }),
    ];

    //夹盘爪的材质
    let materials_szjp_zhua = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x323232,
            transparent: false,
            specular: 0x545454,
            metal: true
        }),
    ];

    //未切削棒料的材质
    materials_bangliao_0 = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x434343,
            transparent: false,
            specular: 0x434343,
            metal: true
        }),
    ];

    //已切削棒料的材质
    materials_bangliao = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x545454,
            transparent: false,
            specular: 0x545454,
            metal: true
        }),
    ];
    //丝杠的材质
    materials_sigang = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x323232,
            transparent: false,
            specular: 0x323232,
            metal: true
        }),
    ];

    //尾座的材质
    let materials_weizuo = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x212121,
            transparent: false,

            metal: true
        }),
    ];


    //尾座顶尖的材质
    let materials_weizuodingjian = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x323232,
            transparent: false,
            specular: 0x323232,
            metal: true
        }),
    ];


    var loader = new THREE.STLLoader();
    loader.load("../../../model/6140.STL", function (geometry) {
        geometry.center();




        jichuang = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_weizuo);
        jichuang.rotation.x =  0.5 *Math.PI;
        jichuang.children.forEach(function (e) {
            e.castShadow = true
        });
        jichuang.receiveShadow = true;

        jichuang.rotation.y =  -0.5 *Math.PI;
        jichuang.position.x=30;
        jichuang.position.y=-250;
        jichuang.position.z=-376;



        scene.add(jichuang);

        console.log('机床加载完成');
        model_number+=1;

        tool=create_tool(main_angle,tool_minor_cutting_edge_angle,edge_inclination_angle,rake_angle,back_angle,secondary_edge_back_angl);

        tool.position.z=0;

        tool.scale.set(0.5,0.5,0.5);
        scene.add(tool);
        console.log('车刀加载完成');
        model_number+=1;

        bangliao1_Geometry=new THREE.CylinderGeometry(bangliao_r1, bangliao_r1, bangliao_length,72,100);

        bangliao1 = THREE.SceneUtils.createMultiMaterialObject(bangliao1_Geometry, materials_bangliao_0);

        bangliao2_Geometry=new THREE.CylinderGeometry(bangliao_r1, bangliao_r2, bangliao2_length,72,20);
        bangliao2 = THREE.SceneUtils.createMultiMaterialObject(bangliao2_Geometry, materials_bangliao);

        bangliao3_Geometry=new THREE.CylinderGeometry(bangliao_r2, bangliao_r2, bangliao_length,72,100);
        bangliao3 = THREE.SceneUtils.createMultiMaterialObject(bangliao3_Geometry, materials_bangliao);

        bangliao4_Geometry=new THREE.CylinderGeometry(bangliao_r1, bangliao_r1, bangliao_length,72,100);
        bangliao4 = THREE.SceneUtils.createMultiMaterialObject(bangliao4_Geometry, materials_bangliao_0);
        // bangliao4.visible=false;
                

        scene.add(bangliao1);
        scene.add(bangliao2);
        scene.add(bangliao3);
        scene.add(bangliao4);
        

        console.log('棒料加载完成');
        model_number+=1;

    });







    loader.load("../../../model/szjp_pan.STL", function (geometry) {
        geometry.center();
        szjp_pan = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_szjp_pan);
        szjp_pan.rotation.x = 0.5 * Math.PI;
        szjp_pan.children.forEach(function (e) {
            e.castShadow = true
        });
        szjp_pan.receiveShadow = true;
        scene.add(szjp_pan);
        console.log('盘子加载完成');
        model_number+=1;
    });

    loader.load("../../../model/szjp_zhua.STL", function (geometry) {
        geometry.center();
        szjp_zhua1 = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_szjp_zhua);
        szjp_zhua1.rotation.x =  0.5 *Math.PI;
        szjp_zhua1.position.y=-89.6;
        // szjp_zhua1.scale.set(0.1, 0.1, 0.1);
        szjp_zhua1.children.forEach(function (e) {
            e.castShadow = true
        });
        szjp_zhua1.receiveShadow = true;
        szjp_zhua2=szjp_zhua1.clone();
        szjp_zhua3=szjp_zhua1.clone();

        scene.add(szjp_zhua1);
        scene.add(szjp_zhua2);
        scene.add(szjp_zhua3);

        console.log('爪子加载完成');
        model_number+=1;




    });

    loader.load("../../../model/weizuo.STL", function (geometry) {
        geometry.center();
        weizuo = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_weizuo);
        weizuo.rotation.x =  0.5 *Math.PI;
        // weizuo.scale.set(0.1, 0.1, 0.1);
        weizuo.children.forEach(function (e) {
            e.castShadow = true
        });
        weizuo.receiveShadow = true;
        weizuo.rotation.y =  -0.5 *Math.PI;
        weizuo.position.x=65;
        weizuo.position.z=-47;
        scene.add(weizuo);


        let dingjian1,dingjian2;
        let dingjian1_Geometry=new THREE.CylinderGeometry(32, 32, 100,360,100);
        dingjian1 = THREE.SceneUtils.createMultiMaterialObject(dingjian1_Geometry, materials_weizuodingjian);
        let dingjian2_Geometry=new THREE.CylinderGeometry(1, 32, 60,360,100);
        dingjian2 = THREE.SceneUtils.createMultiMaterialObject(dingjian2_Geometry, materials_weizuodingjian);
        dingjian1.position.y=-80;

        weizuodingjian=new THREE.Group();
        weizuodingjian.add(dingjian1);

        weizuodingjian.add(dingjian2);

        scene.add(weizuodingjian);


        console.log('尾座加载完成');

        model_number+=1;



    });

    loader.load("../../../model/daojia1.STL", function (geometry) {
        geometry.center();
        daojia1 = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_weizuo);
        daojia1.rotation.x =  0.5 *Math.PI;
        // daojia1.position.y=-89.6;
        // daojia1.scale.set(0.1, 0.1, 0.1);
        daojia1.children.forEach(function (e) {
            e.castShadow = true
        });
        daojia1.receiveShadow = true;

        daojia1.rotation.y =  -Math.PI;
        daojia1.position.x=-68;
        daojia1.position.z=-264;
        scene.add(daojia1);
        console.log('刀架1加载完成');
        model_number+=1;
    });

    loader.load("../../../model/daojia2.STL", function (geometry) {
        geometry.center();
        daojia2 = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_weizuo);
        daojia2.rotation.x =  0.5 *Math.PI;
        // daojia2.position.y=-8.96;
        // daojia2.scale.set(0.1, 0.1, 0.1);
        daojia2.children.forEach(function (e) {
            e.castShadow = true
        });
        daojia2.receiveShadow = true;

        daojia2.rotation.y =  -Math.PI;

        daojia2.position.z=250;
        daojia2.position.z=13;
        scene.add(daojia2);
        console.log('刀架2加载完成');
        model_number+=1;
    });

    loader.load("../../../model/sigang.STL", function (geometry) {
        geometry.center();
        sigang = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_sigang);

        // sigang.scale.set(0.1, 0.1, 0.1);
        sigang.children.forEach(function (e) {
            e.castShadow = true
        });
        sigang.receiveShadow = true;

        sigang.rotation.z =  -0.5*Math.PI;

        sigang.position.y=-600;
        sigang.position.x=-200;
        sigang.position.z=-435;
        scene.add(sigang);
        console.log('丝杠加载完成');
        model_number+=1;
    });


}

//动画
function render() {

    szjp_distance=bangliao_r1+45;
    bangliao_r2=bangliao_r1-bcdl;

    frame_time= Date.now()-last_frame_time;
    last_frame_time=Date.now();

    try
    {

        weizuo.position.y=-390-bangliao_length-5;
        weizuodingjian.position.y=-27-bangliao_length;

        

        rot_angle+=frame_time*(machine_speed/30000)*Math.PI;




        szjp_pan.rotation.z=30*(Math.PI/180)-Math.PI+rot_angle;
        weizuodingjian.rotation.y=-Math.PI+rot_angle;
        bangliao1.rotation.y=- Math.PI+rot_angle;
        bangliao3.rotation.y=- Math.PI+rot_angle;

        szjp_zhua1.rotation.z=0.5 * Math.PI+rot_angle;
        szjp_zhua1.position.z=szjp_distance*Math.cos(-rot_angle);
        szjp_zhua1.position.x=szjp_distance*Math.sin(-rot_angle);

        szjp_zhua2.rotation.z=(0.5+2/3) * Math.PI+rot_angle;
        szjp_zhua2.position.z=szjp_distance*Math.cos(-rot_angle-(2/3)*Math.PI);
        szjp_zhua2.position.x=szjp_distance*Math.sin(-rot_angle-(2/3)*Math.PI);

        szjp_zhua3.rotation.z=(0.5+4/3) * Math.PI+rot_angle;
        szjp_zhua3.position.z=szjp_distance*Math.cos(-rot_angle-(4/3)*Math.PI);
        szjp_zhua3.position.x=szjp_distance*Math.sin(-rot_angle-(4/3)*Math.PI);

        if(cut_length<bangliao_length-200){
            if(duidaobuchang>0){
                duidaobuchang-=frame_time*machine_speed/60000;
            }
            else{
                duidaobuchang=0;
                cut_length+=jjl*frame_time*machine_speed/60000;
                if(cut_length>=bangliao_length-200){
                    cut_length=bangliao_length-200;
                    machine_speed=0;
                }

            }
            
            sigang.rotation.y+=frame_time*machine_speed*jjl*Math.PI/240000;
        }

        
        if(cut_length>0&&cut_length<bcdl*trig('cot',main_angle)){
            console.log('a:'+Date.now());
            deleteGroup(bangliao2);
            bangliao2_length=cut_length+0.0001;
            bangliao2_r2=bangliao_r1-cut_length*trig('tan',main_angle);
            bangliao2_Geometry=new THREE.CylinderGeometry(bangliao_r1, bangliao2_r2, bangliao2_length,360,20);
            bangliao2 = THREE.SceneUtils.createMultiMaterialObject(bangliao2_Geometry, materials_bangliao);
            scene.add(bangliao2);
            if(!cut_start){
                deleteGroup(bangliao3);
                bangliao3_Geometry=new THREE.CylinderGeometry(bangliao_r2, bangliao_r2, bangliao_length,360,100);
                bangliao3 = THREE.SceneUtils.createMultiMaterialObject(bangliao3_Geometry, materials_bangliao);
                scene.add(bangliao3);
                deleteGroup(bangliao4);
                bangliao4_Geometry=new THREE.CylinderGeometry(bangliao_r2, bangliao_r2, 0.3,360,100);
                bangliao4 = THREE.SceneUtils.createMultiMaterialObject(bangliao4_Geometry, materials_bangliao_0);
                scene.add(bangliao4);
                cut_start=true;
            }
            console.log('b:'+Date.now())
        }

        else if(cut_length>0){
            if(!cut_corner_end){
                bangliao2_r2=bangliao_r2;
                bangliao2_length=bcdl*trig('cot',main_angle);
                deleteGroup(bangliao2);
                bangliao2_length=cut_length+0.0001;
                bangliao2_r2=bangliao_r1-cut_length*trig('tan',main_angle);
                bangliao2_Geometry=new THREE.CylinderGeometry(bangliao_r1, bangliao2_r2, bangliao2_length,360,20);
                bangliao2 = THREE.SceneUtils.createMultiMaterialObject(bangliao2_Geometry, materials_bangliao);
                scene.add(bangliao2);
                cut_corner_end=true;
            }
        }



        bangliao1.position.y=-6.5-bangliao_length/2+cut_length;
        bangliao2.position.y=-6.5-bangliao_length+cut_length-bangliao2_length/2;
        bangliao3.position.y=-6.5-bangliao_length/2;
        bangliao4.position.y=-6.5-bangliao_length/2-0.3;

        tool.position.y=-6.5-bangliao_length+cut_length-bcdl*trig('cot',main_angle)-duidaobuchang;
        tool.position.x=-bangliao_r1+bcdl;

        daojia1.position.y=-101-bangliao_length+cut_length-bcdl*trig('cot',main_angle)+daojujiaodubuchang-duidaobuchang;
        daojia2.position.y=-163-bangliao_length+cut_length-bcdl*trig('cot',main_angle)+daojujiaodubuchang-duidaobuchang;
        daojia2.position.x=-bangliao_r1+bcdl-100;

        if(model_number==9){
            load_status=true;
        }
        count+=1;
    }
    catch (e) {
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}


//主函数
function threeStart() {
    initThree();
    initObject();
    loadAutoScreen(camera, renderer);
    render();
}

var Main = {
    data() {
        this.openFullScreen(200);
        return {
            check_pr: false,
            check_ps: false,
            check_p0: false,
            value1: 0,
            value2: 1,
            value3: 0.3,

            src1: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1567144341452&di=a069835f0428b94979796ed1dec81c03&imgtype=0&src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2Fdbe5e3517539425899eadba77521b3ac6ba2edb810f2a-nANzc3_fw658',
            src2:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1567144597468&di=18baee6bc69c3fef33f24dec02c9ec15&imgtype=0&src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2F54293f5fda82dcbdff2da781f5c821b97117d32d8a673-3aeEJ1_fw658',
            adjustable:false,
            marks_machine_speed: {
                0:'0',
                400: '400',
                800: '800',
                1200: '1200',
                1600: '1600'
            },
            marks_cutting_depth: {

                0:'0',
                1: '1.0',
                2: '2.0',
                3: '3.0',
                4: '4.0',
                5: '5.0',
                6:'6.0'
            },
            marks_feed: {
                0.1: '0.1',
                0.2: '0.2',
                0.3: '0.3',
                0.4: '0.4',
                0.5: '0.5'
            }
        }
    },

    methods: {
        greet: function (xx) {
            // machine_speed=this.$refs.machine_speed.value;
            bcdl=this.$refs.cutting_depth.value;
            // jjl=0.1*this.$refs.feed.value;

        },
        start: function(){

            machine_speed=this.$refs.machine_speed.value;
            bcdl=this.$refs.cutting_depth.value;
            jjl=this.$refs.feed.value;
            if(machine_speed==0){
                this.$alert('主轴转速不能为0', '操作提示', {
                    confirmButtonText: '确定',
                    // callback: action => {
                    //     this.$message({
                    //         type: 'info',
                    //         message: `action: ${ action }`
                    //     });
                    // }
                });
                return false;
            }
            if(bcdl==0){
                this.$alert('背吃刀量不能为0', '操作提示', {
                    confirmButtonText: '确定',
                    // callback: action => {
                    //     this.$message({
                    //         type: 'info',
                    //         message: `action: ${ action }`
                    //     });
                    // }
                });
                return false;
            }
            
            // this.$refs.machine_speed.disable=true;
            this.adjustable=true;
        },
        end:function () {
            machine_speed=0;
        },
        reload:function () {
            location.reload();
        },
        openFullScreen:function(time) {
            const loading = this.$loading({
                lock: true,
                text: '实验加载中',
                // spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.92)'
            });
            setTimeout(() => {
                if(load_status){
                    loading.close();
                }
                else {
                    this.openFullScreen(200);
                }

            }, time);
        }

    }

}

var Ctor = Vue.extend(Main)
new Ctor().$mount('#app')


//删除group
function deleteGroup(group) {

    group.traverse(function (item) {
        if (item instanceof THREE.Mesh) {
            item.geometry.dispose(); //删除几何体
            item.material.dispose(); //删除材质
        }
    });

    scene.remove(group);
    console.log("释放内存")
}
//获取url参数
function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}









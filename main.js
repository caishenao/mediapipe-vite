import "./style.css";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import p5 from "p5";
import { Engine } from "matter-js";
import { data, Circle, RigidRectangle } from "./lib/Types";

// 每次检测都会执行的回调函数
function sketch(p) {
  // 检测对象
  let detection;
  // 视频流对象
  let video;
  // 上一帧的时间戳
  let lastTime;
  // 显示数据
  let message = "模型还未加载完毕";
  // 刚性小球数组
  let circles = [];
  let handsCircles = [];
  let boxs = [];

  // wall 刚性墙体
  let walls = [];

  // 预先加载数据文件
  p.preload = () => {
    // 加载检测需要的模型
    detection = new Hands({
      locateFile: (file) => {
        return `./node_modules/@mediapipe/hands/${file}`;
      },
    });
    // 设置检测参数
    detection.setOptions({
      selfieMode: true,
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // 检测结果回调
    detection.onResults((results) => {
      message = "模型加载完毕";
      p.loop(); // 循环
      // 一旦检测到手，将之前的全部小球全部清除
      handsCircles.forEach((hand) => {
        hand.removeFromWorld();
      });
      handsCircles = [];

      // 配置刚性小球的参数
      let options = {
        // 摩檫力
        friction: 4,
        // 刚性值 弹力
        restitution: 1,
        // 是否为静态对象
        isStatic: true,
      };
      let w = p.width;
      let h = p.height;
      // 真正的半径
      let r = 20;
      let color = p.color(0, 255, 0);

      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          for (const landmark of landmarks) {
            // 创建刚性小球
            handsCircles.push(
              new Circle(landmark.x * w, landmark.y * h, r, color, options)
            );
          }
        }
      }
    });
  };

  // 初始化 设置一些参数
  p.setup = () => {
    p.createCanvas(innerWidth, innerHeight);
    p.noLoop(); // 模型未加载完毕之前，不进行循环
    // 获取电脑的摄像头，并将摄像头的流对象转换为视频流
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((mediaStream) => {
        video = document.createElement("video");
        video.srcObject = mediaStream;
        // 实验视频，将创建的视频对象添加到html中
        // document.body.append(video)
        const camera = new Camera(video, {
          onFrame: async () => {
            await detection.send({ image: video });
          },
        });
        camera.start();
      });
    // 初始化时间挫间隔
    lastTime = 0;

    //  随机添加小球
    circles = addCircle(10);

    // 添加随机的箱子
    boxs = addBox(20);
    // 添加刚性墙体
    walls.push(
      new RigidRectangle(
        p.width / 2,
        p.height - 50,
        p.width,
        100,
        p.color(0, 0, 0),
        {
          // 物体的摩檫力
          friction: 1,
          // 弹力
          restitution: 2,
          // 物体所在的角度
          angle: Math.PI / 1,
          // 是否是静态的
          isStatic: true,
        }
      )
    );
  };

  // 绘制每一帧数据
  p.draw = () => {
    // 背景颜色
    p.background(255);

    // 显示加载信息
    //#region
    p.push();
    p.fill(0, 255, 0);
    p.noStroke();
    p.textSize(20);
    p.text(message, p.width - 200, 50);
    p.pop();
    //#endregion
    // 绘制FPS
    //#region
    p.textSize(20);
    p.fill(0, 255, 0);
    p.noStroke();
    p.text(`FPS: ${FPS()}`, 20, 50);
    //#endregion
    // 执行引擎
    Engine.update(data.engine);

    // 渲染Matter引擎中的物体
    // 绘制墙
    walls.forEach((wall) => {
      wall.show(p);
    });
    // 绘制手
    handsCircles.forEach((hands) => {
      hands.show(p);
    });
    // 绘制小球
    for (let i = 0; i < circles.length; i++) {
      // 判断是否超出屏幕
      if (circles[i].isOffScreen(p)) {
        // 超出屏幕
        // 将物体在Matter-js中移除
        circles[i].removeFromWorld();
        // 删除数组中的存储的物体
        circles.splice(i, 1);
        i--;
      } else {
        circles[i].show(p);
      }
    }
    // 绘制盒子
    for (let i = 0; i < boxs.length; i++) {
      // 判断是否超出屏幕
      if (boxs[i].isOffScreen(p)) {
        // 超出屏幕
        // 将物体在Matter-js中移除
        boxs[i].removeFromWorld();
        // 删除数组中的存储的物体
        boxs.splice(i, 1);
        i--;
      } else {
        boxs[i].show(p);
      }
    }
  };

  // FPS
  function FPS() {
    let now = new Date();
    let fps = Math.floor(1000 / (now - lastTime));
    lastTime = now;
    return fps;
  }
  // 随机添加盒子
  function addBox(size) {
    let boxs = [];
    let options = {
      // 摩檫力
      friction: 4,
      // 刚性值 弹力
      restitution: 1,
      // 是否为静态对象
      isStatic: false,
    };
    for (let i = 0; i < size; i++) {
      let color = p.color(p.random(255), p.random(255), p.random(255));
      // 宽度 [50~100)
      let w = p.random(50, 100);
      // 高度 [50~100)
      let h = p.random(50, 100);
      // x轴的值 屏幕宽度
      let x = p.random(w / 2, p.width - w / 2);
      let y = h / 2;
      boxs.push(new RigidRectangle(x, y, w, h, color, options));
    }
    return boxs;
  }
  // 随机添加小球
  function addCircle(size) {
    let circles = [];
    let options = {
      // 摩檫力
      friction: 4,
      // 刚性值 弹力
      restitution: 1,
      // 是否为静态对象
      isStatic: false,
    };
    for (let i = 0; i < size; i++) {
      let color = p.color(p.random(255), p.random(255), p.random(255));
      // 宽度 [50~100)
      let r = p.random(50, 100);
      // x轴的值 屏幕宽度
      let x = p.random(r, p.width - r);
      let y = r;
      circles.push(new Circle(x, y, r, color, options));
    }
    return circles;
  }
}

new p5(sketch, document.querySelector("#app"));

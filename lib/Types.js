import Matter, { Bodies, Engine, World } from "matter-js";
import { Color } from "p5";

export const data = {
  // 引擎
  engine: Engine.create(),
};

// matter中的刚性小球
export class Circle {
  // 构造函数
  /**
   *
   * @param {Number} x X轴坐标
   * @param {Number} y Y轴坐标
   * @param {Number} r 小球的半径
   * @param {Function} color p5.color函数
   * @param {Object} options 参数对象
   */
  constructor(x, y, r, color, options = null) {
    // 默认的
    if (options == null) {
      options = {
        // 摩檫力
        friction: 1,
        // 刚性值 弹力
        restitution: 1,
        // 是否为静态对象
        isStatic: false,
      };
    }
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.options = options;
    // 使用Matter中提供的对象，常见刚性小球
    this.body = Bodies.circle(this.x, this.y, this.r, this.options);
    // 添加到2D引擎世界中
    World.add(data.engine.world, this.body);
  }
  // 在p5中显示刚性小球
  show(p) {
    let pos = this.body.position;
    p.push();
    p.fill(this.color);
    p.noStroke();
    p.ellipse(pos.x, pos.y, 2 * this.r);
    p.pop();
  }
  // 判断小球是否超出屏幕
  isOffScreen(p) {
    let pos = this.body.position;

    if (pos.y > p.height + this.r) {
      return true;
    } else {
      return false;
    }
  }

  // 移除小球，在世界中
  removeFromWorld() {
    World.remove(data.engine.world, this.body);
  }
}

// 刚性矩形
export class RigidRectangle {
  // 构造函数
  /**
   *
   * @param {number} x 物体中心的X轴坐标
   * @param {number} y 物体中心的Y轴坐标
   * @param {number} w 物体的宽度
   * @param {number} h 物体的高度
   * @param {Function} color p5.color()函数，与在p5中的渲染物体的颜色相关
   * @param {Object} options 关于物体在Matter引擎中的配置
   */
  constructor(x, y, w, h, color,options = null) {
    // 对对象进行赋值
    if (options === null) {
      options = {
        // 物体的摩檫力
        friction: 1,
        // 弹力
        restitution: 2,
        // 物体所在的角度
        angle: Math.PI / 1,
        // 是否是静态的
        isStatic: false,
      };
    }
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.options = options;

    // 在Matter中创建并添加对应的对象
    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, this.options);
    World.add(data.engine.world, this.body);
  }
  // 在p5环境下显示
  show(p) {
    let pos = this.body.position;
    let angle = this.body.angle;

    p.push();
    p.translate(pos.x, pos.y);
    p.rotate(angle);
    p.rectMode(p.CENTER);
    //  p.strokeWeight(1);
    p.fill(this.color);
    p.rect(0, 0, this.w, this.h);
    p.pop();
  }

  // 判断物体是否超出边界
  isOffScreen(p) {
    let pos = this.body.position;

    if (pos.y > p.height + this.r) {
      return true;
    } else {
      return false;
    }
  }
  // 将物体在Matter-js引擎中移除
  removeFromWorld() {
    World.remove(data.engine.world, this.body);
  }
}

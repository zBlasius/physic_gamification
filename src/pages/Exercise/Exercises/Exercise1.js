import React, { useEffect, useRef } from "react";
import {
  Engine,
  Render,
  World,
  Body,
  Bodies,
  Runner,
  Mouse,
  MouseConstraint,
  Composite,
  Constraint,
} from "matter-js";

const Exercise1 = ({ speed }) => {
  const scene = useRef(null);

  useEffect(() => {
    // ---- PRE CODE ----
    const cw = scene.current.clientWidth;
    const ch = scene.current.clientHeight;

    const engine = Engine.create();
    const render = Render.create({
      element: scene.current,
      engine: engine,
      options: {
        width: cw,
        height: ch,
        wireframes: false,
        background: "linear-gradient(to bottom, #f0f0f0, #dcdcdc)",
        showCollisions: true,
        showVelocity: true,
        showDebug: true,
        showBounds: true,
        showPositions: true,
      },
    });
    const runner = Runner.create();

    Render.run(render);
    Runner.run(runner, engine);
    // ---- PRE CODE ----

    const ground = Bodies.rectangle(cw / 2, ch * 0.9, cw, 30, {
      isStatic: true,
      friction: 1.0, // Aumentando a fricção do chão
    });

    const scale = 0.8;
    const car = createCar(
      cw / 6,
      ch * 0.9 - 40,
      200 * scale,
      30 * scale,
      30 * scale,
      0.001 // Aumentando a densidade do carro
    );
    const car2 = createCar(
      cw * 0.6,
      ch * 0.9 - 40,
      200 * scale,
      30 * scale,
      30 * scale,
      0.001
    );

    const mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false,
          },
        },
      });

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    World.add(engine.world, [mouseConstraint, ground, car, car2]);

    // Aplicar uma força horizontal constante às rodas do carro
    const horizontalForce = 0.001; // Ajuste a força conforme necessário

    // Configure uma função para aplicar a força continuamente
    const applyHorizontalForce = () => {
      car.bodies.forEach((body) => {
        if (body.label === "Circle Body") {
          // Certifique-se de aplicar a força nas rodas do carro
          Body.applyForce(body, body.position, {
            x: horizontalForce,
            y: 0,
          });
        }
      });

      requestAnimationFrame(applyHorizontalForce);
    };

    // Inicie o loop para aplicar a força
    applyHorizontalForce();

    // Cleanup
    return () => {
      World.clear(engine.world);
      Engine.clear(engine);
      Runner.stop(runner);
      Render.stop(render);
      render.canvas.remove();
      render.canvas = null;
      render.context = null;
      render.textures = {};
    };
  }, []);

  function createCar(xx, yy, width, height, wheelSize, density) {
    const group = Body.nextGroup(true),
      wheelBase = 20,
      wheelAOffset = -width * 0.5 + wheelBase,
      wheelBOffset = width * 0.5 - wheelBase,
      wheelYOffset = 0;

    const car = Composite.create({ label: "Car" }),
      body = Bodies.rectangle(xx, yy, width, height, {
        collisionFilter: {
          group: group,
        },
        chamfer: {
          radius: height * 0.5,
        },
        density: density, // Aumentando a densidade do carro
      });

    const wheelA = Bodies.circle(
      xx + wheelAOffset,
      yy + wheelYOffset,
      wheelSize,
      {
        collisionFilter: {
          group: group,
        },
        friction: 0.8,
      }
    );

    const wheelB = Bodies.circle(
      xx + wheelBOffset,
      yy + wheelYOffset,
      wheelSize,
      {
        collisionFilter: {
          group: group,
        },
        friction: 0.8,
      }
    );

    const axelA = Constraint.create({
      bodyB: body,
      pointB: { x: wheelAOffset, y: wheelYOffset },
      bodyA: wheelA,
      stiffness: 0.5, // Reduzindo a rigidez da mola
      length: 0,
    });

    const axelB = Constraint.create({
      bodyB: body,
      pointB: { x: wheelBOffset, y: wheelYOffset },
      bodyA: wheelB,
      stiffness: 0.5,
      length: 0,
    });

    const carBodyWidth = width * 1.3;
    const carBodyHeight = height * 1.3;
    const carBody = Bodies.rectangle(
      xx,
      yy - wheelSize / 2 - 15,
      carBodyWidth,
      carBodyHeight,
      {
        collisionFilter: {
          group: group,
        },
        density: density, // Aumentando a densidade do carro
      }
    );

    const rectangleOnLeft = Bodies.rectangle(
      xx,
      yy - (carBodyHeight + height) / 2 - wheelSize / 2 - 5,
      (height * 2) / 4,
      width / 3,
      {
        collisionFilter: {
          group: group,
        },
        density: density, // Aumentando a densidade do retângulo
      }
    );

    const rectangleOnRight = Bodies.rectangle(
      xx,
      yy - (carBodyHeight + height) / 2 - wheelSize / 2 - 5,
      (height * 2) / 4,
      width / 3,
      {
        collisionFilter: {
          group: group,
        },
        density: density,
      }
    );

    const axelLC = Constraint.create({
      bodyB: rectangleOnLeft,
      pointB: { x: 0, y: (height * 2) / 2 },
      bodyA: body,
      pointA: { x: -25, y: 0 },
      stiffness: 0.5, // Reduzindo a rigidez da mola
      length: 0,
    });

    const axelRC = Constraint.create({
      bodyB: rectangleOnRight,
      pointB: { x: 0, y: (height * 2) / 2 },
      bodyA: body,
      pointA: { x: 25, y: 0 },
      stiffness: 0.5, // Reduzindo a rigidez da mola
      length: 0,
    });

    const axelLCT = Constraint.create({
      bodyB: carBody,
      pointB: { x: -10, y: 0 },
      bodyA: rectangleOnLeft,
      pointA: { x: 0, y: -(height * 2) / 2 },
      stiffness: 0.5, // Reduzindo a rigidez da mola
      length: 0,
    });

    const axelRCT = Constraint.create({
      bodyB: carBody,
      pointB: { x: 10, y: 0 },
      bodyA: rectangleOnRight,
      pointA: { x: 0, y: -(height * 2) / 2 },
      stiffness: 0.5, // Reduzindo a rigidez da mola
      length: 0,
    });

    const auxilL = Constraint.create({
      bodyB: carBody,
      pointB: { x: -carBodyWidth / 2, y: 0 },
      bodyA: body,
      pointA: { x: -width / 2, y: 0 },
      stiffness: 0.5, // Reduzindo a rigidez da mola
      length: width / 3 - 5,
    });

    const auxilC = Constraint.create({
      bodyB: carBody,
      pointB: { x: 0, y: 0 },
      bodyA: body,
      pointA: { x: 0, y: 0 },
      stiffness: 0.5, // Reduzindo a rigidez da mola
      length: width / 3 - 10,
    });

    const auxilR = Constraint.create({
      bodyB: carBody,
      pointB: { x: carBodyWidth / 2, y: 0 },
      bodyA: body,
      pointA: { x: width / 2, y: 0 },
      stiffness: 0.5, // Reduzindo a rigidez da mola
      length: width / 3 - 5,
    });

    const auxilLC = Constraint.create({
      bodyB: carBody,
      pointB: { x: -carBodyWidth / 2, y: 0 },
      bodyA: body,
      pointA: { x: -10, y: 0 },
      stiffness: 0.5, // Reduzindo a rigidez da mola
      length: carBodyWidth * 0.5,
    });

    const auxilRC = Constraint.create({
      bodyB: carBody,
      pointB: { x: carBodyWidth / 2, y: 0 },
      bodyA: body,
      pointA: { x: 10, y: 0 },
      stiffness: 0.5, // Reduzindo a rigidez da mola
      length: carBodyWidth * 0.5,
    });

    Composite.addBody(car, wheelA);
    Composite.addBody(car, wheelB);
    Composite.addBody(car, carBody);
    Composite.addBody(car, rectangleOnLeft);
    Composite.addBody(car, rectangleOnRight);
    Composite.addBody(car, body);
    Composite.addConstraint(car, axelA);
    Composite.addConstraint(car, axelB);
    Composite.addConstraint(car, axelLC);
    Composite.addConstraint(car, axelRC);
    Composite.addConstraint(car, axelLCT);
    Composite.addConstraint(car, axelRCT);
    Composite.addConstraint(car, auxilR);
    Composite.addConstraint(car, auxilL);
    Composite.addConstraint(car, auxilC);
    Composite.addConstraint(car, auxilLC);
    Composite.addConstraint(car, auxilRC);

    return car;
  }

  return <div style={{ height: "100%", width: "100%" }} ref={scene}></div>;
};

export default Exercise1;

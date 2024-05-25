/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./main.js":
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _config_gameParams_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config/gameParams.json */ \"./config/gameParams.json\");\n/* harmony import */ var _src_Vector2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/Vector2 */ \"./src/Vector2.js\");\n/* harmony import */ var _src_gameObject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/gameObject */ \"./src/gameObject.js\");\n/* harmony import */ var _src_gameLoop__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/gameLoop */ \"./src/gameLoop.js\");\n\r\n\r\n\r\n\r\n\r\n\r\n\r\nconst display = document.querySelector(\"#display\");\r\ndisplay.width = _config_gameParams_json__WEBPACK_IMPORTED_MODULE_0__.width;\r\ndisplay.height = _config_gameParams_json__WEBPACK_IMPORTED_MODULE_0__.height;\r\ndisplay.style.backgroundColor = _config_gameParams_json__WEBPACK_IMPORTED_MODULE_0__.backgroundColor;\r\nconst ctx = display.getContext(\"2d\");\r\n\r\nconst offscreenCanvas = document.createElement(\"canvas\");\r\noffscreenCanvas.width = _config_gameParams_json__WEBPACK_IMPORTED_MODULE_0__.width;\r\noffscreenCanvas.height = _config_gameParams_json__WEBPACK_IMPORTED_MODULE_0__.height;\r\nconst offscreenCtx = offscreenCanvas.getContext(\"2d\");\r\n\r\nconst main = new _src_gameObject__WEBPACK_IMPORTED_MODULE_2__.GameObject({ position: new _src_Vector2__WEBPACK_IMPORTED_MODULE_1__.Vector2(0, 0) });\r\n\r\nconst update = (delta) => {\r\n  main.stepEntry(delta, main);\r\n};\r\n\r\nconst draw = () => {\r\n  ctx.clearRect(0, 0, display.width, display.height);\r\n  main.draw(ctx, 0, 0);\r\n  offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);\r\n  ctx.drawImage(offscreenCanvas, 0, 0);\r\n};\r\n\r\nconst gameLoop = new _src_gameLoop__WEBPACK_IMPORTED_MODULE_3__.GameLoop(update, draw);\r\ngameLoop.name = \"mainLoop\";\r\ngameLoop.start();\r\n\n\n//# sourceURL=webpack://game-loop/./main.js?");

/***/ }),

/***/ "./src/Events.js":
/*!***********************!*\
  !*** ./src/Events.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   events: () => (/* binding */ events)\n/* harmony export */ });\nclass Events {\r\n  callbacks = [];\r\n  nextId = 0;\r\n\r\n  emit(eventName, value) {\r\n    this.callbacks.forEach((stored) => {\r\n      if (stored.eventName === eventName) {\r\n        stored.callback(value);\r\n      }\r\n    });\r\n  }\r\n\r\n  on(eventName, caller, callback) {\r\n    this.nextId += 1;\r\n    this.callbacks.push({\r\n      id: this.nextId,\r\n      eventName,\r\n      caller,\r\n      callback,\r\n    });\r\n    return this.nextId;\r\n  }\r\n\r\n  off(id) {\r\n    this.callbacks = this.callbacks.filter((stored) => stored.id !== id);\r\n  }\r\n\r\n  unsubscribe(caller) {\r\n    this.callbacks = this.callbacks.filter((stored) => stored.caller !== caller);\r\n  }\r\n}\r\n\r\nconst events = new Events();\r\n\n\n//# sourceURL=webpack://game-loop/./src/Events.js?");

/***/ }),

/***/ "./src/Vector2.js":
/*!************************!*\
  !*** ./src/Vector2.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Vector2: () => (/* binding */ Vector2)\n/* harmony export */ });\nclass Vector2 {\r\n  constructor(x = 0, y = 0) {\r\n    this.x = x;\r\n    this.y = y;\r\n  }\r\n\r\n  validate() {\r\n    if (\r\n      this.x === null ||\r\n      this.y === null ||\r\n      this.x === undefined ||\r\n      this.y === undefined ||\r\n      isNaN(this.x) ||\r\n      isNaN(this.y)\r\n    ) {\r\n      throw new Error(\r\n        \"Invalid position: \" + this.x + \" and \" + this.y + \" must be finite numbers.\"\r\n      );\r\n    }\r\n    return this; // Return the validated Vector2 instance\r\n  }\r\n\r\n  duplicate() {\r\n    return new Vector2(this.x, this.y);\r\n  }\r\n}\r\n\n\n//# sourceURL=webpack://game-loop/./src/Vector2.js?");

/***/ }),

/***/ "./src/gameLoop.js":
/*!*************************!*\
  !*** ./src/gameLoop.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GameLoop: () => (/* binding */ GameLoop)\n/* harmony export */ });\nclass GameLoop {\r\n    constructor(update, render) {\r\n      this.lastFrameTime = 0;\r\n      this.accumulatedTime = 0;\r\n      this.timeStep = 1000 / 60; // set to run at 60 fps\r\n  \r\n      this.fps = 0; // fps tracker\r\n      this.frameCount = 0; // fps tracker\r\n      this.frameTime = 0; // fps tracker\r\n  \r\n      this.update = update;\r\n      this.render = render;\r\n  \r\n      this.rafId = null;\r\n      this.isRunning = false;\r\n      this.isPaused = false;\r\n      \r\n      this.debug = false;\r\n    }\r\n  \r\n    mainLoop = (timestamp) => {\r\n      if (!this.isRunning) return;\r\n  \r\n      if (this.isPaused){\r\n        this.isPaused = false;\r\n        this.lastFrameTime = timestamp;\r\n      }\r\n  \r\n      let deltaTime = timestamp - this.lastFrameTime;\r\n      this.lastFrameTime = timestamp;\r\n  \r\n      this.accumulatedTime += deltaTime;\r\n  \r\n      while (this.accumulatedTime >= this.timeStep) {\r\n        this.update(this.timeStep);\r\n        this.accumulatedTime -= this.timeStep;\r\n      }\r\n      this.render();\r\n  \r\n      this.rafId = requestAnimationFrame(this.mainLoop);\r\n  \r\n      this.frameTime += deltaTime;\r\n      if (this.frameTime >= 1000) {\r\n        this.fps = this.rafId - this.frameCount;\r\n        this.frameCount = this.rafId;\r\n        this.frameTime -= 1000;\r\n      }\r\n    };\r\n  \r\n    start() {\r\n      if (!this.isRunning) {\r\n        this.isRunning = true;\r\n        this.rafId = requestAnimationFrame(this.mainLoop);\r\n      }\r\n    }\r\n    stop() {\r\n      if (this.rafId) {\r\n        cancelAnimationFrame(this.rafId);\r\n      }\r\n      this.isRunning = false;\r\n    }\r\n  }\r\n  \n\n//# sourceURL=webpack://game-loop/./src/gameLoop.js?");

/***/ }),

/***/ "./src/gameObject.js":
/*!***************************!*\
  !*** ./src/gameObject.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GameObject: () => (/* binding */ GameObject)\n/* harmony export */ });\n/* harmony import */ var _Vector2_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Vector2.js */ \"./src/Vector2.js\");\n/* harmony import */ var _Events_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Events.js */ \"./src/Events.js\");\n\r\n\r\n\r\nclass GameObject {\r\n  position;\r\n  children;\r\n  parent;\r\n  hasReadyBeenCalled;\r\n\r\n  constructor(options) {\r\n    this.position = options.position ?? new _Vector2_js__WEBPACK_IMPORTED_MODULE_0__.Vector2(0, 0);\r\n    this.children = [];\r\n    this.parent = null;\r\n    this.hasReadyBeenCalled = false;\r\n  }\r\n\r\n  stepEntry(delta, root) {\r\n    this.children.forEach((child) => child.stepEntry(delta, root));\r\n\r\n    if (!this.hasReadyBeenCalled) {\r\n      this.hasReadyBeenCalled = true;\r\n      this.ready();\r\n    }\r\n    this.step(delta, root);\r\n  }\r\n\r\n  ready() {}\r\n\r\n  step(delta) {}\r\n\r\n  draw(ctx, x, y) {\r\n    const drawPosX = x + this.position.x;\r\n    const drawPosY = y + this.position.y;\r\n\r\n    this.drawImage(ctx, drawPosX, drawPosY);\r\n\r\n    this.children.forEach((child) => child.draw(ctx, drawPosX, drawPosY));\r\n  }\r\n\r\n  drawImage(ctx, drawPosX, drawPosY) {}\r\n\r\n  destroy() {\r\n    this.children.forEach((child) => child.destroy());\r\n    this.parent.removeChild(this);\r\n  }\r\n\r\n  addChild(gameObject) {\r\n    gameObject.parent = this;\r\n    this.children.push(gameObject);\r\n  }\r\n\r\n  removeChild(gameObject) {\r\n    _Events_js__WEBPACK_IMPORTED_MODULE_1__.events.unsubscribe(gameObject);\r\n    this.children = this.children.filter((g) => g !== gameObject);\r\n  }\r\n}\r\n\n\n//# sourceURL=webpack://game-loop/./src/gameObject.js?");

/***/ }),

/***/ "./config/gameParams.json":
/*!********************************!*\
  !*** ./config/gameParams.json ***!
  \********************************/
/***/ ((module) => {

eval("module.exports = /*#__PURE__*/JSON.parse('{\"width\":1280,\"height\":768,\"backgroundColor\":\"rgba(240, 240, 240, 0.5)\"}');\n\n//# sourceURL=webpack://game-loop/./config/gameParams.json?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./main.js");
/******/ 	
/******/ })()
;
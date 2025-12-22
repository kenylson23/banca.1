import{c as s}from"./index-Bn_nBLti.js";import{a0 as h,a1 as p,h as d,u as k,a2 as m,j as x,a3 as M,a4 as u}from"./radio-group-CqarH3lg.js";import{r as i}from"./react-vendor-DoqEe0id.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=s("Banknote",[["rect",{width:"20",height:"12",x:"2",y:"6",rx:"2",key:"9lu3g6"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"M6 12h.01M18 12h.01",key:"113zkx"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=s("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=s("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=s("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=s("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=s("Receipt",[["path",{d:"M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z",key:"q3az6g"}],["path",{d:"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8",key:"1h4pet"}],["path",{d:"M12 17.5v-11",key:"1jc1ny"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=s("UserPlus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]);function g(e){const t=h(()=>p(e)),{isStatic:n}=i.useContext(d);if(n){const[,o]=i.useState(e);i.useEffect(()=>t.on("change",o),[])}return t}function l(e,t){const n=g(t()),o=()=>n.set(t());return o(),k(()=>{const a=()=>x.preRender(o,!1,!0),c=e.map(r=>r.on("change",a));return()=>{c.forEach(r=>r()),m(o)}}),n}const C=e=>e&&typeof e=="object"&&e.mix,v=e=>C(e)?e.mix:void 0;function V(...e){const t=!Array.isArray(e[0]),n=t?0:-1,o=e[0+n],a=e[1+n],c=e[2+n],r=e[3+n],y=M(a,c,{mixer:v(c[0]),...r});return t?y(o):y}function I(e){u.current=[],e();const t=l(u.current,e);return u.current=void 0,t}function H(e,t,n,o){if(typeof e=="function")return I(e);const a=typeof t=="function"?t:V(t,n,o);return Array.isArray(e)?f(e,a):f([e],([c])=>a(c))}function f(e,t){const n=h(()=>[]);return l(e,()=>{n.length=0;const o=e.length;for(let a=0;a<o;a++)n[a]=e[a].get();return t(n)})}export{q as B,A as C,R as I,U as R,w as U,H as a,j as b,E as c,g as u};

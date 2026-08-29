import{c as x,r as s,j as e,T as l,a as d,C as i}from"./newtab.html-CQbxFkVU.js";import{g as n}from"./transition-DAEUM-8T.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=x("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);function h(){const[t,r]=s.useState([n()]),[a,o]=s.useState(5);return e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("label",{className:"text-[11px] text-text-secondary",children:"Count"}),e.jsx("input",{type:"number",min:1,max:50,value:a,onChange:c=>o(Math.min(50,Math.max(1,Number(c.target.value)||1))),className:"w-16 rounded-md border border-border bg-bg px-2 py-1 text-xs text-text-primary"}),e.jsxs("button",{onClick:()=>r(Array.from({length:a},()=>n())),className:"ml-auto flex items-center gap-1 rounded-md bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/25",children:[e.jsx(m,{size:12})," Generate"]})]}),e.jsx(l,{label:"Output",action:e.jsx(i,{value:t.join(`
`)}),children:e.jsx(d,{value:t.join(`
`),readOnly:!0,rows:Math.min(10,Math.max(4,t.length))})})]})}export{h as UuidTool};

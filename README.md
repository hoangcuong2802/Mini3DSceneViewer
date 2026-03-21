Mini 3D Scene Viewer – Technical Exercise 

1. Installation & Setup 

1.1 Clone repository 

git clone <your-repo-url> 
cd <project-folder> 

Project structure: 

src/ 
├── main.js 
├── scene/ 
├── controls/ 
├── interaction/ 
├── ui/ 
└── utils/ 

1.2.Install dependencies 

npm install 

1.3.Run development server 

npm run dev 

Then open: 

http://localhost:5173 

2. Build 

To build for production: 

npm run build 

To preview production build: 

npm run preview 

3. Notes on performance optimisation 

No Material Cloning on Selection 

Instead of cloning materials per click, highlighting uses emissive color. 

This avoids GPU memory leaks and reduces draw call overhead. 

Old Technique 

 

New Technique 

 

Old Ghost Preview looks more realistic however it consumes more resources 

Bounding Box Optimization 

Bounding boxes are only created for the selected object. 

Avoids traversing and allocating helpers for the entire scene. 

Preview Object Reuse 

Placement preview reuses a single cloned instance instead of cloning repeatedly. 

Reduces CPU overhead and memory allocations. 

Renderer Optimization 

Pixel ratio is clamped to max 2. 

Basic frustum culling is used by default in Three.js. 

Lightweight Raycasting 

Raycasting is limited to pickable objects only. 

Avoids unnecessary intersection checks. 

Frustum Culling 

Future improvements: 

BVH for raycasting (three-mesh-bvh) -> not necessary for this demo size 

Instancing for repeated objects -> needed when scale up with > 1000 objects 

LOD system for large scenes 

4. User Manual 

4.1. Click buttons on left-top screen create objects 

 

 

4.2. After object spawned in scene, Left-click to choose object and move mouse to see ghost preview, GREEN means you can place RED means you cannot place as it is overlapped. 

 

 

 

 

4.3. On right-top screen GUI, click “wireframe” to see whole wireframe of scene and “showBoundingBox” to see bounding box of ONLY selected object as to optimise performance  

 

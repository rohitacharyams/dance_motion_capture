# 🎭 Character Guide - Where to Get Animated Characters

This guide will help you find and use different 3D characters for your dance motion capture animations!

## 🎮 Available Character Options

### 1. **Basic Avatar (Built-in)** ✅ Always Available
- Simple, stylized character included with the app
- Works immediately, no download needed
- Good for testing and quick demos

### 2. **Ready Player Me (Realistic)** 🌐 Online
- **Website**: https://readyplayer.me/
- **Best for**: Realistic, personalized avatars
- **How to use**:
  1. Visit the website
  2. Create your custom avatar (free, no account needed!)
  3. Download as GLB format
  4. Select "Custom GLB/GLTF Model" in the app
  5. Upload your downloaded file

**Sample Model**: A sample Ready Player Me avatar is available directly in the dropdown!

### 3. **Custom GLB/GLTF Models** 📦 Upload Your Own
Upload any rigged humanoid character in GLB or GLTF format.

---

## 🆓 Free Character Sources

### 1. **Ready Player Me** ⭐ Recommended
- **URL**: https://readyplayer.me/
- **Why**: Easiest to use, web-optimized, realistic
- **Format**: GLB (ready to use)
- **Cost**: Free
- **Best for**: Realistic human avatars

### 2. **Mixamo** (Adobe)
- **URL**: https://www.mixamo.com/
- **Why**: Professional game-ready characters
- **Format**: FBX (needs conversion to GLB)
- **Cost**: Free (requires Adobe account)
- **Best for**: Professional characters with animations
- **How to convert**: Use Blender (see below)

### 3. **Sketchfab**
- **URL**: https://sketchfab.com/
- **Why**: Huge variety of styles
- **Format**: GLB/GLTF (direct download)
- **Cost**: Free models available (check license)
- **Best for**: Diverse character styles
- **Search terms**: "rigged human", "character rigged", "humanoid", "avatar"

### 4. **CGTrader Free Models**
- **URL**: https://www.cgtrader.com/free-3d-models
- **Why**: Large collection of free models
- **Format**: Various (may need conversion)
- **Cost**: Free
- **Best for**: Mix of realistic and stylized characters
- **Filter by**: Free, Rigged, Low-poly

### 5. **Poly Pizza**
- **URL**: https://poly.pizza/
- **Why**: Curated free 3D models
- **Format**: GLB
- **Cost**: Free
- **Best for**: Stylized, low-poly characters

### 6. **VRoid Hub**
- **URL**: https://hub.vroid.com/
- **Why**: Anime-style characters
- **Format**: VRM (needs conversion to GLB)
- **Cost**: Free
- **Best for**: Anime/manga style avatars

---

## 📋 Model Requirements

For best results, your character model should have:

✅ **Must Have:**
- Rigged skeleton (bones/armature)
- Humanoid structure (head, torso, arms, legs)
- GLB or GLTF format

✅ **Recommended:**
- Standard bone naming (Mixamo, VRM, or similar)
- Low-poly (< 50k triangles for smooth performance)
- Embedded textures in GLB file
- File size under 10MB

✅ **Optional:**
- Facial bones (for detailed expressions)
- Finger bones (for hand movements)

---

## 🔄 Converting FBX to GLB

If you download an FBX model (like from Mixamo), convert it using **Blender**:

1. **Install Blender** (free): https://www.blender.org/
2. **Open Blender** → File → Import → FBX
3. **Select your FBX file**
4. **File → Export → glTF 2.0 (.glb)**
5. **Export settings**:
   - Format: **GLB**
   - ✅ Apply Modifiers
   - ✅ Export Skins
   - ✅ Export All Bones
6. **Click Export GLB**

---

## 🎯 Quick Start Guide

### Using Built-in Characters:
1. Start the server: `python server.py`
2. Open http://localhost:5000
3. Select "Basic Avatar" from dropdown
4. Upload a video or load motion data
5. Watch it animate!

### Using Ready Player Me:
1. Select "Ready Player Me (Realistic)" from dropdown
2. Wait for the model to load (first time may take a moment)
3. Upload a video or load motion data
4. Watch your realistic avatar dance!

### Using Custom Models:
1. Download a GLB/GLTF character from any source above
2. Select "Custom GLB/GLTF Model" from dropdown
3. Click "Upload GLB/GLTF Model"
4. Select your downloaded file
5. Wait for it to load
6. Upload a video or load motion data
7. Watch your custom character animate!

---

## 💡 Tips for Best Results

1. **File Size**: Keep GLB files under 10MB for fast loading
2. **Polygon Count**: Under 50k triangles recommended for smooth performance
3. **Bone Names**: Models with standard bone names (Mixamo, VRM) work best
4. **Textures**: Use compressed textures (1024×1024 or 2048×2048)
5. **Format**: GLB is preferred over GLTF (single file, faster)

---

## 🐛 Troubleshooting

**Model doesn't animate:**
- Check browser console for bone mapping detection
- Verify model has a rigged skeleton
- Try a model with standard bone naming (Mixamo format)

**Model appears too small/large:**
- The system auto-scales models to ~1.8 units height
- If it's still wrong, the model might need manual adjustment

**Model loads but appears broken:**
- Ensure model is in GLB format (not plain GLTF with separate files)
- Check that textures are embedded in the GLB
- Verify model faces are not inverted

**Model positioning is off:**
- Models are automatically positioned, but some may need adjustment
- Check the browser console for any errors

---

## 📚 Recommended Character Collections

### For Realistic Characters:
- **Ready Player Me** - Best overall choice
- **Mixamo** - Professional quality

### For Stylized Characters:
- **Sketchfab** - Huge variety
- **Poly Pizza** - Low-poly styles

### For Anime Characters:
- **VRoid Hub** - Anime/manga style

---

## 🎨 Example Character URLs

Here are some example models you can try (copy the URL if you want to test):

```javascript
// Ready Player Me sample (already included in dropdown)
'https://models.readyplayer.me/64bfa40f0e72c63d7c3934a0.glb'

// Note: For other sources, you'll need to download the file first
// then upload it through the "Custom GLB/GLTF Model" option
```

---

## 📝 License Notes

When using models from online sources:
- ✅ Check the license (CC0, CC-BY, etc.)
- ✅ Provide attribution if required
- ✅ Follow the creator's terms of use
- ✅ Respect commercial use restrictions

---

**Happy animating! 🎉**

For more information, see `REALISTIC_AVATARS.md` in this project.


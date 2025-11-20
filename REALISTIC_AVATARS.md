# Using Realistic 3D Avatar Models

## Overview
The pipeline now supports loading external 3D humanoid models in GLB/GLTF format! This enables much more realistic and detailed avatar animations.

## How to Use

### Option 1: Built-in Basic Avatar
- Select "Basic Avatar (Built-in)" from the Avatar Model dropdown
- Uses the procedurally generated avatar with detailed features

### Option 2: Ready Player Me (Recommended)
- Select "Ready Player Me (Realistic)" from the dropdown
- Automatically loads a sample realistic human avatar
- For your own avatar:
  1. Visit [Ready Player Me](https://readyplayer.me/)
  2. Create your custom avatar (free!)
  3. Download the GLB file
  4. Switch to "Custom GLB/GLTF Model" and upload your file

### Option 3: Custom GLB/GLTF Models
- Select "Custom GLB/GLTF Model" from the dropdown
- Click "Upload GLB/GLTF Model" and select your file
- Supports Mixamo, Sketchfab, and other rigged humanoid models

## Where to Get Free Realistic Models

### 1. **Ready Player Me** (Easiest - Recommended)
- Website: https://readyplayer.me/
- **Best for**: Personalized realistic avatars
- Create custom avatars in minutes
- Free with no account required
- Download as GLB format
- Already optimized for web

### 2. **Mixamo** (Adobe - Free)
- Website: https://www.mixamo.com/
- **Best for**: Professional game-ready characters
- Requires Adobe account (free)
- Includes rigged characters with animations
- Download as FBX, then convert to GLB using:
  - [Blender](https://www.blender.org/) (free)
  - [Online converter](https://products.aspose.app/3d/conversion/fbx-to-glb)

### 3. **Sketchfab** (Community Models)
- Website: https://sketchfab.com/
- **Best for**: Diverse character styles
- Filter by: Free, Downloadable, Rigged
- Search: "rigged human", "character rigged", "humanoid"
- Many free CC-licensed models
- Download as GLB directly

### 4. **CGTrader Free Models**
- Website: https://www.cgtrader.com/free-3d-models
- Filter: Free, Rigged, Low-poly
- Supports GLB/GLTF formats
- Mix of realistic and stylized

### 5. **Poly Pizza**
- Website: https://poly.pizza/
- Collection of free 3D models
- Includes some rigged characters
- Direct GLB downloads

## Model Requirements

For best results, your 3D model should have:

✅ **Must Have:**
- Rigged skeleton (bones/armature)
- Humanoid structure (head, torso, arms, legs)
- GLB or GLTF format

✅ **Recommended:**
- Standard bone naming (Mixamo, VRM, or similar)
- Low-poly (< 50k triangles for smooth performance)
- Embedded textures in GLB file

✅ **Optional:**
- Facial bones (for detailed expressions)
- Finger bones (for hand movements)

## Bone Mapping

The system automatically detects bones using common naming conventions:

- **Mixamo**: `mixamorig:Head`, `mixamorig:LeftArm`, etc.
- **Standard**: `Head`, `Neck`, `LeftShoulder`, `RightHand`, etc.
- **VRM**: VRM-compatible bone names

Currently mapped landmarks:
- Head/Neck
- Shoulders
- Upper arms, forearms, hands
- Hips
- Upper legs, lower legs, feet

## Converting FBX to GLB

If you have an FBX model, convert it using **Blender** (free):

1. Install [Blender](https://www.blender.org/)
2. Open Blender → File → Import → FBX
3. Select your FBX file
4. File → Export → glTF 2.0 (.glb)
5. In export settings:
   - Format: **GLB**
   - Check: **Apply Modifiers**
   - Check: **Export Skins**
   - Check: **Export All Bones**
6. Click Export GLB

## Performance Tips

- **File size**: Keep GLB files under 10MB for fast loading
- **Polygon count**: Under 50k triangles recommended
- **Textures**: Use compressed textures (1024×1024 or 2048×2048)
- **Format**: GLB is preferred over GLTF (single file, faster)

## Example URLs for Testing

Quick test with sample models (copy these into your code if needed):

```javascript
// Ready Player Me sample
'https://models.readyplayer.me/64bfa40f0e72c63d7c3934a0.glb'

// Sketchfab examples (requires attribution)
'https://sketchfab.com/models/[model-id]/download'
```

## Troubleshooting

**Model appears too small/large:**
- The system auto-scales models to ~1.8 units height
- Adjust `scale` value in AvatarController.js `switchModel()` method

**Model doesn't animate:**
- Check browser console for bone mapping detection
- Verify model has a rigged skeleton
- Try renaming bones to standard conventions

**Model loads but appears broken:**
- Ensure model is in GLB format (not plain GLTF with separate files)
- Check that textures are embedded in the GLB
- Verify model faces are not inverted

**Model positioning is off:**
- Adjust position values in `switchModel()` method
- Default: `position.set(1.5, -0.9, 0)` for right side

## Future Enhancements

Planned improvements:
- [ ] Better finger articulation (individual finger bones)
- [ ] Facial expression mapping (blendshapes)
- [ ] Automatic bone detection improvement
- [ ] VRM format support
- [ ] Model preview before loading
- [ ] Save/load favorite models

## Credits

When using models from online sources, remember to:
- Check the license (CC0, CC-BY, etc.)
- Provide attribution if required
- Follow the creator's terms of use

---

**Pro Tip**: For the most realistic results, use Ready Player Me! It's specifically designed for real-time web avatars and works perfectly out-of-the-box with our system.

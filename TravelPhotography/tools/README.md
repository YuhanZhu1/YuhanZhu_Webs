The originals in `assets/img` are preserved. The gallery uses three JPEG display sizes from `assets/gallery.json`.

To rebuild them, install ImageMagick and run from any directory:

    python3 TravelPhotography/tools/build_display.py

This uses ImageMagick rather than macOS `sips`: some originals produced black pixels through the previous conversion. It applies EXIF orientation, converts to sRGB, and removes metadata from display copies. Check all three sizes after adding a photograph. The HTML image dimensions and srcset width descriptors must match the generated image widths.

When replacing display files, update the `?v=2` cache version in the gallery HTML so visitors do not keep previously cached copies.

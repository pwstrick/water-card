export function flipPixelRows(pixels, width, height) {
  const rowLength = width * 4
  const flipped = new Uint8ClampedArray(pixels.length)

  for (let row = 0; row < height; row += 1) {
    const sourceOffset = (height - row - 1) * rowLength
    flipped.set(pixels.subarray(sourceOffset, sourceOffset + rowLength), row * rowLength)
  }

  return flipped
}

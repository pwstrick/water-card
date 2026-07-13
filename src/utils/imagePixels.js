export function flipPixelRows(pixels, width, height) {
  // 输入按 RGBA 四通道排列；逐行拷贝比逐像素交换更少创建临时对象。
  const rowLength = width * 4
  const flipped = new Uint8ClampedArray(pixels.length)

  for (let row = 0; row < height; row += 1) {
    const sourceOffset = (height - row - 1) * rowLength
    flipped.set(pixels.subarray(sourceOffset, sourceOffset + rowLength), row * rowLength)
  }

  return flipped
}

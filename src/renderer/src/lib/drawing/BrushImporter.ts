export interface ImportedBrush {
  name: string
  thumbnail: string
  params: Record<string, number | boolean>
  textureData?: ImageData
}

export async function importABR(file: File): Promise<ImportedBrush[]> {
  const name = file.name.replace(/\.abr$/i, '')
  return [
    {
      name,
      thumbnail: '',
      params: { size: 20, hardness: 0.8, opacity: 1, spacing: 25 },
      textureData: undefined,
    },
  ]
}

export async function importSAI2Brush(file: File): Promise<ImportedBrush | null> {
  const name = file.name.replace(/\.(spray|brush)$/i, '')
  return {
    name,
    thumbnail: '',
    params: { size: 15, hardness: 0.6, opacity: 1, spacing: 20 },
    textureData: undefined,
  }
}

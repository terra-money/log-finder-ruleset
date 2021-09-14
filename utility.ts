export function decodeBase64(str: string) {
  try {
    return Buffer.from(str, "base64").toString()
  } catch {
    return str
  }
}

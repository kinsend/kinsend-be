var axios = require('axios');
export async function getImageBase64ByUrl(url: string) {
  try {
    const image = await axios.get(url, { responseType: 'arraybuffer' });
    const raw = Buffer.from(image.data).toString('base64');
    return raw;
  } catch (error) {
    console.log(error);
    return '';
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import sharp from 'sharp';
import axios from 'axios';

@Injectable()
export class OpenAIService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // store in .env
  });

  async generateThumbnail(title: string): Promise<string> {
    const fallbackThumbnail = `https://api.dicebear.com/9.x/icons/svg?seed=${encodeURIComponent(
      title,
    )}`;

    try {
      const prompt = `Generate a simple, professional product thumbnail for an auction titled "${title}". 
      The image should be clean, minimal, and suitable for a marketplace.`;

      const response = await this.openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024', // ✅ supported size
      });

      if (!response.data?.length || !response.data[0].url) {
        return fallbackThumbnail;
      }

      // fetch the image buffer
      const imgResp = await axios.get(response.data[0].url, {
        responseType: 'arraybuffer',
      });

      // resize it to 256x256
      const resized = await sharp(imgResp.data)
        .resize(256, 256)
        .png()
        .toBuffer();

      // convert to base64 string so you can return/use directly
      return `data:image/png;base64,${resized.toString('base64')}`;
    } catch (e: any) {
      console.error('OpenAI thumbnail generation failed:', e.message);
      return fallbackThumbnail;
    }
  }
}
